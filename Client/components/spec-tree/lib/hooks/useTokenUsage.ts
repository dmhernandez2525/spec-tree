/**
 * Token Usage Tracking Hook
 *
 * F1.3.10 - Token usage tracking
 *
 * Provides token estimation, tracking, and budget management for AI generations.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Token estimation method
 */
export type TokenEstimationMethod = 'characters' | 'words' | 'tiktoken';

/**
 * Token limit alert level
 */
export type TokenAlertLevel = 'info' | 'warning' | 'critical';

/**
 * Token alert
 */
export interface TokenAlert {
  level: TokenAlertLevel;
  message: string;
  timestamp: string;
  currentUsage: number;
  limit: number;
  percentUsed: number;
}

/**
 * Token usage record for a single generation
 */
export interface TokenUsageRecord {
  id: string;
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  workItemType?: string;
  workItemId?: string;
}

/**
 * Token budget configuration
 */
export interface TokenBudget {
  /** Daily token limit */
  dailyLimit: number;
  /** Monthly token limit */
  monthlyLimit: number;
  /** Per-request limit */
  perRequestLimit: number;
  /** Warning threshold (percentage) */
  warningThreshold: number;
  /** Critical threshold (percentage) */
  criticalThreshold: number;
}

/**
 * Token usage summary
 */
export interface TokenUsageSummary {
  /** Today's usage */
  todayUsage: number;
  /** This month's usage */
  monthUsage: number;
  /** All-time usage */
  totalUsage: number;
  /** Daily limit remaining */
  dailyRemaining: number;
  /** Monthly limit remaining */
  monthlyRemaining: number;
  /** Daily usage percentage */
  dailyPercentUsed: number;
  /** Monthly usage percentage */
  monthlyPercentUsed: number;
  /** Average tokens per request */
  averageTokensPerRequest: number;
  /** Total requests */
  totalRequests: number;
}

/**
 * Model token limits
 */
export interface ModelTokenLimits {
  contextWindow: number;
  maxOutput: number;
}

/**
 * Default model token limits
 */
export const MODEL_TOKEN_LIMITS: Record<string, ModelTokenLimits> = {
  // OpenAI
  'gpt-4o': { contextWindow: 128000, maxOutput: 16384 },
  'gpt-4o-mini': { contextWindow: 128000, maxOutput: 16384 },
  'gpt-4-turbo': { contextWindow: 128000, maxOutput: 4096 },
  'gpt-3.5-turbo': { contextWindow: 16385, maxOutput: 4096 },
  // Anthropic
  'claude-3-5-sonnet-20241022': { contextWindow: 200000, maxOutput: 8192 },
  'claude-3-opus-20240229': { contextWindow: 200000, maxOutput: 4096 },
  'claude-3-haiku-20240307': { contextWindow: 200000, maxOutput: 4096 },
  'claude-3-sonnet-20240229': { contextWindow: 200000, maxOutput: 4096 },
  // Gemini
  'gemini-1.5-pro': { contextWindow: 2097152, maxOutput: 8192 },
  'gemini-1.5-flash': { contextWindow: 1048576, maxOutput: 8192 },
  'gemini-2.0-flash-exp': { contextWindow: 1048576, maxOutput: 8192 },
  'gemini-pro': { contextWindow: 30720, maxOutput: 2048 },
};

/**
 * Options for useTokenUsage hook
 */
export interface UseTokenUsageOptions {
  /** Storage key for localStorage */
  storageKey?: string;
  /** Token budget configuration */
  budget?: Partial<TokenBudget>;
  /** Token estimation method */
  estimationMethod?: TokenEstimationMethod;
  /** Maximum records to keep */
  maxRecords?: number;
  /** Alert callback */
  onAlert?: (alert: TokenAlert) => void;
}

/**
 * Return type for useTokenUsage hook
 */
