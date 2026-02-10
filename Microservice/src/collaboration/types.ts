export type CollaborationMode = 'edit' | 'read-only';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'generated'
  | 'commented';

export type ActivityTarget = 'app' | 'epic' | 'feature' | 'userStory' | 'task';

export interface CollaborationActivity {
  id: string;
  userId: string;
  userName: string;
  action: ActivityAction;
  targetType: ActivityTarget;
  targetTitle: string;
  timestamp: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  status: 'active' | 'idle';
  lastActive: string;
  avatarUrl?: string;
  currentItemId?: string;
}

export type WorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

export interface WorkItemUpdatePayload {
  itemType: WorkItemType;
  itemId: string;
  field: string;
  value: unknown;
  arrayIndex?: number;
  isArrayItem?: boolean;
  updatedAt: string;
}

export interface WorkItemAddPayload {
  itemType: WorkItemType;
  item: unknown;
  updatedAt: string;
}

export interface WorkItemDeletePayload {
  itemType: WorkItemType;
  itemId: string;
  updatedAt: string;
}

export interface ReorderPayload {
  listType: WorkItemType;
  parentId?: string;
  sourceIndex: number;
  destinationIndex: number;
  updatedAt: string;
}

export interface MovePayload {
  itemType: 'feature' | 'userStory' | 'task';
  itemId: string;
  sourceParentId: string;
  destinationParentId: string;
  destinationIndex: number;
  updatedAt: string;
}

export interface ModePayload {
  mode: CollaborationMode;
  enabled: boolean;
  updatedAt: string;
}

export interface JoinPayload {
  appId: string;
  user: PresenceUser;
}
