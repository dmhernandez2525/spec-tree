import React, { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Comment, MentionCandidate } from '@/types/comments';
import type { OrganizationRole } from '@/types/organization';
import { getCommentPermissions } from '../../lib/utils/comment-permissions';
import CommentComposer from './comment-composer';

export interface CommentNode extends Comment {
  replies?: CommentNode[];
}

interface CommentItemProps {
  comment: CommentNode;
  replies: CommentNode[];
  depth?: number;
  mentionCandidates: MentionCandidate[];
  currentUserId?: string;
  userRole?: OrganizationRole;
  onReply: (body: string, mentions: string[], parentId: string) => Promise<void>;
  onResolve: (commentId: string) => Promise<void>;
  onReopen: (commentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReadOnly?: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return formatDistanceToNow(date, { addSuffix: true });
};

const renderBody = (body: string, mentionCandidates: MentionCandidate[]) => {
  if (!body) return <span className="text-muted-foreground italic">Comment deleted</span>;
  const tokens = body.split(/(@[a-zA-Z0-9._-]+)/g);
  const mentionValues = new Set(
    mentionCandidates.map((candidate) => `@${candidate.value}`)
  );
  return (
    <>
      {tokens.map((token, index) => {
        if (mentionValues.has(token)) {
          return (
            <span key={`${token}-${index}`} className="font-medium text-primary">
              {token}
            </span>
          );
        }
        return <span key={`${token}-${index}`}>{token}</span>;
      })}
    </>
  );
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies,
  depth = 0,
  mentionCandidates,
  currentUserId,
  userRole,
  onReply,
  onResolve,
  onReopen,
  onDelete,
  isReadOnly = false,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const padding = useMemo(() => Math.min(depth * 16, 48), [depth]);

  // Get permission checks for this comment
  const permissions = useMemo(
    () => getCommentPermissions(comment, currentUserId, userRole),
    [comment, currentUserId, userRole]
  );

  return (
    <div className={cn('space-y-3', depth > 0 && 'border-l border-border pl-4')}>
      <div className={cn('rounded-lg border border-border bg-background p-4', depth > 0 && 'bg-muted/30')}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(comment.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={comment.status === 'resolved' ? 'secondary' : 'default'}>
              {comment.status === 'resolved' ? 'Resolved' : 'Open'}
            </Badge>
          </div>
        </div>

        <div className="mt-3 text-sm text-foreground">{renderBody(comment.body, mentionCandidates)}</div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReplying((prev) => !prev)}
            disabled={isReadOnly}
          >
            Reply
          </Button>
          {comment.status === 'resolved' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReopen(comment.id)}
              disabled={isReadOnly || !permissions.canReopen}
              title={!permissions.canReopen ? 'Only the comment author or admins can reopen comments' : undefined}
            >
              Reopen
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResolve(comment.id)}
              disabled={isReadOnly || !permissions.canResolve}
              title={!permissions.canResolve ? 'Only the comment author or admins can resolve comments' : undefined}
            >
              Resolve
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(comment.id)}
            disabled={isReadOnly || !permissions.canDelete}
            title={!permissions.canDelete ? 'Only the comment author can delete their comment' : undefined}
          >
            Delete
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4">
            <CommentComposer
              onSubmit={async (body, mentions) => {
                await onReply(body, mentions, comment.id);
                setIsReplying(false);
              }}
              onCancel={() => setIsReplying(false)}
              mentionCandidates={mentionCandidates}
              placeholder="Write a reply..."
              isReadOnly={isReadOnly}
            />
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="space-y-3" style={{ paddingLeft: padding }}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={reply.replies || []}
              depth={depth + 1}
              mentionCandidates={mentionCandidates}
              currentUserId={currentUserId}
              userRole={userRole}
              onReply={onReply}
              onResolve={onResolve}
              onReopen={onReopen}
              onDelete={onDelete}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
