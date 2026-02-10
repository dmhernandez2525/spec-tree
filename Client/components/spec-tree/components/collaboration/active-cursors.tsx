import React from 'react';
import type { PresenceUser } from '@/types/collaboration';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ActiveCursorsProps {
  itemId: string;
  users: PresenceUser[];
  currentUserId?: string;
  className?: string;
}

const ActiveCursors: React.FC<ActiveCursorsProps> = ({
  itemId,
  users,
  currentUserId,
  className,
}) => {
  const activeUsers = users.filter(
    (user) =>
      user.currentItemId === itemId &&
      user.id !== currentUserId &&
      user.status === 'active'
  );

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {activeUsers.map((user) => (
        <Tooltip key={user.id}>
          <TooltipTrigger asChild>
            <div
              className="h-2.5 w-2.5 rounded-full border border-background"
              style={{ backgroundColor: user.color }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {user.name}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ActiveCursors;
