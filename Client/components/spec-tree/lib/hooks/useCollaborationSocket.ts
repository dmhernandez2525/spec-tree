import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store';
import {
  addActivity,
  recordUpdate,
  removePresenceUser,
  selectCollaborationEnabled,
  selectCollaborationLastUpdatedByKey,
  setEnabled,
  setMode,
  setPresenceUsers,
  upsertPresenceUser,
} from '@/lib/store/collaboration-slice';
import {
  addEpics,
  addFeature,
  addTask,
  addUserStory,
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
} from '@/lib/store/sow-slice';
import type {
  EpicType,
  EpicFields,
  FeatureType,
  FeatureFields,
  TaskType,
  TaskFields,
  UserStoryType,
  UserStoryFields,
} from '../types/work-items';
import type { CollaborationMode, PresenceUser } from '@/types/collaboration';
import { logger } from '@/lib/logger';
import {
  type MovePayload,
  type ReorderPayload,
  type WorkItemAddPayload,
  type WorkItemDeletePayload,
  type WorkItemUpdatePayload,
  setCollaborationEmitter,
} from '../collaboration/collaboration-emitter';

interface UseCollaborationSocketOptions {
  appId: string | null;
  currentUser?: PresenceUser | null;
}

type ModePayload = {
  mode: CollaborationMode;
  enabled: boolean;
  updatedAt?: string;
};

const socketUrl =
  process.env.NEXT_PUBLIC_MICROSERVICE_URL || 'http://localhost:3001';

const buildUpdateKey = (itemType: string, itemId: string, field: string) =>
  `item:${itemType}:${itemId}:${field}`;

const buildOrderKey = (listType: string, parentId?: string) =>
  `order:${listType}:${parentId || 'root'}`;

const buildMoveKey = (itemType: string, itemId: string) =>
  `move:${itemType}:${itemId}`;

