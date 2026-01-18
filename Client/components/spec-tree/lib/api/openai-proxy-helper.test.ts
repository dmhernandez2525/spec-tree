import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  makeProxyCall,
  OpenAIProxyError,
  isOpenAIProxyError,
} from './openai-proxy-helper';

// Mock the openai-proxy module
vi.mock('./openai-proxy', () => ({
  openAIProxy: {
    createCompletion: vi.fn(),
  },
}));

import { openAIProxy } from './openai-proxy';

describe('openai-proxy-helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OpenAIProxyError', () => {
    it('creates an error with correct properties', () => {
      const error = new OpenAIProxyError(
        'Test error',
        'test-context',
        new Error('original')
      );

      expect(error.message).toBe('Test error');
      expect(error.context).toBe('test-context');
      expect(error.name).toBe('OpenAIProxyError');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('is an instance of Error', () => {
      const error = new OpenAIProxyError('Test', 'context', null);

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('isOpenAIProxyError', () => {
    it('returns true for OpenAIProxyError instances', () => {
      const error = new OpenAIProxyError('Test', 'context', null);

      expect(isOpenAIProxyError(error)).toBe(true);
    });

    it('returns false for regular Error', () => {
      const error = new Error('Test');

      expect(isOpenAIProxyError(error)).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isOpenAIProxyError(null)).toBe(false);
      expect(isOpenAIProxyError(undefined)).toBe(false);
      expect(isOpenAIProxyError('string')).toBe(false);
      expect(isOpenAIProxyError(123)).toBe(false);
    });
  });

  describe('makeProxyCall', () => {
    it('throws error when system prompt is missing', async () => {
      await expect(
        makeProxyCall({
          systemPrompt: '',
          userPrompt: 'user prompt',
          selectedModel: 'gpt-4',
          errorContext: 'test',
        })
      ).rejects.toThrow(OpenAIProxyError);
    });

    it('throws error when user prompt is missing', async () => {
      await expect(
        makeProxyCall({
          systemPrompt: 'system prompt',
          userPrompt: '',
          selectedModel: 'gpt-4',
          errorContext: 'test',
        })
      ).rejects.toThrow(OpenAIProxyError);
    });

    it('makes successful proxy call', async () => {
      const mockResponse = {
        data: 'Generated content from AI',
      };

      vi.mocked(openAIProxy.createCompletion).mockResolvedValue(mockResponse);

      const result = await makeProxyCall({
        systemPrompt: 'You are a helpful assistant',
        userPrompt: 'Hello',
        selectedModel: 'gpt-4',
        errorContext: 'test',
      });

      expect(result.data.choices[0].message.content).toBe('Generated content from AI');
    });

    it('passes correct parameters to createCompletion', async () => {
      vi.mocked(openAIProxy.createCompletion).mockResolvedValue({
        data: 'response',
      });

      await makeProxyCall({
        systemPrompt: 'System',
        userPrompt: 'User',
        selectedModel: 'gpt-4o',
        errorContext: 'test',
        maxTokens: 2048,
      });

      expect(openAIProxy.createCompletion).toHaveBeenCalledWith(
        [
          { role: 'system', content: 'System' },
          { role: 'user', content: 'User' },
        ],
        'gpt-4o',
        { maxTokens: 2048 }
      );
    });

    it('uses default maxTokens when not provided', async () => {
      vi.mocked(openAIProxy.createCompletion).mockResolvedValue({
        data: 'response',
      });

      await makeProxyCall({
        systemPrompt: 'System',
        userPrompt: 'User',
        selectedModel: 'gpt-4',
        errorContext: 'test',
      });

      expect(openAIProxy.createCompletion).toHaveBeenCalledWith(
        expect.any(Array),
        'gpt-4',
        { maxTokens: 4096 }
      );
    });

    it('throws OpenAIProxyError on invalid response format', async () => {
      vi.mocked(openAIProxy.createCompletion).mockResolvedValue({
        data: null,
      });

      await expect(
        makeProxyCall({
          systemPrompt: 'System',
          userPrompt: 'User',
          selectedModel: 'gpt-4',
          errorContext: 'test-context',
        })
      ).rejects.toThrow(OpenAIProxyError);
    });

    it('throws OpenAIProxyError when createCompletion fails', async () => {
      vi.mocked(openAIProxy.createCompletion).mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        makeProxyCall({
          systemPrompt: 'System',
          userPrompt: 'User',
          selectedModel: 'gpt-4',
          errorContext: 'test',
        })
      ).rejects.toThrow(OpenAIProxyError);
    });

    it('includes error message from proxy error response', async () => {
      const proxyError = {
        response: {
          data: {
            error: {
              message: 'Rate limit exceeded',
            },
          },
        },
        message: 'Request failed',
      };

      vi.mocked(openAIProxy.createCompletion).mockRejectedValue(proxyError);

      try {
        await makeProxyCall({
          systemPrompt: 'System',
          userPrompt: 'User',
          selectedModel: 'gpt-4',
          errorContext: 'test',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(OpenAIProxyError);
        expect((error as OpenAIProxyError).message).toBe('Rate limit exceeded');
      }
    });
  });
});
