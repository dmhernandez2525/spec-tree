import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  Comment,
  CommentNotification,
  CommentStatus,
  CommentTargetType,
} from '@/types/comments';
import type { RootState } from './index';

interface CommentsState {
  commentsById: Record<string, Comment>;
  targetIndex: Record<string, string[]>;
  notifications: CommentNotification[];
}

const initialState: CommentsState = {
  commentsById: {},
  targetIndex: {},
  notifications: [],
};

const getTargetKey = (targetType: CommentTargetType, targetId: string) =>
  `${targetType}:${targetId}`;

const normalizeComment = (comment: Comment): Comment => ({
  ...comment,
  mentions: comment.mentions || [],
});

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setCommentsForTarget: (
      state,
      action: PayloadAction<{
        targetType: CommentTargetType;
        targetId: string;
        comments: Comment[];
      }>
    ) => {
      const { targetType, targetId, comments } = action.payload;
      const key = getTargetKey(targetType, targetId);
      state.targetIndex[key] = comments.map((comment) => comment.id);
      comments.forEach((comment) => {
        state.commentsById[comment.id] = normalizeComment(comment);
      });
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      const comment = normalizeComment(action.payload);
      state.commentsById[comment.id] = comment;
      const key = getTargetKey(comment.targetType, comment.targetId);
      const existing = state.targetIndex[key] || [];
      state.targetIndex[key] = [comment.id, ...existing.filter((id) => id !== comment.id)];
    },
    updateComment: (
      state,
      action: PayloadAction<{
        id: string;
        body: string;
        mentions: string[];
        updatedAt: string;
      }>
    ) => {
      const { id, body, mentions, updatedAt } = action.payload;
      const comment = state.commentsById[id];
      if (comment) {
        comment.body = body;
        comment.mentions = mentions;
        comment.updatedAt = updatedAt;
      }
    },
    setCommentStatus: (
      state,
      action: PayloadAction<{
        id: string;
        status: CommentStatus;
        resolvedAt?: string | null;
        resolvedBy?: string | null;
      }>
    ) => {
      const { id, status, resolvedAt, resolvedBy } = action.payload;
      const comment = state.commentsById[id];
      if (comment) {
        comment.status = status;
        comment.resolvedAt = resolvedAt || null;
        comment.resolvedBy = resolvedBy || null;
      }
    },
    markCommentDeleted: (state, action: PayloadAction<{ id: string }>) => {
      const comment = state.commentsById[action.payload.id];
      if (comment) {
        comment.isDeleted = true;
        comment.body = '';
      }
    },
    removeComment: (state, action: PayloadAction<{ id: string }>) => {
      const comment = state.commentsById[action.payload.id];
      if (!comment) return;
      const key = getTargetKey(comment.targetType, comment.targetId);
      state.targetIndex[key] = (state.targetIndex[key] || []).filter(
        (commentId) => commentId !== comment.id
      );
      delete state.commentsById[comment.id];
    },
  addNotifications: (
    state,
    action: PayloadAction<CommentNotification[]>
  ) => {
    state.notifications.push(...action.payload);
  },
    setNotifications: (
      state,
      action: PayloadAction<CommentNotification[]>
    ) => {
      state.notifications = action.payload;
    },
    markNotificationRead: (
      state,
      action: PayloadAction<{ id: string }>
    ) => {
      const notification = state.notifications.find(
        (item) => item.id === action.payload.id
      );
      if (notification) {
        notification.status = 'read';
      }
    },
    markNotificationsReadForUser: (
      state,
      action: PayloadAction<{ userId: string }>
    ) => {
      state.notifications.forEach((notification) => {
        if (
          notification.userId === action.payload.userId &&
          notification.status === 'unread'
        ) {
          notification.status = 'read';
        }
      });
    },
  },
});

export const {
  setCommentsForTarget,
  addComment,
  updateComment,
  setCommentStatus,
  markCommentDeleted,
  removeComment,
  addNotifications,
  setNotifications,
  markNotificationRead,
  markNotificationsReadForUser,
} = commentsSlice.actions;

export const selectCommentsForTarget = (
  state: RootState,
  targetType: CommentTargetType,
  targetId: string
): Comment[] => {
  const key = getTargetKey(targetType, targetId);
  const commentIds = state.comments.targetIndex[key] || [];
  return commentIds
    .map((id) => state.comments.commentsById[id])
    .filter((comment): comment is Comment => Boolean(comment))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const selectAllComments = (state: RootState): Comment[] =>
  Object.values(state.comments.commentsById || {});

export const selectNotificationsForUser = (
  state: RootState,
  userId: string
): CommentNotification[] =>
  state.comments.notifications.filter((notification) => notification.userId === userId);

export const selectUnreadNotificationsForUser = (
  state: RootState,
  userId: string
): CommentNotification[] =>
  state.comments.notifications.filter(
    (notification) =>
      notification.userId === userId && notification.status === 'unread'
  );

export default commentsSlice.reducer;
