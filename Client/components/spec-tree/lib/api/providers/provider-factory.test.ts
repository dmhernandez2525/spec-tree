import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProvider,
  getProviderForModel,
  isProviderAvailable,
  getAvailableProviderTypes,
  getAllProviders,
  isModelAvailable,
} from './provider-factory';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock fetch for provider instantiation
global.fetch = vi.fn();

describe('provider-factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProvider', () => {
    it('returns openai provider for openai type', () => {
      const provider = getProvider('openai');
      expect(provider).toBeDefined();
      expect(provider?.providerType).toBe('openai');
    });

    it('returns anthropic provider for anthropic type', () => {
      const provider = getProvider('anthropic');
      expect(provider).toBeDefined();
      expect(provider?.providerType).toBe('anthropic');
    });

    it('returns undefined for unknown provider', () => {
      const provider = getProvider('gemini');
      expect(provider).toBeUndefined();
    });
  });

  describe('getProviderForModel', () => {
    it('returns openai provider for GPT models', () => {
      const provider = getProviderForModel('gpt-4-turbo');
      expect(provider?.providerType).toBe('openai');
    });

    it('returns openai provider for GPT-3.5 models', () => {
      const provider = getProviderForModel('gpt-3.5-turbo-16k');
      expect(provider?.providerType).toBe('openai');
    });

    it('returns anthropic provider for Claude models', () => {
      const provider = getProviderForModel('claude-3-opus-20240229');
      expect(provider?.providerType).toBe('anthropic');
    });

    it('returns anthropic provider for Claude Sonnet model', () => {
      const provider = getProviderForModel('claude-3-sonnet-20240229');
      expect(provider?.providerType).toBe('anthropic');
    });

    it('infers openai for gpt- prefix', () => {
      const provider = getProviderForModel('gpt-future-model');
      expect(provider?.providerType).toBe('openai');
    });

    it('infers anthropic for claude- prefix', () => {
      const provider = getProviderForModel('claude-future-model');
      expect(provider?.providerType).toBe('anthropic');
    });

    it('returns undefined for unknown model', () => {
      const provider = getProviderForModel('unknown-model');
      expect(provider).toBeUndefined();
    });
  });

  describe('isProviderAvailable', () => {
    it('returns true for openai', () => {
      expect(isProviderAvailable('openai')).toBe(true);
    });

    it('returns true for anthropic', () => {
      expect(isProviderAvailable('anthropic')).toBe(true);
    });

    it('returns false for unregistered provider', () => {
      expect(isProviderAvailable('gemini')).toBe(false);
    });
  });

  describe('getAvailableProviderTypes', () => {
    it('returns array of available provider types', () => {
      const types = getAvailableProviderTypes();
      expect(types).toContain('openai');
      expect(types).toContain('anthropic');
    });

    it('returns at least 2 providers', () => {
      const types = getAvailableProviderTypes();
      expect(types.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getAllProviders', () => {
    it('returns array of all providers', () => {
      const providers = getAllProviders();
      expect(providers.length).toBeGreaterThanOrEqual(2);
    });

    it('all providers have providerType', () => {
      const providers = getAllProviders();
      for (const provider of providers) {
        expect(provider.providerType).toBeDefined();
      }
    });
  });

  describe('isModelAvailable', () => {
    it('returns true for GPT models', () => {
      expect(isModelAvailable('gpt-4-turbo')).toBe(true);
      expect(isModelAvailable('gpt-3.5-turbo')).toBe(true);
    });

    it('returns true for Claude models', () => {
      expect(isModelAvailable('claude-3-opus-20240229')).toBe(true);
      expect(isModelAvailable('claude-3-sonnet-20240229')).toBe(true);
    });

    it('returns false for unknown models', () => {
      expect(isModelAvailable('unknown-model')).toBe(false);
    });

    it('returns true for model with provider prefix', () => {
      expect(isModelAvailable('gpt-future-model')).toBe(true);
      expect(isModelAvailable('claude-future-model')).toBe(true);
    });
  });
});
