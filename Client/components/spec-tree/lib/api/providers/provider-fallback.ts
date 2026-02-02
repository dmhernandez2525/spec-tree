/**
 * Provider Fallback Mechanism
 *
 * F1.3.8 - Provider fallback mechanism
 *
 * Automatically falls back to alternative providers when the primary fails.
 */

import { logger } from '@/lib/logger';
import {
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  AIModelInfo,
  ALL_MODELS,
} from './ai-provider';
import { getProviderForModel } from './provider-factory';

/**
 * Fallback configuration options
 */
export interface FallbackConfig {
  /** Maximum number of fallback attempts */
  maxFallbackAttempts?: number;
  /** Whether to enable automatic fallback */
  enableFallback?: boolean;
  /** Custom fallback order (provider types) */
  fallbackOrder?: AIProviderType[];
  /** Callback when fallback occurs */
  onFallback?: (
    fromModel: string,
    toModel: string,
    error: Error,
    attempt: number
  ) => void;
  /** Error categories that should trigger fallback */
  fallbackOnErrors?: FallbackErrorType[];
}

/**
 * Error types that can trigger fallback
 */
export type FallbackErrorType =
  | 'rate_limit'
  | 'network'
  | 'timeout'
  | 'server_error'
  | 'model_unavailable'
  | 'quota_exceeded';

/**
 * Default fallback order - prioritizes by capability/reliability
 */
const DEFAULT_FALLBACK_ORDER: AIProviderType[] = ['openai', 'anthropic', 'gemini'];

/**
 * Default error types that trigger fallback
 */
const DEFAULT_FALLBACK_ERRORS: FallbackErrorType[] = [
  'rate_limit',
  'server_error',
  'model_unavailable',
  'timeout',
  'quota_exceeded',
  'network',
];

/**
 * Default fallback configuration
 */
export const DEFAULT_FALLBACK_CONFIG: Required<FallbackConfig> = {
  maxFallbackAttempts: 2,
  enableFallback: true,
  fallbackOrder: DEFAULT_FALLBACK_ORDER,
  onFallback: () => {},
  fallbackOnErrors: DEFAULT_FALLBACK_ERRORS,
};

/**
 * Model equivalence mapping for fallback
 * Maps models to their equivalent alternatives across providers
 */
const MODEL_EQUIVALENCES: Record<string, string[]> = {
  // High-capability models
  'gpt-4-turbo': ['claude-3-opus-20240229', 'gemini-1.5-pro'],
  'gpt-4': ['claude-3-opus-20240229', 'gemini-1.5-pro'],
  'claude-3-opus-20240229': ['gpt-4-turbo', 'gemini-1.5-pro'],
  'gemini-1.5-pro': ['gpt-4-turbo', 'claude-3-opus-20240229'],

  // Mid-capability models
  'gpt-3.5-turbo': ['claude-3-sonnet-20240229', 'gemini-1.5-flash'],
  'gpt-3.5-turbo-16k': ['claude-3-sonnet-20240229', 'gemini-1.5-flash'],
  'claude-3-sonnet-20240229': ['gpt-3.5-turbo-16k', 'gemini-1.5-flash'],
  'gemini-1.5-flash': ['gpt-3.5-turbo-16k', 'claude-3-sonnet-20240229'],

  // Fast/efficient models
  'claude-3-haiku-20240307': ['gpt-3.5-turbo', 'gemini-1.5-flash'],
  'gemini-pro': ['gpt-3.5-turbo', 'claude-3-haiku-20240307'],
};

/**
 * Get fallback models for a given model
 */
export function getFallbackModels(modelId: string): string[] {
  // First check direct equivalences
  if (MODEL_EQUIVALENCES[modelId]) {
    return MODEL_EQUIVALENCES[modelId];
  }

  // If not found, get models from other providers with similar capabilities
  const currentModel = ALL_MODELS.find((m) => m.id === modelId);
  if (!currentModel) {
    return [];
  }

  // Find similar models from other providers based on context window
  return ALL_MODELS.filter(
    (m) =>
      m.provider !== currentModel.provider &&
      m.contextWindow >= currentModel.contextWindow * 0.5
  )
    .sort((a, b) => b.contextWindow - a.contextWindow)
    .map((m) => m.id);
}

/**
 * Determine if an error should trigger fallback
 */
