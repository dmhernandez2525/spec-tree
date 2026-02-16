import React from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RootState } from '@/lib/store';
import { selectCommentCountForTarget } from '@/lib/store/comments-slice';
import type { CommentTargetType } from '@/types/comments';

interface CommentCountBadgeProps {
  targetType: CommentTargetType;
  targetId: string;
  className?: string;
}

export const CommentCountBadge: React.FC<CommentCountBadgeProps> = ({
  targetType,
  targetId,
  className,
}) => {
  const { total, open } = useSelector((state: RootState) =>
    selectCommentCountForTarget(state, targetType, targetId)
  );

  if (total === 0) return null;

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1 text-xs font-normal', className)}
      title={`${open} open, ${total - open} resolved`}
    >
      <MessageSquare className="h-3 w-3" />
      {total}
    </Badge>
  );
};

export default CommentCountBadge;
