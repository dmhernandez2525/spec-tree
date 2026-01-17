import { Request, Response } from 'express';
import { aiRouterService } from '../services/ai-router.service';
import { AICompletionRequest } from '../types/ai.types';
import { AppError } from '../services/error.service';

export class AIController {
  /**
   * Generate a completion using any configured provider
   */
  async generateCompletion(
    req: Request<Record<string, never>, unknown, AICompletionRequest>,
    res: Response
  ) {
    try {
      const { messages, provider, model, maxTokens, temperature, stream } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new AppError(400, 'Messages array is required');
      }

      const request: AICompletionRequest = {
        messages,
        provider,
        model,
        maxTokens,
        temperature,
        stream,
      };

      // Handle streaming requests
      if (stream) {
        await aiRouterService.streamCompletion(request, res);
        return;
      }

      // Non-streaming request
      const result = await aiRouterService.generateCompletion(request);

      // Calculate cost if usage data is available
      let cost;
      if (result.usage) {
        cost = aiRouterService.estimateCost(
          result.model,
          result.usage.promptTokens,
          result.usage.completionTokens
        );
      }

      res.json({
        success: true,
        data: {
          content: result.content,
          provider: result.provider,
          model: result.model,
          usage: result.usage,
          cost,
          finishReason: result.finishReason,
        },
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
        });
        return;
      }

      console.error('AI Controller Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate completion',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get available providers and models
   */
  async getProviders(req: Request, res: Response) {
    try {
      const providers = aiRouterService.getProviderStatus();
      const models = aiRouterService.getAvailableModels();

      res.json({
        success: true,
        data: {
          providers,
          models,
        },
      });
    } catch (error) {
      console.error('Get Providers Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get providers',
      });
    }
  }

  /**
   * Get available models (for backwards compatibility)
   */
  async getModels(req: Request, res: Response) {
    try {
      const models = aiRouterService.getAvailableModels();
      res.json({
        success: true,
        data: models,
      });
    } catch (error) {
      console.error('Get Models Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get models',
      });
    }
  }
}

export const aiController = new AIController();
