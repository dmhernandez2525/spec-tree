import { Response } from 'express';
import {
  AIProvider,
  AIProviderType,
  AICompletionRequest,
  AICompletionResponse,
  AIModel,
  ALL_MODELS,
} from '../types/ai.types';
import { openAIProvider, anthropicProvider, geminiProvider } from './providers';
import { AppError } from './error.service';

interface ProviderStatus {
  provider: AIProviderType;
  configured: boolean;
  models: AIModel[];
}

class AIRouterService {
  private providers: Map<AIProviderType, AIProvider>;
  private defaultProvider: AIProviderType = 'openai';

  constructor() {
    this.providers = new Map<AIProviderType, AIProvider>();
    this.providers.set('openai', openAIProvider);
    this.providers.set('anthropic', anthropicProvider);
    this.providers.set('gemini', geminiProvider);
  }

  /**
   * Get the status of all configured providers
   */
  getProviderStatus(): ProviderStatus[] {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      provider: type,
      configured: provider.isConfigured(),
      models: provider.isConfigured() ? provider.getAvailableModels() : [],
    }));
  }

  /**
   * Get all available models across all configured providers
   */
  getAvailableModels(): AIModel[] {
    const models: AIModel[] = [];
    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        models.push(...provider.getAvailableModels());
      }
    }
    return models;
  }

  /**
   * Select the appropriate provider based on request or defaults
   */
  private selectProvider(request: AICompletionRequest): AIProvider {
    // If a specific provider is requested
    if (request.provider) {
      const provider = this.providers.get(request.provider);
      if (!provider) {
        throw new AppError(400, `Unknown provider: ${request.provider}`);
      }
      if (!provider.isConfigured()) {
        throw new AppError(400, `Provider ${request.provider} is not configured`);
      }
      return provider;
    }

    // If a specific model is requested, find its provider
    if (request.model) {
      const modelInfo = ALL_MODELS.find((m) => m.id === request.model);
      if (modelInfo) {
        const provider = this.providers.get(modelInfo.provider);
        if (provider?.isConfigured()) {
          return provider;
        }
      }
    }

    // Fall back to default provider if configured
    const defaultProvider = this.providers.get(this.defaultProvider);
    if (defaultProvider?.isConfigured()) {
      return defaultProvider;
    }

    // Try any configured provider
    for (const provider of this.providers.values()) {
      if (provider.isConfigured()) {
        return provider;
      }
    }

    throw new AppError(500, 'No AI provider is configured');
  }

  /**
   * Generate a completion using the appropriate provider
   */
  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const provider = this.selectProvider(request);
    return provider.generateCompletion(request);
  }

  /**
   * Stream a completion response
   */
  async streamCompletion(request: AICompletionRequest, res: Response): Promise<void> {
    const provider = this.selectProvider(request);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = provider.generateStream(request);

      for await (const chunk of stream) {
        const data = JSON.stringify(chunk);
        res.write(`data: ${data}\n\n`);

        if (chunk.done) {
          res.write('data: [DONE]\n\n');
          break;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stream error';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    } finally {
      res.end();
    }
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): { inputCost: number; outputCost: number; totalCost: number } {
    const modelInfo = ALL_MODELS.find((m) => m.id === model);
    if (!modelInfo) {
      return { inputCost: 0, outputCost: 0, totalCost: 0 };
    }

    const inputCost = (promptTokens / 1_000_000) * modelInfo.inputPricePerMillion;
    const outputCost = (completionTokens / 1_000_000) * modelInfo.outputPricePerMillion;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }
}

export const aiRouterService = new AIRouterService();
