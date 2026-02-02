/**
 * AI Provider Factory
 *
 * F1.3.6 - Claude provider integration
 * F1.3.8 - Provider fallback mechanism (partial)
 *
 * Factory for creating and managing AI providers.
 * Supports automatic provider selection based on model.
 */

import {
  AIProvider,
  AIProviderType,
  AIMessage,
  AICompletionOptions,
  AICompletionResponse,
  getProviderFromModel,
  getModelInfo,
} from './ai-provider';
import { openAIProvider } from './openai-adapter';
import { claudeProxy } from './claude-proxy';
import { geminiProxy } from './gemini-proxy';
import { logger } from '@/lib/logger';

/**
 * Registry of available providers
 */
const providers = new Map<AIProviderType, AIProvider>();
providers.set('openai', openAIProvider);
providers.set('anthropic', claudeProxy);
providers.set('gemini', geminiProxy);

/**
 * Get a provider by type
 */
export function getProvider(type: AIProviderType): AIProvider | undefined {
  return providers.get(type);
}

/**
 * Get the provider for a specific model
 */
export function getProviderForModel(modelId: string): AIProvider | undefined {
  const providerType = getProviderFromModel(modelId);
  if (!providerType) {
    // Try to infer from model name
    if (modelId.startsWith('gpt-')) {
      return providers.get('openai');
    }
    if (modelId.startsWith('claude-')) {
      return providers.get('anthropic');
    }
    if (modelId.startsWith('gemini-')) {
      return providers.get('gemini');
    }
    return undefined;
  }
  return providers.get(providerType);
}

/**
 * Register a new provider
 */
export function registerProvider(type: AIProviderType, provider: AIProvider): void {
  providers.set(type, provider);
  logger.log('Provider Factory', `Registered provider: ${type}`);
}

/**
 * Get all registered providers
 */
export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values());
}

/**
 * Get all available provider types
 */
export function getAvailableProviderTypes(): AIProviderType[] {
  return Array.from(providers.keys());
}

/**
 * Check if a provider is available
 */
export function isProviderAvailable(type: AIProviderType): boolean {
  return providers.has(type);
}

/**
 * Unified completion function that automatically selects the right provider
 */
export async function createCompletion(
  messages: AIMessage[],
  model: string,
  options?: AICompletionOptions
): Promise<AICompletionResponse> {
  const provider = getProviderForModel(model);

  if (!provider) {
    throw new Error(`No provider found for model: ${model}`);
  }

  const modelInfo = getModelInfo(model);
  logger.log('Provider Factory', `Using ${provider.providerType} for model ${model}`, {
    contextWindow: modelInfo?.contextWindow,
    maxOutputTokens: modelInfo?.maxOutputTokens,
  });

  return provider.createCompletion(messages, model, options);
}

/**
 * Check if a model is available across all providers
 */
export function isModelAvailable(model: string): boolean {
  const provider = getProviderForModel(model);
  return provider !== undefined && provider.isModelSupported(model);
}

export { openAIProvider, claudeProxy };
