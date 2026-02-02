/**
 * Move Work Item Hook
 *
 * F1.2.3 - Move items between parents
 *
 * Provides functionality to move work items between different parents
 * in the hierarchy (features between epics, stories between features, etc.)
 */

import { useState, useCallback, useMemo } from 'react';

/**
 * Types of work items that can be moved
 */
export type MovableWorkItemType = 'feature' | 'userStory' | 'task';

/**
 * Parent types for each movable type
 */
export type ParentType = 'epic' | 'feature' | 'userStory';

/**
 * Mapping of item types to their parent types
 */
export const PARENT_TYPE_MAP: Record<MovableWorkItemType, ParentType> = {
  feature: 'epic',
  userStory: 'feature',
  task: 'userStory',
};

/**
 * Work item being moved
 */
export interface MoveableItem {
  id: string;
  type: MovableWorkItemType;
  title: string;
  currentParentId: string;
}

/**
 * Potential new parent
 */
export interface PotentialParent {
  id: string;
  title: string;
  type: ParentType;
  /** Whether this is the current parent */
  isCurrent: boolean;
  /** Path to the parent (e.g., "Epic > Feature") */
  path?: string;
}

/**
 * Move operation result
 */
export interface MoveResult {
  success: boolean;
  error?: string;
  itemId: string;
  fromParentId: string;
  toParentId: string;
}

/**
 * Data source for finding parents
 */
export interface MoveWorkItemData {
  epics: Array<{
    id: string;
    title: string;
    featureIds: string[];
  }>;
  features: Record<string, {
    id: string;
    title: string;
    parentEpicId: string;
    userStoryIds?: string[];
  }>;
  userStories: Record<string, {
    id: string;
    title: string;
    parentFeatureId: string;
    taskIds?: string[];
  }>;
  tasks: Record<string, {
    id: string;
    title: string;
    parentUserStoryId: string;
  }>;
}

/**
 * Options for useMoveWorkItem hook
 */
export interface UseMoveWorkItemOptions {
  /** Data source for work items */
  data: MoveWorkItemData;
  /** Callback when move is executed */
  onMove?: (result: MoveResult) => void;
  /** Callback when move starts */
  onMoveStart?: (item: MoveableItem) => void;
  /** Callback when move is cancelled */
  onMoveCancel?: () => void;
}

/**
 * Return type for useMoveWorkItem hook
 */
export interface UseMoveWorkItemReturn {
  /** Currently selected item to move */
  itemToMove: MoveableItem | null;
  /** List of potential parents */
  potentialParents: PotentialParent[];
  /** Selected new parent */
  selectedParent: PotentialParent | null;
  /** Whether move is in progress */
  isMoving: boolean;
  /** Start a move operation */
  startMove: (item: MoveableItem) => void;
  /** Select a new parent */
  selectParent: (parent: PotentialParent) => void;
  /** Execute the move */
  executeMove: () => MoveResult | null;
  /** Cancel the move operation */
  cancelMove: () => void;
  /** Check if an item can be moved */
  canMove: (type: MovableWorkItemType) => boolean;
  /** Get potential parents for an item type */
  getPotentialParents: (type: MovableWorkItemType, currentParentId: string) => PotentialParent[];
}

/**
 * Hook for moving work items between parents
 */
