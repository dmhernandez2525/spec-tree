import { Router } from 'express';
import openaiRoutes from './openai.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes - new multi-provider AI routes
router.use('/ai', aiRoutes);

// Legacy OpenAI routes (for backwards compatibility)
router.use('/openai', openaiRoutes);

export default router;
