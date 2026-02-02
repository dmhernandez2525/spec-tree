import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClaudeProxy, ClaudeRateLimitedError } from './claude-proxy';
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

describe('ClaudeProxy', () => {
  let proxy: ClaudeProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set mock fetch before each test
    global.fetch = mockFetch;
    proxy = new ClaudeProxy({
      baseURL: 'http://localhost:3001',
      apiKey: 'test-api-key',
      rateLimitConfig: {
        maxRetries: 0, // Disable retries in tests for predictable behavior
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('initializes with correct provider type', () => {
      expect(proxy.providerType).toBe('anthropic');
    });

    it('has supported Claude models', () => {
      expect(proxy.supportedModels.length).toBeGreaterThan(0);
      expect(proxy.supportedModels).toContain('claude-3-opus-20240229');
      expect(proxy.supportedModels).toContain('claude-3-sonnet-20240229');
      expect(proxy.supportedModels).toContain('claude-3-haiku-20240307');
    });
  });

  describe('isModelSupported', () => {
    it('returns true for supported models', () => {
      expect(proxy.isModelSupported('claude-3-opus-20240229')).toBe(true);
      expect(proxy.isModelSupported('claude-3-sonnet-20240229')).toBe(true);
      expect(proxy.isModelSupported('claude-3-haiku-20240307')).toBe(true);
    });

    it('returns true for models starting with claude-', () => {
      expect(proxy.isModelSupported('claude-future-model')).toBe(true);
    });

    it('returns false for non-Claude models', () => {
      expect(proxy.isModelSupported('gpt-4')).toBe(false);
      expect(proxy.isModelSupported('unknown-model')).toBe(false);
    });
  });

  describe('getDefaultModel', () => {
    it('returns claude-3-sonnet as default', () => {
      expect(proxy.getDefaultModel()).toBe('claude-3-sonnet-20240229');
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
            model: 'claude-3-sonnet-20240229',
            usage: { input_tokens: 10, output_tokens: 8 },
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/anthropic/completion',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });

    it('converts system message to Claude format', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.system).toBe('You are a helpful assistant.');
      expect(callArgs.messages).toEqual([{ role: 'user', content: 'Hello' }]);
    });

    it('uses default model when not specified', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(mockMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.model).toBe('claude-3-sonnet-20240229');
    });

    it('uses specified model', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'claude-3-opus-20240229',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, 'claude-3-opus-20240229');

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.model).toBe('claude-3-opus-20240229');
    });

    it('passes maxTokens option', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, undefined, { maxTokens: 2048 });

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.max_tokens).toBe(2048);
    });

    it('passes temperature option', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Response',
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(mockMessages, undefined, { temperature: 0.7 });

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.temperature).toBe(0.7);
    });

    it('returns properly formatted response', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Hello! How can I help?',
            model: 'claude-3-sonnet-20240229',
            usage: { input_tokens: 15, output_tokens: 6 },
          }),
        })
      );

      const response = await proxy.createCompletion(mockMessages);

      expect(response.data).toBe('Hello! How can I help?');
      expect(response.model).toBe('claude-3-sonnet-20240229');
      expect(response.provider).toBe('anthropic');
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
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      const response = await proxy.createCompletion(mockMessages);

      expect(response.data).toBe('Response');
      expect(response.usage).toBeUndefined();
    });

    it('throws ClaudeRateLimitedError on 429 status', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 429,
          text: async () => 'Rate limit exceeded',
        })
      );

      await expect(proxy.createCompletion(mockMessages)).rejects.toThrow(
        ClaudeRateLimitedError
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

    it('handles multiple user/assistant messages', async () => {
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
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(conversationMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.system).toBe('You are helpful.');
      expect(callArgs.messages).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'user', content: 'How are you?' },
      ]);
    });

    it('handles messages without system prompt', async () => {
      const noSystemMessages: AIMessage[] = [{ role: 'user', content: 'Hello' }];

      mockFetch.mockResolvedValueOnce(
        createMockResponse({
          ok: true,
          json: async () => ({
            data: 'Hi!',
            model: 'claude-3-sonnet-20240229',
          }),
        })
      );

      await proxy.createCompletion(noSystemMessages);

      const callArgs = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callArgs.system).toBeUndefined();
      expect(callArgs.messages).toEqual([{ role: 'user', content: 'Hello' }]);
    });
  });
});

describe('ClaudeRateLimitedError', () => {
  it('has correct name and properties', () => {
    const error = new ClaudeRateLimitedError(
      'Rate limited',
      { status: 429, message: 'Too many requests', isRateLimited: true },
      3,
      5000
    );

    expect(error.name).toBe('ClaudeRateLimitedError');
    expect(error.message).toBe('Rate limited');
    expect(error.rateLimitError.status).toBe(429);
    expect(error.attempts).toBe(3);
    expect(error.totalDelayMs).toBe(5000);
  });
});