export interface UseTokenUsageReturn {
  /** All usage records */
  records: TokenUsageRecord[];
  /** Current token budget */
  budget: TokenBudget;
  /** Usage summary */
  summary: TokenUsageSummary;
  /** Active alerts */
  alerts: TokenAlert[];
  /** Estimate tokens for text */
  estimateTokens: (text: string, model?: string) => number;
  /** Check if within budget */
  isWithinBudget: (estimatedTokens: number) => boolean;
  /** Record token usage */
  recordUsage: (usage: Omit<TokenUsageRecord, 'id' | 'timestamp'>) => TokenUsageRecord;
  /** Update budget */
  updateBudget: (budget: Partial<TokenBudget>) => void;
  /** Get model limits */
  getModelLimits: (model: string) => ModelTokenLimits;
  /** Check if prompt fits context window */
  fitsContextWindow: (text: string, model: string) => boolean;
  /** Get remaining context tokens */
  getRemainingContextTokens: (usedTokens: number, model: string) => number;
  /** Clear alerts */
  clearAlerts: () => void;
  /** Clear usage history */
  clearHistory: () => void;
  /** Export usage data */
  exportUsage: () => string;
  /** Import usage data */
  importUsage: (json: string) => { imported: number; errors: string[] };
}

/**
 * Default storage key
 */
const DEFAULT_STORAGE_KEY = 'spec-tree-token-usage';

/**
 * Default budget
 */
const DEFAULT_BUDGET: TokenBudget = {
  dailyLimit: 1000000,
  monthlyLimit: 10000000,
  perRequestLimit: 100000,
  warningThreshold: 80,
  criticalThreshold: 95,
};

/**
 * Default max records
 */
const DEFAULT_MAX_RECORDS = 10000;

/**
 * Average characters per token (approximate)
 */
const CHARS_PER_TOKEN = 4;

/**
 * Average words per token (approximate)
 */
const WORDS_PER_TOKEN = 0.75;

/**
 * Generate unique ID
 */
