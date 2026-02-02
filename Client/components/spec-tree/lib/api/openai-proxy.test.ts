import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock logger first
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

import { OpenAIProxy, RateLimitedError } from './openai-proxy';
import { logger } from '@/lib/logger';

describe('OpenAIProxy', () => {
  let proxy: OpenAIProxy;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Store original fetch
    originalFetch = global.fetch;

    // Create fresh proxy instance with no retries for faster tests
    proxy = new OpenAIProxy({
      baseURL: 'http://test-api.com',
      apiKey: 'test-api-key',
      rateLimitConfig: { maxRetries: 0 },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  describe('constructor', () => {
    it('creates instance with provided config', () => {
      const customProxy = new OpenAIProxy({
        baseURL: 'http://custom-url.com',
        apiKey: 'custom-key',
      });

      expect(customProxy).toBeInstanceOf(OpenAIProxy);
    });
  });

  describe('createCompletion', () => {
    it('sends request with correct structure', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test response' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const messages = [{ role: 'user', content: 'Hello' }];
      await proxy.createCompletion(messages);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/api/openai/completion',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          },
        })
      );
    });

    it('uses default model when not specified', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'response' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await proxy.createCompletion([{ role: 'user', content: 'Hello' }]);

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.model).toBe('gpt-3.5-turbo-16k');
    });

    it('uses provided model', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'response' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await proxy.createCompletion([{ role: 'user', content: 'Hello' }], 'gpt-4');

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.model).toBe('gpt-4');
    });

    it('includes maxTokens when provided', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'response' }),
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await proxy.createCompletion(
        [{ role: 'user', content: 'Hello' }],
        'gpt-4',
        { maxTokens: 1000 }
      );

      const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body.max_tokens).toBe(1000);
    });

    it('returns response data on success', async () => {
      const expectedResponse = {
        data: 'Response content',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(expectedResponse),
      });

      const result = await proxy.createCompletion([{ role: 'user', content: 'Hello' }]);

      expect(result).toEqual(expectedResponse);
    });

    it('throws RateLimitedError on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server Error'),
      });

      await expect(
        proxy.createCompletion([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow(RateLimitedError);
    });

    it('logs error on failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request'),
      });

      try {
        await proxy.createCompletion([{ role: 'user', content: 'Hello' }]);
      } catch {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalledWith(
        'OpenAI Proxy Error',
        expect.any(String),
        expect.objectContaining({
          attempts: expect.any(Number),
        })
      );
    });

    it('includes error details in RateLimitedError', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: vi.fn().mockResolvedValue('Rate limited'),
      });

      try {
        await proxy.createCompletion([{ role: 'user', content: 'Hello' }]);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitedError);
        const rateLimitError = error as RateLimitedError;
        expect(rateLimitError.rateLimitError.status).toBe(429);
        expect(rateLimitError.attempts).toBeGreaterThanOrEqual(1);
      }
    });
  });
});
