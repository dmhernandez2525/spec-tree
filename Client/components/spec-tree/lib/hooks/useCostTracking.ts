/**
 * Cost Tracking Hook
 *
 * F1.1.14 - Cost tracking dashboard
 *
 * Tracks AI generation costs and provides aggregated data for the dashboard.
 * Stores usage records in localStorage for persistence.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * AI Provider type
 */
export type AIProvider = 'openai' | 'anthropic' | 'gemini';

/**
 * Model pricing information (per 1K tokens)
 */
export interface ModelPricing {
  input: number;
  output: number;
}

/**
 * Model pricing table
 */
export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
  'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
  'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
  // Gemini
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-2.0-flash-exp': { input: 0.0001, output: 0.0004 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
};

/**
 * Usage record for a single AI generation
 */
export interface UsageRecord {
  /** Unique record ID */
  id: string;
  /** Timestamp of the generation */
  timestamp: string;
  /** AI provider used */
  provider: AIProvider;
  /** Model used */
  model: string;
  /** Input tokens */
  inputTokens: number;
  /** Output tokens */
  outputTokens: number;
  /** Total tokens */
  totalTokens: number;
  /** Input cost in dollars */
  inputCost: number;
  /** Output cost in dollars */
  outputCost: number;
  /** Total cost in dollars */
  totalCost: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Type of generation (e.g., 'epic', 'feature', 'userStory', 'task') */
  generationType?: string;
}

/**
 * Token usage by provider
 */
export interface ProviderTokenUsage {
  input: number;
  output: number;
}

/**
 * Provider usage summary
 */
export interface ProviderUsage {
  cost: number;
  tokens: ProviderTokenUsage;
  requestCount: number;
}

/**
 * Model usage summary
 */
