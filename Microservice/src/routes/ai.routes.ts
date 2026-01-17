import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { completionValidator } from '../middleware/validation';

const router = Router();

/**
 * POST /api/ai/completion
 * Generate AI completion with multi-provider support
 *
 * Body:
 * - messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>
 * - provider?: 'openai' | 'anthropic' | 'gemini' (optional, auto-selects if not provided)
 * - model?: string (optional, uses provider default if not provided)
 * - maxTokens?: number (optional, default 4096)
 * - temperature?: number (optional, default 0.7)
 * - stream?: boolean (optional, default false)
 */
router.post(
  '/completion',
  completionValidator,
  aiController.generateCompletion.bind(aiController)
);

/**
 * GET /api/ai/providers
 * Get all configured providers and their available models
 */
router.get('/providers', aiController.getProviders.bind(aiController));

/**
 * GET /api/ai/models
 * Get all available models across configured providers
 */
router.get('/models', aiController.getModels.bind(aiController));

export default router;
