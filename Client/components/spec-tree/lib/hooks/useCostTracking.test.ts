/**
 * Tests for useCostTracking hook
 *
 * F1.1.14 - Cost tracking dashboard
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCostTracking,
  MODEL_PRICING,
  getProviderFromModel,
  UsageRecord,
} from './useCostTracking';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useCostTracking', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('starts with empty records', () => {
      const { result } = renderHook(() => useCostTracking());

      expect(result.current.records).toEqual([]);
      expect(result.current.currentMonthCost).toBe(0);
    });

    it('uses default budget of 200', () => {
      const { result } = renderHook(() => useCostTracking());

      expect(result.current.budgetRemaining).toBe(200);
      expect(result.current.budgetUsagePercent).toBe(0);
    });

    it('accepts custom budget', () => {
      const { result } = renderHook(() => useCostTracking({ budget: 500 }));

      expect(result.current.budgetRemaining).toBe(500);
    });

    it('accepts custom storage key option', () => {
      // Test that custom storage key is accepted without errors
      const { result } = renderHook(() => useCostTracking({ storageKey: 'custom-key' }));

      expect(result.current.records).toEqual([]);
    });
  });

  describe('calculateCost', () => {
    it('calculates cost for known model', () => {
      const { result } = renderHook(() => useCostTracking());

      const cost = result.current.calculateCost('gpt-4o', 1000, 500);

      // gpt-4o pricing: input 0.005/1K, output 0.015/1K
      expect(cost.inputCost).toBeCloseTo(0.005, 4);
      expect(cost.outputCost).toBeCloseTo(0.0075, 4);
      expect(cost.totalCost).toBeCloseTo(0.0125, 4);
    });

    it('calculates cost for Claude model', () => {
      const { result } = renderHook(() => useCostTracking());

      const cost = result.current.calculateCost('claude-3-5-sonnet-20241022', 1000, 500);

      // claude-3-5-sonnet pricing: input 0.003/1K, output 0.015/1K
      expect(cost.inputCost).toBeCloseTo(0.003, 4);
      expect(cost.outputCost).toBeCloseTo(0.0075, 4);
      expect(cost.totalCost).toBeCloseTo(0.0105, 4);
    });

    it('calculates cost for Gemini model', () => {
      const { result } = renderHook(() => useCostTracking());

      const cost = result.current.calculateCost('gemini-1.5-pro', 1000, 500);

      // gemini-1.5-pro pricing: input 0.00125/1K, output 0.005/1K
      expect(cost.inputCost).toBeCloseTo(0.00125, 5);
      expect(cost.outputCost).toBeCloseTo(0.0025, 4);
      expect(cost.totalCost).toBeCloseTo(0.00375, 5);
    });

    it('uses default pricing for unknown model', () => {
      const { result } = renderHook(() => useCostTracking());

      const cost = result.current.calculateCost('unknown-model', 1000, 500);

      // Default: input 0.001/1K, output 0.002/1K
      expect(cost.inputCost).toBeCloseTo(0.001, 4);
      expect(cost.outputCost).toBeCloseTo(0.001, 4);
      expect(cost.totalCost).toBeCloseTo(0.002, 4);
    });
  });

  describe('recordUsage', () => {
    it('records a new usage event', () => {
      const { result } = renderHook(() => useCostTracking());

      let record: UsageRecord;
      act(() => {
        record = result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      expect(result.current.records.length).toBe(1);
      expect(record!.model).toBe('gpt-4o');
      expect(record!.provider).toBe('openai');
      expect(record!.totalCost).toBeCloseTo(0.0125, 4);
    });

    it('auto-calculates costs', () => {
      const { result } = renderHook(() => useCostTracking());

      let record: UsageRecord;
      act(() => {
        record = result.current.recordUsage({
          provider: 'anthropic',
          model: 'claude-3-haiku-20240307',
          inputTokens: 10000,
          outputTokens: 5000,
          totalTokens: 15000,
        });
      });

      // claude-3-haiku pricing: input 0.00025/1K, output 0.00125/1K
      expect(record!.inputCost).toBeCloseTo(0.0025, 4);
      expect(record!.outputCost).toBeCloseTo(0.00625, 5);
      expect(record!.totalCost).toBeCloseTo(0.00875, 5);
    });

    it('generates unique IDs', () => {
      const { result } = renderHook(() => useCostTracking());

      let record1: UsageRecord;
      let record2: UsageRecord;
      act(() => {
        record1 = result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o-mini',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
        record2 = result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o-mini',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      expect(record1!.id).not.toBe(record2!.id);
    });

    it('includes timestamp', () => {
      const { result } = renderHook(() => useCostTracking());

      const before = new Date();
      let record: UsageRecord;
      act(() => {
        record = result.current.recordUsage({
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });
      const after = new Date();

      const recordDate = new Date(record!.timestamp);
      expect(recordDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(recordDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('includes optional metadata', () => {
      const { result } = renderHook(() => useCostTracking());

      let record: UsageRecord;
      act(() => {
        record = result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
          duration: 2500,
          generationType: 'feature',
        });
      });

      expect(record!.duration).toBe(2500);
      expect(record!.generationType).toBe('feature');
    });
  });

  describe('usageData aggregation', () => {
    it('aggregates records by provider', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
        result.current.recordUsage({
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20241022',
          inputTokens: 2000,
          outputTokens: 1000,
          totalTokens: 3000,
        });
      });

      expect(result.current.usageData.currentMonth.byProvider.openai.requestCount).toBe(1);
      expect(result.current.usageData.currentMonth.byProvider.anthropic.requestCount).toBe(1);
      expect(result.current.usageData.currentMonth.byProvider.gemini.requestCount).toBe(0);
    });

    it('aggregates records by model', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 2000,
          outputTokens: 1000,
          totalTokens: 3000,
        });
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o-mini',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      const modelUsage = result.current.usageData.currentMonth.byModel;
      const gpt4o = modelUsage.find((m) => m.model === 'gpt-4o');
      const gpt4oMini = modelUsage.find((m) => m.model === 'gpt-4o-mini');

      expect(gpt4o?.requests).toBe(2);
      expect(gpt4oMini?.requests).toBe(1);
    });

    it('calculates total cost', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        // Record 4 uses to get a more easily verifiable total
        for (let i = 0; i < 4; i++) {
          result.current.recordUsage({
            provider: 'openai',
            model: 'gpt-4o',
            inputTokens: 1000,
            outputTokens: 500,
            totalTokens: 1500,
          });
        }
      });

      // 4 x 0.0125 = 0.05 (no rounding issues at this value)
      expect(result.current.currentMonthCost).toBeCloseTo(0.05, 2);
    });

    it('updates budget remaining', () => {
      const { result } = renderHook(() => useCostTracking({ budget: 100 }));

      act(() => {
        // Record usage that costs about $10
        for (let i = 0; i < 800; i++) {
          result.current.recordUsage({
            provider: 'openai',
            model: 'gpt-4o',
            inputTokens: 1000,
            outputTokens: 500,
            totalTokens: 1500,
          });
        }
      });

      // 800 x 0.0125 = $10
      expect(result.current.budgetRemaining).toBeCloseTo(90, 0);
      expect(result.current.budgetUsagePercent).toBeCloseTo(10, 0);
    });

    it('includes daily usage for last 7 days', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      expect(result.current.usageData.currentMonth.dailyUsage.length).toBe(7);
    });

    it('includes monthly trend for last 5 months', () => {
      const { result } = renderHook(() => useCostTracking());

      expect(result.current.usageData.monthlyTrend.length).toBe(5);
    });
  });

  describe('clearRecords', () => {
    it('clears all records', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      expect(result.current.records.length).toBe(1);

      act(() => {
        result.current.clearRecords();
      });

      expect(result.current.records.length).toBe(0);
      expect(result.current.currentMonthCost).toBe(0);
    });
  });

  describe('exportRecords', () => {
    it('exports records as JSON', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      const json = result.current.exportRecords();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
      expect(parsed[0].model).toBe('gpt-4o');
    });
  });

  describe('importRecords', () => {
    it('imports valid records', () => {
      const { result } = renderHook(() => useCostTracking());

      const toImport = [
        {
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
        },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importRecords(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(1);
      expect(importResult!.errors.length).toBe(0);
      expect(result.current.records.length).toBe(1);
    });

    it('handles invalid JSON', () => {
      const { result } = renderHook(() => useCostTracking());

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importRecords('invalid json');
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });

    it('handles records missing required fields', () => {
      const { result } = renderHook(() => useCostTracking());

      const invalid = [{ model: 'gpt-4o' }]; // Missing tokens

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importRecords(JSON.stringify(invalid));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getUsageByTimeRange', () => {
    it('filters records by date range', () => {
      const { result } = renderHook(() => useCostTracking());

      act(() => {
        result.current.recordUsage({
          provider: 'openai',
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const inRange = result.current.getUsageByTimeRange(yesterday, tomorrow);
      expect(inRange.length).toBe(1);

      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const sixDaysAgo = new Date(now);
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const outOfRange = result.current.getUsageByTimeRange(lastWeek, sixDaysAgo);
      expect(outOfRange.length).toBe(0);
    });
  });

  describe('setBudget', () => {
    it('updates budget', () => {
      const { result } = renderHook(() => useCostTracking({ budget: 100 }));

      expect(result.current.budgetRemaining).toBe(100);

      act(() => {
        result.current.setBudget(300);
      });

      expect(result.current.budgetRemaining).toBe(300);
    });

    it('recalculates budget usage percent', () => {
      const { result } = renderHook(() => useCostTracking({ budget: 100 }));

      act(() => {
        // Record $10 of usage
        for (let i = 0; i < 800; i++) {
          result.current.recordUsage({
            provider: 'openai',
            model: 'gpt-4o',
            inputTokens: 1000,
            outputTokens: 500,
            totalTokens: 1500,
          });
        }
      });

      expect(result.current.budgetUsagePercent).toBeCloseTo(10, 0);

      act(() => {
        result.current.setBudget(50);
      });

      expect(result.current.budgetUsagePercent).toBeCloseTo(20, 0);
    });
  });
});

describe('getProviderFromModel', () => {
  it('identifies OpenAI models', () => {
    expect(getProviderFromModel('gpt-4o')).toBe('openai');
    expect(getProviderFromModel('gpt-4-turbo')).toBe('openai');
    expect(getProviderFromModel('gpt-3.5-turbo')).toBe('openai');
  });

  it('identifies Anthropic models', () => {
    expect(getProviderFromModel('claude-3-5-sonnet-20241022')).toBe('anthropic');
    expect(getProviderFromModel('claude-3-opus-20240229')).toBe('anthropic');
    expect(getProviderFromModel('claude-3-haiku-20240307')).toBe('anthropic');
  });

  it('identifies Gemini models', () => {
    expect(getProviderFromModel('gemini-1.5-pro')).toBe('gemini');
    expect(getProviderFromModel('gemini-1.5-flash')).toBe('gemini');
    expect(getProviderFromModel('gemini-2.0-flash-exp')).toBe('gemini');
  });

  it('defaults to openai for unknown models', () => {
    expect(getProviderFromModel('unknown-model')).toBe('openai');
  });
});

describe('MODEL_PRICING', () => {
  it('has pricing for major OpenAI models', () => {
    expect(MODEL_PRICING['gpt-4o']).toBeDefined();
    expect(MODEL_PRICING['gpt-4o-mini']).toBeDefined();
    expect(MODEL_PRICING['gpt-4-turbo']).toBeDefined();
  });

  it('has pricing for major Anthropic models', () => {
    expect(MODEL_PRICING['claude-3-5-sonnet-20241022']).toBeDefined();
    expect(MODEL_PRICING['claude-3-opus-20240229']).toBeDefined();
    expect(MODEL_PRICING['claude-3-haiku-20240307']).toBeDefined();
  });

  it('has pricing for major Gemini models', () => {
    expect(MODEL_PRICING['gemini-1.5-pro']).toBeDefined();
    expect(MODEL_PRICING['gemini-1.5-flash']).toBeDefined();
  });

  it('all pricing has input and output rates', () => {
    for (const [_model, pricing] of Object.entries(MODEL_PRICING)) {
      expect(pricing.input).toBeDefined();
      expect(pricing.output).toBeDefined();
      expect(pricing.input).toBeGreaterThan(0);
      expect(pricing.output).toBeGreaterThan(0);
    }
  });
});
