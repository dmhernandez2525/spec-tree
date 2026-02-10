import type { CollaborationActivity, CollaborationMode, PresenceUser } from '@/types/collaboration';

export type WorkItemUpdatePayload = {
  itemType: 'epic' | 'feature' | 'userStory' | 'task';
  itemId: string;
  field: string;
  value: unknown;
  arrayIndex?: number;
  isArrayItem?: boolean;
  updatedAt: string;
};

export type WorkItemAddPayload = {
  itemType: 'epic' | 'feature' | 'userStory' | 'task';
  item: unknown;
  updatedAt: string;
};

export type WorkItemDeletePayload = {
  itemType: 'epic' | 'feature' | 'userStory' | 'task';
  itemId: string;
  updatedAt: string;
};

export type ReorderPayload = {
  listType: 'epic' | 'feature' | 'userStory' | 'task';
  parentId?: string;
  sourceIndex: number;
  destinationIndex: number;
  updatedAt: string;
};

export type MovePayload = {
  itemType: 'feature' | 'userStory' | 'task';
  itemId: string;
  sourceParentId: string;
  destinationParentId: string;
  destinationIndex: number;
  updatedAt: string;
};

export type CollaborationEmitter = {
  emitActivity?: (activity: CollaborationActivity) => void;
  emitPresenceUpdate?: (user: PresenceUser) => void;
  emitWorkItemUpdate?: (payload: WorkItemUpdatePayload) => void;
  emitWorkItemAdd?: (payload: WorkItemAddPayload) => void;
  emitWorkItemDelete?: (payload: WorkItemDeletePayload) => void;
  emitReorder?: (payload: ReorderPayload) => void;
  emitMove?: (payload: MovePayload) => void;
  emitModeChange?: (mode: CollaborationMode, enabled: boolean) => void;
};

let emitter: CollaborationEmitter = {};

export const setCollaborationEmitter = (next: CollaborationEmitter) => {
  emitter = next;
};

export const getCollaborationEmitter = (): CollaborationEmitter => emitter;
