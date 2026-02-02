/**
 * Tests for useCollapsibleTree hook
 *
 * F1.2.1 - Collapsible tree view
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCollapsibleTree,
  collectAllNodeIds,
  getNodeAncestors,
} from './useCollapsibleTree';

describe('useCollapsibleTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty expanded nodes by default', () => {
      const { result } = renderHook(() => useCollapsibleTree());

      expect(result.current.expandedNodes).toEqual({});
      expect(result.current.expandedCount).toBe(0);
    });

    it('uses initial expanded nodes when provided', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1', 'node-2'],
        })
      );

      expect(result.current.isExpanded('node-1')).toBe(true);
      expect(result.current.isExpanded('node-2')).toBe(true);
      expect(result.current.isExpanded('node-3')).toBe(false);
    });

    it('respects defaultExpanded option for unknown nodes', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          defaultExpanded: true,
        })
      );

      expect(result.current.isExpanded('unknown-node')).toBe(true);
    });

    it('uses initialExpanded when localStorage is empty', () => {
      // Test that initialExpanded works when nothing in localStorage
      const { result } = renderHook(() =>
        useCollapsibleTree({
          storageKey: 'test-key',
          initialExpanded: ['node-1'],
        })
      );

      expect(result.current.isExpanded('node-1')).toBe(true);
      expect(result.current.isExpanded('node-2')).toBe(false);
    });
  });

  describe('toggle', () => {
    it('toggles node from collapsed to expanded', () => {
      const { result } = renderHook(() => useCollapsibleTree());

      expect(result.current.isExpanded('node-1')).toBe(false);

      act(() => {
        result.current.toggle('node-1');
      });

      expect(result.current.isExpanded('node-1')).toBe(true);
    });

    it('toggles node from expanded to collapsed', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1'],
        })
      );

      expect(result.current.isExpanded('node-1')).toBe(true);

      act(() => {
        result.current.toggle('node-1');
      });

      expect(result.current.isExpanded('node-1')).toBe(false);
    });
  });

  describe('expand and collapse', () => {
    it('expands a specific node', () => {
      const { result } = renderHook(() => useCollapsibleTree());

      act(() => {
        result.current.expand('node-1');
      });

      expect(result.current.isExpanded('node-1')).toBe(true);
    });

    it('collapses a specific node', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1'],
        })
      );

      act(() => {
        result.current.collapse('node-1');
      });

      expect(result.current.isExpanded('node-1')).toBe(false);
    });
  });

  describe('expandAll and collapseAll', () => {
    it('expands all provided nodes', () => {
      const { result } = renderHook(() => useCollapsibleTree());
      const nodeIds = ['node-1', 'node-2', 'node-3'];

      act(() => {
        result.current.expandAll(nodeIds);
      });

      expect(result.current.isExpanded('node-1')).toBe(true);
      expect(result.current.isExpanded('node-2')).toBe(true);
      expect(result.current.isExpanded('node-3')).toBe(true);
      expect(result.current.expandedCount).toBe(3);
    });

    it('collapses all nodes', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1', 'node-2', 'node-3'],
        })
      );

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.isExpanded('node-1')).toBe(false);
      expect(result.current.isExpanded('node-2')).toBe(false);
      expect(result.current.isExpanded('node-3')).toBe(false);
      expect(result.current.expandedCount).toBe(0);
    });
  });

  describe('expandToNode', () => {
    it('expands all ancestors and the target node', () => {
      const { result } = renderHook(() => useCollapsibleTree());
      const ancestors = ['epic-1', 'feature-1', 'story-1'];

      act(() => {
        result.current.expandToNode('task-1', ancestors);
      });

      expect(result.current.isExpanded('epic-1')).toBe(true);
      expect(result.current.isExpanded('feature-1')).toBe(true);
      expect(result.current.isExpanded('story-1')).toBe(true);
      expect(result.current.isExpanded('task-1')).toBe(true);
    });

    it('preserves existing expanded nodes', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['other-node'],
        })
      );

      act(() => {
        result.current.expandToNode('task-1', ['epic-1']);
      });

      expect(result.current.isExpanded('other-node')).toBe(true);
      expect(result.current.isExpanded('epic-1')).toBe(true);
      expect(result.current.isExpanded('task-1')).toBe(true);
    });
  });

  describe('setExpandedNodes', () => {
    it('sets multiple nodes to expanded', () => {
      const { result } = renderHook(() => useCollapsibleTree());

      act(() => {
        result.current.setExpandedNodes(['node-1', 'node-2'], true);
      });

      expect(result.current.isExpanded('node-1')).toBe(true);
      expect(result.current.isExpanded('node-2')).toBe(true);
    });

    it('sets multiple nodes to collapsed', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1', 'node-2'],
        })
      );

      act(() => {
        result.current.setExpandedNodes(['node-1', 'node-2'], false);
      });

      expect(result.current.isExpanded('node-1')).toBe(false);
      expect(result.current.isExpanded('node-2')).toBe(false);
    });
  });

  describe('allExpanded and allCollapsed', () => {
    it('returns true when all nodes are expanded', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1', 'node-2'],
        })
      );

      expect(result.current.allExpanded(['node-1', 'node-2'])).toBe(true);
      expect(result.current.allExpanded(['node-1', 'node-2', 'node-3'])).toBe(false);
    });

    it('returns true when all nodes are collapsed', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          initialExpanded: ['node-1'],
        })
      );

      expect(result.current.allCollapsed(['node-2', 'node-3'])).toBe(true);
      expect(result.current.allCollapsed(['node-1', 'node-2'])).toBe(false);
    });

    it('handles empty arrays', () => {
      const { result } = renderHook(() => useCollapsibleTree());

      expect(result.current.allExpanded([])).toBe(false);
      expect(result.current.allCollapsed([])).toBe(true);
    });
  });

  describe('state updates', () => {
    it('updates expandedNodes state correctly', () => {
      const { result } = renderHook(() =>
        useCollapsibleTree({
          storageKey: 'state-test',
        })
      );

      // Initially empty
      expect(result.current.expandedNodes).toEqual({});

      act(() => {
        result.current.expand('node-1');
      });

      // State should be updated
      expect(result.current.expandedNodes).toEqual({ 'node-1': true });
      expect(result.current.isExpanded('node-1')).toBe(true);
    });
  });
});

describe('collectAllNodeIds', () => {
  it('collects all node IDs from tree structure', () => {
    const epics = [
      { id: 'epic-1', featureIds: ['feature-1', 'feature-2'] },
      { id: 'epic-2', featureIds: ['feature-3'] },
    ];

    const features: Record<string, { id: string; userStoryIds?: string[] }> = {
      'feature-1': { id: 'feature-1', userStoryIds: ['story-1'] },
      'feature-2': { id: 'feature-2', userStoryIds: [] },
      'feature-3': { id: 'feature-3', userStoryIds: ['story-2'] },
    };

    const userStories: Record<string, { id: string; taskIds?: string[] }> = {
      'story-1': { id: 'story-1', taskIds: ['task-1', 'task-2'] },
      'story-2': { id: 'story-2', taskIds: [] },
    };

    const nodeIds = collectAllNodeIds(epics, features, userStories);

    expect(nodeIds).toContain('epic-1');
    expect(nodeIds).toContain('epic-2');
    expect(nodeIds).toContain('feature-1');
    expect(nodeIds).toContain('feature-2');
    expect(nodeIds).toContain('feature-3');
    expect(nodeIds).toContain('story-1');
    expect(nodeIds).toContain('story-2');
    expect(nodeIds).toContain('task-1');
    expect(nodeIds).toContain('task-2');
    expect(nodeIds).toHaveLength(9);
  });

  it('handles empty tree', () => {
    const nodeIds = collectAllNodeIds([], {}, {});
    expect(nodeIds).toEqual([]);
  });
});

describe('getNodeAncestors', () => {
  const epics = [
    { id: 'epic-1', featureIds: ['feature-1'] },
  ];

  const features: Record<string, { id: string; userStoryIds?: string[]; parentEpicId?: string }> = {
    'feature-1': { id: 'feature-1', userStoryIds: ['story-1'], parentEpicId: 'epic-1' },
  };

  const userStories: Record<string, { id: string; taskIds?: string[]; parentFeatureId?: string }> = {
    'story-1': { id: 'story-1', taskIds: ['task-1'], parentFeatureId: 'feature-1' },
  };

  const tasks: Record<string, { id: string; parentUserStoryId?: string }> = {
    'task-1': { id: 'task-1', parentUserStoryId: 'story-1' },
  };

  it('returns ancestors for a task', () => {
    const ancestors = getNodeAncestors('task-1', epics, features, userStories, tasks);
    expect(ancestors).toEqual(['epic-1', 'feature-1', 'story-1']);
  });

  it('returns ancestors for a user story', () => {
    const ancestors = getNodeAncestors('story-1', epics, features, userStories, tasks);
    expect(ancestors).toEqual(['epic-1', 'feature-1']);
  });

  it('returns ancestors for a feature', () => {
    const ancestors = getNodeAncestors('feature-1', epics, features, userStories, tasks);
    expect(ancestors).toEqual(['epic-1']);
  });

  it('returns empty array for an epic', () => {
    const ancestors = getNodeAncestors('epic-1', epics, features, userStories, tasks);
    expect(ancestors).toEqual([]);
  });

  it('returns empty array for unknown node', () => {
    const ancestors = getNodeAncestors('unknown', epics, features, userStories, tasks);
    expect(ancestors).toEqual([]);
  });
});
