import { logger } from '@/lib/logger';

interface OpenAIProxyConfig {
  baseURL: string;
  apiKey: string;
}

interface CompletionOptions {
  maxTokens?: number;
}

export class OpenAIProxy {
  private baseURL: string;
  private apiKey: string;

  constructor(config: OpenAIProxyConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
  }

  async createCompletion(
    messages: Array<{ role: string; content: string }>,
    model?: string,
    options?: CompletionOptions
  ) {
    try {
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
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('OpenAI Proxy Error:', error);
      throw error;
    }
  }
}

// Initialize the proxy
export const openAIProxy = new OpenAIProxy({
  baseURL: process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MICROSERVICE_API_KEY || '',
});
