export type CollaborationMode = 'edit' | 'read-only';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'moved'
  | 'generated'
  | 'commented';

export type ActivityTarget =
  | 'app'
  | 'epic'
  | 'feature'
  | 'userStory'
  | 'task';

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
