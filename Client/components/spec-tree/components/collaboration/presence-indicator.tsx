import React from 'react';
import type { PresenceUser } from '@/types/collaboration';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  users: PresenceUser[];
  maxVisible?: number;
  className?: string;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase());
  return initials.join('') || 'U';
};

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  users,
  maxVisible = 4,
  className,
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = Math.max(0, users.length - visibleUsers.length);
  const activeCount = users.filter((user) => user.status === 'active').length;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback style={{ backgroundColor: `${user.color}22` }}>
                    <span style={{ color: user.color }}>
                      {getInitials(user.name)}
                    </span>
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                    user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-400'
                  )}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">{user.name}</p>
                <p className="text-muted-foreground">
                  {user.status === 'active' ? 'Active now' : 'Idle'}
                </p>
                {user.currentItemId && (
                  <p className="text-muted-foreground">
                    Viewing {user.currentItemId}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {overflowCount > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
            +{overflowCount}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {activeCount > 0 ? `${activeCount} active` : 'No one active'}
      </div>
    </div>
  );
};

export default PresenceIndicator;
