/**
 * useDragDropReorder
 *
 * F1.1.1 - Drag-and-drop reordering
 *
 * Hook for managing drag-and-drop reordering of tree items.
 * Provides state management and utilities for DnD operations.
 */

import { useCallback, useState, useRef } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Work item type
 */
export type DraggableItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Draggable item interface
 */
export interface DraggableItem {
  id: string;
  type: DraggableItemType;
  parentId: string | null;
  order: number;
}

/**
 * Drop position relative to target
 */
export type DropPosition = 'before' | 'after' | 'inside';

/**
 * Drag state
 */
export interface DragState {
  isDragging: boolean;
  draggedItem: DraggableItem | null;
  draggedOverItem: DraggableItem | null;
  dropPosition: DropPosition | null;
}

/**
 * Reorder result
 */
export interface ReorderResult {
  item: DraggableItem;
  oldParentId: string | null;
  newParentId: string | null;
  oldOrder: number;
  newOrder: number;
  affectedItems: DraggableItem[];
}

/**
 * Validation result
 */
export interface MoveValidation {
  isValid: boolean;
  reason?: string;
}

/**
 * Hook options
 */
export interface UseDragDropReorderOptions {
  onReorder?: (result: ReorderResult) => void;
  onDragStart?: (item: DraggableItem) => void;
  onDragEnd?: () => void;
  validateMove?: (item: DraggableItem, targetParentId: string | null, position: DropPosition) => MoveValidation;
  allowCrossParent?: boolean;
  allowTypeChange?: boolean;
}

/**
 * Hook return type
 */
export interface UseDragDropReorderReturn {
  // State
  dragState: DragState;
  isDragging: boolean;

  // Drag handlers
  handleDragStart: (item: DraggableItem) => void;
  handleDragOver: (item: DraggableItem, position: DropPosition) => void;
  handleDragLeave: () => void;
  handleDrop: (items: DraggableItem[]) => ReorderResult | null;
  handleDragEnd: () => void;

