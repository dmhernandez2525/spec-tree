import { Router } from 'express';
import { openAIController } from '../controllers/openai.controller';
import { validateCompletion } from '../middleware/validation';

const router = Router();

router.post(
  '/completion',
  validateCompletion,
  openAIController.generateCompletion
);

export default router;
