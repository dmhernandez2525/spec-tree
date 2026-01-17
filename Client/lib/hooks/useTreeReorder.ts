'use client';

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  reorderEpics,
  reorderFeatures,
  reorderUserStories,
  reorderTasks,
  moveFeatureToEpic,
  moveUserStoryToFeature,
  moveTaskToUserStory,
} from '../store/sow-slice';
import { strapiService } from '@/components/spec-tree/lib/api/strapi-service';
import { logger } from '../logger';
import { toast } from './use-toast';
import type { ReorderPayload, WorkItemType } from '@/components/tree-view/types';

interface UseTreeReorderOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  persistToApi?: boolean;
}

interface UseTreeReorderReturn {
  handleReorder: (payload: ReorderPayload) => Promise<void>;
  isReordering: boolean;
  error: Error | null;
}

/**
 * Hook for handling drag-and-drop reordering of work items with API persistence
 */
export function useTreeReorder(
  options: UseTreeReorderOptions = {}
): UseTreeReorderReturn {
  const { onSuccess, onError, persistToApi = true } = options;
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.sow);
  const [isReordering, setIsReordering] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleReorder = useCallback(
    async (payload: ReorderPayload) => {
      const {
        itemId,
        itemType,
        sourceIndex,
        destinationIndex,
        sourceParentId,
        destinationParentId,
      } = payload;

      if (sourceIndex === destinationIndex && sourceParentId === destinationParentId) {
        return; // No change
      }

      setIsReordering(true);
      setError(null);

      try {
        // Optimistic UI update via Redux
        const isSameParent = sourceParentId === destinationParentId;

        if (isSameParent) {
          // Reorder within the same parent
          switch (itemType) {
            case 'epic':
              dispatch(
                reorderEpics({
                  sourceIndex,
                  destinationIndex,
                })
              );
              break;
            case 'feature':
              if (sourceParentId) {
                dispatch(
                  reorderFeatures({
                    epicId: sourceParentId,
                    sourceIndex,
                    destinationIndex,
                  })
                );
              }
              break;
            case 'userStory':
              if (sourceParentId) {
                dispatch(
                  reorderUserStories({
                    featureId: sourceParentId,
                    sourceIndex,
                    destinationIndex,
                  })
                );
              }
              break;
            case 'task':
              if (sourceParentId) {
                dispatch(
                  reorderTasks({
                    userStoryId: sourceParentId,
                    sourceIndex,
                    destinationIndex,
                  })
                );
              }
              break;
          }
        } else {
          // Move to different parent
          switch (itemType) {
            case 'feature':
              if (sourceParentId && destinationParentId) {
                dispatch(
                  moveFeatureToEpic({
                    featureId: itemId,
                    sourceEpicId: sourceParentId,
                    destinationEpicId: destinationParentId,
                    destinationIndex,
                  })
                );
              }
              break;
            case 'userStory':
              if (sourceParentId && destinationParentId) {
                dispatch(
                  moveUserStoryToFeature({
                    userStoryId: itemId,
                    sourceFeatureId: sourceParentId,
                    destinationFeatureId: destinationParentId,
                    destinationIndex,
                  })
                );
              }
              break;
            case 'task':
              if (sourceParentId && destinationParentId) {
                dispatch(
                  moveTaskToUserStory({
                    taskId: itemId,
                    sourceUserStoryId: sourceParentId,
                    destinationUserStoryId: destinationParentId,
                    destinationIndex,
                  })
                );
              }
              break;
          }
        }

        // Persist to API
        if (persistToApi) {
          await persistReorderToApi(
            itemId,
            itemType,
            destinationIndex,
            destinationParentId ?? sourceParentId,
            state
          );
        }

        logger.log('TreeReorder', 'Reorder successful', payload);
        onSuccess?.();
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error('Failed to reorder items');
        setError(errorObj);
        logger.error('TreeReorder', 'Reorder failed', { error: err, payload });

        toast({
          title: 'Reorder Failed',
          description:
            'Failed to save the new order. Your changes may not be persisted.',
          variant: 'destructive',
        });

        onError?.(errorObj);
      } finally {
        setIsReordering(false);
      }
    },
    [dispatch, persistToApi, onSuccess, onError, state]
  );

  return {
    handleReorder,
    isReordering,
    error,
  };
}

/**
 * Persist reorder changes to the Strapi API
 */
async function persistReorderToApi(
  itemId: string,
  itemType: WorkItemType,
  newPosition: number,
  parentId: string | null | undefined,
  state: RootState['sow']
): Promise<void> {
  // Find the documentId from the state
  let documentId: string | undefined;

  switch (itemType) {
    case 'epic': {
      const epic = state.epics[itemId];
      documentId = epic?.documentId || epic?.id;
      if (documentId) {
        await strapiService.updateEpicPosition(documentId, newPosition);
      }
      break;
    }
    case 'feature': {
      const feature = state.features[itemId];
      documentId = feature?.documentId || feature?.id;
      const parentDocumentId = parentId
        ? state.epics[parentId]?.documentId || parentId
        : undefined;
      if (documentId) {
        await strapiService.updateFeaturePosition(
          documentId,
          newPosition,
          parentDocumentId
        );
      }
      break;
    }
    case 'userStory': {
      const userStory = state.userStories[itemId];
      documentId = userStory?.documentId || userStory?.id;
      const parentDocumentId = parentId
        ? state.features[parentId]?.documentId || parentId
        : undefined;
      if (documentId) {
        await strapiService.updateUserStoryPosition(
          documentId,
          newPosition,
          parentDocumentId
        );
      }
      break;
    }
    case 'task': {
      const task = state.tasks[itemId];
      documentId = task?.documentId || task?.id;
      const parentDocumentId = parentId
        ? state.userStories[parentId]?.documentId || parentId
        : undefined;
      if (documentId) {
        await strapiService.updateTaskPosition(
          documentId,
          newPosition,
          parentDocumentId
        );
      }
      break;
    }
  }
}

export default useTreeReorder;