  // Utilities
  calculateNewOrder: (items: DraggableItem[], targetIndex: number, position: DropPosition) => number;
  reorderItems: (items: DraggableItem[], draggedId: string, targetId: string, position: DropPosition) => DraggableItem[];
  validateMove: (item: DraggableItem, targetParentId: string | null, position: DropPosition) => MoveValidation;
  getDropIndicatorPosition: (position: DropPosition) => 'top' | 'bottom' | 'center';
  canDrop: (draggedItem: DraggableItem, targetItem: DraggableItem, position: DropPosition) => boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const INITIAL_DRAG_STATE: DragState = {
  isDragging: false,
  draggedItem: null,
  draggedOverItem: null,
  dropPosition: null,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get valid parent types for each item type
 */
export function getValidParentTypes(itemType: DraggableItemType): (DraggableItemType | null)[] {
  const parentMap: Record<DraggableItemType, (DraggableItemType | null)[]> = {
    epic: [null], // Epics can only be at root level
    feature: ['epic'], // Features must be under epics
    userStory: ['feature'], // User stories must be under features
    task: ['userStory'], // Tasks must be under user stories
  };
  return parentMap[itemType];
}

/**
 * Check if item type can be a child of parent type
 */
export function canBeChildOf(itemType: DraggableItemType, parentType: DraggableItemType | null): boolean {
  const validParents = getValidParentTypes(itemType);
  return validParents.includes(parentType);
}

/**
 * Get item type display name
 */
export function getItemTypeDisplayName(type: DraggableItemType): string {
  const names: Record<DraggableItemType, string> = {
    epic: 'Epic',
    feature: 'Feature',
    userStory: 'User Story',
    task: 'Task',
  };
  return names[type];
}

/**
 * Check if an item is an ancestor of another (prevents circular references)
 */
export function isAncestorOf(
  potentialAncestorId: string,
  itemId: string,
  items: DraggableItem[]
): boolean {
  // An item is not an ancestor of itself
  if (potentialAncestorId === itemId) {
    return false;
  }

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const item = itemMap.get(itemId);
  let currentId: string | null = item?.parentId ?? null;

  while (currentId) {
    if (currentId === potentialAncestorId) {
      return true;
    }
    const current = itemMap.get(currentId);
    currentId = current?.parentId ?? null;
  }

  return false;
}

/**
 * Get siblings of an item
 */
export function getSiblings(item: DraggableItem, items: DraggableItem[]): DraggableItem[] {
  return items
    .filter((i) => i.parentId === item.parentId && i.id !== item.id)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get children of an item
 */
export function getChildren(parentId: string, items: DraggableItem[]): DraggableItem[] {
  return items.filter((item) => item.parentId === parentId).sort((a, b) => a.order - b.order);
}

/**
 * Calculate new order value for insertion
 */
export function calculateNewOrder(
  items: DraggableItem[],
  targetIndex: number,
  position: DropPosition
): number {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  if (sortedItems.length === 0) {
    return 1000; // Initial order
  }

  if (position === 'inside') {
    // Insert as first child
    const children = sortedItems;
    if (children.length === 0) {
      return 1000;
    }
    return children[0].order - 1000;
  }

  if (targetIndex < 0 || targetIndex >= sortedItems.length) {
    // Insert at the end
    return sortedItems[sortedItems.length - 1].order + 1000;
  }

  const targetItem = sortedItems[targetIndex];

  if (position === 'before') {
    if (targetIndex === 0) {
      return targetItem.order - 1000;
    }
    const prevItem = sortedItems[targetIndex - 1];
    return (prevItem.order + targetItem.order) / 2;
  } else {
    // 'after'
    if (targetIndex === sortedItems.length - 1) {
      return targetItem.order + 1000;
    }
    const nextItem = sortedItems[targetIndex + 1];
    return (targetItem.order + nextItem.order) / 2;
  }
}

/**
 * Get drop indicator position class
 */
export function getDropIndicatorPosition(position: DropPosition): 'top' | 'bottom' | 'center' {
  switch (position) {
    case 'before':
      return 'top';
    case 'after':
      return 'bottom';
    case 'inside':
      return 'center';
  }
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for drag-and-drop reordering
 */
export function useDragDropReorder(
  options: UseDragDropReorderOptions = {}
): UseDragDropReorderReturn {
  const {
    onReorder,
    onDragStart: onDragStartCallback,
    onDragEnd: onDragEndCallback,
    validateMove: customValidateMove,
    allowCrossParent = true,
    allowTypeChange = false,
  } = options;

  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG_STATE);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  /**
   * Validate a move operation
   */
  const validateMove = useCallback(
    (item: DraggableItem, targetParentId: string | null, position: DropPosition): MoveValidation => {
      // Custom validation first
      if (customValidateMove) {
        const customResult = customValidateMove(item, targetParentId, position);
        if (!customResult.isValid) {
          return customResult;
        }
      }

      // Can't drop on itself
      if (targetParentId === item.id) {
        return { isValid: false, reason: 'Cannot drop an item onto itself' };
      }

      // Check cross-parent moves
      if (!allowCrossParent && targetParentId !== item.parentId) {
        return { isValid: false, reason: 'Cross-parent moves are not allowed' };
      }

      return { isValid: true };
    },
    [customValidateMove, allowCrossParent]
  );

  /**
   * Check if a drop is allowed
   */
  const canDrop = useCallback(
    (draggedItem: DraggableItem, targetItem: DraggableItem, position: DropPosition): boolean => {
      // Can't drop on itself
      if (draggedItem.id === targetItem.id) {
        return false;
      }

      // For 'inside' drops, check valid parent type
      if (position === 'inside') {
        if (!canBeChildOf(draggedItem.type, targetItem.type)) {
          return false;
        }
      } else {
        // For before/after, must be same parent type
        if (!allowTypeChange && draggedItem.type !== targetItem.type) {
          return false;
        }
      }

      // Check validation
      const targetParentId = position === 'inside' ? targetItem.id : targetItem.parentId;
      const validation = validateMove(draggedItem, targetParentId, position);
      return validation.isValid;
    },
    [allowTypeChange, validateMove]
  );

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (item: DraggableItem) => {
      setDragState({
        isDragging: true,
        draggedItem: item,
        draggedOverItem: null,
        dropPosition: null,
      });
      onDragStartCallback?.(item);
    },
    [onDragStartCallback]
  );

  /**
   * Handle drag over an item
   */
  const handleDragOver = useCallback(
    (item: DraggableItem, position: DropPosition) => {
      setDragState((prev) => {
        if (!prev.isDragging || !prev.draggedItem) {
          return prev;
        }

        // Check if this is a valid drop target
        if (!canDrop(prev.draggedItem, item, position)) {
          return {
            ...prev,
            draggedOverItem: null,
            dropPosition: null,
          };
        }

        return {
          ...prev,
          draggedOverItem: item,
          dropPosition: position,
        };
      });
    },
    [canDrop]
  );

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    setDragState((prev) => ({
      ...prev,
      draggedOverItem: null,
      dropPosition: null,
    }));
  }, []);

