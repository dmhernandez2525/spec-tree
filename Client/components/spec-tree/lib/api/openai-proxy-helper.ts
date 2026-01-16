import { openAIProxy } from './openai-proxy';
import { OpenAIMessage, ProxyError } from '../types/openai.types';

interface ProxyCallParams {
  systemPrompt: string;
  userPrompt: string;
  selectedModel: string;
  errorContext: string;
  maxTokens?: number;
}

export class OpenAIProxyError extends Error {
  constructor(
    message: string,
    public context: string,
    public originalError: unknown
  ) {
    super(message);
    this.name = 'OpenAIProxyError';
  }
}

export const makeProxyCall = async ({
  systemPrompt,
  userPrompt,
  selectedModel,
  errorContext,
  maxTokens = 4096,
}: ProxyCallParams) => {
  if (!systemPrompt || !userPrompt) {
    throw new OpenAIProxyError(
      'Missing required prompts',
      errorContext,
      new Error('System prompt and user prompt are required')
    );
  }

  try {
    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const response = await openAIProxy.createCompletion(
      messages,
      selectedModel,
      { maxTokens }
    );
    if (!response?.data) {
      throw new OpenAIProxyError(
        'Invalid response format',
        errorContext,
        new Error('Response missing required fields')
      );
    }

    return {
      data: {
        choices: [
          {
            message: {
              content: response.data,
            },
          },
        ],
      },
    };
  } catch (error) {
    const proxyError = error as ProxyError;

    throw new OpenAIProxyError(
      proxyError.response?.data?.error?.message ||
        proxyError.message ||
        'Unknown error',
      errorContext,
      error
    );
  }
};

export const isOpenAIProxyError = (
  error: unknown
): error is OpenAIProxyError => {
  return error instanceof OpenAIProxyError;
};
