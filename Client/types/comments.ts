export type CommentTargetType = 'app' | 'epic' | 'feature' | 'userStory' | 'task';

export type CommentStatus = 'open' | 'resolved';

export interface Comment {
  id: string;
  targetType: CommentTargetType;
  targetId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  mentions: string[];
  status: CommentStatus;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  isDeleted?: boolean;
}

export type NotificationChannel = 'in-app' | 'email';
export type NotificationStatus = 'unread' | 'read' | 'queued' | 'sent' | 'failed';

export interface CommentNotification {
  id: string;
  commentId: string;
  userId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  createdAt: string;
}

export interface MentionCandidate {
  id: string;
  label: string;
  value: string;
  email?: string;
}
