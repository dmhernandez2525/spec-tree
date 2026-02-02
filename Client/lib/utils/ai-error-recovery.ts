import { logger } from '@/lib/logger';
import { RateLimitedError } from '@/components/spec-tree/lib/api/openai-proxy';

/**
 * Error categories for AI generation failures
 */
export type AIErrorCategory =
  | 'rate_limit'
  | 'network'
  | 'timeout'
  | 'validation'
  | 'parsing'
  | 'api'
  | 'quota'
  | 'model_unavailable'
  | 'context_length'
  | 'unknown';

/**
 * Recovery actions that can be taken for each error type
 */
export type RecoveryAction =
  | 'retry'
  | 'retry_with_smaller_context'
  | 'switch_model'
  | 'wait_and_retry'
  | 'manual_edit'
  | 'contact_support'
  | 'check_connection';

export interface AIError {
  category: AIErrorCategory;
  message: string;
  userMessage: string;
  recoveryActions: RecoveryAction[];
  originalError: unknown;
  retryable: boolean;
  suggestedWaitMs?: number;
}

export interface RecoveryOption {
  action: RecoveryAction;
  label: string;
  description: string;
  isPrimary: boolean;
}

/**
 * Classify an error into a category for appropriate handling
 */
export function classifyAIError(error: unknown): AIError {
  // Handle rate limit errors from our proxy
  if (error instanceof RateLimitedError) {
    const { rateLimitError } = error;
    if (rateLimitError.status === 429) {
      return {
        category: 'rate_limit',
        message: error.message,
        userMessage: 'The AI service is temporarily busy. The system will retry automatically.',
        recoveryActions: ['wait_and_retry'],
        originalError: error,
        retryable: true,
        suggestedWaitMs: rateLimitError.retryAfter || 60000,
      };
    }
    // Other rate-limited errors (502, 503, 504)
    return {
      category: 'network',
      message: error.message,
      userMessage: 'The AI service is temporarily unavailable. Please try again.',
      recoveryActions: ['retry', 'check_connection'],
      originalError: error,
      retryable: true,
    };
  }

  // Handle standard errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed to fetch') ||
      message.includes('connection')
    ) {
      return {
        category: 'network',
        message: error.message,
        userMessage: 'Unable to connect to the AI service. Please check your internet connection.',
        recoveryActions: ['check_connection', 'retry'],
        originalError: error,
        retryable: true,
      };
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        category: 'timeout',
        message: error.message,
        userMessage: 'The request took too long. Try generating with less content.',
        recoveryActions: ['retry_with_smaller_context', 'retry'],
        originalError: error,
        retryable: true,
      };
    }

    // Context length errors
    if (
      message.includes('context length') ||
      message.includes('maximum context') ||
      message.includes('too many tokens') ||
      message.includes('token limit')
    ) {
      return {
        category: 'context_length',
        message: error.message,
        userMessage: 'The content is too large for the AI model. Try reducing the scope.',
        recoveryActions: ['retry_with_smaller_context', 'switch_model'],
        originalError: error,
        retryable: true,
      };
    }

    // Model unavailable
    if (
      message.includes('model') &&
      (message.includes('unavailable') ||
        message.includes('not found') ||
        message.includes('does not exist'))
    ) {
      return {
        category: 'model_unavailable',
        message: error.message,
        userMessage: 'The selected AI model is currently unavailable. Try a different model.',
        recoveryActions: ['switch_model', 'retry'],
        originalError: error,
        retryable: true,
      };
    }

    // Quota/billing errors
    if (
      message.includes('quota') ||
      message.includes('billing') ||
      message.includes('insufficient') ||
      message.includes('credits')
    ) {
      return {
        category: 'quota',
        message: error.message,
        userMessage: 'AI usage quota exceeded. Please contact support or wait for quota reset.',
        recoveryActions: ['contact_support', 'wait_and_retry'],
        originalError: error,
        retryable: false,
      };
    }

    // Validation errors
    if (
      message.includes('invalid') ||
      message.includes('validation') ||
      message.includes('missing required')
    ) {
      return {
        category: 'validation',
        message: error.message,
        userMessage: 'There was a problem with the request. Please try again.',
        recoveryActions: ['manual_edit', 'retry'],
        originalError: error,
        retryable: false,
      };
    }

    // Parsing errors (JSON parsing failures)
    if (
      message.includes('parse') ||
      message.includes('json') ||
      message.includes('unexpected token') ||
      message.includes('syntax')
    ) {
      return {
        category: 'parsing',
        message: error.message,
        userMessage: 'The AI response could not be processed. Please try again.',
        recoveryActions: ['retry'],
        originalError: error,
        retryable: true,
      };
    }

    // API errors with status codes
    const statusMatch = message.match(/status:\s*(\d+)/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10);
      return classifyByStatusCode(status, error);
    }
  }

  // Unknown error
  return {
    category: 'unknown',
    message: error instanceof Error ? error.message : String(error),
    userMessage: 'An unexpected error occurred. Please try again.',
    recoveryActions: ['retry', 'contact_support'],
    originalError: error,
    retryable: true,
  };
}

