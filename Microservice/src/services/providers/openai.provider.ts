import OpenAI from 'openai';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  OPENAI_MODELS,
} from '../../types/ai.types';
import { AppError } from '../error.service';

export class OpenAIProvider implements AIProvider {
  name: 'openai' = 'openai';
  private client: OpenAI | null = null;
  private defaultModel = 'gpt-4o';

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  getAvailableModels(): AIModel[] {
    return OPENAI_MODELS;
  }

  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.client) {
      throw new AppError(500, 'OpenAI provider is not configured');
    }

    const model = request.model || this.defaultModel;
    const messages = request.messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    try {
      const completion = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new AppError(500, 'No completion generated from OpenAI');
      }

      return {
        content: choice.message.content,
        provider: 'openai',
        model,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens,
            }
          : undefined,
        finishReason: choice.finish_reason || undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown OpenAI error';
      throw new AppError(500, `OpenAI API error: ${message}`);
    }
  }

  async *generateStream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    if (!this.client) {
      throw new AppError(500, 'OpenAI provider is not configured');
    }

    const model = request.model || this.defaultModel;
    const messages = request.messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content,
    }));

    try {
      const stream = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        const done = chunk.choices[0]?.finish_reason !== null;
        yield { content, done };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OpenAI streaming error';
      throw new AppError(500, `OpenAI streaming error: ${message}`);
    }
  }
}

export const openAIProvider = new OpenAIProvider();