export function useMoveWorkItem(options: UseMoveWorkItemOptions): UseMoveWorkItemReturn {
  const { data, onMove, onMoveStart, onMoveCancel } = options;

  const [itemToMove, setItemToMove] = useState<MoveableItem | null>(null);
  const [selectedParent, setSelectedParent] = useState<PotentialParent | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  /**
   * Get potential parents for an item type
   */
  const getPotentialParents = useCallback(
    (type: MovableWorkItemType, currentParentId: string): PotentialParent[] => {
      const parentType = PARENT_TYPE_MAP[type];
      const parents: PotentialParent[] = [];

      switch (parentType) {
        case 'epic':
          // Features can be moved to any epic
          for (const epic of data.epics) {
            parents.push({
              id: epic.id,
              title: epic.title,
              type: 'epic',
              isCurrent: epic.id === currentParentId,
            });
          }
          break;

        case 'feature':
          // User stories can be moved to any feature
          for (const feature of Object.values(data.features)) {
            const epic = data.epics.find(e => e.id === feature.parentEpicId);
            parents.push({
              id: feature.id,
              title: feature.title,
              type: 'feature',
              isCurrent: feature.id === currentParentId,
              path: epic?.title,
            });
          }
          break;

        case 'userStory':
          // Tasks can be moved to any user story
          for (const story of Object.values(data.userStories)) {
            const feature = data.features[story.parentFeatureId];
            const epic = feature ? data.epics.find(e => e.id === feature.parentEpicId) : null;
            const path = epic && feature ? `${epic.title} > ${feature.title}` : feature?.title;
            parents.push({
              id: story.id,
              title: story.title,
              type: 'userStory',
              isCurrent: story.id === currentParentId,
              path,
            });
          }
          break;
      }

      // Sort: current parent first, then alphabetically
      return parents.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return a.title.localeCompare(b.title);
      });
    },
    [data]
  );

  /**
   * Computed potential parents for current item
   */
  const potentialParents = useMemo(() => {
    if (!itemToMove) return [];
    return getPotentialParents(itemToMove.type, itemToMove.currentParentId);
  }, [itemToMove, getPotentialParents]);

  /**
   * Start a move operation
   */
  const startMove = useCallback(
    (item: MoveableItem) => {
      setItemToMove(item);
      setSelectedParent(null);
      setIsMoving(true);
      onMoveStart?.(item);
    },
    [onMoveStart]
  );

  /**
   * Select a new parent
   */
  const selectParent = useCallback((parent: PotentialParent) => {
    setSelectedParent(parent);
  }, []);

  /**
   * Execute the move
   */
  const executeMove = useCallback((): MoveResult | null => {
    if (!itemToMove || !selectedParent) {
      return null;
    }

    // Don't move to the same parent
    if (selectedParent.isCurrent) {
      return {
        success: false,
        error: 'Item is already under this parent',
        itemId: itemToMove.id,
        fromParentId: itemToMove.currentParentId,
        toParentId: selectedParent.id,
      };
    }

    const result: MoveResult = {
      success: true,
      itemId: itemToMove.id,
      fromParentId: itemToMove.currentParentId,
      toParentId: selectedParent.id,
    };

    onMove?.(result);

    // Reset state
    setItemToMove(null);
    setSelectedParent(null);
    setIsMoving(false);

    return result;
  }, [itemToMove, selectedParent, onMove]);

  /**
   * Cancel the move operation
   */
  const cancelMove = useCallback(() => {
    setItemToMove(null);
    setSelectedParent(null);
    setIsMoving(false);
    onMoveCancel?.();
  }, [onMoveCancel]);

  /**
   * Check if an item type can be moved
   */
  const canMove = useCallback(
    (type: MovableWorkItemType): boolean => {
      const parentType = PARENT_TYPE_MAP[type];

      // Check if there are at least 2 potential parents to move between
      switch (parentType) {
        case 'epic':
          return data.epics.length >= 2;
        case 'feature':
          return Object.keys(data.features).length >= 2;
        case 'userStory':
          return Object.keys(data.userStories).length >= 2;
        default:
          return false;
      }
    },
    [data]
  );

  return {
    itemToMove,
    potentialParents,
    selectedParent,
    isMoving,
    startMove,
    selectParent,
    executeMove,
    cancelMove,
    canMove,
    getPotentialParents,
  };
}

/**
 * Validate a move operation
 */
export function validateMove(
  item: MoveableItem,
  newParentId: string,
  data: MoveWorkItemData
): { valid: boolean; error?: string } {
  // Check if the new parent exists
  const parentType = PARENT_TYPE_MAP[item.type];

  switch (parentType) {
    case 'epic':
      if (!data.epics.find(e => e.id === newParentId)) {
        return { valid: false, error: 'Target epic does not exist' };
      }
      break;
    case 'feature':
      if (!data.features[newParentId]) {
        return { valid: false, error: 'Target feature does not exist' };
      }
      break;
    case 'userStory':
      if (!data.userStories[newParentId]) {
        return { valid: false, error: 'Target user story does not exist' };
      }
      break;
  }

  // Check if moving to same parent
  if (item.currentParentId === newParentId) {
    return { valid: false, error: 'Item is already under this parent' };
  }

  return { valid: true };
}

/**
 * Get display label for parent type
 */
export function getParentTypeLabel(type: ParentType): string {
  switch (type) {
    case 'epic':
      return 'Epic';
    case 'feature':
      return 'Feature';
    case 'userStory':
      return 'User Story';
    default:
      return 'Parent';
  }
}

/**
 * Get display label for item type
 */
export function getItemTypeLabel(type: MovableWorkItemType): string {
  switch (type) {
    case 'feature':
      return 'Feature';
    case 'userStory':
      return 'User Story';
    case 'task':
      return 'Task';
    default:
      return 'Item';
  }
}

export default useMoveWorkItem;