const useCollaborationSocket = ({
  appId,
  currentUser,
}: UseCollaborationSocketOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEnabled = useSelector(selectCollaborationEnabled);
  const lastUpdated = useSelector((state: RootState) =>
    selectCollaborationLastUpdatedByKey(state)
  );
  const socketRef = useRef<Socket | null>(null);
  const lastUpdatedRef = useRef<Record<string, string>>({});

  useEffect(() => {
    lastUpdatedRef.current = lastUpdated;
  }, [lastUpdated]);

  useEffect(() => {
    if (!isEnabled || !appId || !currentUser) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setCollaborationEmitter({});
      return;
    }

    const socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    setCollaborationEmitter({
      emitActivity: (activity) => socket.emit('collaboration:activity', activity),
      emitPresenceUpdate: (user) =>
        socket.emit('collaboration:presence:update', user),
      emitWorkItemUpdate: (payload) =>
        socket.emit('collaboration:item:update', payload),
      emitWorkItemAdd: (payload) =>
        socket.emit('collaboration:item:add', payload),
      emitWorkItemDelete: (payload) =>
        socket.emit('collaboration:item:delete', payload),
      emitReorder: (payload) => socket.emit('collaboration:reorder', payload),
      emitMove: (payload) => socket.emit('collaboration:move', payload),
      emitModeChange: (mode, enabled) =>
        socket.emit('collaboration:mode:update', {
          mode,
          enabled,
          updatedAt: new Date().toISOString(),
        }),
    });

    const dispatchRemote = <T,>(action: { type: string; payload: T }) => {
      dispatch({ ...action, meta: { source: 'remote' } });
    };

    const shouldApplyUpdate = (key: string, updatedAt: string) => {
      const current = lastUpdatedRef.current[key];
      return !current || updatedAt > current;
    };

    socket.on('connect', () => {
      socket.emit('collaboration:join', {
        appId,
        user: currentUser,
      });
    });

    socket.on('collaboration:presence:sync', (users: PresenceUser[]) => {
      dispatch(setPresenceUsers(users));
    });

    socket.on('collaboration:presence:update', (user: PresenceUser) => {
      dispatch(upsertPresenceUser(user));
    });

    socket.on('collaboration:presence:remove', (userId: string) => {
      dispatch(removePresenceUser(userId));
    });

    socket.on('collaboration:activity', (activity) => {
      dispatch(addActivity(activity));
    });

    socket.on('collaboration:item:update', (payload: WorkItemUpdatePayload) => {
      const key = buildUpdateKey(payload.itemType, payload.itemId, payload.field);
      if (!shouldApplyUpdate(key, payload.updatedAt)) return;

      if (payload.itemType === 'task') {
        dispatchRemote(
          updateTaskField({
            taskId: payload.itemId,
            field: payload.field as TaskFields,
            newValue: payload.value as string,
          })
        );
      } else if (payload.itemType === 'userStory') {
        dispatchRemote(
          updateUserStoryField({
            userStoryId: payload.itemId,
            field: payload.field as UserStoryFields,
            newValue: payload.value as string | string[],
            arrayIndex: payload.arrayIndex,
            isArrayItem: payload.isArrayItem,
          })
        );
      } else if (payload.itemType === 'feature') {
        dispatchRemote(
          updateFeatureField({
            featureId: payload.itemId,
            field: payload.field as FeatureFields,
            newValue: payload.value as string | string[],
            arrayIndex: payload.arrayIndex,
            isArrayItem: payload.isArrayItem,
          })
        );
      } else if (payload.itemType === 'epic') {
        dispatchRemote(
          updateEpicField({
            epicName: payload.itemId,
            field: payload.field as EpicFields,
            newValue: payload.value as string,
          })
        );
      }

      dispatch(
        recordUpdate({
          key,
          updatedAt: payload.updatedAt,
        })
      );
    });

    socket.on('collaboration:item:add', (payload: WorkItemAddPayload) => {
      if (payload.itemType === 'epic') {
        dispatchRemote(addEpics(payload.item as EpicType));
      } else if (payload.itemType === 'feature') {
        dispatchRemote(addFeature(payload.item as FeatureType));
      } else if (payload.itemType === 'userStory') {
        dispatchRemote(addUserStory(payload.item as UserStoryType));
      } else if (payload.itemType === 'task') {
        dispatchRemote(addTask(payload.item as TaskType));
      }
    });

    socket.on('collaboration:item:delete', (payload: WorkItemDeletePayload) => {
      if (payload.itemType === 'epic') {
        dispatchRemote(deleteEpic(payload.itemId));
      } else if (payload.itemType === 'feature') {
        dispatchRemote(deleteFeature(payload.itemId));
      } else if (payload.itemType === 'userStory') {
        dispatchRemote(deleteUserStory(payload.itemId));
      } else if (payload.itemType === 'task') {
        dispatchRemote(deleteTask(payload.itemId));
      }
    });

    socket.on('collaboration:reorder', (payload: ReorderPayload) => {
      const key = buildOrderKey(payload.listType, payload.parentId);
      if (!shouldApplyUpdate(key, payload.updatedAt)) return;

      if (payload.listType === 'epic') {
        dispatchRemote(
          reorderEpics({
            sourceIndex: payload.sourceIndex,
            destinationIndex: payload.destinationIndex,
          })
        );
      } else if (payload.listType === 'feature') {
        if (!payload.parentId) return;
        dispatchRemote(
          reorderFeatures({
            epicId: payload.parentId,
            sourceIndex: payload.sourceIndex,
            destinationIndex: payload.destinationIndex,
          })
        );
      } else if (payload.listType === 'userStory') {
        if (!payload.parentId) return;
        dispatchRemote(
          reorderUserStories({
            featureId: payload.parentId,
            sourceIndex: payload.sourceIndex,
            destinationIndex: payload.destinationIndex,
          })
        );
      } else if (payload.listType === 'task') {
        if (!payload.parentId) return;
        dispatchRemote(
          reorderTasks({
            userStoryId: payload.parentId,
            sourceIndex: payload.sourceIndex,
            destinationIndex: payload.destinationIndex,
          })
        );
      }

      dispatch(
        recordUpdate({
          key,
          updatedAt: payload.updatedAt,
        })
      );
    });

    socket.on('collaboration:move', (payload: MovePayload) => {
      const key = buildMoveKey(payload.itemType, payload.itemId);
      if (!shouldApplyUpdate(key, payload.updatedAt)) return;

      if (payload.itemType === 'feature') {
        dispatchRemote(
          moveFeatureToEpic({
            featureId: payload.itemId,
            sourceEpicId: payload.sourceParentId,
            destinationEpicId: payload.destinationParentId,
            destinationIndex: payload.destinationIndex,
          })
        );
      } else if (payload.itemType === 'userStory') {
        dispatchRemote(
          moveUserStoryToFeature({
            userStoryId: payload.itemId,
            sourceFeatureId: payload.sourceParentId,
            destinationFeatureId: payload.destinationParentId,
            destinationIndex: payload.destinationIndex,
          })
        );
      } else if (payload.itemType === 'task') {
        dispatchRemote(
          moveTaskToUserStory({
            taskId: payload.itemId,
            sourceUserStoryId: payload.sourceParentId,
            destinationUserStoryId: payload.destinationParentId,
            destinationIndex: payload.destinationIndex,
          })
        );
      }

      dispatch(
        recordUpdate({
          key,
          updatedAt: payload.updatedAt,
        })
      );
    });

    socket.on('collaboration:mode:update', (payload: ModePayload) => {
      if (!payload?.mode) return;
      dispatch(setMode(payload.mode));
      if (typeof payload.enabled === 'boolean') {
        dispatch(setEnabled(payload.enabled));
      }
    });

    socket.on('connect_error', (error) => {
      logger.error('collaboration.socket', 'Failed to connect to collaboration server', {
        error,
      });
    });

    return () => {
      socket.off('connect');
      socket.off('collaboration:presence:sync');
      socket.off('collaboration:presence:update');
      socket.off('collaboration:presence:remove');
      socket.off('collaboration:activity');
      socket.off('collaboration:item:update');
      socket.off('collaboration:item:add');
      socket.off('collaboration:item:delete');
      socket.off('collaboration:reorder');
      socket.off('collaboration:move');
      socket.off('collaboration:mode:update');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
      setCollaborationEmitter({});
    };
  }, [appId, currentUser, dispatch, isEnabled]);
};

export default useCollaborationSocket;
