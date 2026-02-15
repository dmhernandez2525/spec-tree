import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchActivities } from '@/lib/store/workspace-slice';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';
import type { TeamActivityType } from '@/types/organization';

const ACTIVITY_LABELS: Record<TeamActivityType, string> = {
  edit: 'Edited',
  comment: 'Commented',
  generation: 'Generated',
  invite: 'Invited',
  member_change: 'Member change',
  permission_change: 'Permission change',
  template: 'Template update',
  api_key: 'API key update',
  quota: 'Quota change',
  settings: 'Settings update',
};

const ACTIVITY_VARIANTS: Record<
  TeamActivityType,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  edit: 'secondary',
  comment: 'outline',
  generation: 'default',
  invite: 'secondary',
  member_change: 'outline',
  permission_change: 'destructive',
  template: 'secondary',
  api_key: 'outline',
  quota: 'outline',
  settings: 'outline',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector(
    (state) => state.organization.currentOrganization?.id
  );
  const activities = useAppSelector((state) => state.workspace.activities);

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchActivities({ organizationId }));
    }
  }, [dispatch, organizationId]);

  if (activities.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Team Activity</h3>
      <ScrollArea className="max-h-[500px]">
        <div className="space-y-3 pr-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icons.users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {activity.actorName}
                  </span>
                  <Badge variant={ACTIVITY_VARIANTS[activity.type]}>
                    {ACTIVITY_LABELS[activity.type]}
                  </Badge>
                </div>
                {activity.target && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {activity.target}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatRelativeTime(activity.happenedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
