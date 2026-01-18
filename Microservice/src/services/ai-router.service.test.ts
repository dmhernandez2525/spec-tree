import { Response } from 'express';
import { AICompletionRequest } from '../types/ai.types';

const mockOpenAIProvider = {
  name: 'openai' as const,
  isConfigured: jest.fn().mockReturnValue(true),
  getAvailableModels: jest.fn().mockReturnValue([
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, maxOutputTokens: 16384, inputPricePerMillion: 2.5, outputPricePerMillion: 10 },
  ]),
  generateCompletion: jest.fn(),
  generateStream: jest.fn(),
};

const mockAnthropicProvider = {
  name: 'anthropic' as const,
  isConfigured: jest.fn().mockReturnValue(false),
  getAvailableModels: jest.fn().mockReturnValue([]),
  generateCompletion: jest.fn(),
  generateStream: jest.fn(),
};

const mockGeminiProvider = {
  name: 'gemini' as const,
  isConfigured: jest.fn().mockReturnValue(false),
  getAvailableModels: jest.fn().mockReturnValue([]),
  generateCompletion: jest.fn(),
  generateStream: jest.fn(),
};

// Mock the providers before importing the service
jest.mock('./providers', () => ({
  openAIProvider: mockOpenAIProvider,
  anthropicProvider: mockAnthropicProvider,
  geminiProvider: mockGeminiProvider,
}));

// Import the service after setting up mocks
import { aiRouterService } from './ai-router.service';

describe('AIRouterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock states
    mockOpenAIProvider.isConfigured.mockReturnValue(true);
    mockOpenAIProvider.getAvailableModels.mockReturnValue([
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, maxOutputTokens: 16384, inputPricePerMillion: 2.5, outputPricePerMillion: 10 },
    ]);
    mockAnthropicProvider.isConfigured.mockReturnValue(false);
    mockAnthropicProvider.getAvailableModels.mockReturnValue([]);
    mockGeminiProvider.isConfigured.mockReturnValue(false);
    mockGeminiProvider.getAvailableModels.mockReturnValue([]);
  });

  describe('getProviderStatus', () => {
    it('returns status of all providers', () => {
      const status = aiRouterService.getProviderStatus();

      expect(status).toHaveLength(3);
      expect(status[0]).toEqual({
        provider: 'openai',
        configured: true,
        models: expect.any(Array),
      });
      expect(status[1]).toEqual({
        provider: 'anthropic',
        configured: false,
        models: [],
      });
    });
  });

  describe('getAvailableModels', () => {
    it('returns models from configured providers only', () => {
      const models = aiRouterService.getAvailableModels();

      expect(models.length).toBeGreaterThan(0);
      expect(models[0].provider).toBe('openai');
    });

    it('returns empty array when no providers are configured', () => {
      (mockOpenAIProvider.isConfigured as jest.Mock).mockReturnValue(false);

      const models = aiRouterService.getAvailableModels();

      expect(models).toEqual([]);

      // Restore
      (mockOpenAIProvider.isConfigured as jest.Mock).mockReturnValue(true);
    });
  });

  describe('generateCompletion', () => {
    it('generates completion using default provider', async () => {
      const mockResponse = {
        content: 'Hello!',
        provider: 'openai',
        model: 'gpt-4o',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
      (mockOpenAIProvider.generateCompletion as jest.Mock).mockResolvedValue(mockResponse);

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const result = await aiRouterService.generateCompletion(request);

      expect(result).toEqual(mockResponse);
      expect(mockOpenAIProvider.generateCompletion).toHaveBeenCalledWith(request);
    });

    it('throws error when requested provider is not configured', async () => {
      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        provider: 'anthropic',
      };

      await expect(aiRouterService.generateCompletion(request))
        .rejects.toThrow('Provider anthropic is not configured');
    });

    it('throws error for unknown provider', async () => {
      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        provider: 'unknown' as any,
      };

      await expect(aiRouterService.generateCompletion(request))
        .rejects.toThrow('Unknown provider: unknown');
    });

    it('throws error when no providers are configured', async () => {
      (mockOpenAIProvider.isConfigured as jest.Mock).mockReturnValue(false);

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await expect(aiRouterService.generateCompletion(request))
        .rejects.toThrow('No AI provider is configured');

      // Restore
      (mockOpenAIProvider.isConfigured as jest.Mock).mockReturnValue(true);
    });
  });

  describe('streamCompletion', () => {
    it('streams completion to response', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      async function* mockStream() {
        yield { content: 'Hello', done: false };
        yield { content: ' world', done: false };
        yield { content: '!', done: true };
      }
      (mockOpenAIProvider.generateStream as jest.Mock).mockReturnValue(mockStream());

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: true,
      };

      await aiRouterService.streamCompletion(request, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
      expect(mockRes.write).toHaveBeenCalledTimes(4); // 3 chunks + [DONE]
      expect(mockRes.end).toHaveBeenCalled();
    });

    it('handles stream errors gracefully', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
      } as unknown as Response;

      async function* mockErrorStream() {
        yield { content: 'Start', done: false };
        throw new Error('Stream failed');
      }
      (mockOpenAIProvider.generateStream as jest.Mock).mockReturnValue(mockErrorStream());

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hi' }],
        stream: true,
      };

      await aiRouterService.streamCompletion(request, mockRes);

      expect(mockRes.write).toHaveBeenCalledWith(
        expect.stringContaining('Stream failed')
      );
      expect(mockRes.end).toHaveBeenCalled();
    });
  });

  describe('estimateCost', () => {
    it('calculates cost for known model', () => {
      const cost = aiRouterService.estimateCost('gpt-4o', 1000, 500);

      expect(cost.inputCost).toBeCloseTo(0.0025, 5);
      expect(cost.outputCost).toBeCloseTo(0.005, 5);
      expect(cost.totalCost).toBeCloseTo(0.0075, 5);
    });

    it('returns zero cost for unknown model', () => {
      const cost = aiRouterService.estimateCost('unknown-model', 1000, 500);

      expect(cost).toEqual({ inputCost: 0, outputCost: 0, totalCost: 0 });
    });
  });
});
