import { AICompletionRequest, OPENAI_MODELS } from '../../types/ai.types';

// Mock OpenAI before importing the provider
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

// Set env before importing
const originalEnv = process.env;

describe('OpenAIProvider', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, OPENAI_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isConfigured', () => {
    it('returns true when API key is set', async () => {
      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when API key is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      jest.resetModules();
      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('getAvailableModels', () => {
    it('returns OpenAI models', async () => {
      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();
      const models = provider.getAvailableModels();
      expect(models).toEqual(OPENAI_MODELS);
    });
  });

  describe('generateCompletion', () => {
    it('throws error when not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      jest.resetModules();
      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('OpenAI provider is not configured');
    });

    it('generates completion successfully', async () => {
      const OpenAI = jest.requireMock('openai');
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Hello back!' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 },
      });
      OpenAI.mockImplementation(() => ({
        chat: { completions: { create: mockCreate } },
      }));

      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4o',
        maxTokens: 100,
        temperature: 0.5,
      };

      const result = await provider.generateCompletion(request);

      expect(result.content).toBe('Hello back!');
      expect(result.provider).toBe('openai');
      expect(result.model).toBe('gpt-4o');
      expect(result.usage).toEqual({
        promptTokens: 5,
        completionTokens: 3,
        totalTokens: 8,
      });
    });

    it('throws error when no content in response', async () => {
      const OpenAI = jest.requireMock('openai');
      const mockCreate = jest.fn().mockResolvedValue({
        choices: [{ message: { content: null }, finish_reason: 'stop' }],
      });
      OpenAI.mockImplementation(() => ({
        chat: { completions: { create: mockCreate } },
      }));

      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('No completion generated from OpenAI');
    });
  });

  describe('generateStream', () => {
    it('throws error when not configured', async () => {
      delete process.env.OPENAI_API_KEY;
      jest.resetModules();
      const { OpenAIProvider } = await import('./openai.provider');
      const provider = new OpenAIProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
      };

      const stream = provider.generateStream(request);
      await expect(stream.next()).rejects.toThrow('OpenAI provider is not configured');
    });
  });
});
