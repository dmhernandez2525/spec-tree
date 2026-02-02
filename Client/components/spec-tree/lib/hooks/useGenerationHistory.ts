/**
 * Generation History Hook
 *
 * F1.1.15 - Generation history
 *
 * Tracks AI generation history for work items, allowing users to view
 * past generations and revert to previous versions.
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * Work item type for generation
 */
export type GenerationWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Generation status
 */
export type GenerationStatus = 'pending' | 'streaming' | 'completed' | 'failed';

/**
 * AI Provider type
 */
export type GenerationProvider = 'openai' | 'anthropic' | 'gemini';

/**
 * A single generation record
 */
export interface GenerationRecord {
  /** Unique record ID */
  id: string;
  /** Timestamp of generation */
  timestamp: string;
  /** Type of work item generated */
  workItemType: GenerationWorkItemType;
  /** ID of the work item this generation is for */
  workItemId: string;
  /** Parent item ID (e.g., epic ID for a feature) */
  parentId?: string;
  /** The prompt or context used for generation */
  prompt: string;
  /** The generated content */
  content: string;
  /** AI provider used */
  provider: GenerationProvider;
  /** Model used */
  model: string;
  /** Status of generation */
  status: GenerationStatus;
  /** Duration in milliseconds */
  duration?: number;
  /** Token usage */
  tokens?: {
    input: number;
    output: number;
  };
  /** Error message if failed */
  error?: string;
  /** Whether this generation was accepted/applied */
  wasApplied: boolean;
  /** User feedback on the generation */
  feedback?: 'positive' | 'negative' | 'neutral';
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Grouped history by work item
 */
export interface WorkItemHistory {
  workItemId: string;
  workItemType: GenerationWorkItemType;
  generations: GenerationRecord[];
  latestGeneration?: GenerationRecord;
  appliedGeneration?: GenerationRecord;
}

/**
 * Generation history store structure
 */
export interface GenerationHistoryStore {
  records: GenerationRecord[];
  lastUpdated: string;
}

/**
 * Options for useGenerationHistory hook
 */
export interface UseGenerationHistoryOptions {
  /** Storage key for localStorage */
  storageKey?: string;
  /** Maximum records to keep */
  maxRecords?: number;
  /** Filter by work item type */
  filterType?: GenerationWorkItemType;
}

/**
 * Return type for useGenerationHistory hook
 */
export interface UseGenerationHistoryReturn {
  /** All generation records */
  records: GenerationRecord[];
  /** Add a new generation record */
  addGeneration: (generation: Omit<GenerationRecord, 'id' | 'timestamp'>) => GenerationRecord;
  /** Update an existing generation */
  updateGeneration: (id: string, updates: Partial<GenerationRecord>) => GenerationRecord | null;
  /** Get generation by ID */
  getGeneration: (id: string) => GenerationRecord | undefined;
  /** Get history for a specific work item */
  getWorkItemHistory: (workItemId: string) => WorkItemHistory | undefined;
  /** Get all history grouped by work item */
  getAllWorkItemHistories: () => WorkItemHistory[];
  /** Mark a generation as applied */
  markAsApplied: (id: string) => void;
  /** Add feedback to a generation */
  addFeedback: (id: string, feedback: 'positive' | 'negative' | 'neutral') => void;
  /** Delete a generation record */
  deleteGeneration: (id: string) => boolean;
  /** Clear all history for a work item */
  clearWorkItemHistory: (workItemId: string) => void;
  /** Clear all history */
  clearAllHistory: () => void;
  /** Export history as JSON */
  exportHistory: (workItemIds?: string[]) => string;
  /** Import history from JSON */
  importHistory: (json: string) => { imported: number; errors: string[] };
  /** Get recent generations */
  getRecentGenerations: (limit?: number) => GenerationRecord[];
  /** Search generations */
  searchGenerations: (query: string) => GenerationRecord[];
  /** Get statistics */
  getStatistics: () => GenerationStatistics;
}

/**
 * Generation statistics
 */
export interface GenerationStatistics {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  appliedGenerations: number;
  byType: Record<GenerationWorkItemType, number>;
  byProvider: Record<GenerationProvider, number>;
  averageDuration: number;
  totalTokens: { input: number; output: number };
  feedbackCounts: { positive: number; negative: number; neutral: number };
}

/**
 * Default storage key
 */
const DEFAULT_STORAGE_KEY = 'spec-tree-generation-history';

/**
 * Default maximum records
 */
const DEFAULT_MAX_RECORDS = 1000;

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load history from localStorage
 */
function loadHistory(storageKey: string): GenerationRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const store: GenerationHistoryStore = JSON.parse(stored);
      return store.records;
    }
  } catch {
    // Ignore parse errors
  }

  return [];
}

