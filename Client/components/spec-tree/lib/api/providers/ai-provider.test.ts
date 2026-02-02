import { describe, it, expect } from 'vitest';
import {
  OPENAI_MODELS,
  ANTHROPIC_MODELS,
  GEMINI_MODELS,
  ALL_MODELS,
  getModelInfo,
  getProviderFromModel,
  getModelsForProvider,
} from './ai-provider';

describe('ai-provider', () => {
  describe('OPENAI_MODELS', () => {
    it('contains GPT-4 Turbo model', () => {
      const gpt4Turbo = OPENAI_MODELS.find((m) => m.id === 'gpt-4-turbo');
      expect(gpt4Turbo).toBeDefined();
      expect(gpt4Turbo?.provider).toBe('openai');
      expect(gpt4Turbo?.contextWindow).toBe(128000);
    });

    it('contains GPT-3.5 Turbo model', () => {
      const gpt35 = OPENAI_MODELS.find((m) => m.id === 'gpt-3.5-turbo');
      expect(gpt35).toBeDefined();
      expect(gpt35?.provider).toBe('openai');
    });

    it('all models have required fields', () => {
      for (const model of OPENAI_MODELS) {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBe('openai');
        expect(model.contextWindow).toBeGreaterThan(0);
        expect(model.maxOutputTokens).toBeGreaterThan(0);
      }
    });
  });

  describe('ANTHROPIC_MODELS', () => {
    it('contains Claude 3 Opus model', () => {
      const opus = ANTHROPIC_MODELS.find((m) => m.id === 'claude-3-opus-20240229');
      expect(opus).toBeDefined();
      expect(opus?.provider).toBe('anthropic');
      expect(opus?.contextWindow).toBe(200000);
    });

    it('contains Claude 3 Sonnet model', () => {
      const sonnet = ANTHROPIC_MODELS.find((m) => m.id === 'claude-3-sonnet-20240229');
      expect(sonnet).toBeDefined();
      expect(sonnet?.provider).toBe('anthropic');
    });

    it('contains Claude 3 Haiku model', () => {
      const haiku = ANTHROPIC_MODELS.find((m) => m.id === 'claude-3-haiku-20240307');
      expect(haiku).toBeDefined();
      expect(haiku?.provider).toBe('anthropic');
    });

    it('all models have required fields', () => {
      for (const model of ANTHROPIC_MODELS) {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBe('anthropic');
        expect(model.contextWindow).toBeGreaterThan(0);
        expect(model.maxOutputTokens).toBeGreaterThan(0);
      }
    });
  });

  describe('GEMINI_MODELS', () => {
    it('contains Gemini 1.5 Pro model', () => {
      const pro = GEMINI_MODELS.find((m) => m.id === 'gemini-1.5-pro');
      expect(pro).toBeDefined();
      expect(pro?.provider).toBe('gemini');
      expect(pro?.contextWindow).toBe(1000000);
    });

    it('contains Gemini 1.5 Flash model', () => {
      const flash = GEMINI_MODELS.find((m) => m.id === 'gemini-1.5-flash');
      expect(flash).toBeDefined();
      expect(flash?.provider).toBe('gemini');
    });

    it('contains Gemini Pro model', () => {
      const geminiPro = GEMINI_MODELS.find((m) => m.id === 'gemini-pro');
      expect(geminiPro).toBeDefined();
      expect(geminiPro?.provider).toBe('gemini');
    });

    it('all models have required fields', () => {
      for (const model of GEMINI_MODELS) {
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBe('gemini');
        expect(model.contextWindow).toBeGreaterThan(0);
        expect(model.maxOutputTokens).toBeGreaterThan(0);
      }
    });
  });

  describe('ALL_MODELS', () => {
    it('contains models from all providers', () => {
      const openaiCount = ALL_MODELS.filter((m) => m.provider === 'openai').length;
      const anthropicCount = ALL_MODELS.filter((m) => m.provider === 'anthropic').length;
      const geminiCount = ALL_MODELS.filter((m) => m.provider === 'gemini').length;

      expect(openaiCount).toBe(OPENAI_MODELS.length);
      expect(anthropicCount).toBe(ANTHROPIC_MODELS.length);
      expect(geminiCount).toBe(GEMINI_MODELS.length);
      expect(ALL_MODELS.length).toBe(
        OPENAI_MODELS.length + ANTHROPIC_MODELS.length + GEMINI_MODELS.length
      );
    });
  });

  describe('getModelInfo', () => {
    it('returns model info for valid OpenAI model', () => {
      const info = getModelInfo('gpt-4-turbo');
      expect(info).toBeDefined();
      expect(info?.provider).toBe('openai');
    });

    it('returns model info for valid Claude model', () => {
      const info = getModelInfo('claude-3-opus-20240229');
      expect(info).toBeDefined();
      expect(info?.provider).toBe('anthropic');
    });

    it('returns undefined for unknown model', () => {
      const info = getModelInfo('unknown-model');
      expect(info).toBeUndefined();
    });
  });

  describe('getProviderFromModel', () => {
    it('returns openai for GPT models', () => {
      expect(getProviderFromModel('gpt-4-turbo')).toBe('openai');
      expect(getProviderFromModel('gpt-3.5-turbo')).toBe('openai');
    });

    it('returns anthropic for Claude models', () => {
      expect(getProviderFromModel('claude-3-opus-20240229')).toBe('anthropic');
      expect(getProviderFromModel('claude-3-sonnet-20240229')).toBe('anthropic');
    });

    it('returns gemini for Gemini models', () => {
      expect(getProviderFromModel('gemini-1.5-pro')).toBe('gemini');
      expect(getProviderFromModel('gemini-1.5-flash')).toBe('gemini');
    });

    it('returns undefined for unknown model', () => {
      expect(getProviderFromModel('unknown-model')).toBeUndefined();
    });
  });

  describe('getModelsForProvider', () => {
    it('returns OpenAI models for openai provider', () => {
      const models = getModelsForProvider('openai');
      expect(models.length).toBe(OPENAI_MODELS.length);
      expect(models.every((m) => m.provider === 'openai')).toBe(true);
    });

    it('returns Claude models for anthropic provider', () => {
      const models = getModelsForProvider('anthropic');
      expect(models.length).toBe(ANTHROPIC_MODELS.length);
      expect(models.every((m) => m.provider === 'anthropic')).toBe(true);
    });

    it('returns Gemini models for gemini provider', () => {
      const models = getModelsForProvider('gemini');
      expect(models.length).toBe(GEMINI_MODELS.length);
      expect(models.every((m) => m.provider === 'gemini')).toBe(true);
    });

    it('returns empty array for unknown provider', () => {
      // Cast to any to test unknown provider
      const models = getModelsForProvider('unknown' as never);
      expect(models.length).toBe(0);
    });
  });
});
