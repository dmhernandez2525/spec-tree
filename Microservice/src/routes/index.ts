import { Router } from 'express';
import openaiRoutes from './openai.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/openai', openaiRoutes);

export default router;