export function shouldFallback(
  error: Error,
  config: FallbackConfig
): { shouldFallback: boolean; errorType: FallbackErrorType | null } {
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  // Check for rate limit errors
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('429') ||
    errorName.includes('ratelimit')
  ) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('rate_limit') ?? true,
      errorType: 'rate_limit',
    };
  }

  // Check for server errors
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('internal server')
  ) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('server_error') ?? true,
      errorType: 'server_error',
    };
  }

  // Check for timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('timeout') ?? true,
      errorType: 'timeout',
    };
  }

  // Check for model unavailable
  if (
    errorMessage.includes('model') &&
    (errorMessage.includes('not found') ||
      errorMessage.includes('does not exist') ||
      errorMessage.includes('unavailable'))
  ) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('model_unavailable') ?? true,
      errorType: 'model_unavailable',
    };
  }

  // Check for quota exceeded
  if (
    errorMessage.includes('quota') ||
    errorMessage.includes('insufficient') ||
    errorMessage.includes('exceeded')
  ) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('quota_exceeded') ?? true,
      errorType: 'quota_exceeded',
    };
  }

  // Check for network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection')
  ) {
    return {
      shouldFallback: config.fallbackOnErrors?.includes('network') ?? true,
      errorType: 'network',
    };
  }

  return { shouldFallback: false, errorType: null };
}

/**
 * Result of a completion with fallback
 */
export interface FallbackCompletionResult extends AICompletionResponse {
  /** Whether fallback was used */
  usedFallback: boolean;
  /** Original model requested */
  originalModel: string;
  /** Number of fallback attempts made */
  fallbackAttempts: number;
  /** Errors encountered during fallback */
  errors: Array<{ model: string; error: Error }>;
}

/**
 * Create a completion with automatic fallback support
 */
export async function createCompletionWithFallback(
  messages: AIMessage[],
  model: string,
  options?: AICompletionOptions,
  fallbackConfig?: FallbackConfig
): Promise<FallbackCompletionResult> {
  const config = { ...DEFAULT_FALLBACK_CONFIG, ...fallbackConfig };
  const errors: Array<{ model: string; error: Error }> = [];

  // Build the model sequence to try
  const modelsToTry = [model];
  if (config.enableFallback) {
    modelsToTry.push(...getFallbackModels(model));
  }

  // Limit to max attempts + 1 (primary)
  const maxTries = Math.min(modelsToTry.length, config.maxFallbackAttempts + 1);

  for (let attempt = 0; attempt < maxTries; attempt++) {
    const currentModel = modelsToTry[attempt];
    const provider = getProviderForModel(currentModel);

    if (!provider) {
      logger.warn('Provider Fallback', `No provider found for model: ${currentModel}`);
      continue;
    }

    try {
      logger.log('Provider Fallback', `Attempting completion with ${currentModel}`, {
        attempt: attempt + 1,
        maxTries,
        provider: provider.providerType,
      });

      const response = await provider.createCompletion(messages, currentModel, options);

      // Success!
      if (attempt > 0) {
        logger.log('Provider Fallback', `Fallback succeeded with ${currentModel}`, {
          originalModel: model,
          attempts: attempt + 1,
        });
      }

      return {
        ...response,
        usedFallback: attempt > 0,
        originalModel: model,
        fallbackAttempts: attempt,
        errors,
      };
    } catch (error) {
      const err = error as Error;
      errors.push({ model: currentModel, error: err });

      logger.warn('Provider Fallback', `Error with ${currentModel}`, {
        error: err.message,
        attempt: attempt + 1,
      });

      // Check if we should continue with fallback
      const { shouldFallback: shouldTryFallback, errorType } = shouldFallback(
        err,
        config
      );

      if (!shouldTryFallback || !config.enableFallback) {
        // Don't fallback, rethrow
        throw err;
      }

      // Notify about fallback attempt
      if (attempt < maxTries - 1) {
        const nextModel = modelsToTry[attempt + 1];
        config.onFallback(currentModel, nextModel, err, attempt + 1);

        logger.log('Provider Fallback', `Falling back from ${currentModel} to ${nextModel}`, {
          errorType,
          attempt: attempt + 1,
        });
      }
    }
  }

  // All attempts failed - throw the last error
  const lastError = errors[errors.length - 1];
  throw lastError.error;
}

/**
 * Get information about fallback options for a model
 */
export function getFallbackInfo(modelId: string): {
  model: AIModelInfo | undefined;
  fallbackModels: Array<{ model: AIModelInfo; priority: number }>;
} {
  const model = ALL_MODELS.find((m) => m.id === modelId);
  const fallbackIds = getFallbackModels(modelId);

  const fallbackModels = fallbackIds
    .map((id, index) => {
      const fallbackModel = ALL_MODELS.find((m) => m.id === id);
      return fallbackModel
        ? { model: fallbackModel, priority: index + 1 }
        : null;
    })
    .filter((m): m is { model: AIModelInfo; priority: number } => m !== null);

  return { model, fallbackModels };
}
