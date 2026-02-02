/**
 * AI Provider Interface
 *
 * F1.3.6 - Claude provider integration
 *
 * Defines the common interface for all AI providers (OpenAI, Claude, Gemini, etc.)
 */

import { RateLimitError, RateLimitConfig } from '@/lib/utils/rate-limit';

export type AIProviderType = 'openai' | 'anthropic' | 'gemini';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  maxTokens?: number;
  temperature?: number;
  onRateLimitRetry?: (attempt: number, delayMs: number, error: RateLimitError) => void;
}

export interface AICompletionResponse {
  data: string;
  model: string;
  provider: AIProviderType;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIProviderConfig {
  baseURL: string;
  apiKey: string;
  rateLimitConfig?: Partial<RateLimitConfig>;
}

/**
 * Base interface for all AI providers
 */
export interface AIProvider {
  readonly providerType: AIProviderType;
  readonly supportedModels: string[];

  /**
   * Create a completion with the AI model
   */
  createCompletion(
    messages: AIMessage[],
    model?: string,
    options?: AICompletionOptions
  ): Promise<AICompletionResponse>;

  /**
   * Check if a model is supported by this provider
   */
  isModelSupported(model: string): boolean;

  /**
   * Get the default model for this provider
   */
  getDefaultModel(): string;
}

/**
 * Model information for selection UI
 */
export interface AIModelInfo {
  id: string;
  name: string;
  provider: AIProviderType;
  contextWindow: number;
  maxOutputTokens: number;
  description?: string;
}

/**
 * Available OpenAI models
 */
export const OPENAI_MODELS: AIModelInfo[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    description: 'Most capable OpenAI model with vision support',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    description: 'High-quality reasoning and generation',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    description: 'Fast and cost-effective',
  },
  {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    provider: 'openai',
    contextWindow: 16385,
    maxOutputTokens: 4096,
    description: 'Extended context window',
  },
];

/**
 * Available Anthropic Claude models
 */
export const ANTHROPIC_MODELS: AIModelInfo[] = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    description: 'Most powerful Claude model for complex tasks',
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    description: 'Balanced performance and speed',
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    contextWindow: 200000,
    maxOutputTokens: 4096,
    description: 'Fastest Claude model for simple tasks',
  },
];

/**
 * All available models across providers
 */
export const ALL_MODELS: AIModelInfo[] = [...OPENAI_MODELS, ...ANTHROPIC_MODELS];

/**
 * Get model info by ID
 */
export function getModelInfo(modelId: string): AIModelInfo | undefined {
  return ALL_MODELS.find((m) => m.id === modelId);
}

/**
 * Get provider type from model ID
 */
export function getProviderFromModel(modelId: string): AIProviderType | undefined {
  const model = getModelInfo(modelId);
  return model?.provider;
}

/**
 * Get models for a specific provider
 */
export function getModelsForProvider(provider: AIProviderType): AIModelInfo[] {
  return ALL_MODELS.filter((m) => m.provider === provider);
}
