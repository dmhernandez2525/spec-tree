/**
 * Gemini (Google) Proxy
 *
 * F1.3.7 - Gemini provider integration
 *
 * Provides API integration with Google's Gemini models via a backend proxy.
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
  GEMINI_MODELS,
} from './ai-provider';

export interface GeminiProxyConfig extends AIProviderConfig {}

export interface GeminiProxyResponse {
  data: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  model: string;
  finishReason?: string;
}

export class GeminiRateLimitedError extends Error {
  constructor(
    message: string,
    public rateLimitError: RateLimitError,
    public attempts: number,
    public totalDelayMs: number
  ) {
    super(message);
    this.name = 'GeminiRateLimitedError';
  }
}

/**
 * Gemini API proxy client
 */
export class GeminiProxy implements AIProvider {
  private baseURL: string;
  private apiKey: string;
  private rateLimitConfig: Partial<RateLimitConfig>;

  readonly providerType = 'gemini' as const;
  readonly supportedModels = GEMINI_MODELS.map((m) => m.id);

  constructor(config: GeminiProxyConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.rateLimitConfig = config.rateLimitConfig || {};
  }

  isModelSupported(model: string): boolean {
    return this.supportedModels.includes(model) || model.startsWith('gemini-');
  }

  getDefaultModel(): string {
    return 'gemini-1.5-flash';
  }

  /**
   * Convert messages from standard format to Gemini format
   * Gemini has a different structure for conversations
   */
  private convertMessages(messages: AIMessage[]): {
    systemInstruction?: string;
    contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }>;
  } {
    let systemInstruction: string | undefined;
    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    return {
      systemInstruction,
      contents,
    };
  }

  async createCompletion(
    messages: AIMessage[],
    model?: string,
    options?: AICompletionOptions
  ): Promise<AICompletionResponse> {
    const selectedModel = model || this.getDefaultModel();
    const { systemInstruction, contents } = this.convertMessages(messages);

    const result = await withRateLimitRetry(
      async () => {
        const response = await fetch(`${this.baseURL}/api/gemini/completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            model: selectedModel,
            generationConfig: {
              maxOutputTokens: options?.maxTokens || 8192,
              temperature: options?.temperature,
            },
            systemInstruction: systemInstruction
              ? { parts: [{ text: systemInstruction }] }
              : undefined,
            contents,
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
        return data as GeminiProxyResponse;
      },
      {
        ...RATE_LIMIT_DEFAULT_CONFIG,
        ...this.rateLimitConfig,
      },
      (attempt, delayMs, error) => {
        logger.log('Gemini Proxy', `Rate limited, retry attempt ${attempt}`, {
          delayMs,
          status: error.status,
        });
        options?.onRateLimitRetry?.(attempt, delayMs, error);
      }
    );

    if (result.error) {
      const userMessage = getRateLimitMessage(result.error);
      logger.error('Gemini Proxy Error', userMessage, {
        attempts: result.attempts,
        totalDelayMs: result.totalDelayMs,
        error: result.error,
      });

      throw new GeminiRateLimitedError(
        userMessage,
        result.error,
        result.attempts,
        result.totalDelayMs
      );
    }

    if (result.attempts > 1) {
      logger.log('Gemini Proxy', `Request succeeded after ${result.attempts} attempts`, {
        totalDelayMs: result.totalDelayMs,
      });
    }

    const responseData = result.data as GeminiProxyResponse;

    return {
      data: responseData.data,
      model: responseData.model || selectedModel,
      provider: 'gemini',
      usage: responseData.usage
        ? {
            prompt_tokens: responseData.usage.promptTokenCount,
            completion_tokens: responseData.usage.candidatesTokenCount,
            total_tokens: responseData.usage.totalTokenCount,
          }
        : undefined,
    };
  }
}

/**
 * Initialize the Gemini proxy
 */
export const geminiProxy = new GeminiProxy({
  baseURL: process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MICROSERVICE_API_KEY || '',
});
