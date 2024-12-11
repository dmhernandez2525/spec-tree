interface OpenAIProxyConfig {
  baseURL: string;
  apiKey: string;
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
    model?: string
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
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OpenAI Proxy Error:', error);
      throw error;
    }
  }
}

// Initialize the proxy
export const openAIProxy = new OpenAIProxy({
  baseURL: process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001',
  apiKey: process.env.NEXT_PUBLIC_MICROSERVICE_API_KEY || '',
});