export interface ModelUsage {
  model: string;
  requests: number;
  cost: number;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Daily usage data point
 */
export interface DailyUsage {
  date: string;
  openai: number;
  anthropic: number;
  gemini: number;
}

/**
 * Monthly trend data point
 */
export interface MonthlyTrend {
  month: string;
  cost: number;
}

/**
 * Current period usage summary
 */
export interface PeriodUsage {
  totalCost: number;
  budget: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  byProvider: {
    openai: ProviderUsage;
    anthropic: ProviderUsage;
    gemini: ProviderUsage;
  };
  byModel: ModelUsage[];
  dailyUsage: DailyUsage[];
  requestCount: number;
}

/**
 * Full usage data structure
 */
export interface UsageData {
  currentMonth: PeriodUsage;
  monthlyTrend: MonthlyTrend[];
}

/**
 * Options for useCostTracking hook
 */
export interface UseCostTrackingOptions {
  /** Storage key for localStorage */
  storageKey?: string;
  /** Monthly budget limit */
  budget?: number;
  /** Maximum records to keep */
  maxRecords?: number;
}

/**
 * Return type for useCostTracking hook
 */
export interface UseCostTrackingReturn {
  /** All usage records */
  records: UsageRecord[];
  /** Aggregated usage data */
  usageData: UsageData;
  /** Record a new usage event */
  recordUsage: (usage: Omit<UsageRecord, 'id' | 'timestamp' | 'inputCost' | 'outputCost' | 'totalCost'> & { inputTokens: number; outputTokens: number }) => UsageRecord;
  /** Calculate cost for given tokens and model */
  calculateCost: (model: string, inputTokens: number, outputTokens: number) => { inputCost: number; outputCost: number; totalCost: number };
  /** Clear all usage records */
  clearRecords: () => void;
  /** Export records as JSON */
  exportRecords: () => string;
  /** Import records from JSON */
  importRecords: (json: string) => { imported: number; errors: string[] };
  /** Get usage for a specific time range */
  getUsageByTimeRange: (startDate: Date, endDate: Date) => UsageRecord[];
  /** Get total cost for the current month */
  currentMonthCost: number;
  /** Budget remaining */
  budgetRemaining: number;
  /** Budget usage percentage */
  budgetUsagePercent: number;
  /** Update budget */
  setBudget: (budget: number) => void;
}

/**
 * Default storage key
 */
const DEFAULT_STORAGE_KEY = 'spec-tree-cost-tracking';

/**
 * Default budget
 */
const DEFAULT_BUDGET = 200;

/**
 * Maximum records to keep by default
 */
const DEFAULT_MAX_RECORDS = 10000;

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `usage-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get provider from model name
 */
export function getProviderFromModel(model: string): AIProvider {
  const lowerModel = model.toLowerCase();
  if (lowerModel.includes('gpt') || lowerModel.includes('openai')) {
    return 'openai';
  }
  if (lowerModel.includes('claude') || lowerModel.includes('anthropic')) {
    return 'anthropic';
  }
  if (lowerModel.includes('gemini') || lowerModel.includes('google')) {
    return 'gemini';
  }
  // Default to openai if unknown
  return 'openai';
}

/**
 * Get the start of the current month
 */
function getMonthStart(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Format date as short day name
 */
function getShortDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Format date as short month name
 */
function getShortMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

/**
 * Load records from localStorage
 */
function loadRecords(storageKey: string): UsageRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return [];
}

/**
 * Save records to localStorage
 */
function saveRecords(storageKey: string, records: UsageRecord[], maxRecords: number): void {
  if (typeof window === 'undefined') return;

  try {
    // Trim to max records, keeping most recent
    const trimmed = records.slice(-maxRecords);
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Load budget from localStorage
 */
function loadBudget(storageKey: string, defaultBudget: number): number {
  if (typeof window === 'undefined') {
    return defaultBudget;
  }

  try {
    const stored = localStorage.getItem(`${storageKey}-budget`);
    if (stored) {
      return parseFloat(stored);
    }
  } catch {
    // Ignore parse errors
  }

  return defaultBudget;
}

/**
 * Save budget to localStorage
 */
function saveBudget(storageKey: string, budget: number): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${storageKey}-budget`, budget.toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create empty provider usage
 */
function createEmptyProviderUsage(): ProviderUsage {
  return {
    cost: 0,
    tokens: { input: 0, output: 0 },
    requestCount: 0,
  };
}

/**
 * Aggregate records into usage data
 */
function aggregateUsageData(records: UsageRecord[], budget: number): UsageData {
  const now = new Date();
  const monthStart = getMonthStart(now);

  // Filter to current month
  const currentMonthRecords = records.filter(
    (r) => new Date(r.timestamp) >= monthStart
  );

  // Calculate totals
  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const byProvider: Record<AIProvider, ProviderUsage> = {
    openai: createEmptyProviderUsage(),
    anthropic: createEmptyProviderUsage(),
    gemini: createEmptyProviderUsage(),
  };
  const modelMap = new Map<string, ModelUsage>();

  for (const record of currentMonthRecords) {
    totalCost += record.totalCost;
    totalInputTokens += record.inputTokens;
    totalOutputTokens += record.outputTokens;

    // By provider
    const provider = byProvider[record.provider];
    provider.cost += record.totalCost;
    provider.tokens.input += record.inputTokens;
    provider.tokens.output += record.outputTokens;
    provider.requestCount += 1;

    // By model
    const existingModel = modelMap.get(record.model);
    if (existingModel) {
      existingModel.requests += 1;
      existingModel.cost += record.totalCost;
      existingModel.inputTokens += record.inputTokens;
      existingModel.outputTokens += record.outputTokens;
    } else {
      modelMap.set(record.model, {
        model: record.model,
        requests: 1,
        cost: record.totalCost,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
      });
    }
  }

  // Sort models by cost descending
  const byModel = Array.from(modelMap.values()).sort((a, b) => b.cost - a.cost);

  // Calculate daily usage for last 7 days
  const dailyUsage: DailyUsage[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayRecords = records.filter((r) => {
      const recordDate = new Date(r.timestamp);
      return recordDate >= dayStart && recordDate < dayEnd;
    });

    const dayCosts = { openai: 0, anthropic: 0, gemini: 0 };
    for (const record of dayRecords) {
      dayCosts[record.provider] += record.totalCost;
    }

    dailyUsage.push({
      date: getShortDayName(date),
      openai: parseFloat(dayCosts.openai.toFixed(2)),
      anthropic: parseFloat(dayCosts.anthropic.toFixed(2)),
      gemini: parseFloat(dayCosts.gemini.toFixed(2)),
    });
  }

  // Calculate monthly trend for last 5 months
  const monthlyTrend: MonthlyTrend[] = [];
  for (let i = 4; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

    const monthRecords = records.filter((r) => {
      const recordDate = new Date(r.timestamp);
      return recordDate >= monthDate && recordDate < monthEnd;
    });

    const monthCost = monthRecords.reduce((sum, r) => sum + r.totalCost, 0);

    monthlyTrend.push({
      month: getShortMonthName(monthDate),
      cost: parseFloat(monthCost.toFixed(2)),
    });
  }

  return {
    currentMonth: {
      totalCost: parseFloat(totalCost.toFixed(2)),
      budget,
      tokensUsed: {
        input: totalInputTokens,
        output: totalOutputTokens,
      },
      byProvider: {
        openai: {
          cost: parseFloat(byProvider.openai.cost.toFixed(2)),
          tokens: byProvider.openai.tokens,
          requestCount: byProvider.openai.requestCount,
        },
        anthropic: {
          cost: parseFloat(byProvider.anthropic.cost.toFixed(2)),
          tokens: byProvider.anthropic.tokens,
          requestCount: byProvider.anthropic.requestCount,
        },
        gemini: {
          cost: parseFloat(byProvider.gemini.cost.toFixed(2)),
          tokens: byProvider.gemini.tokens,
          requestCount: byProvider.gemini.requestCount,
        },
      },
      byModel,
      dailyUsage,
      requestCount: currentMonthRecords.length,
    },
    monthlyTrend,
  };
}

/**
 * Hook for tracking AI generation costs
 */
export function useCostTracking(
  options: UseCostTrackingOptions = {}
): UseCostTrackingReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    budget: initialBudget = DEFAULT_BUDGET,
    maxRecords = DEFAULT_MAX_RECORDS,
  } = options;

  const [records, setRecords] = useState<UsageRecord[]>(() =>
    loadRecords(storageKey)
  );
  const [budget, setBudgetState] = useState<number>(() =>
    loadBudget(storageKey, initialBudget)
  );

  // Save to localStorage when records change
  useEffect(() => {
    saveRecords(storageKey, records, maxRecords);
  }, [records, storageKey, maxRecords]);

  // Save budget when it changes
  useEffect(() => {
    saveBudget(storageKey, budget);
  }, [budget, storageKey]);

  /**
   * Calculate cost for given tokens and model
   */
  const calculateCost = useCallback(
    (model: string, inputTokens: number, outputTokens: number) => {
      const pricing = MODEL_PRICING[model] || { input: 0.001, output: 0.002 };
      const inputCost = (inputTokens / 1000) * pricing.input;
      const outputCost = (outputTokens / 1000) * pricing.output;
      return {
        inputCost: parseFloat(inputCost.toFixed(6)),
        outputCost: parseFloat(outputCost.toFixed(6)),
        totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
      };
    },
    []
  );

  /**
   * Record a new usage event
   */
  const recordUsage = useCallback(
    (
      usage: Omit<UsageRecord, 'id' | 'timestamp' | 'inputCost' | 'outputCost' | 'totalCost'> & {
        inputTokens: number;
        outputTokens: number;
      }
    ): UsageRecord => {
      const { inputCost, outputCost, totalCost } = calculateCost(
        usage.model,
        usage.inputTokens,
        usage.outputTokens
      );

      const record: UsageRecord = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        provider: usage.provider || getProviderFromModel(usage.model),
        model: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.inputTokens + usage.outputTokens,
        inputCost,
        outputCost,
        totalCost,
        duration: usage.duration,
        generationType: usage.generationType,
      };

      setRecords((prev) => [...prev, record]);
      return record;
    },
    [calculateCost]
  );

  /**
   * Clear all usage records
   */
  const clearRecords = useCallback(() => {
    setRecords([]);
  }, []);

  /**
   * Export records as JSON
   */
  const exportRecords = useCallback(() => {
    return JSON.stringify(records, null, 2);
  }, [records]);

  /**
   * Import records from JSON
   */
  const importRecords = useCallback(
    (json: string): { imported: number; errors: string[] } => {
      const errors: string[] = [];
      let imported = 0;

      try {
        const parsed = JSON.parse(json);
        const toImport = Array.isArray(parsed) ? parsed : [parsed];
        const newRecords: UsageRecord[] = [];

        for (const item of toImport) {
          if (!item.model || item.inputTokens === undefined || item.outputTokens === undefined) {
            errors.push('Invalid record: missing required fields');
            continue;
          }

          const { inputCost, outputCost, totalCost } = calculateCost(
            item.model,
            item.inputTokens,
            item.outputTokens
          );

          newRecords.push({
            id: item.id || generateId(),
            timestamp: item.timestamp || new Date().toISOString(),
            provider: item.provider || getProviderFromModel(item.model),
            model: item.model,
            inputTokens: item.inputTokens,
            outputTokens: item.outputTokens,
            totalTokens: item.inputTokens + item.outputTokens,
            inputCost,
            outputCost,
            totalCost,
            duration: item.duration,
            generationType: item.generationType,
          });
          imported++;
        }

        if (newRecords.length > 0) {
          setRecords((prev) => [...prev, ...newRecords]);
        }
      } catch (e) {
        errors.push(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      return { imported, errors };
    },
    [calculateCost]
  );

  /**
   * Get usage for a specific time range
   */
  const getUsageByTimeRange = useCallback(
    (startDate: Date, endDate: Date): UsageRecord[] => {
      return records.filter((r) => {
        const recordDate = new Date(r.timestamp);
        return recordDate >= startDate && recordDate <= endDate;
      });
    },
    [records]
  );

  /**
   * Set budget
   */
  const setBudget = useCallback((newBudget: number) => {
    setBudgetState(newBudget);
  }, []);

  // Aggregate usage data
  const usageData = aggregateUsageData(records, budget);
  const currentMonthCost = usageData.currentMonth.totalCost;
  const budgetRemaining = Math.max(0, budget - currentMonthCost);
  const budgetUsagePercent = budget > 0 ? (currentMonthCost / budget) * 100 : 0;

  return {
    records,
    usageData,
    recordUsage,
    calculateCost,
    clearRecords,
    exportRecords,
    importRecords,
    getUsageByTimeRange,
    currentMonthCost,
    budgetRemaining,
    budgetUsagePercent,
    setBudget,
  };
}

export default useCostTracking;
