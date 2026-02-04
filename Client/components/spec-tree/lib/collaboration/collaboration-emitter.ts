import type { CollaborationActivity, CollaborationMode, PresenceUser } from '@/types/collaboration';

export type WorkItemUpdatePayload = {
  itemType: 'epic' | 'feature' | 'userStory' | 'task';
  itemId: string;
  field: string;
  value: string | number;
  updatedAt?: string;
  userId?: string;
};

export type ReorderPayload = {
  listType: 'epic' | 'feature' | 'userStory' | 'task';
  parentId?: string;
  sourceIndex: number;
  destinationIndex: number;
  updatedAt?: string;
  userId?: string;
};

export type CollaborationEmitter = {
  emitActivity?: (activity: CollaborationActivity) => void;
  emitPresenceUpdate?: (user: PresenceUser) => void;
  emitWorkItemUpdate?: (payload: WorkItemUpdatePayload) => void;
  emitReorder?: (payload: ReorderPayload) => void;
  emitModeChange?: (mode: CollaborationMode, enabled: boolean) => void;
};

let emitter: CollaborationEmitter = {};

export const setCollaborationEmitter = (next: CollaborationEmitter) => {
  emitter = next;
};

export const getCollaborationEmitter = (): CollaborationEmitter => emitter;
