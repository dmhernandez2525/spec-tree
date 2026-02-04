import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  PlusCircle,
  Pencil,
  Trash2,
  MoveRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import type { CollaborationActivity, ActivityTarget } from '@/types/collaboration';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  items: CollaborationActivity[];
  className?: string;
}

const actionMeta = {
  created: { label: 'created', icon: PlusCircle, color: 'text-emerald-600' },
  updated: { label: 'updated', icon: Pencil, color: 'text-blue-600' },
  deleted: { label: 'deleted', icon: Trash2, color: 'text-rose-600' },
  moved: { label: 'moved', icon: MoveRight, color: 'text-amber-600' },
  generated: { label: 'generated', icon: Sparkles, color: 'text-purple-600' },
  commented: { label: 'commented', icon: MessageSquare, color: 'text-slate-600' },
} as const;

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  return formatDistanceToNow(date, { addSuffix: true });
};

const formatTargetType = (targetType: ActivityTarget) => {
  if (targetType === 'userStory') return 'user story';
  return targetType;
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, className }) => {
  if (items.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground', className)}>
        No activity yet. Start collaborating to see updates here.
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item) => {
        const meta = actionMeta[item.action];
        const Icon = meta.icon;
        return (
          <div key={item.id} className="flex gap-3 rounded-lg border border-muted p-3">
            <div className={cn('mt-1', meta.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.userName}</span>{' '}
                {meta.label} {formatTargetType(item.targetType)}{' '}
                <span className="font-medium">{item.targetTitle}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
