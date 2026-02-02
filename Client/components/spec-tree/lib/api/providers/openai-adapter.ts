/**
 * OpenAI Provider Adapter
 *
 * F1.3.6 - Claude provider integration
 *
 * Adapts the existing OpenAI proxy to implement the AIProvider interface.
 */

import { OpenAIProxy, openAIProxy } from '../openai-proxy';
import {
  AIProvider,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  OPENAI_MODELS,
} from './ai-provider';

/**
 * Adapter to make OpenAIProxy implement AIProvider interface
 */
export class OpenAIProviderAdapter implements AIProvider {
  private proxy: OpenAIProxy;

  readonly providerType = 'openai' as const;
  readonly supportedModels = OPENAI_MODELS.map((m) => m.id);

  constructor(proxy: OpenAIProxy) {
    this.proxy = proxy;
  }

  isModelSupported(model: string): boolean {
    return this.supportedModels.includes(model) || model.startsWith('gpt-');
  }

  getDefaultModel(): string {
    return 'gpt-3.5-turbo-16k';
  }

  async createCompletion(
    messages: AIMessage[],
    model?: string,
    options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const response = await this.proxy.createCompletion(
      messages.map((m) => ({ role: m.role, content: m.content })),
      model || this.getDefaultModel(),
      {
        maxTokens: options?.maxTokens,
        onRateLimitRetry: options?.onRateLimitRetry,
      }
    );

    return {
      data: response.data,
      model: model || this.getDefaultModel(),
      provider: 'openai',
      usage: response.usage,
    };
  }
}

/**
 * Default OpenAI provider instance
 */
export const openAIProvider = new OpenAIProviderAdapter(openAIProxy);
