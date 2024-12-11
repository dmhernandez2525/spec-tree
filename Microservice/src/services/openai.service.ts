import { openai, defaultConfig } from '../config/openai.config';
import { OpenAIRequestBody } from '../types/openai.types';
import { AppError } from './error.service';

interface OpenAIError {
  status?: number;
  message: string;
}

class OpenAIService {
  async createCompletion(params: OpenAIRequestBody) {
    try {
      // Validate required fields
      if (!params.systemPrompt || !params.userPrompt) {
        throw new AppError(400, 'System prompt and user prompt are required');
      }

      console.log({ params: JSON.stringify(params) });

      const completion = await openai.chat.completions.create({
        model: params.selectedModel || defaultConfig.models.default,
        messages: [
          {
            role: 'system',
            content: params.systemPrompt,
          },
          {
            role: 'user',
            content: params.userPrompt,
          },
        ],
        max_tokens: params.maxTokens || defaultConfig.max_tokens.default,
        temperature: defaultConfig.temperature,
      });

      if (!completion.choices[0]?.message?.content) {
        throw new AppError(500, 'No completion generated');
      }

      return completion.choices[0].message.content;
    } catch (error: unknown) {
      console.error('OpenAI API Error:', error);

      // Handle specific error types
      if (error instanceof AppError) {
        throw error;
      }

      // Type guard for OpenAI API errors
      const openAIError = error as OpenAIError;

      // Handle OpenAI API errors with more specific status codes
      if (openAIError.status === 400) {
        throw new AppError(400, 'Invalid request parameters');
      }

      throw new AppError(
        500,
        openAIError.message || 'Failed to generate completion'
      );
    }
  }
}

export const openAIService = new OpenAIService();
