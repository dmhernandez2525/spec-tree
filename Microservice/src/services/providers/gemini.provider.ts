import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';
import {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  GEMINI_MODELS,
} from '../../types/ai.types';
import { AppError } from '../error.service';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;
  private client: GoogleGenerativeAI | null = null;
  private defaultModel = 'gemini-1.5-pro';

  constructor() {
    if (process.env.GOOGLE_AI_API_KEY) {
      this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  getAvailableModels(): AIModel[] {
    return GEMINI_MODELS;
  }

  private getModel(modelId: string): GenerativeModel {
    if (!this.client) {
      throw new AppError(500, 'Gemini provider is not configured');
    }
    return this.client.getGenerativeModel({ model: modelId });
  }

  private convertMessages(request: AICompletionRequest): { systemInstruction?: string; history: Content[] } {
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const history: Content[] = [];

    // Convert messages to Gemini format
    const conversationMessages = request.messages.filter((m) => m.role !== 'system');

    for (const msg of conversationMessages) {
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    return {
      systemInstruction: systemMessage?.content,
      history,
    };
  }

  async generateCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.client) {
      throw new AppError(500, 'Gemini provider is not configured');
    }

    const modelId = request.model || this.defaultModel;
    const model = this.getModel(modelId);
    const { systemInstruction, history } = this.convertMessages(request);

    try {
      // Get the last user message
      const lastUserMessage = history.pop();
      if (!lastUserMessage || lastUserMessage.role !== 'user') {
        throw new AppError(400, 'Last message must be from user');
      }

      const chat = model.startChat({
        history: history,
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
          maxOutputTokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
        },
      });

      const result = await chat.sendMessage(lastUserMessage.parts);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new AppError(500, 'No text content in Gemini response');
      }

      // Estimate token usage (Gemini doesn't always provide this)
      const usageMetadata = response.usageMetadata;

      return {
        content: text,
        provider: 'gemini',
        model: modelId,
        usage: usageMetadata
          ? {
              promptTokens: usageMetadata.promptTokenCount || 0,
              completionTokens: usageMetadata.candidatesTokenCount || 0,
              totalTokens: usageMetadata.totalTokenCount || 0,
            }
          : undefined,
        finishReason: response.candidates?.[0]?.finishReason || undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      throw new AppError(500, `Gemini API error: ${message}`);
    }
  }

  async *generateStream(request: AICompletionRequest): AsyncGenerator<AIStreamChunk> {
    if (!this.client) {
      throw new AppError(500, 'Gemini provider is not configured');
    }

    const modelId = request.model || this.defaultModel;
    const model = this.getModel(modelId);
    const { systemInstruction, history } = this.convertMessages(request);

    try {
      // Get the last user message
      const lastUserMessage = history.pop();
      if (!lastUserMessage || lastUserMessage.role !== 'user') {
        throw new AppError(400, 'Last message must be from user');
      }

      const chat = model.startChat({
        history: history,
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
          maxOutputTokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
        },
      });

      const result = await chat.sendMessageStream(lastUserMessage.parts);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        yield { content: text, done: false };
      }

      yield { content: '', done: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini streaming error';
      throw new AppError(500, `Gemini streaming error: ${message}`);
    }
  }
}

export const geminiProvider = new GeminiProvider();