  /**
   * Reorder items after drop
   */
  const reorderItems = useCallback(
    (
      items: DraggableItem[],
      draggedId: string,
      targetId: string,
      position: DropPosition
    ): DraggableItem[] => {
      const draggedItem = items.find((i) => i.id === draggedId);
      const targetItem = items.find((i) => i.id === targetId);

      if (!draggedItem || !targetItem) {
        return items;
      }

      const result = items.map((item) => ({ ...item }));
      const draggedIndex = result.findIndex((i) => i.id === draggedId);

      // Determine new parent
      const newParentId = position === 'inside' ? targetId : targetItem.parentId;
      result[draggedIndex].parentId = newParentId;

      // Get siblings at new position
      const siblings = result.filter(
        (i) => i.parentId === newParentId && i.id !== draggedId
      );

      // Calculate new order
      const siblingTargetIndex = siblings.findIndex((i) => i.id === targetId);
      const newOrder = calculateNewOrder(
        siblings,
        position === 'inside' ? -1 : siblingTargetIndex,
        position
      );
      result[draggedIndex].order = newOrder;

      return result;
    },
    []
  );

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (items: DraggableItem[]): ReorderResult | null => {
      const { draggedItem, draggedOverItem, dropPosition } = dragState;

      if (!draggedItem || !draggedOverItem || !dropPosition) {
        return null;
      }

      // Validate the move
      const targetParentId = dropPosition === 'inside' ? draggedOverItem.id : draggedOverItem.parentId;
      const validation = validateMove(draggedItem, targetParentId, dropPosition);

      if (!validation.isValid) {
        return null;
      }

      // Calculate new order
      const siblings = items.filter(
        (i) => i.parentId === targetParentId && i.id !== draggedItem.id
      );
      const targetIndex = siblings.findIndex((i) => i.id === draggedOverItem.id);
      const newOrder = calculateNewOrder(siblings, targetIndex, dropPosition);

      // Create result
      const newItems = reorderItems(items, draggedItem.id, draggedOverItem.id, dropPosition);
      const affectedItems = newItems.filter((item) => {
        const original = items.find((i) => i.id === item.id);
        return original && (original.order !== item.order || original.parentId !== item.parentId);
      });

      const result: ReorderResult = {
        item: { ...draggedItem, parentId: targetParentId, order: newOrder },
        oldParentId: draggedItem.parentId,
        newParentId: targetParentId,
        oldOrder: draggedItem.order,
        newOrder,
        affectedItems,
      };

      onReorder?.(result);

      return result;
    },
    [dragState, validateMove, reorderItems, onReorder]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    setDragState(INITIAL_DRAG_STATE);
    dragStartRef.current = null;
    onDragEndCallback?.();
  }, [onDragEndCallback]);

  return {
    // State
    dragState,
    isDragging: dragState.isDragging,

    // Drag handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,

    // Utilities
    calculateNewOrder: (items, targetIndex, position) =>
      calculateNewOrder(items, targetIndex, position),
    reorderItems,
    validateMove,
    getDropIndicatorPosition,
    canDrop,
  };
}

export default useDragDropReorder;