function generateId(): string {
  return `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get start of today
 */
function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Get start of month
 */
function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Load records from localStorage
 */
function loadRecords(storageKey: string): TokenUsageRecord[] {
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
function saveRecords(storageKey: string, records: TokenUsageRecord[], maxRecords: number): void {
  if (typeof window === 'undefined') return;

  try {
    const trimmed = records.slice(-maxRecords);
    localStorage.setItem(storageKey, JSON.stringify(trimmed));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Load budget from localStorage
 */
function loadBudget(storageKey: string, defaultBudget: TokenBudget): TokenBudget {
  if (typeof window === 'undefined') {
    return defaultBudget;
  }

  try {
    const stored = localStorage.getItem(`${storageKey}-budget`);
    if (stored) {
      return { ...defaultBudget, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }

  return defaultBudget;
}

/**
 * Save budget to localStorage
 */
function saveBudget(storageKey: string, budget: TokenBudget): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(`${storageKey}-budget`, JSON.stringify(budget));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Estimate tokens using character count method
 */
function estimateByCharacters(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens using word count method
 */
function estimateByWords(text: string): number {
  const wordCount = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  return Math.ceil(wordCount / WORDS_PER_TOKEN);
}

/**
 * Calculate usage summary
 */
function calculateSummary(records: TokenUsageRecord[], budget: TokenBudget): TokenUsageSummary {
  const todayStart = getTodayStart();
  const monthStart = getMonthStart();

  let todayUsage = 0;
  let monthUsage = 0;
  let totalUsage = 0;

  for (const record of records) {
    const recordDate = new Date(record.timestamp);
    totalUsage += record.totalTokens;

    if (recordDate >= monthStart) {
      monthUsage += record.totalTokens;
    }

    if (recordDate >= todayStart) {
      todayUsage += record.totalTokens;
    }
  }

  const dailyRemaining = Math.max(0, budget.dailyLimit - todayUsage);
  const monthlyRemaining = Math.max(0, budget.monthlyLimit - monthUsage);
  const dailyPercentUsed = budget.dailyLimit > 0 ? (todayUsage / budget.dailyLimit) * 100 : 0;
  const monthlyPercentUsed = budget.monthlyLimit > 0 ? (monthUsage / budget.monthlyLimit) * 100 : 0;
  const averageTokensPerRequest = records.length > 0 ? totalUsage / records.length : 0;

  return {
    todayUsage,
    monthUsage,
    totalUsage,
    dailyRemaining,
    monthlyRemaining,
    dailyPercentUsed: parseFloat(dailyPercentUsed.toFixed(2)),
    monthlyPercentUsed: parseFloat(monthlyPercentUsed.toFixed(2)),
    averageTokensPerRequest: Math.round(averageTokensPerRequest),
    totalRequests: records.length,
  };
}

/**
 * Check for alerts based on usage
 */
function checkAlerts(summary: TokenUsageSummary, budget: TokenBudget): TokenAlert[] {
  const alerts: TokenAlert[] = [];
  const now = new Date().toISOString();

  // Daily alerts
  if (summary.dailyPercentUsed >= budget.criticalThreshold) {
    alerts.push({
      level: 'critical',
      message: `Daily token usage is at ${summary.dailyPercentUsed.toFixed(1)}%`,
      timestamp: now,
      currentUsage: summary.todayUsage,
      limit: budget.dailyLimit,
      percentUsed: summary.dailyPercentUsed,
    });
  } else if (summary.dailyPercentUsed >= budget.warningThreshold) {
    alerts.push({
      level: 'warning',
      message: `Daily token usage is at ${summary.dailyPercentUsed.toFixed(1)}%`,
      timestamp: now,
      currentUsage: summary.todayUsage,
      limit: budget.dailyLimit,
      percentUsed: summary.dailyPercentUsed,
    });
  }

  // Monthly alerts
  if (summary.monthlyPercentUsed >= budget.criticalThreshold) {
    alerts.push({
      level: 'critical',
      message: `Monthly token usage is at ${summary.monthlyPercentUsed.toFixed(1)}%`,
      timestamp: now,
      currentUsage: summary.monthUsage,
      limit: budget.monthlyLimit,
      percentUsed: summary.monthlyPercentUsed,
    });
  } else if (summary.monthlyPercentUsed >= budget.warningThreshold) {
    alerts.push({
      level: 'warning',
      message: `Monthly token usage is at ${summary.monthlyPercentUsed.toFixed(1)}%`,
      timestamp: now,
      currentUsage: summary.monthUsage,
      limit: budget.monthlyLimit,
      percentUsed: summary.monthlyPercentUsed,
    });
  }

  return alerts;
}

/**
 * Hook for token usage tracking
 */
export function useTokenUsage(
  options: UseTokenUsageOptions = {}
): UseTokenUsageReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    budget: initialBudget,
    estimationMethod = 'characters',
    maxRecords = DEFAULT_MAX_RECORDS,
    onAlert,
  } = options;

  const [records, setRecords] = useState<TokenUsageRecord[]>(() =>
    loadRecords(storageKey)
  );
  const [budget, setBudget] = useState<TokenBudget>(() =>
    loadBudget(storageKey, { ...DEFAULT_BUDGET, ...initialBudget })
  );
  const [alerts, setAlerts] = useState<TokenAlert[]>([]);

  // Save records when changed
  useEffect(() => {
    saveRecords(storageKey, records, maxRecords);
  }, [records, storageKey, maxRecords]);

  // Save budget when changed
  useEffect(() => {
    saveBudget(storageKey, budget);
  }, [budget, storageKey]);

  // Calculate summary
  const summary = calculateSummary(records, budget);

  // Check for alerts when summary changes
  useEffect(() => {
    const newAlerts = checkAlerts(summary, budget);
    if (newAlerts.length > 0 && onAlert) {
      newAlerts.forEach(onAlert);
    }
    setAlerts(newAlerts);
  }, [summary.todayUsage, summary.monthUsage, budget, onAlert]);

  /**
   * Estimate tokens for text
   */
  const estimateTokens = useCallback(
    (text: string, _model?: string): number => {
      if (estimationMethod === 'words') {
        return estimateByWords(text);
      }
      return estimateByCharacters(text);
    },
    [estimationMethod]
  );

  /**
   * Check if within budget
   */
  const isWithinBudget = useCallback(
    (estimatedTokens: number): boolean => {
      return (
        estimatedTokens <= budget.perRequestLimit &&
        summary.todayUsage + estimatedTokens <= budget.dailyLimit &&
        summary.monthUsage + estimatedTokens <= budget.monthlyLimit
      );
    },
    [budget, summary]
  );

  /**
   * Record token usage
   */
  const recordUsage = useCallback(
    (usage: Omit<TokenUsageRecord, 'id' | 'timestamp'>): TokenUsageRecord => {
      const record: TokenUsageRecord = {
        ...usage,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };

      setRecords((prev) => [...prev, record]);
      return record;
    },
    []
  );

  /**
   * Update budget
   */
  const updateBudget = useCallback((updates: Partial<TokenBudget>) => {
    setBudget((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Get model limits
   */
  const getModelLimits = useCallback((model: string): ModelTokenLimits => {
    return MODEL_TOKEN_LIMITS[model] || { contextWindow: 4096, maxOutput: 4096 };
  }, []);

  /**
   * Check if text fits context window
   */
  const fitsContextWindow = useCallback(
    (text: string, model: string): boolean => {
      const tokens = estimateTokens(text);
      const limits = getModelLimits(model);
      return tokens <= limits.contextWindow;
    },
    [estimateTokens, getModelLimits]
  );

  /**
   * Get remaining context tokens
   */
  const getRemainingContextTokens = useCallback(
    (usedTokens: number, model: string): number => {
      const limits = getModelLimits(model);
      return Math.max(0, limits.contextWindow - usedTokens);
    },
    [getModelLimits]
  );

  /**
   * Clear alerts
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  /**
   * Clear usage history
   */
  const clearHistory = useCallback(() => {
    setRecords([]);
  }, []);

  /**
   * Export usage data
   */
  const exportUsage = useCallback((): string => {
    return JSON.stringify({ records, budget }, null, 2);
  }, [records, budget]);

  /**
   * Import usage data
   */
  const importUsage = useCallback(
    (json: string): { imported: number; errors: string[] } => {
      const errors: string[] = [];
      let imported = 0;

      try {
        const parsed = JSON.parse(json);
        const toImport = parsed.records || (Array.isArray(parsed) ? parsed : []);

        const newRecords: TokenUsageRecord[] = [];

        for (const item of toImport) {
          if (!item.model || item.inputTokens === undefined || item.outputTokens === undefined) {
            errors.push('Invalid record: missing required fields');
            continue;
          }

          newRecords.push({
            id: item.id || generateId(),
            timestamp: item.timestamp || new Date().toISOString(),
            model: item.model,
            inputTokens: item.inputTokens,
            outputTokens: item.outputTokens,
            totalTokens: item.totalTokens || item.inputTokens + item.outputTokens,
            workItemType: item.workItemType,
            workItemId: item.workItemId,
          });
          imported++;
        }

        if (newRecords.length > 0) {
          setRecords((prev) => [...prev, ...newRecords]);
        }

        if (parsed.budget) {
          setBudget((prev) => ({ ...prev, ...parsed.budget }));
        }
      } catch (e) {
        errors.push(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }

      return { imported, errors };
    },
    []
  );

  return {
    records,
    budget,
    summary,
    alerts,
    estimateTokens,
    isWithinBudget,
    recordUsage,
    updateBudget,
    getModelLimits,
    fitsContextWindow,
    getRemainingContextTokens,
    clearAlerts,
    clearHistory,
    exportUsage,
    importUsage,
  };
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Get alert color by level
 */
export function getAlertColor(level: TokenAlertLevel): string {
  switch (level) {
    case 'critical':
      return 'red';
    case 'warning':
      return 'amber';
    case 'info':
      return 'blue';
    default:
      return 'gray';
  }
}

export default useTokenUsage;
