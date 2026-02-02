/**
 * Tests for useDragDropReorder hook
 *
 * F1.1.1 - Drag-and-drop reordering
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  useDragDropReorder,
  getValidParentTypes,
  canBeChildOf,
  getItemTypeDisplayName,
  isAncestorOf,
  getSiblings,
  getChildren,
  calculateNewOrder,
  getDropIndicatorPosition,
  type DraggableItem,
} from './useDragDropReorder';

const sampleItems: DraggableItem[] = [
  { id: 'epic-1', type: 'epic', parentId: null, order: 1000 },
  { id: 'epic-2', type: 'epic', parentId: null, order: 2000 },
  { id: 'feature-1', type: 'feature', parentId: 'epic-1', order: 1000 },
  { id: 'feature-2', type: 'feature', parentId: 'epic-1', order: 2000 },
  { id: 'story-1', type: 'userStory', parentId: 'feature-1', order: 1000 },
  { id: 'story-2', type: 'userStory', parentId: 'feature-1', order: 2000 },
  { id: 'task-1', type: 'task', parentId: 'story-1', order: 1000 },
  { id: 'task-2', type: 'task', parentId: 'story-1', order: 2000 },
];

describe('getValidParentTypes', () => {
  it('should return null for epic', () => {
    expect(getValidParentTypes('epic')).toEqual([null]);
  });

  it('should return epic for feature', () => {
    expect(getValidParentTypes('feature')).toEqual(['epic']);
  });

  it('should return feature for userStory', () => {
    expect(getValidParentTypes('userStory')).toEqual(['feature']);
  });

  it('should return userStory for task', () => {
    expect(getValidParentTypes('task')).toEqual(['userStory']);
  });
});

describe('canBeChildOf', () => {
  it('should allow epic at root level', () => {
    expect(canBeChildOf('epic', null)).toBe(true);
  });

  it('should not allow epic under other items', () => {
    expect(canBeChildOf('epic', 'feature')).toBe(false);
    expect(canBeChildOf('epic', 'epic')).toBe(false);
  });

  it('should allow feature under epic', () => {
    expect(canBeChildOf('feature', 'epic')).toBe(true);
  });

  it('should not allow feature at root', () => {
    expect(canBeChildOf('feature', null)).toBe(false);
  });

  it('should allow userStory under feature', () => {
    expect(canBeChildOf('userStory', 'feature')).toBe(true);
  });

  it('should allow task under userStory', () => {
    expect(canBeChildOf('task', 'userStory')).toBe(true);
  });
});

describe('getItemTypeDisplayName', () => {
  it('should return correct display names', () => {
    expect(getItemTypeDisplayName('epic')).toBe('Epic');
    expect(getItemTypeDisplayName('feature')).toBe('Feature');
    expect(getItemTypeDisplayName('userStory')).toBe('User Story');
    expect(getItemTypeDisplayName('task')).toBe('Task');
  });
});

describe('isAncestorOf', () => {
  it('should detect direct parent as ancestor', () => {
    expect(isAncestorOf('epic-1', 'feature-1', sampleItems)).toBe(true);
  });

  it('should detect grandparent as ancestor', () => {
    expect(isAncestorOf('epic-1', 'story-1', sampleItems)).toBe(true);
  });

  it('should detect great-grandparent as ancestor', () => {
    expect(isAncestorOf('epic-1', 'task-1', sampleItems)).toBe(true);
  });

  it('should not detect non-ancestor', () => {
    expect(isAncestorOf('epic-2', 'feature-1', sampleItems)).toBe(false);
  });

  it('should not detect self as ancestor', () => {
    expect(isAncestorOf('feature-1', 'feature-1', sampleItems)).toBe(false);
  });
});

describe('getSiblings', () => {
  it('should return siblings of item', () => {
    const siblings = getSiblings(sampleItems[2], sampleItems); // feature-1
    expect(siblings).toHaveLength(1);
    expect(siblings[0].id).toBe('feature-2');
  });

  it('should return empty array for item with no siblings', () => {
    const items: DraggableItem[] = [
      { id: 'epic-1', type: 'epic', parentId: null, order: 1000 },
    ];
    const siblings = getSiblings(items[0], items);
    expect(siblings).toHaveLength(0);
  });

  it('should sort siblings by order', () => {
    const siblings = getSiblings(sampleItems[4], sampleItems); // story-1
    expect(siblings[0].id).toBe('story-2');
  });
});

describe('getChildren', () => {
  it('should return children of parent', () => {
    const children = getChildren('epic-1', sampleItems);
    expect(children).toHaveLength(2);
    expect(children.map((c) => c.id)).toContain('feature-1');
    expect(children.map((c) => c.id)).toContain('feature-2');
  });

  it('should return empty array for item with no children', () => {
    const children = getChildren('task-1', sampleItems);
    expect(children).toHaveLength(0);
  });

  it('should sort children by order', () => {
    const children = getChildren('epic-1', sampleItems);
    expect(children[0].id).toBe('feature-1');
    expect(children[1].id).toBe('feature-2');
  });
});

describe('calculateNewOrder', () => {
  const orderedItems: DraggableItem[] = [
    { id: 'a', type: 'epic', parentId: null, order: 1000 },
    { id: 'b', type: 'epic', parentId: null, order: 2000 },
    { id: 'c', type: 'epic', parentId: null, order: 3000 },
  ];

  it('should calculate order for empty list', () => {
    const order = calculateNewOrder([], 0, 'before');
    expect(order).toBe(1000);
  });

  it('should calculate order before first item', () => {
    const order = calculateNewOrder(orderedItems, 0, 'before');
    expect(order).toBeLessThan(1000);
  });

  it('should calculate order after last item', () => {
    const order = calculateNewOrder(orderedItems, 2, 'after');
    expect(order).toBeGreaterThan(3000);
  });

  it('should calculate order between items', () => {
    const order = calculateNewOrder(orderedItems, 1, 'before');
    expect(order).toBeGreaterThan(1000);
    expect(order).toBeLessThan(2000);
  });

  it('should calculate order for inside position', () => {
    const order = calculateNewOrder(orderedItems, 0, 'inside');
    expect(order).toBeLessThan(1000);
  });
});

describe('getDropIndicatorPosition', () => {
  it('should return top for before position', () => {
    expect(getDropIndicatorPosition('before')).toBe('top');
  });

  it('should return bottom for after position', () => {
    expect(getDropIndicatorPosition('after')).toBe('bottom');
  });

  it('should return center for inside position', () => {
    expect(getDropIndicatorPosition('inside')).toBe('center');
  });
});

describe('useDragDropReorder', () => {
  describe('initial state', () => {
    it('should have correct initial drag state', () => {
      const { result } = renderHook(() => useDragDropReorder());

      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragState.draggedItem).toBeNull();
      expect(result.current.dragState.draggedOverItem).toBeNull();
      expect(result.current.dragState.dropPosition).toBeNull();
    });
  });

  describe('handleDragStart', () => {
    it('should set dragging state', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.dragState.draggedItem).toEqual(sampleItems[0]);
    });

    it('should call onDragStart callback', () => {
      const onDragStart = vi.fn();
      const { result } = renderHook(() => useDragDropReorder({ onDragStart }));

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
      });

      expect(onDragStart).toHaveBeenCalledWith(sampleItems[0]);
    });
  });

  describe('handleDragOver', () => {
    it('should set drag over state when valid', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]); // epic-1
      });

      act(() => {
        result.current.handleDragOver(sampleItems[1], 'after'); // epic-2
      });

      expect(result.current.dragState.draggedOverItem).toEqual(sampleItems[1]);
      expect(result.current.dragState.dropPosition).toBe('after');
    });

    it('should not set drag over for invalid drop', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]); // epic-1
      });

      act(() => {
        result.current.handleDragOver(sampleItems[0], 'after'); // Same item
      });

      expect(result.current.dragState.draggedOverItem).toBeNull();
    });
  });

  describe('handleDragLeave', () => {
    it('should clear drag over state', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
        result.current.handleDragOver(sampleItems[1], 'after');
      });

      act(() => {
        result.current.handleDragLeave();
      });

      expect(result.current.dragState.draggedOverItem).toBeNull();
      expect(result.current.dragState.dropPosition).toBeNull();
    });
  });

  describe('handleDragEnd', () => {
    it('should reset all drag state', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
        result.current.handleDragOver(sampleItems[1], 'after');
      });

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.dragState.draggedItem).toBeNull();
      expect(result.current.dragState.draggedOverItem).toBeNull();
    });

    it('should call onDragEnd callback', () => {
      const onDragEnd = vi.fn();
      const { result } = renderHook(() => useDragDropReorder({ onDragEnd }));

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
      });

      act(() => {
        result.current.handleDragEnd();
      });

      expect(onDragEnd).toHaveBeenCalled();
    });
  });

  describe('handleDrop', () => {
    it('should return reorder result on valid drop', () => {
      const { result } = renderHook(() => useDragDropReorder());

      act(() => {
        result.current.handleDragStart(sampleItems[0]); // epic-1
        result.current.handleDragOver(sampleItems[1], 'after'); // epic-2
      });

      let dropResult;
      act(() => {
        dropResult = result.current.handleDrop(sampleItems);
      });

      expect(dropResult).not.toBeNull();
      expect(dropResult?.item.id).toBe('epic-1');
    });

    it('should return null when no drag in progress', () => {
      const { result } = renderHook(() => useDragDropReorder());

      let dropResult;
      act(() => {
        dropResult = result.current.handleDrop(sampleItems);
      });

      expect(dropResult).toBeNull();
    });

    it('should call onReorder callback', () => {
      const onReorder = vi.fn();
      const { result } = renderHook(() => useDragDropReorder({ onReorder }));

      act(() => {
        result.current.handleDragStart(sampleItems[0]);
        result.current.handleDragOver(sampleItems[1], 'after');
      });

      act(() => {
        result.current.handleDrop(sampleItems);
      });

      expect(onReorder).toHaveBeenCalled();
    });
  });

  describe('reorderItems', () => {
    it('should reorder items correctly', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const reordered = result.current.reorderItems(sampleItems, 'epic-1', 'epic-2', 'after');

      const epic1 = reordered.find((i) => i.id === 'epic-1');
      const epic2 = reordered.find((i) => i.id === 'epic-2');

      expect(epic1!.order).toBeGreaterThan(epic2!.order);
    });

    it('should update parent on inside drop', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const items: DraggableItem[] = [
        { id: 'epic-1', type: 'epic', parentId: null, order: 1000 },
        { id: 'feature-1', type: 'feature', parentId: null, order: 2000 },
      ];

      const reordered = result.current.reorderItems(items, 'feature-1', 'epic-1', 'inside');
      const feature = reordered.find((i) => i.id === 'feature-1');

      expect(feature!.parentId).toBe('epic-1');
    });
  });

  describe('validateMove', () => {
    it('should invalidate drop on self', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const validation = result.current.validateMove(sampleItems[0], 'epic-1', 'inside');

      expect(validation.isValid).toBe(false);
    });

    it('should validate valid move', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const validation = result.current.validateMove(sampleItems[0], null, 'before');

      expect(validation.isValid).toBe(true);
    });

    it('should use custom validation', () => {
      const customValidate = vi.fn().mockReturnValue({ isValid: false, reason: 'Custom reason' });
      const { result } = renderHook(() =>
        useDragDropReorder({ validateMove: customValidate })
      );

      const validation = result.current.validateMove(sampleItems[0], null, 'before');

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toBe('Custom reason');
    });

    it('should invalidate cross-parent when not allowed', () => {
      const { result } = renderHook(() => useDragDropReorder({ allowCrossParent: false }));

      const validation = result.current.validateMove(sampleItems[2], 'epic-2', 'inside');

      expect(validation.isValid).toBe(false);
    });
  });

  describe('canDrop', () => {
    it('should not allow drop on self', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const canDrop = result.current.canDrop(sampleItems[0], sampleItems[0], 'before');

      expect(canDrop).toBe(false);
    });

    it('should allow valid sibling reorder', () => {
      const { result } = renderHook(() => useDragDropReorder());

      const canDrop = result.current.canDrop(sampleItems[0], sampleItems[1], 'after');

      expect(canDrop).toBe(true);
    });

    it('should check valid parent types for inside drops', () => {
      const { result } = renderHook(() => useDragDropReorder());

      // Task can't be inside epic
      const canDrop = result.current.canDrop(
        sampleItems[6], // task-1
        sampleItems[0], // epic-1
        'inside'
      );

      expect(canDrop).toBe(false);
    });
  });
});

describe('integration', () => {
  it('should complete full drag and drop flow', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() => useDragDropReorder({ onReorder }));

    // Start drag
    act(() => {
      result.current.handleDragStart(sampleItems[0]); // epic-1
    });

    expect(result.current.isDragging).toBe(true);

    // Drag over target
    act(() => {
      result.current.handleDragOver(sampleItems[1], 'after'); // epic-2
    });

    expect(result.current.dragState.dropPosition).toBe('after');

    // Drop
    act(() => {
      result.current.handleDrop(sampleItems);
    });

    expect(onReorder).toHaveBeenCalled();

    // End drag
    act(() => {
      result.current.handleDragEnd();
    });

    expect(result.current.isDragging).toBe(false);
  });

  it('should handle cancelled drag', () => {
    const onReorder = vi.fn();
    const { result } = renderHook(() => useDragDropReorder({ onReorder }));

    // Start drag
    act(() => {
      result.current.handleDragStart(sampleItems[0]);
    });

    // Cancel without dropping
    act(() => {
      result.current.handleDragEnd();
    });

    expect(onReorder).not.toHaveBeenCalled();
    expect(result.current.isDragging).toBe(false);
  });
});
