/**
 * Claude (Anthropic) Proxy
 *
 * F1.3.6 - Claude provider integration
 *
 * Provides API integration with Anthropic's Claude models via a backend proxy.
 */

import { logger } from '@/lib/logger';
import {
  withRateLimitRetry,
  getRateLimitMessage,
  RateLimitError,
  RateLimitConfig,
  RATE_LIMIT_DEFAULT_CONFIG,
} from '@/lib/utils/rate-limit';
import {
  AIProvider,
  AIProviderConfig,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  ANTHROPIC_MODELS,
} from './ai-provider';

export interface ClaudeProxyConfig extends AIProviderConfig {}

export interface ClaudeProxyResponse {
  data: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  model: string;
  stop_reason?: string;
}

export class ClaudeRateLimitedError extends Error {
  constructor(
    message: string,
    public rateLimitError: RateLimitError,
    public attempts: number,
    public totalDelayMs: number
  ) {
    super(message);
    this.name = 'ClaudeRateLimitedError';
  }
}

/**
 * Claude API proxy client
 */
export class ClaudeProxy implements AIProvider {
  private baseURL: string;
  private apiKey: string;
  private rateLimitConfig: Partial<RateLimitConfig>;

  readonly providerType = 'anthropic' as const;
  readonly supportedModels = ANTHROPIC_MODELS.map((m) => m.id);

  constructor(config: ClaudeProxyConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.rateLimitConfig = config.rateLimitConfig || {};
  }

  isModelSupported(model: string): boolean {
    return this.supportedModels.includes(model) || model.startsWith('claude-');
  }

  getDefaultModel(): string {
    return 'claude-3-sonnet-20240229';
  }

  /**
   * Convert messages from OpenAI format to Claude format
   * Claude uses a different message structure
   */
  private convertMessages(messages: AIMessage[]): {
    system?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    let systemPrompt: string | undefined;
    const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
      } else {
        claudeMessages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    return {
      system: systemPrompt,
      messages: claudeMessages,
    };
  }

  async createCompletion(
    messages: AIMessage[],
    model?: string,
    options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const selectedModel = model || this.getDefaultModel();
    const { system, messages: claudeMessages } = this.convertMessages(messages);

    const result = await withRateLimitRetry(
      async () => {
        const response = await fetch(`${this.baseURL}/api/anthropic/completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            model: selectedModel,
            max_tokens: options?.maxTokens || 4096,
            temperature: options?.temperature,
            system,
            messages: claudeMessages,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          const error = new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
          (error as Error & { status?: number }).status = response.status;
          throw error;
        }

        const data = await response.json();
        return data as ClaudeProxyResponse;
      },
      {
        ...RATE_LIMIT_DEFAULT_CONFIG,
        ...this.rateLimitConfig,
      },
      (attempt, delayMs, error) => {
        logger.log('Claude Proxy', `Rate limited, retry attempt ${attempt}`, {
          delayMs,
          status: error.status,
        });
        options?.onRateLimitRetry?.(attempt, delayMs, error);
      }
    );

    if (result.error) {
      const userMessage = getRateLimitMessage(result.error);
      logger.error('Claude Proxy Error', userMessage, {
        attempts: result.attempts,
        totalDelayMs: result.totalDelayMs,
        error: result.error,
      });

      throw new ClaudeRateLimitedError(
        userMessage,
        result.error,
        result.attempts,
        result.totalDelayMs
      );
    }

    if (result.attempts > 1) {
      logger.log('Claude Proxy', `Request succeeded after ${result.attempts} attempts`, {
        totalDelayMs: result.totalDelayMs,
      });
    }

    const responseData = result.data as ClaudeProxyResponse;

    return {
      data: responseData.data,
      model: responseData.model || selectedModel,
      provider: 'anthropic',
      usage: responseData.usage
        ? {
            prompt_tokens: responseData.usage.input_tokens,
            completion_tokens: responseData.usage.output_tokens,
            total_tokens:
              responseData.usage.input_tokens + responseData.usage.output_tokens,
          }
        : undefined,
    };
  }
}

/**
 * Initialize the Claude proxy
 */
export const claudeProxy = new ClaudeProxy({
  baseURL: process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MICROSERVICE_API_KEY || '',
});
