import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiProxy, GeminiRateLimitedError } from './gemini-proxy';
import type { AIMessage } from './ai-provider';

// Helper to create a proper mock response with clone method
function createMockResponse(data: {
  ok: boolean;
  status?: number;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
}) {
  const response = {
    ok: data.ok,
    status: data.status ?? (data.ok ? 200 : 500),
    json: data.json ?? (async () => ({})),
    text: data.text ?? (async () => ''),
    clone: function () {
      return { ...this };
    },
  };
  return response;
}

// Mock fetch
const mockFetch = vi.fn();

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('GeminiProxy', () => {
  let proxy: GeminiProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    proxy = new GeminiProxy({
      baseURL: 'http://localhost:3001',
      apiKey: 'test-api-key',
      rateLimitConfig: {
        maxRetries: 0, // Disable retries in tests
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes with correct provider type', () => {
      expect(proxy.providerType).toBe('gemini');
    });

    it('has supported Gemini models', () => {
      expect(proxy.supportedModels.length).toBeGreaterThan(0);
      expect(proxy.supportedModels).toContain('gemini-1.5-pro');
      expect(proxy.supportedModels).toContain('gemini-1.5-flash');
      expect(proxy.supportedModels).toContain('gemini-pro');
    });
  });

  describe('isModelSupported', () => {
    it('returns true for supported models', () => {
      expect(proxy.isModelSupported('gemini-1.5-pro')).toBe(true);
      expect(proxy.isModelSupported('gemini-1.5-flash')).toBe(true);
      expect(proxy.isModelSupported('gemini-pro')).toBe(true);
    });

    it('returns true for models starting with gemini-', () => {
      expect(proxy.isModelSupported('gemini-future-model')).toBe(true);
    });

    it('returns false for non-Gemini models', () => {
      expect(proxy.isModelSupported('gpt-4')).toBe(false);
      expect(proxy.isModelSupported('claude-3-opus')).toBe(false);
      expect(proxy.isModelSupported('unknown-model')).toBe(false);
    });
  });

  describe('getDefaultModel', () => {
    it('returns gemini-1.5-flash as default', () => {
      expect(proxy.getDefaultModel()).toBe('gemini-1.5-flash');
    });
  });

  describe('createCompletion', () => {
    const mockMessages: AIMessage[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello' },
    ];

    it('makes request to correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Hello! How can I help you?',
            model: 'gemini-1.5-flash',
            usage: {
              promptTokenCount: 10,
              candidatesTokenCount: 8,
              totalTokenCount: 18,
            },
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/gemini/completion',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });

    it('converts system message to Gemini format', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.systemInstruction).toEqual({
        parts: [{ text: 'You are a helpful assistant.' }],
      });
      expect(callArgs.contents).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
      ]);
    });

    it('uses default model when not specified', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.model).toBe('gemini-1.5-flash');
    });

    it('uses specified model', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-pro',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, 'gemini-1.5-pro');

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.model).toBe('gemini-1.5-pro');
    });

    it('passes maxTokens in generationConfig', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, undefined, { maxTokens: 2048 });

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.generationConfig.maxOutputTokens).toBe(2048);
    });

    it('passes temperature in generationConfig', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, undefined, { temperature: 0.7 });

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.generationConfig.temperature).toBe(0.7);
    });

    it('returns properly formatted response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Hello! How can I help?',
            model: 'gemini-1.5-flash',
            usage: {
              promptTokenCount: 15,
              candidatesTokenCount: 6,
              totalTokenCount: 21,
            },
          }),
        })
      );

      const response = await proxy.createCompletion(mockMessages);

      expect(response.data).toBe('Hello! How can I help?');
      expect(response.model).toBe('gemini-1.5-flash');
      expect(response.provider).toBe('gemini');
      expect(response.usage).toEqual({
        prompt_tokens: 15,
        completion_tokens: 6,
        total_tokens: 21,
      });
    });

    it('handles response without usage data', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      const response = await proxy.createCompletion(mockMessages);

      expect(response.data).toBe('Response');
      expect(response.usage).toBeUndefined();
    });

    it('throws GeminiRateLimitedError on 429 status', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded',
        })
      );

      await expect(proxy.createCompletion(mockMessages)).rejects.toThrow(
        GeminiRateLimitedError
      );
    });

    it('throws error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: false,
          status: 500,
          text: async () => 'Internal server error',
        })
      );

      await expect(proxy.createCompletion(mockMessages)).rejects.toThrow();
    });

    it('handles multiple user/model messages', async () => {
      const conversationMessages: AIMessage[] = [
        { role: 'system', content: 'You are helpful.' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: "I'm doing well!",
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(conversationMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.systemInstruction).toEqual({
        parts: [{ text: 'You are helpful.' }],
      });
      expect(callArgs.contents).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] },
        { role: 'user', parts: [{ text: 'How are you?' }] },
      ]);
    });

    it('handles messages without system prompt', async () => {
      const noSystemMessages: AIMessage[] = [{ role: 'user', content: 'Hello' }];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Hi!',
            model: 'gemini-1.5-flash',
          }),
        })
      );

      await proxy.createCompletion(noSystemMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.systemInstruction).toBeUndefined();
      expect(callArgs.contents).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
      ]);
    });
  });
});

describe('GeminiRateLimitedError', () => {
  it('has correct name and properties', () => {
    const error = new GeminiRateLimitedError(
      'Rate limited',
      { status: 429, message: 'Too many requests', isRateLimited: true },
      3,
      5000
    );

    expect(error.name).toBe('GeminiRateLimitedError');
    expect(error.message).toBe('Rate limited');
    expect(error.rateLimitError.status).toBe(429);
    expect(error.attempts).toBe(3);
    expect(error.totalDelayMs).toBe(5000);
  });
});