/**
 * Classify error based on HTTP status code
 */
function classifyByStatusCode(status: number, error: Error): AIError {
  if (status === 429) {
    return {
      category: 'rate_limit',
      message: error.message,
      userMessage: 'Too many requests. Please wait a moment before trying again.',
      recoveryActions: ['wait_and_retry'],
      originalError: error,
      retryable: true,
      suggestedWaitMs: 60000,
    };
  }

  if (status === 401 || status === 403) {
    return {
      category: 'api',
      message: error.message,
      userMessage: 'Authentication error. Please try logging in again.',
      recoveryActions: ['contact_support'],
      originalError: error,
      retryable: false,
    };
  }

  if (status === 400) {
    return {
      category: 'validation',
      message: error.message,
      userMessage: 'Invalid request. Please check your input and try again.',
      recoveryActions: ['manual_edit', 'retry'],
      originalError: error,
      retryable: false,
    };
  }

  if (status >= 500) {
    return {
      category: 'api',
      message: error.message,
      userMessage: 'The AI service is experiencing issues. Please try again later.',
      recoveryActions: ['retry', 'wait_and_retry'],
      originalError: error,
      retryable: true,
    };
  }

  return {
    category: 'api',
    message: error.message,
    userMessage: `Request failed with status ${status}. Please try again.`,
    recoveryActions: ['retry'],
    originalError: error,
    retryable: true,
  };
}

/**
 * Get recovery options for an AI error
 */
export function getRecoveryOptions(error: AIError): RecoveryOption[] {
  const optionMap: Record<RecoveryAction, Omit<RecoveryOption, 'action' | 'isPrimary'>> = {
    retry: {
      label: 'Try Again',
      description: 'Attempt the generation again',
    },
    retry_with_smaller_context: {
      label: 'Try with Less Content',
      description: 'Reduce the scope and try again',
    },
    switch_model: {
      label: 'Use Different Model',
      description: 'Switch to an alternative AI model',
    },
    wait_and_retry: {
      label: 'Wait and Retry',
      description: 'Wait for the service to recover, then try again',
    },
    manual_edit: {
      label: 'Edit Manually',
      description: 'Make changes manually instead',
    },
    contact_support: {
      label: 'Contact Support',
      description: 'Get help from the support team',
    },
    check_connection: {
      label: 'Check Connection',
      description: 'Verify your internet connection',
    },
  };

  return error.recoveryActions.map((action, index) => ({
    action,
    ...optionMap[action],
    isPrimary: index === 0,
  }));
}

/**
 * Log an AI error with appropriate context
 */
export function logAIError(error: AIError, context: string): void {
  logger.error('AIGeneration', `Error in ${context}`, {
    category: error.category,
    message: error.message,
    retryable: error.retryable,
    recoveryActions: error.recoveryActions,
  });
}

/**
 * Check if an error is recoverable with a specific action
 */
export function canRecoverWith(error: AIError, action: RecoveryAction): boolean {
  return error.recoveryActions.includes(action);
}

/**
 * Suggested fallback models for when primary model fails
 */
export const FALLBACK_MODELS: Record<string, string[]> = {
  'gpt-4': ['gpt-4-turbo', 'gpt-3.5-turbo-16k'],
  'gpt-4-turbo': ['gpt-4', 'gpt-3.5-turbo-16k'],
  'gpt-3.5-turbo': ['gpt-3.5-turbo-16k', 'gpt-4'],
  'gpt-3.5-turbo-16k': ['gpt-3.5-turbo', 'gpt-4'],
  'claude-3-opus': ['claude-3-sonnet', 'gpt-4'],
  'claude-3-sonnet': ['claude-3-opus', 'gpt-4'],
  'gemini-pro': ['gpt-4', 'claude-3-sonnet'],
};

/**
 * Get fallback model for a failed model
 */
export function getFallbackModel(currentModel: string): string | undefined {
  const fallbacks = FALLBACK_MODELS[currentModel];
  return fallbacks?.[0];
}
