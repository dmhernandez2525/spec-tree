import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './index';
import {
  addEpics,
  addFeature,
  addFeatures,
  addTask,
  addTasks,
  addUserStory,
  addUserStories,
  deleteEpic,
  deleteFeature,
  deleteTask,
  deleteUserStory,
  moveFeatureToEpic,
  moveTaskToUserStory,
  moveUserStoryToFeature,
  reorderEpics,
  reorderFeatures,
  reorderTasks,
  reorderUserStories,
  updateEpicField,
  updateFeatureField,
  updateTaskField,
  updateUserStoryField,
} from './sow-slice';
import { recordUpdate } from './collaboration-slice';
import { getCollaborationEmitter } from '@/components/spec-tree/lib/collaboration/collaboration-emitter';

const isRemoteAction = (action: { meta?: { source?: string } }) =>
  action.meta?.source === 'remote';

const buildUpdateKey = (itemType: string, itemId: string, field: string) =>
  `item:${itemType}:${itemId}:${field}`;

const buildOrderKey = (listType: string, parentId?: string) =>
  `order:${listType}:${parentId || 'root'}`;

const buildMoveKey = (itemType: string, itemId: string) =>
  `move:${itemType}:${itemId}`;

export const collaborationMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    if (action.type === recordUpdate.type) {
      return result;
    }

    const state = store.getState();
    if (!state.collaboration.isEnabled || isRemoteAction(action)) {
      return result;
    }

    const emitter = getCollaborationEmitter();
    const updatedAt = new Date().toISOString();

    switch (action.type) {
      case updateTaskField.type: {
        const payload = action.payload;
        emitter.emitWorkItemUpdate?.({
          itemType: 'task',
          itemId: payload.taskId,
          field: payload.field,
          value: payload.newValue,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildUpdateKey('task', payload.taskId, payload.field),
            updatedAt,
          })
        );
        break;
      }
      case updateUserStoryField.type: {
        const payload = action.payload;
        emitter.emitWorkItemUpdate?.({
          itemType: 'userStory',
          itemId: payload.userStoryId,
          field: payload.field,
          value: payload.newValue,
          arrayIndex: payload.arrayIndex,
          isArrayItem: payload.isArrayItem,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildUpdateKey('userStory', payload.userStoryId, payload.field),
            updatedAt,
          })
        );
        break;
      }
      case updateFeatureField.type: {
        const payload = action.payload;
        emitter.emitWorkItemUpdate?.({
          itemType: 'feature',
          itemId: payload.featureId,
          field: payload.field,
          value: payload.newValue,
          arrayIndex: payload.arrayIndex,
          isArrayItem: payload.isArrayItem,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildUpdateKey('feature', payload.featureId, payload.field),
            updatedAt,
          })
        );
        break;
      }
      case updateEpicField.type: {
        const payload = action.payload;
        emitter.emitWorkItemUpdate?.({
          itemType: 'epic',
          itemId: payload.epicName,
          field: payload.field,
          value: payload.newValue,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildUpdateKey('epic', payload.epicName, payload.field),
            updatedAt,
          })
        );
        break;
      }
      case addEpics.type:
      case addFeature.type:
      case addFeatures.type:
      case addUserStory.type:
      case addUserStories.type:
      case addTask.type:
      case addTasks.type: {
        const payload = action.payload;
        const itemType =
          action.type === addEpics.type
            ? 'epic'
            : action.type === addFeature.type || action.type === addFeatures.type
            ? 'feature'
            : action.type === addUserStory.type || action.type === addUserStories.type
            ? 'userStory'
            : 'task';
        emitter.emitWorkItemAdd?.({
          itemType,
          item: payload,
          updatedAt,
        });
        break;
      }
      case deleteEpic.type:
      case deleteFeature.type:
      case deleteUserStory.type:
      case deleteTask.type: {
        const itemType =
          action.type === deleteEpic.type
            ? 'epic'
            : action.type === deleteFeature.type
            ? 'feature'
            : action.type === deleteUserStory.type
            ? 'userStory'
            : 'task';
        emitter.emitWorkItemDelete?.({
          itemType,
          itemId: action.payload,
          updatedAt,
        });
        break;
      }
      case reorderEpics.type: {
        const payload = action.payload;
        emitter.emitReorder?.({
          listType: 'epic',
          sourceIndex: payload.sourceIndex,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildOrderKey('epic'),
            updatedAt,
          })
        );
        break;
      }
      case reorderFeatures.type: {
        const payload = action.payload;
        emitter.emitReorder?.({
          listType: 'feature',
          parentId: payload.epicId,
          sourceIndex: payload.sourceIndex,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildOrderKey('feature', payload.epicId),
            updatedAt,
          })
        );
        break;
      }
      case reorderUserStories.type: {
        const payload = action.payload;
        emitter.emitReorder?.({
          listType: 'userStory',
          parentId: payload.featureId,
          sourceIndex: payload.sourceIndex,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildOrderKey('userStory', payload.featureId),
            updatedAt,
          })
        );
        break;
      }
      case reorderTasks.type: {
        const payload = action.payload;
        emitter.emitReorder?.({
          listType: 'task',
          parentId: payload.userStoryId,
          sourceIndex: payload.sourceIndex,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildOrderKey('task', payload.userStoryId),
            updatedAt,
          })
        );
        break;
      }
      case moveFeatureToEpic.type: {
        const payload = action.payload;
        emitter.emitMove?.({
          itemType: 'feature',
          itemId: payload.featureId,
          sourceParentId: payload.sourceEpicId,
          destinationParentId: payload.destinationEpicId,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildMoveKey('feature', payload.featureId),
            updatedAt,
          })
        );
        break;
      }
      case moveUserStoryToFeature.type: {
        const payload = action.payload;
        emitter.emitMove?.({
          itemType: 'userStory',
          itemId: payload.userStoryId,
          sourceParentId: payload.sourceFeatureId,
          destinationParentId: payload.destinationFeatureId,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildMoveKey('userStory', payload.userStoryId),
            updatedAt,
          })
        );
        break;
      }
      case moveTaskToUserStory.type: {
        const payload = action.payload;
        emitter.emitMove?.({
          itemType: 'task',
          itemId: payload.taskId,
          sourceParentId: payload.sourceUserStoryId,
          destinationParentId: payload.destinationUserStoryId,
          destinationIndex: payload.destinationIndex,
          updatedAt,
        });
        store.dispatch(
          recordUpdate({
            key: buildMoveKey('task', payload.taskId),
            updatedAt,
          })
        );
        break;
      }
      default:
        break;
    }

    return result;
  };
