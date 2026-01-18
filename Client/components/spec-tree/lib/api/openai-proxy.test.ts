import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock logger first
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
  },
}));

import { OpenAIProxy } from './openai-proxy';
import { logger } from '@/lib/logger';

describe('OpenAIProxy', () => {
  let proxy: OpenAIProxy;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Store original fetch
    originalFetch = global.fetch;

    // Create fresh proxy instance
    proxy = new OpenAIProxy({
      baseURL: 'http://test-api.com',
      apiKey: 'test-api-key',
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
        json: vi.fn().mockResolvedValue({ choices: [{ message: { content: 'test' } }] }),
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
        json: vi.fn().mockResolvedValue({ choices: [] }),
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
        json: vi.fn().mockResolvedValue({ choices: [] }),
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
        json: vi.fn().mockResolvedValue({ choices: [] }),
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
        choices: [{ message: { content: 'Response' } }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(expectedResponse),
      });

      const result = await proxy.createCompletion([{ role: 'user', content: 'Hello' }]);

      expect(result).toEqual(expectedResponse);
    });

    it('throws error on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Server Error'),
      });

      await expect(
        proxy.createCompletion([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow('HTTP error! status: 500, message: Server Error');
    });

    it('logs error on failure', async () => {
      const error = new Error('Network error');
      global.fetch = vi.fn().mockRejectedValue(error);

      await expect(
        proxy.createCompletion([{ role: 'user', content: 'Hello' }])
      ).rejects.toThrow('Network error');

      expect(logger.error).toHaveBeenCalledWith('OpenAI Proxy Error:', error);
    });
  });
});
