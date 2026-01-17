import Anthropic from '@anthropic-ai/sdk';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  ANTHROPIC_MODELS,
} from '../../types/ai.types';
import { AppError } from '../error.service';

export class AnthropicProvider implements AIProvider {
  name: 'anthropic' = 'anthropic';
  private client: Anthropic | null = null;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  getAvailableModels(): AIModel[] {
    return ANTHROPIC_MODELS;
  }

  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.client) {
      throw new AppError(500, 'Anthropic provider is not configured');
    }

    const model = request.model || this.defaultModel;

    // Extract system message and user messages
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages
      .filter((m) => m.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens || 4096,
        system: systemMessage?.content || '',
        messages: conversationMessages,
      });

      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new AppError(500, 'No text content in Anthropic response');
      }

      return {
        content: textContent.text,
        provider: 'anthropic',
        model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        finishReason: response.stop_reason || undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Anthropic error';
      throw new AppError(500, `Anthropic API error: ${message}`);
    }
  }

  async *generateStream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    if (!this.client) {
      throw new AppError(500, 'Anthropic provider is not configured');
    }

    const model = request.model || this.defaultModel;

    // Extract system message and user messages
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const conversationMessages = request.messages
      .filter((m) => m.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    try {
      const stream = await this.client.messages.stream({
        model,
        max_tokens: request.maxTokens || 4096,
        system: systemMessage?.content || '',
        messages: conversationMessages,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield { content: event.delta.text, done: false };
        }
        if (event.type === 'message_stop') {
          yield { content: '', done: true };
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Anthropic streaming error';
      throw new AppError(500, `Anthropic streaming error: ${message}`);
    }
  }
}

export const anthropicProvider = new AnthropicProvider();
