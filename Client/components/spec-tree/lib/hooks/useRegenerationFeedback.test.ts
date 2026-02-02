/**
 * Tests for useRegenerationFeedback hook
 *
 * F1.1.16 - Regeneration with feedback
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  useRegenerationFeedback,
  getFeedbackTypeDisplayName,
  getFeedbackTypePrompt,
  buildRegenerationPrompt,
  FEEDBACK_OPTIONS,
  FeedbackType,
  FeedbackRecord,
} from './useRegenerationFeedback';

describe('useRegenerationFeedback', () => {
  const testStorageKey = 'test-regeneration-feedback';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty records', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      expect(result.current.records).toEqual([]);
    });

    it('should provide all required methods and properties', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      expect(result.current.records).toBeDefined();
      expect(typeof result.current.recordFeedback).toBe('function');
      expect(typeof result.current.rateSatisfaction).toBe('function');
      expect(typeof result.current.getFeedback).toBe('function');
      expect(typeof result.current.getWorkItemFeedback).toBe('function');
      expect(typeof result.current.getRecentFeedback).toBe('function');
      expect(typeof result.current.deleteFeedback).toBe('function');
      expect(typeof result.current.clearWorkItemFeedback).toBe('function');
      expect(typeof result.current.clearAllFeedback).toBe('function');
      expect(typeof result.current.getStatistics).toBe('function');
      expect(typeof result.current.getSuggestions).toBe('function');
      expect(typeof result.current.exportFeedback).toBe('function');
      expect(typeof result.current.importFeedback).toBe('function');
      expect(typeof result.current.linkToGeneration).toBe('function');
    });
  });

  describe('recordFeedback', () => {
    it('should record feedback with generated id and timestamp', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let record: FeedbackRecord;
      act(() => {
        record = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test prompt',
        });
      });

      expect(record!.id).toMatch(/^fb-/);
      expect(record!.timestamp).toBeDefined();
      expect(record!.satisfaction).toBe('unrated');
      expect(result.current.records).toHaveLength(1);
    });

    it('should record custom feedback', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'epic',
          feedbackType: 'custom',
          customFeedback: 'Make it more user-friendly',
          fullPrompt: 'User feedback: Make it more user-friendly',
        });
      });

      expect(result.current.records[0].feedbackType).toBe('custom');
      expect(result.current.records[0].customFeedback).toBe('Make it more user-friendly');
    });

    it('should add records to the in-memory state', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'task',
          feedbackType: 'simpler',
          fullPrompt: 'Test',
        });
      });

      expect(result.current.records).toHaveLength(1);
      expect(result.current.records[0].workItemId).toBe('work-1');
      expect(result.current.records[0].feedbackType).toBe('simpler');
    });
  });

  describe('rateSatisfaction', () => {
    it('should update satisfaction rating', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let record: FeedbackRecord;
      act(() => {
        record = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test',
        });
      });

      act(() => {
        result.current.rateSatisfaction(record!.id, 'satisfied', 'Good result');
      });

      expect(result.current.records[0].satisfaction).toBe('satisfied');
      expect(result.current.records[0].satisfactionNotes).toBe('Good result');
    });

    it('should return null for non-existent record', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let updated: FeedbackRecord | null;
      act(() => {
        updated = result.current.rateSatisfaction('non-existent', 'satisfied');
      });

      expect(updated!).toBeNull();
    });
  });

  describe('getFeedback', () => {
    it('should get feedback by ID', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let record: FeedbackRecord;
      act(() => {
        record = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test',
        });
      });

      const found = result.current.getFeedback(record!.id);
      expect(found).toBeDefined();
      expect(found?.workItemId).toBe('work-1');
    });

    it('should return undefined for non-existent ID', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      const found = result.current.getFeedback('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getWorkItemFeedback', () => {
    it('should get all feedback for a work item', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'different_approach',
          fullPrompt: 'Test 3',
        });
      });

      const feedback = result.current.getWorkItemFeedback('work-1');
      expect(feedback).toHaveLength(2);
    });

    it('should return feedback sorted by timestamp (newest first)', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      // Import records with explicit timestamps to test sorting
      const toImport = [
        {
          id: 'fb-1',
          timestamp: '2024-01-15T10:00:00.000Z', // Older
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'First',
          satisfaction: 'unrated',
        },
        {
          id: 'fb-2',
          timestamp: '2024-01-15T11:00:00.000Z', // Newer
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'simpler',
          fullPrompt: 'Second',
          satisfaction: 'unrated',
        },
      ];

      act(() => {
        result.current.importFeedback(JSON.stringify(toImport));
      });

      const feedback = result.current.getWorkItemFeedback('work-1');
      expect(feedback[0].fullPrompt).toBe('Second'); // Newer first
      expect(feedback[1].fullPrompt).toBe('First');  // Older second
    });
  });

  describe('getRecentFeedback', () => {
    it('should get recent feedback with default limit', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.recordFeedback({
            workItemId: `work-${i}`,
            workItemType: 'feature',
            feedbackType: 'more_detailed',
            fullPrompt: `Test ${i}`,
          });
        }
      });

      const recent = result.current.getRecentFeedback();
      expect(recent).toHaveLength(10); // Default limit
    });

    it('should respect custom limit', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.recordFeedback({
            workItemId: `work-${i}`,
            workItemType: 'feature',
            feedbackType: 'more_detailed',
            fullPrompt: `Test ${i}`,
          });
        }
      });

      const recent = result.current.getRecentFeedback(5);
      expect(recent).toHaveLength(5);
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback record', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let record: FeedbackRecord;
      act(() => {
        record = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test',
        });
      });

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteFeedback(record!.id);
      });

      expect(deleted!).toBe(true);
      expect(result.current.records).toHaveLength(0);
    });

    it('should return false for non-existent record', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteFeedback('non-existent');
      });

      expect(deleted!).toBe(false);
    });
  });

  describe('clearWorkItemFeedback', () => {
    it('should clear all feedback for a work item', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'different_approach',
          fullPrompt: 'Test 3',
        });
      });

      act(() => {
        result.current.clearWorkItemFeedback('work-1');
      });

      expect(result.current.records).toHaveLength(1);
      expect(result.current.records[0].workItemId).toBe('work-2');
    });
  });

  describe('clearAllFeedback', () => {
    it('should clear all feedback', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
      });

      act(() => {
        result.current.clearAllFeedback();
      });

      expect(result.current.records).toHaveLength(0);
    });
  });

  describe('getStatistics', () => {
    it('should calculate statistics correctly', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        const record1 = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.rateSatisfaction(record1.id, 'satisfied');

        const record2 = result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 2',
        });
        result.current.rateSatisfaction(record2.id, 'satisfied');

        const record3 = result.current.recordFeedback({
          workItemId: 'work-3',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 3',
        });
        result.current.rateSatisfaction(record3.id, 'unsatisfied');

        result.current.recordFeedback({
          workItemId: 'work-4',
          workItemType: 'task',
          feedbackType: 'different_approach',
          fullPrompt: 'Test 4',
        }); // unrated
      });

      const stats = result.current.getStatistics();

      expect(stats.totalRegenerations).toBe(4);
      expect(stats.satisfiedCount).toBe(2);
      expect(stats.unsatisfiedCount).toBe(1);
      expect(stats.unratedCount).toBe(1);
      expect(stats.satisfactionRate).toBeCloseTo(0.667, 2); // 2/3

      expect(stats.byType.more_detailed.total).toBe(2);
      expect(stats.byType.more_detailed.satisfied).toBe(2);
      expect(stats.byType.simpler.total).toBe(1);
      expect(stats.byType.simpler.satisfied).toBe(0);

      expect(stats.byWorkItemType.feature.total).toBe(2);
      expect(stats.byWorkItemType.epic.total).toBe(1);
      expect(stats.byWorkItemType.task.total).toBe(1);

      expect(stats.mostEffective[0].type).toBe('more_detailed');
      expect(stats.mostEffective[0].rate).toBe(1);
    });

    it('should handle empty records', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      const stats = result.current.getStatistics();

      expect(stats.totalRegenerations).toBe(0);
      expect(stats.satisfactionRate).toBe(0);
    });
  });

  describe('getSuggestions', () => {
    it('should suggest feedback types based on effectiveness', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        // More detailed: 100% effective
        const r1 = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.rateSatisfaction(r1.id, 'satisfied');

        // Simpler: 0% effective
        const r2 = result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'feature',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
        result.current.rateSatisfaction(r2.id, 'unsatisfied');
      });

      const suggestions = result.current.getSuggestions();

      expect(suggestions[0].type).toBe('more_detailed');
      expect(suggestions[0].effectivenessRate).toBe(1);

      const simplerSuggestion = suggestions.find(s => s.type === 'simpler');
      expect(simplerSuggestion?.effectivenessRate).toBe(0);
    });

    it('should filter suggestions by work item type', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        const r1 = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.rateSatisfaction(r1.id, 'satisfied');

        const r2 = result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 2',
        });
        result.current.rateSatisfaction(r2.id, 'unsatisfied');
      });

      const featureSuggestions = result.current.getSuggestions('feature');
      const moreDetailedFeature = featureSuggestions.find(s => s.type === 'more_detailed');
      expect(moreDetailedFeature?.effectivenessRate).toBe(1);

      const epicSuggestions = result.current.getSuggestions('epic');
      const moreDetailedEpic = epicSuggestions.find(s => s.type === 'more_detailed');
      expect(moreDetailedEpic?.effectivenessRate).toBe(0);
    });
  });

  describe('exportFeedback', () => {
    it('should export all feedback as JSON', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
      });

      const exported = result.current.exportFeedback();
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(2);
    });

    it('should export filtered feedback by work item IDs', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
      });

      const exported = result.current.exportFeedback(['work-1']);
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveLength(1);
      expect(parsed[0].workItemId).toBe('work-1');
    });
  });

  describe('importFeedback', () => {
    it('should import valid feedback records', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      const toImport = [
        {
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        },
        {
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importFeedback(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(2);
      expect(importResult!.errors).toHaveLength(0);
      expect(result.current.records).toHaveLength(2);
    });

    it('should reject invalid records', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      const toImport = [
        {
          workItemId: 'work-1',
          // Missing workItemType and feedbackType
        },
        {
          workItemId: 'work-2',
          workItemType: 'invalid_type',
          feedbackType: 'more_detailed',
        },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importFeedback(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors).toHaveLength(2);
    });

    it('should handle invalid JSON', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importFeedback('invalid json');
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors).toHaveLength(1);
      expect(importResult!.errors[0]).toContain('Failed to parse JSON');
    });
  });

  describe('linkToGeneration', () => {
    it('should link feedback to a generation', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({ storageKey: testStorageKey })
      );

      let record: FeedbackRecord;
      act(() => {
        record = result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test',
        });
      });

      act(() => {
        result.current.linkToGeneration(record!.id, 'gen-123');
      });

      expect(result.current.records[0].generationId).toBe('gen-123');
    });
  });

  describe('filterWorkItemType option', () => {
    it('should filter records by work item type', () => {
      const { result } = renderHook(() =>
        useRegenerationFeedback({
          storageKey: testStorageKey,
          filterWorkItemType: 'feature',
        })
      );

      act(() => {
        result.current.recordFeedback({
          workItemId: 'work-1',
          workItemType: 'feature',
          feedbackType: 'more_detailed',
          fullPrompt: 'Test 1',
        });
        result.current.recordFeedback({
          workItemId: 'work-2',
          workItemType: 'epic',
          feedbackType: 'simpler',
          fullPrompt: 'Test 2',
        });
      });

      expect(result.current.records).toHaveLength(1);
      expect(result.current.records[0].workItemType).toBe('feature');
    });
  });

  describe('maxRecords option', () => {
    it('should keep all records in memory regardless of maxRecords', () => {
      // maxRecords only affects localStorage persistence, not in-memory state
      const { result } = renderHook(() =>
        useRegenerationFeedback({
          storageKey: testStorageKey,
          maxRecords: 3,
        })
      );

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.recordFeedback({
            workItemId: `work-${i}`,
            workItemType: 'feature',
            feedbackType: 'more_detailed',
            fullPrompt: `Test ${i}`,
          });
        }
      });

      // In-memory state keeps all records
      expect(result.current.records).toHaveLength(5);
      expect(result.current.records[0].workItemId).toBe('work-0');
      expect(result.current.records[4].workItemId).toBe('work-4');
    });
  });
});

describe('utility functions', () => {
  describe('getFeedbackTypeDisplayName', () => {
    it('should return display name for known types', () => {
      expect(getFeedbackTypeDisplayName('more_detailed')).toBe('More detailed');
      expect(getFeedbackTypeDisplayName('simpler')).toBe('Simpler');
      expect(getFeedbackTypeDisplayName('different_approach')).toBe('Different approach');
      expect(getFeedbackTypeDisplayName('more_technical')).toBe('More technical');
      expect(getFeedbackTypeDisplayName('less_technical')).toBe('Less technical');
      expect(getFeedbackTypeDisplayName('custom')).toBe('Custom feedback');
    });

    it('should return Unknown for invalid types', () => {
      expect(getFeedbackTypeDisplayName('invalid' as FeedbackType)).toBe('Unknown');
    });
  });

  describe('getFeedbackTypePrompt', () => {
    it('should return prompt for known types', () => {
      expect(getFeedbackTypePrompt('more_detailed')).toContain('more detail');
      expect(getFeedbackTypePrompt('simpler')).toContain('simpler approach');
    });

    it('should return empty string for custom type', () => {
      expect(getFeedbackTypePrompt('custom')).toBe('');
    });
  });

  describe('buildRegenerationPrompt', () => {
    it('should build prompt with predefined feedback', () => {
      const prompt = buildRegenerationPrompt('more_detailed', 'features');
      expect(prompt).toContain('more detail');
      expect(prompt).toContain('features');
    });

    it('should build prompt with custom feedback', () => {
      const prompt = buildRegenerationPrompt('custom', 'tasks', 'Focus on security');
      expect(prompt).toContain('Focus on security');
      expect(prompt).toContain('tasks');
    });

    it('should return empty string for custom without feedback', () => {
      const prompt = buildRegenerationPrompt('custom', 'epics');
      expect(prompt).toBe('');
    });
  });

  describe('FEEDBACK_OPTIONS', () => {
    it('should have all feedback types defined', () => {
      const types: FeedbackType[] = ['more_detailed', 'simpler', 'different_approach', 'more_technical', 'less_technical', 'custom'];

      for (const type of types) {
        expect(FEEDBACK_OPTIONS[type]).toBeDefined();
        expect(FEEDBACK_OPTIONS[type].label).toBeDefined();
        expect(typeof FEEDBACK_OPTIONS[type].prompt).toBe('string');
      }
    });
  });
});
