/**
 * Breadcrumb Hook
 *
 * F1.2.2 - Breadcrumb navigation
 *
 * Provides breadcrumb path calculation for work items in the hierarchy.
 */

import { useMemo, useCallback } from 'react';

/**
 * Work item types in the hierarchy
 */
export type WorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Work item interface for breadcrumb
 */
export interface WorkItemInfo {
  id: string;
  type: WorkItemType;
  title: string;
}

/**
 * Breadcrumb item with navigation info
 */
export interface BreadcrumbItem {
  id: string;
  type: WorkItemType;
  title: string;
  /** Display label for the item type */
  typeLabel: string;
  /** Whether this is the current (active) item */
  isCurrent: boolean;
}

/**
 * Work item data structures from Redux store
 */
export interface WorkItemData {
  epics: Array<{ id: string; title: string; featureIds: string[] }>;
  features: Record<string, { id: string; title: string; userStoryIds?: string[]; parentEpicId?: string }>;
  userStories: Record<string, { id: string; title: string; taskIds?: string[]; parentFeatureId?: string }>;
  tasks: Record<string, { id: string; title: string; parentUserStoryId?: string }>;
}

/**
 * Type labels for display
 */
const typeLabels: Record<WorkItemType, string> = {
  epic: 'Epic',
  feature: 'Feature',
  userStory: 'User Story',
  task: 'Task',
};

/**
 * Build breadcrumb path for a work item
 */
export function buildBreadcrumbPath(
  currentItem: WorkItemInfo,
  data: WorkItemData
): BreadcrumbItem[] {
  const path: BreadcrumbItem[] = [];

  // Add ancestors based on item type
  if (currentItem.type === 'task') {
    const task = data.tasks[currentItem.id];
    if (task?.parentUserStoryId) {
      const userStory = data.userStories[task.parentUserStoryId];
      if (userStory?.parentFeatureId) {
        const feature = data.features[userStory.parentFeatureId];
        if (feature?.parentEpicId) {
          const epic = data.epics.find((e) => e.id === feature.parentEpicId);
          if (epic) {
            path.push({
              id: epic.id,
              type: 'epic',
              title: epic.title,
              typeLabel: typeLabels.epic,
              isCurrent: false,
            });
          }
        }
        path.push({
          id: feature.id,
          type: 'feature',
          title: feature.title,
          typeLabel: typeLabels.feature,
          isCurrent: false,
        });
      }
      path.push({
        id: userStory.id,
        type: 'userStory',
        title: userStory.title,
        typeLabel: typeLabels.userStory,
        isCurrent: false,
      });
    }
  } else if (currentItem.type === 'userStory') {
    const userStory = data.userStories[currentItem.id];
    if (userStory?.parentFeatureId) {
      const feature = data.features[userStory.parentFeatureId];
      if (feature?.parentEpicId) {
        const epic = data.epics.find((e) => e.id === feature.parentEpicId);
        if (epic) {
          path.push({
            id: epic.id,
            type: 'epic',
            title: epic.title,
            typeLabel: typeLabels.epic,
            isCurrent: false,
          });
        }
      }
      path.push({
        id: feature.id,
        type: 'feature',
        title: feature.title,
        typeLabel: typeLabels.feature,
        isCurrent: false,
      });
    }
  } else if (currentItem.type === 'feature') {
    const feature = data.features[currentItem.id];
    if (feature?.parentEpicId) {
      const epic = data.epics.find((e) => e.id === feature.parentEpicId);
      if (epic) {
        path.push({
          id: epic.id,
          type: 'epic',
          title: epic.title,
          typeLabel: typeLabels.epic,
          isCurrent: false,
        });
      }
    }
  }

  // Add current item
  path.push({
    id: currentItem.id,
    type: currentItem.type,
    title: currentItem.title,
    typeLabel: typeLabels[currentItem.type],
    isCurrent: true,
  });

  return path;
}

/**
 * Get ancestor IDs for a work item
 */
export function getAncestorIds(
  itemId: string,
  itemType: WorkItemType,
  data: WorkItemData
): string[] {
  const ancestors: string[] = [];

  if (itemType === 'task') {
    const task = data.tasks[itemId];
    if (task?.parentUserStoryId) {
      const userStory = data.userStories[task.parentUserStoryId];
      ancestors.push(userStory.id);
      if (userStory?.parentFeatureId) {
        const feature = data.features[userStory.parentFeatureId];
        ancestors.unshift(feature.id);
        if (feature?.parentEpicId) {
          ancestors.unshift(feature.parentEpicId);
        }
      }
    }
  } else if (itemType === 'userStory') {
    const userStory = data.userStories[itemId];
    if (userStory?.parentFeatureId) {
      const feature = data.features[userStory.parentFeatureId];
      ancestors.push(feature.id);
      if (feature?.parentEpicId) {
        ancestors.unshift(feature.parentEpicId);
      }
    }
  } else if (itemType === 'feature') {
    const feature = data.features[itemId];
    if (feature?.parentEpicId) {
      ancestors.push(feature.parentEpicId);
    }
  }

  return ancestors;
}

/**
 * Options for useBreadcrumb hook
 */
export interface UseBreadcrumbOptions {
  /** Work item data from Redux store */
  data: WorkItemData;
  /** Callback when a breadcrumb item is clicked */
  onNavigate?: (item: BreadcrumbItem) => void;
}

/**
 * Return type for useBreadcrumb hook
 */
export interface UseBreadcrumbReturn {
  /** Get breadcrumb path for an item */
  getBreadcrumbPath: (item: WorkItemInfo) => BreadcrumbItem[];
  /** Get ancestor IDs for an item */
  getAncestors: (itemId: string, itemType: WorkItemType) => string[];
  /** Navigate to a breadcrumb item */
  navigateTo: (item: BreadcrumbItem) => void;
}

/**
 * Hook for breadcrumb navigation
 */
export function useBreadcrumb(options: UseBreadcrumbOptions): UseBreadcrumbReturn {
  const { data, onNavigate } = options;

  const getBreadcrumbPath = useCallback(
    (item: WorkItemInfo): BreadcrumbItem[] => {
      return buildBreadcrumbPath(item, data);
    },
    [data]
  );

  const getAncestors = useCallback(
    (itemId: string, itemType: WorkItemType): string[] => {
      return getAncestorIds(itemId, itemType, data);
    },
    [data]
  );

  const navigateTo = useCallback(
    (item: BreadcrumbItem) => {
      onNavigate?.(item);
    },
    [onNavigate]
  );

  return useMemo(
    () => ({
      getBreadcrumbPath,
      getAncestors,
      navigateTo,
    }),
    [getBreadcrumbPath, getAncestors, navigateTo]
  );
}

export default useBreadcrumb;
