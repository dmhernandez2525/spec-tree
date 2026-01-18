import { AICompletionRequest, ANTHROPIC_MODELS } from '../../types/ai.types';

// Mock Anthropic before importing
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
      stream: jest.fn(),
    },
  }));
});

const originalEnv = process.env;

describe('AnthropicProvider', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isConfigured', () => {
    it('returns true when API key is set', async () => {
      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();
      expect(provider.isConfigured()).toBe(true);
    });

    it('returns false when API key is not set', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();
      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();
      expect(provider.isConfigured()).toBe(false);
    });
  });

  describe('getAvailableModels', () => {
    it('returns Anthropic models', async () => {
      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();
      const models = provider.getAvailableModels();
      expect(models).toEqual(ANTHROPIC_MODELS);
    });
  });

  describe('generateCompletion', () => {
    it('throws error when not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();
      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('Anthropic provider is not configured');
    });

    it('generates completion successfully', async () => {
      const Anthropic = jest.requireMock('@anthropic-ai/sdk');
      const mockCreate = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Hello from Claude!' }],
        usage: { input_tokens: 5, output_tokens: 4 },
        stop_reason: 'end_turn',
      });
      Anthropic.mockImplementation(() => ({
        messages: { create: mockCreate, stream: jest.fn() },
      }));

      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();

      const request: AICompletionRequest = {
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' },
        ],
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 100,
      };

      const result = await provider.generateCompletion(request);

      expect(result.content).toBe('Hello from Claude!');
      expect(result.provider).toBe('anthropic');
      expect(result.usage).toEqual({
        promptTokens: 5,
        completionTokens: 4,
        totalTokens: 9,
      });
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'claude-3-5-sonnet-20241022',
          system: 'You are helpful',
          messages: [{ role: 'user', content: 'Hello' }],
        })
      );
    });

    it('throws error when no text content in response', async () => {
      const Anthropic = jest.requireMock('@anthropic-ai/sdk');
      const mockCreate = jest.fn().mockResolvedValue({
        content: [{ type: 'tool_use', id: '123' }],
        usage: { input_tokens: 5, output_tokens: 0 },
      });
      Anthropic.mockImplementation(() => ({
        messages: { create: mockCreate, stream: jest.fn() },
      }));

      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      await expect(provider.generateCompletion(request))
        .rejects.toThrow('No text content in Anthropic response');
    });
  });

  describe('generateStream', () => {
    it('throws error when not configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      jest.resetModules();
      const { AnthropicProvider } = await import('./anthropic.provider');
      const provider = new AnthropicProvider();

      const request: AICompletionRequest = {
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
      };

      const stream = provider.generateStream(request);
      await expect(stream.next()).rejects.toThrow('Anthropic provider is not configured');
    });
  });
});
