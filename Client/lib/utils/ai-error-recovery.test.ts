import { describe, it, expect, vi } from 'vitest';
import {
  classifyAIError,
  getRecoveryOptions,
  canRecoverWith,
  getFallbackModel,
  logAIError,
  AIError,
} from './ai-error-recovery';
import { RateLimitedError } from '@/components/spec-tree/lib/api/openai-proxy';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('ai-error-recovery', () => {
  describe('classifyAIError', () => {
    it('classifies RateLimitedError with 429 status as rate_limit', () => {
      const rateLimitError = new RateLimitedError(
        'Rate limited',
        { status: 429, message: 'Too many requests', isRateLimited: true, retryAfter: 60000 },
        1,
        0
      );

      const result = classifyAIError(rateLimitError);

      expect(result.category).toBe('rate_limit');
      expect(result.retryable).toBe(true);
      expect(result.suggestedWaitMs).toBe(60000);
      expect(result.recoveryActions).toContain('wait_and_retry');
    });

    it('classifies RateLimitedError with 503 status as network', () => {
      const rateLimitError = new RateLimitedError(
        'Service unavailable',
        { status: 503, message: 'Service unavailable', isRateLimited: false },
        1,
        0
      );

      const result = classifyAIError(rateLimitError);

      expect(result.category).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('retry');
    });

    it('classifies network errors correctly', () => {
      const error = new Error('Failed to fetch: network error');

      const result = classifyAIError(error);

      expect(result.category).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('check_connection');
    });

    it('classifies timeout errors correctly', () => {
      const error = new Error('Request timed out');

      const result = classifyAIError(error);

      expect(result.category).toBe('timeout');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('retry_with_smaller_context');
    });

    it('classifies context length errors correctly', () => {
      const error = new Error('Maximum context length exceeded');

      const result = classifyAIError(error);

      expect(result.category).toBe('context_length');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('retry_with_smaller_context');
      expect(result.recoveryActions).toContain('switch_model');
    });

    it('classifies model unavailable errors correctly', () => {
      const error = new Error('Model gpt-5 does not exist');

      const result = classifyAIError(error);

      expect(result.category).toBe('model_unavailable');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('switch_model');
    });

    it('classifies quota errors correctly', () => {
      const error = new Error('Quota exceeded');

      const result = classifyAIError(error);

      expect(result.category).toBe('quota');
      expect(result.retryable).toBe(false);
      expect(result.recoveryActions).toContain('contact_support');
    });

    it('classifies validation errors correctly', () => {
      const error = new Error('Invalid request: missing required field');

      const result = classifyAIError(error);

      expect(result.category).toBe('validation');
      expect(result.retryable).toBe(false);
      expect(result.recoveryActions).toContain('manual_edit');
    });

    it('classifies parsing errors correctly', () => {
      const error = new Error('Unexpected token in JSON');

      const result = classifyAIError(error);

      expect(result.category).toBe('parsing');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('retry');
    });

    it('extracts status code from error message', () => {
      const error = new Error('HTTP error! status: 500, message: Internal Server Error');

      const result = classifyAIError(error);

      expect(result.category).toBe('api');
      expect(result.retryable).toBe(true);
    });

    it('classifies 401 errors as non-retryable', () => {
      const error = new Error('HTTP error! status: 401, message: Unauthorized');

      const result = classifyAIError(error);

      expect(result.category).toBe('api');
      expect(result.retryable).toBe(false);
    });

    it('classifies unknown errors with default recovery', () => {
      const error = new Error('Something went wrong');

      const result = classifyAIError(error);

      expect(result.category).toBe('unknown');
      expect(result.retryable).toBe(true);
      expect(result.recoveryActions).toContain('retry');
      expect(result.recoveryActions).toContain('contact_support');
    });

    it('handles non-Error objects', () => {
      const result = classifyAIError('string error');

      expect(result.category).toBe('unknown');
      expect(result.message).toBe('string error');
    });
  });

  describe('getRecoveryOptions', () => {
    it('returns recovery options with labels and descriptions', () => {
      const error: AIError = {
        category: 'network',
        message: 'Network error',
        userMessage: 'Connection failed',
        recoveryActions: ['retry', 'check_connection'],
        originalError: new Error(),
        retryable: true,
      };

      const options = getRecoveryOptions(error);

      expect(options).toHaveLength(2);
      expect(options[0].action).toBe('retry');
      expect(options[0].label).toBe('Try Again');
      expect(options[0].isPrimary).toBe(true);
      expect(options[1].action).toBe('check_connection');
      expect(options[1].isPrimary).toBe(false);
    });

    it('marks first option as primary', () => {
      const error: AIError = {
        category: 'timeout',
        message: 'Timeout',
        userMessage: 'Request timed out',
        recoveryActions: ['retry_with_smaller_context', 'retry'],
        originalError: new Error(),
        retryable: true,
      };

      const options = getRecoveryOptions(error);

      expect(options[0].isPrimary).toBe(true);
      expect(options[1].isPrimary).toBe(false);
    });
  });

  describe('canRecoverWith', () => {
    it('returns true when action is available', () => {
      const error: AIError = {
        category: 'network',
        message: 'Network error',
        userMessage: 'Connection failed',
        recoveryActions: ['retry', 'check_connection'],
        originalError: new Error(),
        retryable: true,
      };

      expect(canRecoverWith(error, 'retry')).toBe(true);
      expect(canRecoverWith(error, 'check_connection')).toBe(true);
    });

    it('returns false when action is not available', () => {
      const error: AIError = {
        category: 'network',
        message: 'Network error',
        userMessage: 'Connection failed',
        recoveryActions: ['retry'],
        originalError: new Error(),
        retryable: true,
      };

      expect(canRecoverWith(error, 'switch_model')).toBe(false);
    });
  });

  describe('getFallbackModel', () => {
    it('returns fallback for gpt-4', () => {
      expect(getFallbackModel('gpt-4')).toBe('gpt-4-turbo');
    });

    it('returns fallback for gpt-3.5-turbo', () => {
      expect(getFallbackModel('gpt-3.5-turbo')).toBe('gpt-3.5-turbo-16k');
    });

    it('returns fallback for claude-3-opus', () => {
      expect(getFallbackModel('claude-3-opus')).toBe('claude-3-sonnet');
    });

    it('returns undefined for unknown model', () => {
      expect(getFallbackModel('unknown-model')).toBeUndefined();
    });
  });

  describe('logAIError', () => {
    it('logs error with context', async () => {
      const loggerModule = await import('@/lib/logger');
      const error: AIError = {
        category: 'network',
        message: 'Network error',
        userMessage: 'Connection failed',
        recoveryActions: ['retry'],
        originalError: new Error(),
        retryable: true,
      };

      logAIError(error, 'generateEpics');

      expect(loggerModule.logger.error).toHaveBeenCalledWith(
        'AIGeneration',
        'Error in generateEpics',
        expect.objectContaining({
          category: 'network',
          retryable: true,
        })
      );
    });
  });
});
