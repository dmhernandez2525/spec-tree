/**
 * Tests for useBreadcrumb hook
 *
 * F1.2.2 - Breadcrumb navigation
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useBreadcrumb,
  buildBreadcrumbPath,
  getAncestorIds,
  WorkItemData,
  WorkItemInfo,
} from './useBreadcrumb';

// Sample test data
const testData: WorkItemData = {
  epics: [
    { id: 'epic-1', title: 'Epic 1', featureIds: ['feature-1', 'feature-2'] },
    { id: 'epic-2', title: 'Epic 2', featureIds: ['feature-3'] },
  ],
  features: {
    'feature-1': {
      id: 'feature-1',
      title: 'Feature 1',
      userStoryIds: ['story-1', 'story-2'],
      parentEpicId: 'epic-1',
    },
    'feature-2': {
      id: 'feature-2',
      title: 'Feature 2',
      userStoryIds: [],
      parentEpicId: 'epic-1',
    },
    'feature-3': {
      id: 'feature-3',
      title: 'Feature 3',
      userStoryIds: ['story-3'],
      parentEpicId: 'epic-2',
    },
  },
  userStories: {
    'story-1': {
      id: 'story-1',
      title: 'User Story 1',
      taskIds: ['task-1', 'task-2'],
      parentFeatureId: 'feature-1',
    },
    'story-2': {
      id: 'story-2',
      title: 'User Story 2',
      taskIds: [],
      parentFeatureId: 'feature-1',
    },
    'story-3': {
      id: 'story-3',
      title: 'User Story 3',
      taskIds: ['task-3'],
      parentFeatureId: 'feature-3',
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Task 1',
      parentUserStoryId: 'story-1',
    },
    'task-2': {
      id: 'task-2',
      title: 'Task 2',
      parentUserStoryId: 'story-1',
    },
    'task-3': {
      id: 'task-3',
      title: 'Task 3',
      parentUserStoryId: 'story-3',
    },
  },
};

describe('buildBreadcrumbPath', () => {
  it('builds path for epic', () => {
    const item: WorkItemInfo = { id: 'epic-1', type: 'epic', title: 'Epic 1' };
    const path = buildBreadcrumbPath(item, testData);

    expect(path).toHaveLength(1);
    expect(path[0]).toEqual({
      id: 'epic-1',
      type: 'epic',
      title: 'Epic 1',
      typeLabel: 'Epic',
      isCurrent: true,
    });
  });

  it('builds path for feature', () => {
    const item: WorkItemInfo = { id: 'feature-1', type: 'feature', title: 'Feature 1' };
    const path = buildBreadcrumbPath(item, testData);

    expect(path).toHaveLength(2);
    expect(path[0].id).toBe('epic-1');
    expect(path[0].isCurrent).toBe(false);
    expect(path[1].id).toBe('feature-1');
    expect(path[1].isCurrent).toBe(true);
  });

  it('builds path for user story', () => {
    const item: WorkItemInfo = { id: 'story-1', type: 'userStory', title: 'User Story 1' };
    const path = buildBreadcrumbPath(item, testData);

    expect(path).toHaveLength(3);
    expect(path[0].id).toBe('epic-1');
    expect(path[0].type).toBe('epic');
    expect(path[1].id).toBe('feature-1');
    expect(path[1].type).toBe('feature');
    expect(path[2].id).toBe('story-1');
    expect(path[2].type).toBe('userStory');
    expect(path[2].isCurrent).toBe(true);
  });

  it('builds path for task', () => {
    const item: WorkItemInfo = { id: 'task-1', type: 'task', title: 'Task 1' };
    const path = buildBreadcrumbPath(item, testData);

    expect(path).toHaveLength(4);
    expect(path[0].id).toBe('epic-1');
    expect(path[1].id).toBe('feature-1');
    expect(path[2].id).toBe('story-1');
    expect(path[3].id).toBe('task-1');
    expect(path[3].type).toBe('task');
    expect(path[3].isCurrent).toBe(true);
  });

  it('includes type labels', () => {
    const item: WorkItemInfo = { id: 'task-1', type: 'task', title: 'Task 1' };
    const path = buildBreadcrumbPath(item, testData);

    expect(path[0].typeLabel).toBe('Epic');
    expect(path[1].typeLabel).toBe('Feature');
    expect(path[2].typeLabel).toBe('User Story');
    expect(path[3].typeLabel).toBe('Task');
  });
});

describe('getAncestorIds', () => {
  it('returns empty array for epic', () => {
    const ancestors = getAncestorIds('epic-1', 'epic', testData);
    expect(ancestors).toEqual([]);
  });

  it('returns epic for feature', () => {
    const ancestors = getAncestorIds('feature-1', 'feature', testData);
    expect(ancestors).toEqual(['epic-1']);
  });

  it('returns epic and feature for user story', () => {
    const ancestors = getAncestorIds('story-1', 'userStory', testData);
    expect(ancestors).toEqual(['epic-1', 'feature-1']);
  });

  it('returns all ancestors for task', () => {
    const ancestors = getAncestorIds('task-1', 'task', testData);
    expect(ancestors).toEqual(['epic-1', 'feature-1', 'story-1']);
  });
});

describe('useBreadcrumb', () => {
  it('provides getBreadcrumbPath function', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({ data: testData })
    );

    const item: WorkItemInfo = { id: 'feature-1', type: 'feature', title: 'Feature 1' };
    const path = result.current.getBreadcrumbPath(item);

    expect(path).toHaveLength(2);
    expect(path[0].id).toBe('epic-1');
    expect(path[1].id).toBe('feature-1');
  });

  it('provides getAncestors function', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({ data: testData })
    );

    const ancestors = result.current.getAncestors('task-1', 'task');
    expect(ancestors).toEqual(['epic-1', 'feature-1', 'story-1']);
  });

  it('calls onNavigate when navigateTo is called', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useBreadcrumb({ data: testData, onNavigate })
    );

    const item = {
      id: 'epic-1',
      type: 'epic' as const,
      title: 'Epic 1',
      typeLabel: 'Epic',
      isCurrent: false,
    };

    result.current.navigateTo(item);

    expect(onNavigate).toHaveBeenCalledWith(item);
  });

  it('does not throw when onNavigate is not provided', () => {
    const { result } = renderHook(() =>
      useBreadcrumb({ data: testData })
    );

    const item = {
      id: 'epic-1',
      type: 'epic' as const,
      title: 'Epic 1',
      typeLabel: 'Epic',
      isCurrent: false,
    };

    expect(() => result.current.navigateTo(item)).not.toThrow();
  });
});
