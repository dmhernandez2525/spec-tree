/**
 * Regeneration Feedback Hook
 *
 * F1.1.16 - Regeneration with feedback
 *
 * Tracks regeneration feedback history and effectiveness metrics,
 * allowing users to refine AI output with guidance and track what works.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Predefined feedback types that can be used for regeneration
 */
export type FeedbackType =
  | 'more_detailed'
  | 'simpler'
  | 'different_approach'
  | 'more_technical'
  | 'less_technical'
  | 'custom';

/**
 * Work item type for feedback tracking
 */
export type FeedbackWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Satisfaction rating for a regeneration
 */
export type SatisfactionRating = 'satisfied' | 'unsatisfied' | 'neutral' | 'unrated';

/**
 * A single feedback record
 */
export interface FeedbackRecord {
  /** Unique record ID */
  id: string;
  /** Timestamp of the feedback */
  timestamp: string;
  /** Work item ID this feedback was for */
  workItemId: string;
  /** Type of work item */
  workItemType: FeedbackWorkItemType;
  /** Type of feedback used */
  feedbackType: FeedbackType;
  /** Custom feedback text (if feedbackType is 'custom') */
  customFeedback?: string;
  /** The full prompt that was sent */
  fullPrompt: string;
  /** Satisfaction rating */
  satisfaction: SatisfactionRating;
  /** Optional notes about why the rating was given */
  satisfactionNotes?: string;
  /** Generation ID this feedback resulted in (links to useGenerationHistory) */
  generationId?: string;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Statistics for feedback effectiveness
 */
export interface FeedbackStatistics {
  /** Total number of regenerations with feedback */
  totalRegenerations: number;
  /** Number of satisfied regenerations */
  satisfiedCount: number;
  /** Number of unsatisfied regenerations */
  unsatisfiedCount: number;
  /** Number of neutral regenerations */
  neutralCount: number;
  /** Number of unrated regenerations */
  unratedCount: number;
  /** Satisfaction rate (satisfied / (satisfied + unsatisfied)) */
  satisfactionRate: number;
  /** Counts by feedback type */
  byType: Record<FeedbackType, { total: number; satisfied: number; rate: number }>;
  /** Counts by work item type */
  byWorkItemType: Record<FeedbackWorkItemType, { total: number; satisfied: number; rate: number }>;
  /** Most effective feedback types (sorted by satisfaction rate) */
  mostEffective: Array<{ type: FeedbackType; rate: number; count: number }>;
}

/**
 * Suggested feedback based on past effectiveness
 */
export interface FeedbackSuggestion {
  type: FeedbackType;
  label: string;
  prompt: string;
  effectivenessRate: number;
  usageCount: number;
}

/**
 * Feedback store structure for persistence
 */
export interface FeedbackStore {
  records: FeedbackRecord[];
  lastUpdated: string;
}

/**
 * Options for useRegenerationFeedback hook
 */
export interface UseRegenerationFeedbackOptions {
  /** Storage key for localStorage */
  storageKey?: string;
  /** Maximum records to keep */
  maxRecords?: number;
  /** Filter by work item type */
  filterWorkItemType?: FeedbackWorkItemType;
}

/**
 * Return type for useRegenerationFeedback hook
 */
export interface UseRegenerationFeedbackReturn {
  /** All feedback records */
  records: FeedbackRecord[];
  /** Record a new regeneration with feedback */
  recordFeedback: (feedback: Omit<FeedbackRecord, 'id' | 'timestamp' | 'satisfaction'>) => FeedbackRecord;
  /** Update satisfaction rating for a feedback record */
  rateSatisfaction: (id: string, satisfaction: SatisfactionRating, notes?: string) => FeedbackRecord | null;
  /** Get feedback record by ID */
  getFeedback: (id: string) => FeedbackRecord | undefined;
  /** Get feedback history for a specific work item */
  getWorkItemFeedback: (workItemId: string) => FeedbackRecord[];
  /** Get recent feedback records */
  getRecentFeedback: (limit?: number) => FeedbackRecord[];
  /** Delete a feedback record */
  deleteFeedback: (id: string) => boolean;
  /** Clear all feedback for a work item */
  clearWorkItemFeedback: (workItemId: string) => void;
  /** Clear all feedback */
  clearAllFeedback: () => void;
  /** Get statistics on feedback effectiveness */
  getStatistics: () => FeedbackStatistics;
  /** Get suggested feedback types based on effectiveness */
  getSuggestions: (workItemType?: FeedbackWorkItemType) => FeedbackSuggestion[];
  /** Export feedback history as JSON */
  exportFeedback: (workItemIds?: string[]) => string;
  /** Import feedback history from JSON */
  importFeedback: (json: string) => { imported: number; errors: string[] };
  /** Link feedback record to a generation */
  linkToGeneration: (feedbackId: string, generationId: string) => void;
}

/**
 * Default storage key
 */
const DEFAULT_STORAGE_KEY = 'spec-tree-regeneration-feedback';

/**
 * Default maximum records
 */
const DEFAULT_MAX_RECORDS = 500;

/**
 * Feedback type labels and prompts
 */
export const FEEDBACK_OPTIONS: Record<FeedbackType, { label: string; prompt: string }> = {
  more_detailed: {
    label: 'More detailed',
    prompt: 'Please regenerate with more detail. Include additional specifications, edge cases, and implementation considerations.',
  },
  simpler: {
    label: 'Simpler',
    prompt: 'Please regenerate with a simpler approach. Focus on the core functionality and reduce complexity.',
  },
  different_approach: {
    label: 'Different approach',
    prompt: 'Please regenerate using a different approach or architecture. Consider alternative solutions.',
  },
  more_technical: {
    label: 'More technical',
    prompt: 'Please regenerate with more technical depth. Include specific technologies, patterns, and technical requirements.',
  },
  less_technical: {
    label: 'Less technical',
    prompt: 'Please regenerate in simpler, less technical terms. Focus on business value and user-facing features.',
  },
  custom: {
    label: 'Custom feedback',
    prompt: '',
  },
};

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `fb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Load feedback from localStorage
 */
function loadFeedback(storageKey: string): FeedbackRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const store: FeedbackStore = JSON.parse(stored);
      return store.records;
    }
  } catch {
    // Ignore parse errors
  }

  return [];
}

/**
 * Save feedback to localStorage
 */
function saveFeedback(storageKey: string, records: FeedbackRecord[], maxRecords: number): void {
  if (typeof window === 'undefined') return;

  try {
    // Trim to max records, keeping most recent
    const trimmed = records.slice(-maxRecords);
    const store: FeedbackStore = {
      records: trimmed,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(storageKey, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Calculate satisfaction rate
 */
function calculateRate(satisfied: number, total: number): number {
  if (total === 0) return 0;
  return satisfied / total;
}

/**
 * Hook for managing regeneration feedback
 */
export function useRegenerationFeedback(
  options: UseRegenerationFeedbackOptions = {}
): UseRegenerationFeedbackReturn {
  const {
    storageKey = DEFAULT_STORAGE_KEY,
    maxRecords = DEFAULT_MAX_RECORDS,
    filterWorkItemType,
  } = options;

  const [records, setRecords] = useState<FeedbackRecord[]>(() =>
    loadFeedback(storageKey)
  );

  // Save to localStorage when records change
  useEffect(() => {
    saveFeedback(storageKey, records, maxRecords);
  }, [records, storageKey, maxRecords]);

  /**
   * Get filtered records
   */
  const filteredRecords = useMemo((): FeedbackRecord[] => {
    if (filterWorkItemType) {
      return records.filter((r) => r.workItemType === filterWorkItemType);
    }
    return records;
  }, [records, filterWorkItemType]);

  /**
   * Record a new regeneration with feedback
   */
  const recordFeedback = useCallback(
    (feedback: Omit<FeedbackRecord, 'id' | 'timestamp' | 'satisfaction'>): FeedbackRecord => {
      const record: FeedbackRecord = {
        ...feedback,
        id: generateId(),
        timestamp: new Date().toISOString(),
        satisfaction: 'unrated',
      };

      setRecords((prev) => [...prev, record]);
      return record;
    },
    []
  );

  /**
   * Update satisfaction rating for a feedback record
   */
  const rateSatisfaction = useCallback(
    (id: string, satisfaction: SatisfactionRating, notes?: string): FeedbackRecord | null => {
      let updated: FeedbackRecord | null = null;

      setRecords((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            updated = { ...r, satisfaction, satisfactionNotes: notes };
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
   * Get feedback record by ID
   */
  const getFeedback = useCallback(
    (id: string): FeedbackRecord | undefined => {
      return records.find((r) => r.id === id);
    },
    [records]
  );

  /**
   * Get feedback history for a specific work item
   */
  const getWorkItemFeedback = useCallback(
    (workItemId: string): FeedbackRecord[] => {
      return filteredRecords
        .filter((r) => r.workItemId === workItemId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [filteredRecords]
  );

  /**
   * Get recent feedback records
   */
  const getRecentFeedback = useCallback(
    (limit: number = 10): FeedbackRecord[] => {
      return [...filteredRecords]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    },
    [filteredRecords]
  );

  /**
   * Delete a feedback record
   */
  const deleteFeedback = useCallback((id: string): boolean => {
    const exists = records.some((r) => r.id === id);
    if (!exists) {
      return false;
    }

    setRecords((prev) => prev.filter((r) => r.id !== id));
    return true;
  }, [records]);

  /**
   * Clear all feedback for a work item
   */
  const clearWorkItemFeedback = useCallback((workItemId: string) => {
    setRecords((prev) => prev.filter((r) => r.workItemId !== workItemId));
  }, []);

  /**
   * Clear all feedback
   */
  const clearAllFeedback = useCallback(() => {
    setRecords([]);
  }, []);

  /**
   * Get statistics on feedback effectiveness
   */
  const getStatistics = useCallback((): FeedbackStatistics => {
    const allTypes: FeedbackType[] = ['more_detailed', 'simpler', 'different_approach', 'more_technical', 'less_technical', 'custom'];
    const allWorkItemTypes: FeedbackWorkItemType[] = ['epic', 'feature', 'userStory', 'task'];

    const stats: FeedbackStatistics = {
      totalRegenerations: filteredRecords.length,
      satisfiedCount: 0,
      unsatisfiedCount: 0,
      neutralCount: 0,
      unratedCount: 0,
      satisfactionRate: 0,
      byType: {} as Record<FeedbackType, { total: number; satisfied: number; rate: number }>,
      byWorkItemType: {} as Record<FeedbackWorkItemType, { total: number; satisfied: number; rate: number }>,
      mostEffective: [],
    };

    // Initialize byType
    for (const type of allTypes) {
      stats.byType[type] = { total: 0, satisfied: 0, rate: 0 };
    }

    // Initialize byWorkItemType
    for (const type of allWorkItemTypes) {
      stats.byWorkItemType[type] = { total: 0, satisfied: 0, rate: 0 };
    }

    // Count records
    for (const record of filteredRecords) {
      // Satisfaction counts
      switch (record.satisfaction) {
        case 'satisfied':
          stats.satisfiedCount++;
          break;
        case 'unsatisfied':
          stats.unsatisfiedCount++;
          break;
        case 'neutral':
          stats.neutralCount++;
          break;
        case 'unrated':
          stats.unratedCount++;
          break;
      }

      // By type
      stats.byType[record.feedbackType].total++;
      if (record.satisfaction === 'satisfied') {
        stats.byType[record.feedbackType].satisfied++;
      }

      // By work item type
      stats.byWorkItemType[record.workItemType].total++;
      if (record.satisfaction === 'satisfied') {
        stats.byWorkItemType[record.workItemType].satisfied++;
      }
    }

    // Calculate rates
    const ratedCount = stats.satisfiedCount + stats.unsatisfiedCount;
    stats.satisfactionRate = calculateRate(stats.satisfiedCount, ratedCount);

    for (const type of allTypes) {
      const typeData = stats.byType[type];
      typeData.rate = calculateRate(typeData.satisfied, typeData.total);
    }

    for (const type of allWorkItemTypes) {
      const typeData = stats.byWorkItemType[type];
      typeData.rate = calculateRate(typeData.satisfied, typeData.total);
    }

    // Calculate most effective (sorted by rate, then by count)
    stats.mostEffective = allTypes
      .map((type) => ({
        type,
        rate: stats.byType[type].rate,
        count: stats.byType[type].total,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => {
        if (b.rate !== a.rate) return b.rate - a.rate;
        return b.count - a.count;
      });

    return stats;
  }, [filteredRecords]);

  /**
   * Get suggested feedback types based on effectiveness
   */
  const getSuggestions = useCallback(
    (workItemType?: FeedbackWorkItemType): FeedbackSuggestion[] => {
      // Filter records by work item type if specified
      const relevantRecords = workItemType
        ? filteredRecords.filter((r) => r.workItemType === workItemType)
        : filteredRecords;

      const allTypes: FeedbackType[] = ['more_detailed', 'simpler', 'different_approach', 'more_technical', 'less_technical', 'custom'];

      // Calculate effectiveness for each type
      const typeStats = new Map<FeedbackType, { total: number; satisfied: number }>();

      for (const type of allTypes) {
        typeStats.set(type, { total: 0, satisfied: 0 });
      }

      for (const record of relevantRecords) {
        const stat = typeStats.get(record.feedbackType)!;
        stat.total++;
        if (record.satisfaction === 'satisfied') {
          stat.satisfied++;
        }
      }

      // Build suggestions sorted by effectiveness
      const suggestions: FeedbackSuggestion[] = allTypes
        .filter((type) => type !== 'custom') // Exclude custom from suggestions
        .map((type) => {
          const stat = typeStats.get(type)!;
          const option = FEEDBACK_OPTIONS[type];
          return {
            type,
            label: option.label,
            prompt: option.prompt,
            effectivenessRate: stat.total > 0 ? stat.satisfied / stat.total : 0.5, // Default to 50% if no data
            usageCount: stat.total,
          };
        })
        .sort((a, b) => {
          // Sort by effectiveness rate, then by usage count
          if (b.effectivenessRate !== a.effectivenessRate) {
            return b.effectivenessRate - a.effectivenessRate;
          }
          return b.usageCount - a.usageCount;
        });

      return suggestions;
    },
    [filteredRecords]
  );

  /**
   * Export feedback history as JSON
   */
  const exportFeedback = useCallback(
    (workItemIds?: string[]): string => {
      const toExport = workItemIds
        ? records.filter((r) => workItemIds.includes(r.workItemId))
        : records;

      return JSON.stringify(toExport, null, 2);
    },
    [records]
  );

  /**
   * Import feedback history from JSON
   */
  const importFeedback = useCallback(
    (json: string): { imported: number; errors: string[] } => {
      const errors: string[] = [];
      let imported = 0;

      try {
        const parsed = JSON.parse(json);
        const toImport = Array.isArray(parsed) ? parsed : [parsed];
        const newRecords: FeedbackRecord[] = [];

        for (const item of toImport) {
          if (!item.workItemType || !item.workItemId || !item.feedbackType) {
            errors.push('Invalid record: missing required fields');
            continue;
          }

          if (!['epic', 'feature', 'userStory', 'task'].includes(item.workItemType)) {
            errors.push(`Invalid work item type: ${item.workItemType}`);
            continue;
          }

          if (!['more_detailed', 'simpler', 'different_approach', 'more_technical', 'less_technical', 'custom'].includes(item.feedbackType)) {
            errors.push(`Invalid feedback type: ${item.feedbackType}`);
            continue;
          }

          newRecords.push({
            id: item.id || generateId(),
            timestamp: item.timestamp || new Date().toISOString(),
            workItemId: item.workItemId,
            workItemType: item.workItemType,
            feedbackType: item.feedbackType,
            customFeedback: item.customFeedback,
            fullPrompt: item.fullPrompt || '',
            satisfaction: item.satisfaction || 'unrated',
            satisfactionNotes: item.satisfactionNotes,
            generationId: item.generationId,
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
   * Link feedback record to a generation
   */
  const linkToGeneration = useCallback((feedbackId: string, generationId: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === feedbackId) {
          return { ...r, generationId };
        }
        return r;
      })
    );
  }, []);

  return {
    records: filteredRecords,
    recordFeedback,
    rateSatisfaction,
    getFeedback,
    getWorkItemFeedback,
    getRecentFeedback,
    deleteFeedback,
    clearWorkItemFeedback,
    clearAllFeedback,
    getStatistics,
    getSuggestions,
    exportFeedback,
    importFeedback,
    linkToGeneration,
  };
}

/**
 * Get display name for feedback type
 */
export function getFeedbackTypeDisplayName(type: FeedbackType): string {
  return FEEDBACK_OPTIONS[type]?.label || 'Unknown';
}

/**
 * Get prompt for feedback type
 */
export function getFeedbackTypePrompt(type: FeedbackType): string {
  return FEEDBACK_OPTIONS[type]?.prompt || '';
}

/**
 * Build a full regeneration prompt with feedback
 */
export function buildRegenerationPrompt(
  feedbackType: FeedbackType,
  itemType: string,
  customFeedback?: string
): string {
  if (feedbackType === 'custom' && customFeedback) {
    return `User feedback: ${customFeedback.trim()}\n\nApply this guidance when generating the ${itemType}.`;
  }

  const prompt = getFeedbackTypePrompt(feedbackType);
  if (prompt) {
    return `${prompt}\n\nApply this guidance when generating the ${itemType}.`;
  }

  return '';
}

export default useRegenerationFeedback;