/**
 * Save history to localStorage
 */
function saveHistory(storageKey: string, records: GenerationRecord[], maxRecords: number): void {
  if (typeof window === 'undefined') return;

  try {
    // Trim to max records, keeping most recent
    const trimmed = records.slice(-maxRecords);
    const store: GenerationHistoryStore = {
      records: trimmed,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Group records by work item
 */
function groupByWorkItem(records: GenerationRecord[]): Map<string, WorkItemHistory> {
  const groups = new Map<string, WorkItemHistory>();

  for (const record of records) {
    const existing = groups.get(record.workItemId);
    if (existing) {
      existing.generations.push(record);
      // Update latest and applied
      if (!existing.latestGeneration || new Date(record.timestamp) > new Date(existing.latestGeneration.timestamp)) {
        existing.latestGeneration = record;
      }
      if (record.wasApplied) {
        existing.appliedGeneration = record;
      }
    } else {
      groups.set(record.workItemId, {
        workItemId: record.workItemId,
        workItemType: record.workItemType,
        generations: [record],
        latestGeneration: record,
        appliedGeneration: record.wasApplied ? record : undefined,
      });
    }
  }

  // Sort generations within each group by timestamp (newest first)
  Array.from(groups.values()).forEach((history) => {
    history.generations.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  });

  return groups;
}

/**
 * Hook for managing generation history
 */
export function useGenerationHistory(
  options: UseGenerationHistoryOptions = {}
): UseGenerationHistoryReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    maxRecords = DEFAULT_MAX_RECORDS,
    filterType,
  } = options;

  const [records, setRecords] = useState<GenerationRecord[]>(() =>
    loadHistory(storageKey)
  );

  // Save to localStorage when records change
  useEffect(() => {
    saveHistory(storageKey, records, maxRecords);
  }, [records, storageKey, maxRecords]);

  /**
   * Get filtered records
   */
  const getFilteredRecords = useCallback((): GenerationRecord[] => {
    if (filterType) {
      return records.filter((r) => r.workItemType === filterType);
    }
    return records;
  }, [records, filterType]);

  /**
   * Add a new generation record
   */
  const addGeneration = useCallback(
    (generation: Omit<GenerationRecord, 'id' | 'timestamp'>): GenerationRecord => {
      const record: GenerationRecord = {
        ...generation,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };

      setRecords((prev) => [...prev, record]);
      return record;
    },
    []
  );

  /**
   * Update an existing generation
   */
  const updateGeneration = useCallback(
    (id: string, updates: Partial<GenerationRecord>): GenerationRecord | null => {
      let updated: GenerationRecord | null = null;

      setRecords((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            updated = { ...r, ...updates };
            return updated;
          }
          return r;
        })
      );

      return updated;
    },
    []
  );

  /**
   * Get generation by ID
   */
  const getGeneration = useCallback(
    (id: string): GenerationRecord | undefined => {
      return records.find((r) => r.id === id);
    },
    [records]
  );

  /**
   * Get history for a specific work item
   */
  const getWorkItemHistory = useCallback(
    (workItemId: string): WorkItemHistory | undefined => {
      const groups = groupByWorkItem(getFilteredRecords());
      return groups.get(workItemId);
    },
    [getFilteredRecords]
  );

  /**
   * Get all history grouped by work item
   */
  const getAllWorkItemHistories = useCallback((): WorkItemHistory[] => {
    const groups = groupByWorkItem(getFilteredRecords());
    return Array.from(groups.values());
  }, [getFilteredRecords]);

  /**
   * Mark a generation as applied
   */
  const markAsApplied = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, wasApplied: true };
        }
        // Unmark other generations for the same work item
        const target = prev.find((rec) => rec.id === id);
        if (target && r.workItemId === target.workItemId && r.id !== id) {
          return { ...r, wasApplied: false };
        }
        return r;
      })
    );
  }, []);

  /**
   * Add feedback to a generation
   */
  const addFeedback = useCallback(
    (id: string, feedback: 'positive' | 'negative' | 'neutral') => {
      updateGeneration(id, { feedback });
    },
    [updateGeneration]
  );

  /**
   * Delete a generation record
   */
  const deleteGeneration = useCallback((id: string): boolean => {
    // Check if record exists first
    const exists = records.some((r) => r.id === id);
    if (!exists) {
      return false;
    }

    setRecords((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, [records]);

  /**
   * Clear all history for a work item
   */
  const clearWorkItemHistory = useCallback((workItemId: string) => {
    setRecords((prev) => prev.filter((r) => r.workItemId !== workItemId));
  }, []);

  /**
   * Clear all history
   */
  const clearAllHistory = useCallback(() => {
    setRecords([]);
  }, []);

  /**
   * Export history as JSON
   */
  const exportHistory = useCallback(
    (workItemIds?: string[]): string => {
      const toExport = workItemIds
        ? records.filter((r) => workItemIds.includes(r.workItemId))
        : records;

      return JSON.stringify(toExport, null, 2);
    },
    [records]
  );

  /**
   * Import history from JSON
   */
  const importHistory = useCallback(
    (json: string): { imported: number; errors: string[] } => {
      const errors: string[] = [];
      let imported = 0;

      try {
        const parsed = JSON.parse(json);
        const toImport = Array.isArray(parsed) ? parsed : [parsed];
        const newRecords: GenerationRecord[] = [];

        for (const item of toImport) {
          if (!item.workItemType || !item.workItemId || !item.content) {
            errors.push('Invalid record: missing required fields');
            continue;
          }

          if (!['epic', 'feature', 'userStory', 'task'].includes(item.workItemType)) {
            errors.push(`Invalid work item type: ${item.workItemType}`);
            continue;
          }

          newRecords.push({
            id: item.id || generateId(),
            timestamp: item.timestamp || new Date().toISOString(),
            workItemType: item.workItemType,
            workItemId: item.workItemId,
            parentId: item.parentId,
            prompt: item.prompt || '',
            content: item.content,
            provider: item.provider || 'openai',
            model: item.model || 'unknown',
            status: item.status || 'completed',
            duration: item.duration,
            tokens: item.tokens,
            error: item.error,
            wasApplied: item.wasApplied || false,
            feedback: item.feedback,
            tags: item.tags,
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
    []
  );

  /**
   * Get recent generations
   */
  const getRecentGenerations = useCallback(
    (limit: number = 10): GenerationRecord[] => {
      const filtered = getFilteredRecords();
      return [...filtered]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    [getFilteredRecords]
  );

  /**
   * Search generations
   */
  const searchGenerations = useCallback(
    (query: string): GenerationRecord[] => {
      if (!query.trim()) return getFilteredRecords();

      const lowerQuery = query.toLowerCase();
      return getFilteredRecords().filter(
        (r) =>
          r.content.toLowerCase().includes(lowerQuery) ||
          r.prompt.toLowerCase().includes(lowerQuery) ||
          r.workItemId.toLowerCase().includes(lowerQuery) ||
          r.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    },
    [getFilteredRecords]
  );

  /**
   * Get statistics
   */
  const getStatistics = useCallback((): GenerationStatistics => {
    const filtered = getFilteredRecords();

    const stats: GenerationStatistics = {
      totalGenerations: filtered.length,
      successfulGenerations: 0,
      failedGenerations: 0,
      appliedGenerations: 0,
      byType: { epic: 0, feature: 0, userStory: 0, task: 0 },
      byProvider: { openai: 0, anthropic: 0, gemini: 0 },
      averageDuration: 0,
      totalTokens: { input: 0, output: 0 },
      feedbackCounts: { positive: 0, negative: 0, neutral: 0 },
    };

    let totalDuration = 0;
    let durationCount = 0;

    for (const record of filtered) {
      // Status counts
      if (record.status === 'completed') {
        stats.successfulGenerations++;
      } else if (record.status === 'failed') {
        stats.failedGenerations++;
      }

      if (record.wasApplied) {
        stats.appliedGenerations++;
      }

      // By type
      stats.byType[record.workItemType]++;

      // By provider
      stats.byProvider[record.provider]++;

      // Duration
      if (record.duration) {
        totalDuration += record.duration;
        durationCount++;
      }

      // Tokens
      if (record.tokens) {
        stats.totalTokens.input += record.tokens.input;
        stats.totalTokens.output += record.tokens.output;
      }

      // Feedback
      if (record.feedback) {
        stats.feedbackCounts[record.feedback]++;
      }
    }

    stats.averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return stats;
  }, [getFilteredRecords]);

  return {
    records: getFilteredRecords(),
    addGeneration,
    updateGeneration,
    getGeneration,
    getWorkItemHistory,
    getAllWorkItemHistories,
    markAsApplied,
    addFeedback,
    deleteGeneration,
    clearWorkItemHistory,
    clearAllHistory,
    exportHistory,
    importHistory,
    getRecentGenerations,
    searchGenerations,
    getStatistics,
  };
}

/**
 * Get display name for work item type
 */
export function getWorkItemTypeDisplayName(type: GenerationWorkItemType): string {
  switch (type) {
    case 'epic':
      return 'Epic';
    case 'feature':
      return 'Feature';
    case 'userStory':
      return 'User Story';
    case 'task':
      return 'Task';
    default:
      return 'Unknown';
  }
}

export default useGenerationHistory;
