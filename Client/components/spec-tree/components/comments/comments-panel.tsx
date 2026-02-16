import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { AppDispatch, RootState } from '@/lib/store';
import {
  addComment,
  markCommentDeleted,
  markNotificationsReadForUser,
  selectCommentsForTarget,
  selectUnreadNotificationsForUser,
  setCommentStatus,
  setCommentsForTarget,
  setNotifications,
} from '@/lib/store/comments-slice';
import type { Comment, CommentTargetType, MentionCandidate } from '@/types/comments';
import type { OrganizationRole } from '@/types/organization';
import { toMentionValue } from '../../lib/utils/mention-utils';
import { defaultMentionCandidates } from '../../lib/data/mention-candidates';
import { canPerformCommentAction } from '../../lib/utils/comment-permissions';
import { strapiService } from '../../lib/api/strapi-service';
import CommentComposer from './comment-composer';
import CommentItem, { CommentNode } from './comment-item';

interface CommentsPanelProps {
  targetType: CommentTargetType;
  targetId: string;
  targetTitle: string;
  isReadOnly?: boolean;
  className?: string;
}

const buildThread = (comments: Comment[]): CommentNode[] => {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.replies?.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  targetType,
  targetId,
  targetTitle,
  isReadOnly = false,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const comments = useSelector((state: RootState) =>
    selectCommentsForTarget(state, targetType, targetId)
  );
  const currentUser = useSelector((state: RootState) => state.user.user);
  const members = useSelector((state: RootState) => state.organization.members);
  const currentUserId =
    currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : 'current-user');
  const unreadNotifications = useSelector((state: RootState) =>
    selectUnreadNotificationsForUser(state, currentUserId)
  );

  // Get the current user's role in the organization for permission checks
  const currentUserRole = useMemo<OrganizationRole | undefined>(() => {
    if (!currentUserId || !Array.isArray(members)) return undefined;
    const member = members.find((m) => m.userId === currentUserId);
    return member?.role;
  }, [currentUserId, members]);
  const [showResolved, setShowResolved] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mentionCandidates = useMemo<MentionCandidate[]>(() => {
    const candidates: MentionCandidate[] = [];
    if (currentUser) {
      const label =
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ') ||
        currentUser.username ||
        currentUser.email ||
        'You';
      candidates.push({
        id: currentUser.documentId || String(currentUser.id),
        label,
        value: toMentionValue(label),
        email: currentUser.email,
      });
    }

    (Array.isArray(members) ? members : []).forEach((member) => {
      const label = `Member ${member.userId.slice(0, 6)}`;
      candidates.push({
        id: member.userId,
        label,
        value: toMentionValue(label),
      });
    });

    if (candidates.length === 0) {
      return defaultMentionCandidates;
    }

    return candidates;
  }, [currentUser, members]);

  const visibleComments = useMemo(() => {
    const authorLower = authorFilter.toLowerCase();
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    return comments.filter((comment) => {
      if (!showResolved && comment.status !== 'open') return false;
      if (authorLower && !comment.authorName.toLowerCase().includes(authorLower)) return false;
      if (fromDate) {
        const created = new Date(comment.createdAt);
        if (created < fromDate) return false;
      }
      if (toDate) {
        const created = new Date(comment.createdAt);
        if (created > toDate) return false;
      }
      return true;
    });
  }, [comments, showResolved, authorFilter, dateFrom, dateTo]);

  const commentThread = useMemo(() => buildThread(visibleComments), [visibleComments]);

  const openCount = comments.filter((comment) => comment.status === 'open').length;
  const resolvedCount = comments.filter((comment) => comment.status === 'resolved').length;

  const loadComments = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await strapiService.fetchCommentsForTarget(targetType, targetId);
      dispatch(setCommentsForTarget({ targetType, targetId, comments: data }));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to load comments', { error });
      setErrorMessage('Failed to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, targetId, targetType]);

  const loadNotifications = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const data = await strapiService.fetchCommentNotificationsForUser(currentUserId);
      dispatch(setNotifications(data));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to load notifications', { error });
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const handleAddComment = async (body: string, mentions: string[]) => {
    if (isReadOnly) return;
    const authorName =
      [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
      currentUser?.username ||
      currentUser?.email ||
      'You';
    const authorId = currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : 'current-user');

    try {
      const saved = await strapiService.createComment({
        targetType,
        targetId,
        body,
        mentions,
        authorId,
        authorName,
        authorEmail: currentUser?.email,
        status: 'open',
      });
      dispatch(addComment(saved));
      void loadNotifications();
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to create comment', { error });
      setErrorMessage('Failed to create comment. Please try again.');
    }
  };

  const handleReply = async (body: string, mentions: string[], parentId: string) => {
    if (isReadOnly) return;
    const authorName =
      [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') ||
      currentUser?.username ||
      currentUser?.email ||
      'You';
    const authorId = currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : 'current-user');

    try {
      const saved = await strapiService.createComment({
        targetType,
        targetId,
        body,
        mentions,
        authorId,
        authorName,
        authorEmail: currentUser?.email,
        status: 'open',
        parentId,
      });
      dispatch(addComment(saved));
      void loadNotifications();
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to create reply', { error });
      setErrorMessage('Failed to create reply. Please try again.');
    }
  };

  const handleResolve = async (commentId: string) => {
    if (isReadOnly) return;

    // Find the comment and check permissions
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      logger.error('CommentsPanel', 'Comment not found', { commentId });
      return;
    }

    if (!canPerformCommentAction('resolve', comment, currentUserId, currentUserRole)) {
      logger.warn('CommentsPanel', 'User does not have permission to resolve this comment', {
        commentId,
        currentUserId,
        authorId: comment.authorId,
      });
      setErrorMessage('You do not have permission to resolve this comment.');
      return;
    }

    const resolvedAt = new Date().toISOString();
    const resolvedBy = currentUser?.documentId || (currentUser?.id ? String(currentUser.id) : 'current-user');
    try {
      await strapiService.updateComment(commentId, {
        status: 'resolved',
        resolvedAt,
        resolvedBy,
      });
      dispatch(setCommentStatus({ id: commentId, status: 'resolved', resolvedAt, resolvedBy }));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to resolve comment', { error });
    }
  };

  const handleReopen = async (commentId: string) => {
    if (isReadOnly) return;

    // Find the comment and check permissions
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      logger.error('CommentsPanel', 'Comment not found', { commentId });
      return;
    }

    if (!canPerformCommentAction('reopen', comment, currentUserId, currentUserRole)) {
      logger.warn('CommentsPanel', 'User does not have permission to reopen this comment', {
        commentId,
        currentUserId,
        authorId: comment.authorId,
      });
      setErrorMessage('You do not have permission to reopen this comment.');
      return;
    }

    try {
      await strapiService.updateComment(commentId, {
        status: 'open',
        resolvedAt: null,
        resolvedBy: null,
      });
      dispatch(setCommentStatus({ id: commentId, status: 'open', resolvedAt: null, resolvedBy: null }));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to reopen comment', { error });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (isReadOnly) return;

    // Find the comment and check permissions
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      logger.error('CommentsPanel', 'Comment not found', { commentId });
      return;
    }

    if (!canPerformCommentAction('delete', comment, currentUserId, currentUserRole)) {
      logger.warn('CommentsPanel', 'User does not have permission to delete this comment', {
        commentId,
        currentUserId,
        authorId: comment.authorId,
      });
      setErrorMessage('You do not have permission to delete this comment. Only the author can delete their own comments.');
      return;
    }

    try {
      await strapiService.deleteComment(commentId);
      dispatch(markCommentDeleted({ id: commentId }));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to delete comment', { error });
    }
  };

  const handleMarkRead = async () => {
    if (!currentUserId) return;
    try {
      await strapiService.markCommentNotificationsRead(currentUserId);
      dispatch(markNotificationsReadForUser({ userId: currentUserId }));
    } catch (error) {
      logger.error('CommentsPanel', 'Failed to mark notifications read', { error });
    }
  };

  return (
    <div className={cn('space-y-4 rounded-lg border border-border bg-background p-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Comments</h4>
          <p className="text-xs text-muted-foreground">
            {openCount} open · {resolvedCount} resolved
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={showResolved}
              onCheckedChange={setShowResolved}
              aria-label="Show resolved comments"
            />
            <Label className="text-xs text-muted-foreground">Show resolved</Label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters((prev) => !prev)}
            title="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
          {unreadNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unreadNotifications.length} new</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkRead}
              >
                Mark read
              </Button>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label className="text-xs">Author</Label>
            <Input
              placeholder="Filter by author..."
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="h-8 w-40 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 w-36 text-xs"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAuthorFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="h-8 text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Loading comments...
        </div>
      ) : (
        <div className="space-y-4">
          {commentThread.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No comments for {targetTitle} yet.
            </div>
          ) : (
            commentThread.map((node) => (
              <CommentItem
                key={node.id}
                comment={node}
                replies={node.replies || []}
                mentionCandidates={mentionCandidates}
                currentUserId={currentUserId}
                userRole={currentUserRole}
                onReply={handleReply}
                onResolve={handleResolve}
                onReopen={handleReopen}
                onDelete={handleDelete}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </div>
      )}

      <div className="pt-2">
        <CommentComposer
          onSubmit={handleAddComment}
          mentionCandidates={mentionCandidates}
          isReadOnly={isReadOnly}
          placeholder={`Comment on ${targetTitle}...`}
        />
      </div>
    </div>
  );
};

export default CommentsPanel;
