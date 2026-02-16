import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchAuditLogs } from '@/lib/store/workspace-slice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AuditLogAction } from '@/types/organization';

const AUDIT_ACTION_LABELS: Record<AuditLogAction, string> = {
  permission_change: 'Permission changed',
  member_added: 'Member added',
  member_removed: 'Member removed',
  invite_sent: 'Invite sent',
  invite_accepted: 'Invite accepted',
  invite_declined: 'Invite declined',
  quota_updated: 'Quota updated',
  api_key_created: 'API key created',
  api_key_revoked: 'API key revoked',
  settings_updated: 'Settings updated',
  template_created: 'Template created',
};

export function AuditLogViewer() {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector(
    (state) => state.organization.currentOrganization?.id
  );
  const auditLogs = useAppSelector((state) => state.workspace.auditLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchAuditLogs({ organizationId, page }));
    }
  }, [dispatch, organizationId, page]);

  const filtered = auditLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.actorName.toLowerCase().includes(term) ||
      AUDIT_ACTION_LABELS[log.action].toLowerCase().includes(term) ||
      log.targetType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audit Log</h3>
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[240px]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">No audit logs found.</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-2 pr-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {log.actorName}
                    </span>
                    <Badge variant="outline">
                      {AUDIT_ACTION_LABELS[log.action]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Target: {log.targetType}
                    {log.targetId ? ` (${log.targetId})` : ''}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(log.happenedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={filtered.length < 25}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
