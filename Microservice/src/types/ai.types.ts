// AI Provider Types - Multi-provider abstraction layer

export type AIProviderType = 'openai' | 'anthropic' | 'gemini';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  provider?: AIProviderType;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  provider: AIProviderType;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface AIProvider {
  name: AIProviderType;
  generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse>;
  generateStream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk>;
  getAvailableModels(): AIModel[];
  isConfigured(): boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderType;
  contextWindow: number;
  maxOutputTokens: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
}

export interface AIProviderConfig {
  apiKey?: string;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
}

// Provider-specific model lists - Pricing updated January 2026
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    inputPricePerMillion: 10,
    outputPricePerMillion: 30,
  },
  {
    id: 'o1',
    name: 'o1 (Reasoning)',
    provider: 'openai',
    contextWindow: 200000,
    maxOutputTokens: 100000,
    inputPricePerMillion: 15,
    outputPricePerMillion: 60,
  },
  {
    id: 'o1-mini',
    name: 'o1 Mini',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 65536,
    inputPricePerMillion: 3,
    outputPricePerMillion: 12,
  },
];

export const ANTHROPIC_MODELS: AIModel[] = [
  {
    id: 'claude-opus-4-5-20251101',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 32000,
    inputPricePerMillion: 5,
    outputPricePerMillion: 25,
  },
  {
    id: 'claude-sonnet-4-5-20251101',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 16000,
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
  },
  {
    id: 'claude-haiku-4-5-20251022',
    name: 'Claude Haiku 4.5',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    inputPricePerMillion: 1,
    outputPricePerMillion: 5,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 8192,
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
  },
];

export const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 10,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 65536,
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 3,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.3,
  },
];

export const ALL_MODELS: AIModel[] = [
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GEMINI_MODELS,
];
