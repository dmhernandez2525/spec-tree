import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getFallbackModels,
  shouldFallback,
  createCompletionWithFallback,
  getFallbackInfo,
  DEFAULT_FALLBACK_CONFIG,
} from './provider-fallback';
import * as providerFactory from './provider-factory';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('provider-fallback', () => {
  describe('getFallbackModels', () => {
    it('returns fallback models for gpt-4-turbo', () => {
      const fallbacks = getFallbackModels('gpt-4-turbo');
      expect(fallbacks).toContain('claude-3-opus-20240229');
      expect(fallbacks).toContain('gemini-1.5-pro');
    });

    it('returns fallback models for claude-3-opus-20240229', () => {
      const fallbacks = getFallbackModels('claude-3-opus-20240229');
      expect(fallbacks).toContain('gpt-4-turbo');
      expect(fallbacks).toContain('gemini-1.5-pro');
    });

    it('returns fallback models for gemini-1.5-pro', () => {
      const fallbacks = getFallbackModels('gemini-1.5-pro');
      expect(fallbacks).toContain('gpt-4-turbo');
      expect(fallbacks).toContain('claude-3-opus-20240229');
    });

    it('returns fallback models for gpt-3.5-turbo', () => {
      const fallbacks = getFallbackModels('gpt-3.5-turbo');
      expect(fallbacks).toContain('claude-3-sonnet-20240229');
      expect(fallbacks).toContain('gemini-1.5-flash');
    });

    it('returns empty array for unknown model', () => {
      const fallbacks = getFallbackModels('unknown-model');
      expect(fallbacks).toEqual([]);
    });
  });

  describe('shouldFallback', () => {
    const config = DEFAULT_FALLBACK_CONFIG;

    it('returns true for rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('rate_limit');
    });

    it('returns true for 429 status errors', () => {
      const error = new Error('HTTP error! status: 429');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('rate_limit');
    });

    it('returns true for server errors (500)', () => {
      const error = new Error('HTTP error! status: 500');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('server_error');
    });

    it('returns true for server errors (503)', () => {
      const error = new Error('HTTP error! status: 503');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('server_error');
    });

    it('returns true for timeout errors', () => {
      const error = new Error('Request timed out');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('timeout');
    });

    it('returns true for model unavailable errors', () => {
      const error = new Error('Model does not exist');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('model_unavailable');
    });

    it('returns true for quota exceeded errors', () => {
      const error = new Error('Quota exceeded');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('quota_exceeded');
    });

    it('returns true for network errors', () => {
      const error = new Error('Network connection failed');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(true);
      expect(result.errorType).toBe('network');
    });

    it('returns false for validation errors', () => {
      const error = new Error('Invalid request format');
      const result = shouldFallback(error, config);
      expect(result.shouldFallback).toBe(false);
      expect(result.errorType).toBeNull();
    });

    it('respects fallbackOnErrors config', () => {
      const customConfig = {
        ...config,
        fallbackOnErrors: ['server_error'] as ('server_error')[],
      };

      const rateLimitError = new Error('Rate limit exceeded');
      const serverError = new Error('HTTP error! status: 500');

      expect(shouldFallback(rateLimitError, customConfig).shouldFallback).toBe(false);
      expect(shouldFallback(serverError, customConfig).shouldFallback).toBe(true);
    });
  });

  describe('createCompletionWithFallback', () => {
    let mockProvider: {
      providerType: string;
      supportedModels: string[];
      isModelSupported: () => boolean;
      getDefaultModel: () => string;
      createCompletion: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockProvider = {
        providerType: 'openai',
        supportedModels: ['gpt-4-turbo'],
        isModelSupported: () => true,
        getDefaultModel: () => 'gpt-4-turbo',
        createCompletion: vi.fn(),
      };

      vi.spyOn(providerFactory, 'getProviderForModel').mockReturnValue(
        mockProvider as unknown as ReturnType<typeof providerFactory.getProviderForModel>
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('returns success without fallback on first attempt', async () => {
      mockProvider.createCompletion.mockResolvedValueOnce({
        data: 'Response',
        model: 'gpt-4-turbo',
        provider: 'openai',
      });

      const result = await createCompletionWithFallback(
        [{ role: 'user', content: 'Hello' }],
        'gpt-4-turbo'
      );

      expect(result.usedFallback).toBe(false);
      expect(result.originalModel).toBe('gpt-4-turbo');
      expect(result.fallbackAttempts).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('falls back on rate limit error', async () => {
      mockProvider.createCompletion
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          data: 'Response from fallback',
          model: 'claude-3-opus-20240229',
          provider: 'anthropic',
        });

      const onFallback = vi.fn();
      const result = await createCompletionWithFallback(
        [{ role: 'user', content: 'Hello' }],
        'gpt-4-turbo',
        undefined,
        { onFallback }
      );

      expect(result.usedFallback).toBe(true);
      expect(result.fallbackAttempts).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(onFallback).toHaveBeenCalled();
    });

    it('throws when all fallbacks fail', async () => {
      mockProvider.createCompletion.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        createCompletionWithFallback(
          [{ role: 'user', content: 'Hello' }],
          'gpt-4-turbo',
          undefined,
          { maxFallbackAttempts: 1 }
        )
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('does not fallback when enableFallback is false', async () => {
      mockProvider.createCompletion.mockRejectedValueOnce(
        new Error('Rate limit exceeded')
      );

      await expect(
        createCompletionWithFallback(
          [{ role: 'user', content: 'Hello' }],
          'gpt-4-turbo',
          undefined,
          { enableFallback: false }
        )
      ).rejects.toThrow('Rate limit exceeded');

      expect(mockProvider.createCompletion).toHaveBeenCalledTimes(1);
    });

    it('does not fallback on validation errors', async () => {
      mockProvider.createCompletion.mockRejectedValueOnce(
        new Error('Invalid request format')
      );

      await expect(
        createCompletionWithFallback(
          [{ role: 'user', content: 'Hello' }],
          'gpt-4-turbo'
        )
      ).rejects.toThrow('Invalid request format');

      expect(mockProvider.createCompletion).toHaveBeenCalledTimes(1);
    });

    it('respects maxFallbackAttempts', async () => {
      mockProvider.createCompletion.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      await expect(
        createCompletionWithFallback(
          [{ role: 'user', content: 'Hello' }],
          'gpt-4-turbo',
          undefined,
          { maxFallbackAttempts: 2 }
        )
      ).rejects.toThrow();

      // Primary + 2 fallback attempts = 3 total
      expect(mockProvider.createCompletion).toHaveBeenCalledTimes(3);
    });
  });

  describe('getFallbackInfo', () => {
    it('returns model info and fallback options for gpt-4-turbo', () => {
      const info = getFallbackInfo('gpt-4-turbo');

      expect(info.model).toBeDefined();
      expect(info.model?.id).toBe('gpt-4-turbo');
      expect(info.fallbackModels.length).toBeGreaterThan(0);
      expect(info.fallbackModels[0].priority).toBe(1);
    });

    it('returns undefined model for unknown model', () => {
      const info = getFallbackInfo('unknown-model');

      expect(info.model).toBeUndefined();
      expect(info.fallbackModels).toHaveLength(0);
    });

    it('fallback models have ascending priorities', () => {
      const info = getFallbackInfo('gpt-4-turbo');

      for (let i = 1; i < info.fallbackModels.length; i++) {
        expect(info.fallbackModels[i].priority).toBeGreaterThan(
          info.fallbackModels[i - 1].priority
        );
      }
    });
  });

  describe('DEFAULT_FALLBACK_CONFIG', () => {
    it('has sensible defaults', () => {
      expect(DEFAULT_FALLBACK_CONFIG.maxFallbackAttempts).toBeGreaterThan(0);
      expect(DEFAULT_FALLBACK_CONFIG.enableFallback).toBe(true);
      expect(DEFAULT_FALLBACK_CONFIG.fallbackOrder.length).toBeGreaterThan(0);
      expect(DEFAULT_FALLBACK_CONFIG.fallbackOnErrors.length).toBeGreaterThan(0);
    });

    it('includes all major providers in fallback order', () => {
      expect(DEFAULT_FALLBACK_CONFIG.fallbackOrder).toContain('openai');
      expect(DEFAULT_FALLBACK_CONFIG.fallbackOrder).toContain('anthropic');
      expect(DEFAULT_FALLBACK_CONFIG.fallbackOrder).toContain('gemini');
    });
  });
});
