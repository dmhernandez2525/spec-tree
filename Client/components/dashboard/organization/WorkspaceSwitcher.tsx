import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchWorkspaces } from '@/lib/store/workspace-slice';
import { setCurrentOrganization } from '@/lib/store/organization-slice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';

export function WorkspaceSwitcher() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.user?.documentId);
  const currentOrgId = useAppSelector(
    (state) => state.organization.currentOrganization?.id
  );
  const workspaces = useAppSelector((state) => state.workspace.workspaces);

  useEffect(() => {
    if (userId) {
      dispatch(fetchWorkspaces(userId));
    }
  }, [dispatch, userId]);

  const currentWorkspace = useMemo(
    () => workspaces.find((ws) => ws.id === currentOrgId),
    [workspaces, currentOrgId]
  );

  const handleSwitch = (workspaceId: string) => {
    if (workspaceId === currentOrgId) return;
    const target = workspaces.find((ws) => ws.id === workspaceId);
    if (target) {
      dispatch(
        setCurrentOrganization({
          id: target.id,
          name: target.name,
        })
      );
    }
  };

  if (workspaces.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span className="truncate text-sm">
            {currentWorkspace?.name || 'Select workspace'}
          </span>
          <Icons.chevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => handleSwitch(ws.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{ws.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {ws.role}
              </Badge>
              {ws.id === currentOrgId && (
                <Icons.check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
