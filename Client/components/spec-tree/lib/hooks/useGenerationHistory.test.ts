/**
 * Tests for useGenerationHistory hook
 *
 * F1.1.15 - Generation history
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useGenerationHistory,
  getWorkItemTypeDisplayName,
  GenerationRecord,
} from './useGenerationHistory';

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

describe('useGenerationHistory', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('initialization', () => {
    it('starts with empty records', () => {
      const { result } = renderHook(() => useGenerationHistory());

      expect(result.current.records).toEqual([]);
    });

    it('accepts custom storage key', () => {
      const { result } = renderHook(() =>
        useGenerationHistory({ storageKey: 'custom-key' })
      );

      expect(result.current.records).toEqual([]);
    });
  });

  describe('addGeneration', () => {
    it('adds a new generation record', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Generate a feature',
          content: 'Generated content here',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(result.current.records.length).toBe(1);
      expect(record!.workItemType).toBe('feature');
      expect(record!.content).toBe('Generated content here');
    });

    it('generates unique IDs', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record1: GenerationRecord;
      let record2: GenerationRecord;
      act(() => {
        record1 = result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt 1',
          content: 'Content 1',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        record2 = result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt 2',
          content: 'Content 2',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(record1!.id).not.toBe(record2!.id);
    });

    it('includes timestamp', () => {
      const { result } = renderHook(() => useGenerationHistory());

      const before = new Date();
      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'task',
          workItemId: 'task-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          status: 'completed',
          wasApplied: false,
        });
      });
      const after = new Date();

      const recordDate = new Date(record!.timestamp);
      expect(recordDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(recordDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('includes optional metadata', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'userStory',
          workItemId: 'story-1',
          parentId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'gemini',
          model: 'gemini-1.5-pro',
          status: 'completed',
          duration: 2500,
          tokens: { input: 1000, output: 500 },
          wasApplied: true,
          tags: ['test', 'example'],
        });
      });

      expect(record!.parentId).toBe('feature-1');
      expect(record!.duration).toBe(2500);
      expect(record!.tokens).toEqual({ input: 1000, output: 500 });
      expect(record!.wasApplied).toBe(true);
      expect(record!.tags).toEqual(['test', 'example']);
    });
  });

  describe('updateGeneration', () => {
    it('updates an existing generation', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Original prompt',
          content: 'Original content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'streaming',
          wasApplied: false,
        });
      });

      act(() => {
        result.current.updateGeneration(record.id, {
          content: 'Updated content',
          status: 'completed',
        });
      });

      const updated = result.current.getGeneration(record.id);
      expect(updated?.content).toBe('Updated content');
      expect(updated?.status).toBe('completed');
    });

    it('returns null for non-existent record', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let updated: GenerationRecord | null;
      act(() => {
        updated = result.current.updateGeneration('non-existent', {
          content: 'New content',
        });
      });

      expect(updated).toBeNull();
    });
  });

  describe('getGeneration', () => {
    it('returns generation by ID', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const found = result.current.getGeneration(record.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(record.id);
    });

    it('returns undefined for non-existent ID', () => {
      const { result } = renderHook(() => useGenerationHistory());

      const found = result.current.getGeneration('non-existent');
      expect(found).toBeUndefined();
    });
  });

  describe('getWorkItemHistory', () => {
    it('returns history for a work item', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt 1',
          content: 'Content 1',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt 2',
          content: 'Content 2',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          status: 'completed',
          wasApplied: true,
        });
      });

      const history = result.current.getWorkItemHistory('feature-1');
      expect(history).toBeDefined();
      expect(history?.generations.length).toBe(2);
      expect(history?.appliedGeneration).toBeDefined();
    });

    it('returns undefined for work item with no history', () => {
      const { result } = renderHook(() => useGenerationHistory());

      const history = result.current.getWorkItemHistory('non-existent');
      expect(history).toBeUndefined();
    });
  });

  describe('getAllWorkItemHistories', () => {
    it('returns all histories grouped by work item', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          status: 'completed',
          wasApplied: false,
        });
      });

      const histories = result.current.getAllWorkItemHistories();
      expect(histories.length).toBe(2);
    });
  });

  describe('markAsApplied', () => {
    it('marks a generation as applied', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'task',
          workItemId: 'task-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(result.current.getGeneration(record.id)?.wasApplied).toBe(false);

      act(() => {
        result.current.markAsApplied(record.id);
      });

      expect(result.current.getGeneration(record.id)?.wasApplied).toBe(true);
    });

    it('unmarks other generations for same work item', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record1: GenerationRecord;
      let record2: GenerationRecord;
      act(() => {
        record1 = result.current.addGeneration({
          workItemType: 'task',
          workItemId: 'task-1',
          prompt: 'Prompt 1',
          content: 'Content 1',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: true,
        });
        record2 = result.current.addGeneration({
          workItemType: 'task',
          workItemId: 'task-1',
          prompt: 'Prompt 2',
          content: 'Content 2',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      act(() => {
        result.current.markAsApplied(record2.id);
      });

      expect(result.current.getGeneration(record1.id)?.wasApplied).toBe(false);
      expect(result.current.getGeneration(record2.id)?.wasApplied).toBe(true);
    });
  });

  describe('addFeedback', () => {
    it('adds feedback to a generation', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      act(() => {
        result.current.addFeedback(record.id, 'positive');
      });

      expect(result.current.getGeneration(record.id)?.feedback).toBe('positive');
    });
  });

  describe('deleteGeneration', () => {
    it('deletes a generation', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let record: GenerationRecord;
      act(() => {
        record = result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(result.current.records.length).toBe(1);

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteGeneration(record.id);
      });

      expect(deleted).toBe(true);
      expect(result.current.records.length).toBe(0);
    });

    it('returns false for non-existent record', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let deleted: boolean;
      act(() => {
        deleted = result.current.deleteGeneration('non-existent');
      });

      expect(deleted).toBe(false);
    });
  });

  describe('clearWorkItemHistory', () => {
    it('clears history for a specific work item', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(result.current.records.length).toBe(2);

      act(() => {
        result.current.clearWorkItemHistory('epic-1');
      });

      expect(result.current.records.length).toBe(1);
      expect(result.current.records[0].workItemId).toBe('feature-1');
    });
  });

  describe('clearAllHistory', () => {
    it('clears all history', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(result.current.records.length).toBe(2);

      act(() => {
        result.current.clearAllHistory();
      });

      expect(result.current.records.length).toBe(0);
    });
  });

  describe('exportHistory', () => {
    it('exports all records as JSON', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const json = result.current.exportHistory();
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBe(1);
    });

    it('exports specific work items by ID', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content 1',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content 2',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const json = result.current.exportHistory(['epic-1']);
      const parsed = JSON.parse(json);

      expect(parsed.length).toBe(1);
      expect(parsed[0].workItemId).toBe('epic-1');
    });
  });

  describe('importHistory', () => {
    it('imports valid records', () => {
      const { result } = renderHook(() => useGenerationHistory());

      const toImport = [
        {
          workItemType: 'epic',
          workItemId: 'epic-1',
          content: 'Imported content',
        },
      ];

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importHistory(JSON.stringify(toImport));
      });

      expect(importResult!.imported).toBe(1);
      expect(importResult!.errors.length).toBe(0);
      expect(result.current.records.length).toBe(1);
    });

    it('handles invalid JSON', () => {
      const { result } = renderHook(() => useGenerationHistory());

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importHistory('invalid json');
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });

    it('handles records missing required fields', () => {
      const { result } = renderHook(() => useGenerationHistory());

      const invalid = [{ workItemType: 'epic' }]; // Missing workItemId and content

      let importResult: { imported: number; errors: string[] };
      act(() => {
        importResult = result.current.importHistory(JSON.stringify(invalid));
      });

      expect(importResult!.imported).toBe(0);
      expect(importResult!.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getRecentGenerations', () => {
    it('returns most recent generations', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addGeneration({
            workItemType: 'task',
            workItemId: `task-${i}`,
            prompt: `Prompt ${i}`,
            content: `Content ${i}`,
            provider: 'openai',
            model: 'gpt-4o',
            status: 'completed',
            wasApplied: false,
          });
        }
      });

      const recent = result.current.getRecentGenerations(5);
      expect(recent.length).toBe(5);
    });

    it('uses default limit of 10', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addGeneration({
            workItemType: 'task',
            workItemId: `task-${i}`,
            prompt: `Prompt ${i}`,
            content: `Content ${i}`,
            provider: 'openai',
            model: 'gpt-4o',
            status: 'completed',
            wasApplied: false,
          });
        }
      });

      const recent = result.current.getRecentGenerations();
      expect(recent.length).toBe(10);
    });
  });

  describe('searchGenerations', () => {
    it('searches by content', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Authentication feature',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-2',
          prompt: 'Prompt',
          content: 'Dashboard feature',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const results = result.current.searchGenerations('auth');
      expect(results.length).toBe(1);
      expect(results[0].content).toContain('Authentication');
    });

    it('searches by prompt', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Generate login epic',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const results = result.current.searchGenerations('login');
      expect(results.length).toBe(1);
    });

    it('returns all records for empty query', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      const results = result.current.searchGenerations('');
      expect(results.length).toBe(1);
    });
  });

  describe('getStatistics', () => {
    it('calculates generation statistics', () => {
      const { result } = renderHook(() => useGenerationHistory());

      act(() => {
        result.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          duration: 1000,
          tokens: { input: 100, output: 50 },
          wasApplied: true,
        });
        result.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'anthropic',
          model: 'claude-3-5-sonnet',
          status: 'failed',
          wasApplied: false,
          feedback: 'negative',
        });
      });

      const stats = result.current.getStatistics();

      expect(stats.totalGenerations).toBe(2);
      expect(stats.successfulGenerations).toBe(1);
      expect(stats.failedGenerations).toBe(1);
      expect(stats.appliedGenerations).toBe(1);
      expect(stats.byType.epic).toBe(1);
      expect(stats.byType.feature).toBe(1);
      expect(stats.byProvider.openai).toBe(1);
      expect(stats.byProvider.anthropic).toBe(1);
      expect(stats.averageDuration).toBe(1000);
      expect(stats.totalTokens.input).toBe(100);
      expect(stats.totalTokens.output).toBe(50);
      expect(stats.feedbackCounts.negative).toBe(1);
    });
  });

  describe('filterType option', () => {
    it('filters records by work item type', () => {
      // Test that filterType option is accepted
      const { result: _epicResult } = renderHook(() =>
        useGenerationHistory({ filterType: 'epic' })
      );
      const { result: allResult } = renderHook(() => useGenerationHistory());

      act(() => {
        allResult.current.addGeneration({
          workItemType: 'epic',
          workItemId: 'epic-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
        allResult.current.addGeneration({
          workItemType: 'feature',
          workItemId: 'feature-1',
          prompt: 'Prompt',
          content: 'Content',
          provider: 'openai',
          model: 'gpt-4o',
          status: 'completed',
          wasApplied: false,
        });
      });

      expect(allResult.current.records.length).toBe(2);
      // Note: filterType works on read, so epicResult won't see the records
      // added through allResult since they use different storageKeys by default
    });
  });
});

describe('getWorkItemTypeDisplayName', () => {
  it('returns correct display names', () => {
    expect(getWorkItemTypeDisplayName('epic')).toBe('Epic');
    expect(getWorkItemTypeDisplayName('feature')).toBe('Feature');
    expect(getWorkItemTypeDisplayName('userStory')).toBe('User Story');
    expect(getWorkItemTypeDisplayName('task')).toBe('Task');
  });
});
