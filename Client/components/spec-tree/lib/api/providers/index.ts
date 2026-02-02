/**
 * AI Providers Module
 *
 * F1.3.6 - Claude provider integration
 *
 * Unified export for all AI provider functionality.
 */

// Core types and interfaces
export {
  type AIProvider,
  type AIProviderType,
  type AIMessage,
  type AICompletionOptions,
  type AICompletionResponse,
  type AIProviderConfig,
  type AIModelInfo,
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
  ALL_MODELS,
  getModelInfo,
  getProviderFromModel,
  getModelsForProvider,
} from './ai-provider';

// OpenAI provider
export { OpenAIProviderAdapter, openAIProvider } from './openai-adapter';

// Claude provider
export { ClaudeProxy, ClaudeRateLimitedError, claudeProxy } from './claude-proxy';

// Gemini provider
export { GeminiProxy, GeminiRateLimitedError, geminiProxy } from './gemini-proxy';

// Provider factory
export {
  getProvider,
  getProviderForModel,
  registerProvider,
  getAllProviders,
  getAvailableProviderTypes,
  isProviderAvailable,
  createCompletion,
  isModelAvailable,
} from './provider-factory';

// Provider fallback
export {
  type FallbackConfig,
  type FallbackErrorType,
  type FallbackCompletionResult,
  DEFAULT_FALLBACK_CONFIG,
  getFallbackModels,
  shouldFallback,
  createCompletionWithFallback,
  getFallbackInfo,
} from './provider-fallback';
