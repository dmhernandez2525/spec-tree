import { Request, Response } from 'express';
import { openAIService } from '../services/openai.service';
import { OpenAIRequestBody } from '../types/openai.types';

export class OpenAIController {
  async generateCompletion(
    req: Request<{}, {}, OpenAIRequestBody>,
    res: Response
  ) {
    try {
      const result = await openAIService.createCompletion(req.body);
      res.json({ data: result });
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({
        error: 'Failed to generate completion',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export const openAIController = new OpenAIController();
