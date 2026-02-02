import { logger } from '@/lib/logger';
import {
  withRateLimitRetry,
  getRateLimitMessage,
  RateLimitError,
  RateLimitConfig,
  RATE_LIMIT_DEFAULT_CONFIG,
} from '@/lib/utils/rate-limit';

interface OpenAIProxyConfig {
  baseURL: string;
  apiKey: string;
  rateLimitConfig?: Partial<RateLimitConfig>;
}

interface CompletionOptions {
  maxTokens?: number;
  onRateLimitRetry?: (attempt: number, delayMs: number, error: RateLimitError) => void;
}

export interface OpenAIProxyResponse {
  data: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class RateLimitedError extends Error {
  constructor(
    message: string,
    public rateLimitError: RateLimitError,
    public attempts: number,
    public totalDelayMs: number
  ) {
    super(message);
    this.name = 'RateLimitedError';
  }
}

export class OpenAIProxy {
  private baseURL: string;
  private apiKey: string;
  private rateLimitConfig: Partial<RateLimitConfig>;

  constructor(config: OpenAIProxyConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.rateLimitConfig = config.rateLimitConfig || {};
  }

  async createCompletion(
    messages: Array<{ role: string; content: string }>,
    model?: string,
    options?: CompletionOptions
  ): Promise<OpenAIProxyResponse> {
    const result = await withRateLimitRetry(
      async () => {
        const response = await fetch(`${this.baseURL}/api/openai/completion`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            messages,
            model: model || 'gpt-3.5-turbo-16k',
            max_tokens: options?.maxTokens,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          const error = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
          // Attach status for rate limit detection
          (error as Error & { status?: number }).status = response.status;
          throw error;
        }

        const data = await response.json();
        return data as OpenAIProxyResponse;
      },
      {
        ...RATE_LIMIT_DEFAULT_CONFIG,
        ...this.rateLimitConfig,
      },
      (attempt, delayMs, error) => {
        logger.log('OpenAI Proxy', `Rate limited, retry attempt ${attempt}`, {
          delayMs,
          status: error.status,
        });
        options?.onRateLimitRetry?.(attempt, delayMs, error);
      }
    );

    if (result.error) {
      const userMessage = getRateLimitMessage(result.error);
      logger.error('OpenAI Proxy Error', userMessage, {
        attempts: result.attempts,
        totalDelayMs: result.totalDelayMs,
        error: result.error,
      });

      throw new RateLimitedError(
        userMessage,
        result.error,
        result.attempts,
        result.totalDelayMs
      );
    }

    if (result.attempts > 1) {
      logger.log('OpenAI Proxy', `Request succeeded after ${result.attempts} attempts`, {
        totalDelayMs: result.totalDelayMs,
      });
    }

    return result.data as OpenAIProxyResponse;
  }
}

// Initialize the proxy
export const openAIProxy = new OpenAIProxy({
  baseURL: process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MICROSERVICE_API_KEY || '',
});
