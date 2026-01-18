import { Request, Response } from 'express';
import { aiController } from './ai.controller';

// Mock the AI router service
jest.mock('../services/ai-router.service', () => ({
  aiRouterService: {
    generateCompletion: jest.fn(),
    streamCompletion: jest.fn(),
    getProviderStatus: jest.fn(),
    getAvailableModels: jest.fn(),
    estimateCost: jest.fn(),
  },
}));

import { aiRouterService } from '../services/ai-router.service';
import { AppError } from '../services/error.service';

describe('AIController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      json: jsonMock,
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('generateCompletion', () => {
    it('generates completion successfully', async () => {
      const mockResult = {
        content: 'Hello!',
        provider: 'openai',
        model: 'gpt-4o',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };
      (aiRouterService.generateCompletion as jest.Mock).mockResolvedValue(mockResult);
      (aiRouterService.estimateCost as jest.Mock).mockReturnValue({
        inputCost: 0.001,
        outputCost: 0.002,
        totalCost: 0.003,
      });

      mockReq = {
        body: {
          messages: [{ role: 'user', content: 'Hi' }],
          model: 'gpt-4o',
        },
      };

      await aiController.generateCompletion(mockReq as any, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          content: 'Hello!',
          provider: 'openai',
          model: 'gpt-4o',
        }),
      });
    });

    it('handles streaming requests', async () => {
      (aiRouterService.streamCompletion as jest.Mock).mockResolvedValue(undefined);

      mockReq = {
        body: {
          messages: [{ role: 'user', content: 'Hi' }],
          stream: true,
        },
      };

      await aiController.generateCompletion(mockReq as any, mockRes as Response);

      expect(aiRouterService.streamCompletion).toHaveBeenCalled();
    });

    it('returns error for empty messages', async () => {
      mockReq = {
        body: {
          messages: [],
        },
      };

      await aiController.generateCompletion(mockReq as any, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Messages array is required',
      });
    });

    it('handles AppError correctly', async () => {
      (aiRouterService.generateCompletion as jest.Mock).mockRejectedValue(
        new AppError(400, 'Provider not configured')
      );

      mockReq = {
        body: {
          messages: [{ role: 'user', content: 'Hi' }],
        },
      };

      await aiController.generateCompletion(mockReq as any, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Provider not configured',
      });
    });

    it('handles unknown errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (aiRouterService.generateCompletion as jest.Mock).mockRejectedValue(
        new Error('Unexpected error')
      );

      mockReq = {
        body: {
          messages: [{ role: 'user', content: 'Hi' }],
        },
      };

      await aiController.generateCompletion(mockReq as any, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to generate completion',
        details: 'Unexpected error',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getProviders', () => {
    it('returns providers and models', async () => {
      const mockProviders = [{ provider: 'openai', configured: true, models: [] }];
      const mockModels = [{ id: 'gpt-4o', name: 'GPT-4o' }];

      (aiRouterService.getProviderStatus as jest.Mock).mockReturnValue(mockProviders);
      (aiRouterService.getAvailableModels as jest.Mock).mockReturnValue(mockModels);

      mockReq = {};

      await aiController.getProviders(mockReq as any, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          providers: mockProviders,
          models: mockModels,
        },
      });
    });

    it('handles errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (aiRouterService.getProviderStatus as jest.Mock).mockImplementation(() => {
        throw new Error('Service error');
      });

      mockReq = {};

      await aiController.getProviders(mockReq as any, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to get providers',
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getModels', () => {
    it('returns available models', async () => {
      const mockModels = [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
      ];

      (aiRouterService.getAvailableModels as jest.Mock).mockReturnValue(mockModels);

      mockReq = {};

      await aiController.getModels(mockReq as any, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockModels,
      });
    });
  });
});
