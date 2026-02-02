/**
 * Tests for useMoveWorkItem hook
 *
 * F1.2.3 - Move items between parents
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useMoveWorkItem,
  validateMove,
  getParentTypeLabel,
  getItemTypeLabel,
  PARENT_TYPE_MAP,
  MoveWorkItemData,
  MoveableItem,
} from './useMoveWorkItem';

// Sample test data
const testData: MoveWorkItemData = {
  epics: [
    { id: 'epic-1', title: 'User Management', featureIds: ['feature-1'] },
    { id: 'epic-2', title: 'Reporting', featureIds: ['feature-2'] },
    { id: 'epic-3', title: 'Analytics', featureIds: [] },
  ],
  features: {
    'feature-1': {
      id: 'feature-1',
      title: 'Login Feature',
      parentEpicId: 'epic-1',
      userStoryIds: ['story-1'],
    },
    'feature-2': {
      id: 'feature-2',
      title: 'Dashboard Feature',
      parentEpicId: 'epic-2',
      userStoryIds: ['story-2'],
    },
  },
  userStories: {
    'story-1': {
      id: 'story-1',
      title: 'User can login',
      parentFeatureId: 'feature-1',
      taskIds: ['task-1'],
    },
    'story-2': {
      id: 'story-2',
      title: 'User can view dashboard',
      parentFeatureId: 'feature-2',
      taskIds: ['task-2'],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Create login form',
      parentUserStoryId: 'story-1',
    },
    'task-2': {
      id: 'task-2',
      title: 'Design dashboard layout',
      parentUserStoryId: 'story-2',
    },
  },
};

describe('PARENT_TYPE_MAP', () => {
  it('maps features to epics', () => {
    expect(PARENT_TYPE_MAP.feature).toBe('epic');
  });

  it('maps userStories to features', () => {
    expect(PARENT_TYPE_MAP.userStory).toBe('feature');
  });

  it('maps tasks to userStories', () => {
    expect(PARENT_TYPE_MAP.task).toBe('userStory');
  });
});

describe('useMoveWorkItem', () => {
  describe('initial state', () => {
    it('starts with no item to move', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      expect(result.current.itemToMove).toBeNull();
      expect(result.current.selectedParent).toBeNull();
      expect(result.current.isMoving).toBe(false);
      expect(result.current.potentialParents).toEqual([]);
    });
  });

  describe('startMove', () => {
    it('sets the item to move', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      const item: MoveableItem = {
        id: 'feature-1',
        type: 'feature',
        title: 'Login Feature',
        currentParentId: 'epic-1',
      };

      act(() => {
        result.current.startMove(item);
      });

      expect(result.current.itemToMove).toEqual(item);
      expect(result.current.isMoving).toBe(true);
    });

    it('calls onMoveStart callback', () => {
      const onMoveStart = vi.fn();
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData, onMoveStart })
      );

      const item: MoveableItem = {
        id: 'feature-1',
        type: 'feature',
        title: 'Login Feature',
        currentParentId: 'epic-1',
      };

      act(() => {
        result.current.startMove(item);
      });

      expect(onMoveStart).toHaveBeenCalledWith(item);
    });

    it('populates potential parents for feature', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      // Should have all 3 epics as potential parents
      expect(result.current.potentialParents.length).toBe(3);
      expect(result.current.potentialParents.some(p => p.id === 'epic-1')).toBe(true);
      expect(result.current.potentialParents.some(p => p.id === 'epic-2')).toBe(true);
    });

    it('marks current parent', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      const currentParent = result.current.potentialParents.find(p => p.id === 'epic-1');
      expect(currentParent?.isCurrent).toBe(true);
    });
  });

  describe('selectParent', () => {
    it('sets selected parent', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      const newParent = result.current.potentialParents.find(p => p.id === 'epic-2');

      act(() => {
        result.current.selectParent(newParent!);
      });

      expect(result.current.selectedParent).toEqual(newParent);
    });
  });

  describe('executeMove', () => {
    it('returns null if no item to move', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      let moveResult;
      act(() => {
        moveResult = result.current.executeMove();
      });

      expect(moveResult).toBeNull();
    });

    it('returns null if no parent selected', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      let moveResult;
      act(() => {
        moveResult = result.current.executeMove();
      });

      expect(moveResult).toBeNull();
    });

    it('returns error if moving to same parent', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      const sameParent = result.current.potentialParents.find(p => p.id === 'epic-1');

      act(() => {
        result.current.selectParent(sameParent!);
      });

      let moveResult;
      act(() => {
        moveResult = result.current.executeMove();
      });

      expect(moveResult?.success).toBe(false);
      expect(moveResult?.error).toBe('Item is already under this parent');
    });

    it('executes move successfully', () => {
      const onMove = vi.fn();
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData, onMove })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      const newParent = result.current.potentialParents.find(p => p.id === 'epic-2');

      act(() => {
        result.current.selectParent(newParent!);
      });

      let moveResult;
      act(() => {
        moveResult = result.current.executeMove();
      });

      expect(moveResult?.success).toBe(true);
      expect(moveResult?.itemId).toBe('feature-1');
      expect(moveResult?.fromParentId).toBe('epic-1');
      expect(moveResult?.toParentId).toBe('epic-2');
      expect(onMove).toHaveBeenCalledWith(moveResult);
    });

    it('resets state after successful move', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      const newParent = result.current.potentialParents.find(p => p.id === 'epic-2');

      act(() => {
        result.current.selectParent(newParent!);
      });

      act(() => {
        result.current.executeMove();
      });

      expect(result.current.itemToMove).toBeNull();
      expect(result.current.selectedParent).toBeNull();
      expect(result.current.isMoving).toBe(false);
    });
  });

  describe('cancelMove', () => {
    it('resets state', () => {
      const onMoveCancel = vi.fn();
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData, onMoveCancel })
      );

      act(() => {
        result.current.startMove({
          id: 'feature-1',
          type: 'feature',
          title: 'Login Feature',
          currentParentId: 'epic-1',
        });
      });

      act(() => {
        result.current.cancelMove();
      });

      expect(result.current.itemToMove).toBeNull();
      expect(result.current.isMoving).toBe(false);
      expect(onMoveCancel).toHaveBeenCalled();
    });
  });

  describe('canMove', () => {
    it('returns true when there are multiple potential parents', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      // 3 epics = features can be moved
      expect(result.current.canMove('feature')).toBe(true);
      // 2 features = stories can be moved
      expect(result.current.canMove('userStory')).toBe(true);
      // 2 stories = tasks can be moved
      expect(result.current.canMove('task')).toBe(true);
    });

    it('returns false when only one parent exists', () => {
      const minimalData: MoveWorkItemData = {
        epics: [{ id: 'epic-1', title: 'Only Epic', featureIds: ['feature-1'] }],
        features: {
          'feature-1': {
            id: 'feature-1',
            title: 'Only Feature',
            parentEpicId: 'epic-1',
            userStoryIds: [],
          },
        },
        userStories: {},
        tasks: {},
      };

      const { result } = renderHook(() =>
        useMoveWorkItem({ data: minimalData })
      );

      // Only 1 epic = features can't be moved
      expect(result.current.canMove('feature')).toBe(false);
    });
  });

  describe('getPotentialParents', () => {
    it('returns epics for features', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      const parents = result.current.getPotentialParents('feature', 'epic-1');

      expect(parents.length).toBe(3);
      expect(parents.every(p => p.type === 'epic')).toBe(true);
    });

    it('returns features for user stories', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      const parents = result.current.getPotentialParents('userStory', 'feature-1');

      expect(parents.length).toBe(2);
      expect(parents.every(p => p.type === 'feature')).toBe(true);
    });

    it('returns user stories for tasks', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      const parents = result.current.getPotentialParents('task', 'story-1');

      expect(parents.length).toBe(2);
      expect(parents.every(p => p.type === 'userStory')).toBe(true);
    });

    it('includes path for nested items', () => {
      const { result } = renderHook(() =>
        useMoveWorkItem({ data: testData })
      );

      const parents = result.current.getPotentialParents('task', 'story-1');
      const storyWithPath = parents.find(p => p.id === 'story-1');

      expect(storyWithPath?.path).toContain('User Management');
      expect(storyWithPath?.path).toContain('Login Feature');
    });
  });
});

describe('validateMove', () => {
  it('returns valid for valid move', () => {
    const item: MoveableItem = {
      id: 'feature-1',
      type: 'feature',
      title: 'Login Feature',
      currentParentId: 'epic-1',
    };

    const result = validateMove(item, 'epic-2', testData);
    expect(result.valid).toBe(true);
  });

  it('returns invalid for non-existent target epic', () => {
    const item: MoveableItem = {
      id: 'feature-1',
      type: 'feature',
      title: 'Login Feature',
      currentParentId: 'epic-1',
    };

    const result = validateMove(item, 'non-existent', testData);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Target epic does not exist');
  });

  it('returns invalid for non-existent target feature', () => {
    const item: MoveableItem = {
      id: 'story-1',
      type: 'userStory',
      title: 'User can login',
      currentParentId: 'feature-1',
    };

    const result = validateMove(item, 'non-existent', testData);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Target feature does not exist');
  });

  it('returns invalid for non-existent target user story', () => {
    const item: MoveableItem = {
      id: 'task-1',
      type: 'task',
      title: 'Create login form',
      currentParentId: 'story-1',
    };

    const result = validateMove(item, 'non-existent', testData);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Target user story does not exist');
  });

  it('returns invalid for moving to same parent', () => {
    const item: MoveableItem = {
      id: 'feature-1',
      type: 'feature',
      title: 'Login Feature',
      currentParentId: 'epic-1',
    };

    const result = validateMove(item, 'epic-1', testData);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Item is already under this parent');
  });
});

describe('getParentTypeLabel', () => {
  it('returns Epic for epic', () => {
    expect(getParentTypeLabel('epic')).toBe('Epic');
  });

  it('returns Feature for feature', () => {
    expect(getParentTypeLabel('feature')).toBe('Feature');
  });

  it('returns User Story for userStory', () => {
    expect(getParentTypeLabel('userStory')).toBe('User Story');
  });
});

describe('getItemTypeLabel', () => {
  it('returns Feature for feature', () => {
    expect(getItemTypeLabel('feature')).toBe('Feature');
  });

  it('returns User Story for userStory', () => {
    expect(getItemTypeLabel('userStory')).toBe('User Story');
  });

  it('returns Task for task', () => {
    expect(getItemTypeLabel('task')).toBe('Task');
  });
});
