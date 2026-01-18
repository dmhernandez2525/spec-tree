import { AICompletionRequest, GEMINI_MODELS } from '../../types/ai.types';

// Mock Google AI before importing
jest.mock('@google/generative-ai', () => {
  const mockSendMessage = jest.fn();
  const mockSendMessageStream = jest.fn();
  const mockStartChat = jest.fn().mockReturnValue({
    sendMessage: mockSendMessage,
    sendMessageStream: mockSendMessageStream,
  });
  const mockGetGenerativeModel = jest.fn().mockReturnValue({
    startChat: mockStartChat,
  });

  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

const originalEnv = process.env;

describe('GeminiProvider', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GOOGLE_AI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isConfigured', () => {
    it('returns true when API key is set', async () => {
      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when API key is not set', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      jest.resetModules();
      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('getAvailableModels', () => {
    it('returns Gemini models', async () => {
      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();
      const models = provider.getAvailableModels();
      expect(models).toEqual(GEMINI_MODELS);
    });
  });

  describe('generateCompletion', () => {
    it('throws error when not configured', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      jest.resetModules();
      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('Gemini provider is not configured');
    });

    it('generates completion successfully', async () => {
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai');
      const mockSendMessage = jest.fn().mockResolvedValue({
        response: {
          text: () => 'Hello from Gemini!',
          usageMetadata: {
            promptTokenCount: 5,
            candidatesTokenCount: 4,
            totalTokenCount: 9,
          },
          candidates: [{ finishReason: 'STOP' }],
        },
      });
      const mockStartChat = jest.fn().mockReturnValue({
        sendMessage: mockSendMessage,
      });
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({ startChat: mockStartChat }),
      }));

      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();

      const request: AICompletionRequest = {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
        ],
        model: 'gemini-1.5-pro',
      };

      const result = await provider.generateCompletion(request);

      expect(result.content).toBe('Hello from Gemini!');
      expect(result.provider).toBe('gemini');
      expect(result.usage).toEqual({
        promptTokens: 5,
        completionTokens: 4,
        totalTokens: 9,
      });
    });

    it('throws error when last message is not from user', async () => {
      const { GoogleGenerativeAI } = jest.requireMock('@google/generative-ai');
      const mockStartChat = jest.fn().mockReturnValue({
        sendMessage: jest.fn(),
      });
      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({ startChat: mockStartChat }),
      }));

      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();

      const request: AICompletionRequest = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi' },
        ],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('Last message must be from user');
    });
  });

  describe('generateStream', () => {
    it('throws error when not configured', async () => {
      delete process.env.GOOGLE_AI_API_KEY;
      jest.resetModules();
      const { GeminiProvider } = await import('./gemini.provider');
      const provider = new GeminiProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
      };

      const stream = provider.generateStream(request);
      await expect(stream.next()).rejects.toThrow('Gemini provider is not configured');
    });
  });
});
