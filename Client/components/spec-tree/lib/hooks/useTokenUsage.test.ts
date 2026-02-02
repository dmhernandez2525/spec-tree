/**
 * Tests for useTokenUsage hook
 *
 * F1.3.10 - Token usage tracking
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useTokenUsage,
  formatTokenCount,
  getAlertColor,
  MODEL_TOKEN_LIMITS,
  TokenUsageRecord,
} from './useTokenUsage';

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

describe('useTokenUsage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('starts with empty records', () => {
      const { result } = renderHook(() => useTokenUsage());

      expect(result.current.records).toEqual([]);
    });

    it('starts with default budget', () => {
      const { result } = renderHook(() => useTokenUsage());

      expect(result.current.budget.dailyLimit).toBe(1000000);
      expect(result.current.budget.monthlyLimit).toBe(10000000);
      expect(result.current.budget.perRequestLimit).toBe(100000);
    });

    it('accepts custom budget', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ budget: { dailyLimit: 500000 } })
      );

      expect(result.current.budget.dailyLimit).toBe(500000);
    });

    it('starts with zero usage summary', () => {
      const { result } = renderHook(() => useTokenUsage());

      expect(result.current.summary.todayUsage).toBe(0);
      expect(result.current.summary.monthUsage).toBe(0);
      expect(result.current.summary.totalUsage).toBe(0);
    });
  });

  describe('estimateTokens', () => {
    it('estimates tokens from text using character method', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ estimationMethod: 'characters' })
      );

      // ~4 chars per token
      const estimate = result.current.estimateTokens('Hello world! This is a test.');
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(20); // Should be around 7-8 tokens
    });

    it('estimates tokens from text using word method', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ estimationMethod: 'words' })
      );

      // ~0.75 words per token
      const estimate = result.current.estimateTokens('Hello world this is a test');
      expect(estimate).toBeGreaterThan(0);
    });

    it('handles empty text', () => {
      const { result } = renderHook(() => useTokenUsage());

      const estimate = result.current.estimateTokens('');
      expect(estimate).toBe(0);
    });
  });

  describe('recordUsage', () => {
    it('records token usage', () => {
      const { result } = renderHook(() => useTokenUsage());

      let record: TokenUsageRecord;
      act(() => {
        record = result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });
      });

      expect(result.current.records.length).toBe(1);
      expect(record!.model).toBe('gpt-4o');
      expect(record!.totalTokens).toBe(150);
    });

    it('generates unique IDs', () => {
      const { result } = renderHook(() => useTokenUsage());

      let record1: TokenUsageRecord;
      let record2: TokenUsageRecord;
      act(() => {
        record1 = result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });
        record2 = result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 200,
          outputTokens: 100,
          totalTokens: 300,
        });
      });

      expect(record1!.id).not.toBe(record2!.id);
    });

    it('includes timestamp', () => {
      const { result } = renderHook(() => useTokenUsage());

      const before = new Date();
      let record: TokenUsageRecord;
      act(() => {
        record = result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });
      });
      const after = new Date();

      const recordDate = new Date(record!.timestamp);
      expect(recordDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(recordDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('includes optional metadata', () => {
      const { result } = renderHook(() => useTokenUsage());

      let record: TokenUsageRecord;
      act(() => {
        record = result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
          workItemType: 'feature',
          workItemId: 'feature-1',
        });
      });

      expect(record!.workItemType).toBe('feature');
      expect(record!.workItemId).toBe('feature-1');
    });
  });

  describe('summary', () => {
    it('calculates usage summary', () => {
      const { result } = renderHook(() => useTokenUsage());

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 2000,
          outputTokens: 1000,
          totalTokens: 3000,
        });
      });

      expect(result.current.summary.totalUsage).toBe(4500);
      expect(result.current.summary.totalRequests).toBe(2);
      expect(result.current.summary.averageTokensPerRequest).toBe(2250);
    });

    it('calculates daily remaining tokens', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ budget: { dailyLimit: 10000 } })
      );

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
        });
      });

      expect(result.current.summary.dailyRemaining).toBe(8500);
    });
  });

  describe('isWithinBudget', () => {
    it('returns true when within budget', () => {
      const { result } = renderHook(() =>
        useTokenUsage({
          budget: {
            dailyLimit: 10000,
            monthlyLimit: 100000,
            perRequestLimit: 5000,
          },
        })
      );

      expect(result.current.isWithinBudget(1000)).toBe(true);
    });

    it('returns false when exceeding per-request limit', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ budget: { perRequestLimit: 500 } })
      );

      expect(result.current.isWithinBudget(1000)).toBe(false);
    });

    it('returns false when would exceed daily limit', () => {
      const { result } = renderHook(() =>
        useTokenUsage({ budget: { dailyLimit: 1000 } })
      );

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 500,
          outputTokens: 250,
          totalTokens: 750,
        });
      });

      // Would put us at 1250 (over 1000 limit)
      expect(result.current.isWithinBudget(500)).toBe(false);
    });
  });

  describe('updateBudget', () => {
    it('updates budget', () => {
      const { result } = renderHook(() => useTokenUsage());

      act(() => {
        result.current.updateBudget({ dailyLimit: 500000 });
      });

      expect(result.current.budget.dailyLimit).toBe(500000);
    });

    it('preserves other budget values', () => {
      const { result } = renderHook(() => useTokenUsage());

      const originalMonthly = result.current.budget.monthlyLimit;

      act(() => {
        result.current.updateBudget({ dailyLimit: 500000 });
      });

      expect(result.current.budget.monthlyLimit).toBe(originalMonthly);
    });
  });

  describe('getModelLimits', () => {
    it('returns limits for known models', () => {
      const { result } = renderHook(() => useTokenUsage());

      const gpt4oLimits = result.current.getModelLimits('gpt-4o');
      expect(gpt4oLimits.contextWindow).toBe(128000);
      expect(gpt4oLimits.maxOutput).toBe(16384);
    });

    it('returns default limits for unknown models', () => {
      const { result } = renderHook(() => useTokenUsage());

      const unknownLimits = result.current.getModelLimits('unknown-model');
      expect(unknownLimits.contextWindow).toBe(4096);
      expect(unknownLimits.maxOutput).toBe(4096);
    });
  });

  describe('fitsContextWindow', () => {
    it('returns true when text fits', () => {
      const { result } = renderHook(() => useTokenUsage());

      // Short text should fit
      expect(result.current.fitsContextWindow('Hello world', 'gpt-4o')).toBe(true);
    });

    it('returns false when text is too long', () => {
      const { result } = renderHook(() => useTokenUsage());

      // Very long text (simulate with length check)
      const longText = 'x'.repeat(600000); // ~150K tokens
      expect(result.current.fitsContextWindow(longText, 'gpt-4o')).toBe(false);
    });
  });

  describe('getRemainingContextTokens', () => {
    it('calculates remaining tokens correctly', () => {
      const { result } = renderHook(() => useTokenUsage());

      const remaining = result.current.getRemainingContextTokens(10000, 'gpt-4o');
      expect(remaining).toBe(128000 - 10000);
    });

    it('returns 0 when context is exceeded', () => {
      const { result } = renderHook(() => useTokenUsage());

      const remaining = result.current.getRemainingContextTokens(200000, 'gpt-4o');
      expect(remaining).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('clears all usage records', () => {
      const { result } = renderHook(() => useTokenUsage());

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });
      });

      expect(result.current.records.length).toBe(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.records.length).toBe(0);
    });
  });

  describe('exportUsage', () => {
    it('exports usage data as JSON', () => {
      const { result } = renderHook(() => useTokenUsage());

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        });
      });

      const json = result.current.exportUsage();
      const parsed = JSON.parse(json);

      expect(parsed.records).toBeDefined();
      expect(parsed.records.length).toBe(1);
      expect(parsed.budget).toBeDefined();
    });
  });

  describe('importUsage', () => {
    it('imports valid usage data', () => {
      const { result } = renderHook(() => useTokenUsage());

      const toImport = {
        records: [
          {
            model: 'gpt-4o',
            inputTokens: 100,
            outputTokens: 50,
            totalTokens: 150,
          },
        ],
      };

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importUsage(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(1);
      expect(importResult!.errors.length).toBe(0);
      expect(result.current.records.length).toBe(1);
    });

    it('handles invalid JSON', () => {
      const { result } = renderHook(() => useTokenUsage());

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importUsage('invalid json');
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });

    it('handles records missing required fields', () => {
      const { result } = renderHook(() => useTokenUsage());

      const invalid = { records: [{ model: 'gpt-4o' }] }; // Missing tokens

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importUsage(JSON.stringify(invalid));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });
  });

  describe('alerts', () => {
    it('generates warning alert when approaching limit', () => {
      const { result } = renderHook(() =>
        useTokenUsage({
          budget: {
            dailyLimit: 1000,
            warningThreshold: 80,
            criticalThreshold: 95,
          },
        })
      );

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 400,
          outputTokens: 450,
          totalTokens: 850, // 85% of limit
        });
      });

      expect(result.current.alerts.length).toBeGreaterThan(0);
      expect(result.current.alerts.some((a) => a.level === 'warning')).toBe(true);
    });

    it('generates critical alert when near limit', () => {
      const { result } = renderHook(() =>
        useTokenUsage({
          budget: {
            dailyLimit: 1000,
            warningThreshold: 80,
            criticalThreshold: 95,
          },
        })
      );

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 500,
          outputTokens: 480,
          totalTokens: 980, // 98% of limit
        });
      });

      expect(result.current.alerts.some((a) => a.level === 'critical')).toBe(true);
    });

    it('clears alerts', () => {
      const { result } = renderHook(() =>
        useTokenUsage({
          budget: { dailyLimit: 1000, warningThreshold: 80 },
        })
      );

      act(() => {
        result.current.recordUsage({
          model: 'gpt-4o',
          inputTokens: 500,
          outputTokens: 400,
          totalTokens: 900,
        });
      });

      expect(result.current.alerts.length).toBeGreaterThan(0);

      act(() => {
        result.current.clearAlerts();
      });

      expect(result.current.alerts.length).toBe(0);
    });
  });
});

describe('formatTokenCount', () => {
  it('formats millions correctly', () => {
    expect(formatTokenCount(1500000)).toBe('1.50M');
    expect(formatTokenCount(10000000)).toBe('10.00M');
  });

  it('formats thousands correctly', () => {
    expect(formatTokenCount(1500)).toBe('1.5K');
    expect(formatTokenCount(50000)).toBe('50.0K');
  });

  it('formats small numbers without suffix', () => {
    expect(formatTokenCount(500)).toBe('500');
    expect(formatTokenCount(99)).toBe('99');
  });
});

describe('getAlertColor', () => {
  it('returns correct colors for alert levels', () => {
    expect(getAlertColor('critical')).toBe('red');
    expect(getAlertColor('warning')).toBe('amber');
    expect(getAlertColor('info')).toBe('blue');
  });
});

describe('MODEL_TOKEN_LIMITS', () => {
  it('includes major OpenAI models', () => {
    expect(MODEL_TOKEN_LIMITS['gpt-4o']).toBeDefined();
    expect(MODEL_TOKEN_LIMITS['gpt-4o-mini']).toBeDefined();
    expect(MODEL_TOKEN_LIMITS['gpt-4-turbo']).toBeDefined();
  });

  it('includes major Anthropic models', () => {
    expect(MODEL_TOKEN_LIMITS['claude-3-5-sonnet-20241022']).toBeDefined();
    expect(MODEL_TOKEN_LIMITS['claude-3-opus-20240229']).toBeDefined();
    expect(MODEL_TOKEN_LIMITS['claude-3-haiku-20240307']).toBeDefined();
  });

  it('includes major Gemini models', () => {
    expect(MODEL_TOKEN_LIMITS['gemini-1.5-pro']).toBeDefined();
    expect(MODEL_TOKEN_LIMITS['gemini-1.5-flash']).toBeDefined();
  });

  it('all models have contextWindow and maxOutput', () => {
    for (const [_model, limits] of Object.entries(MODEL_TOKEN_LIMITS)) {
      expect(limits.contextWindow).toBeDefined();
      expect(limits.maxOutput).toBeDefined();
      expect(limits.contextWindow).toBeGreaterThan(0);
      expect(limits.maxOutput).toBeGreaterThan(0);
    }
  });
});
