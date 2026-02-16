import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import {
  fetchAPIKeys,
  createAPIKey,
  revokeAPIKey,
} from '@/lib/store/workspace-slice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/shared/icons';
import type { AIProvider } from '@/types/organization';

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function APIKeyManager() {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector(
    (state) => state.organization.currentOrganization?.id
  );
  const userId = useAppSelector(
    (state) => state.user.user?.documentId
  );
  const apiKeys = useAppSelector((state) => state.workspace.apiKeys);
  const userRole = useAppSelector(
    (state) => state.auth.organizationRole
  ) || 'viewer';

  const [createOpen, setCreateOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');

  const canManage = userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchAPIKeys(organizationId));
    }
  }, [dispatch, organizationId]);

  const handleCreate = async () => {
    if (!organizationId || !userId || !label.trim() || !apiKey.trim()) return;
    await dispatch(
      createAPIKey({
        organizationId,
        provider,
        label: label.trim(),
        maskedKey: maskApiKey(apiKey.trim()),
        encryptedKey: apiKey.trim(),
        createdById: userId,
      })
    );
    setLabel('');
    setApiKey('');
    setProvider('openai');
    setCreateOpen(false);
  };

  const handleRevoke = async () => {
    if (!organizationId || !revokeId) return;
    await dispatch(revokeAPIKey({ organizationId, apiKeyId: revokeId }));
    setRevokeId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">API Keys</h3>
        {canManage && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Icons.plus className="mr-2 h-4 w-4" />
                Add Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-provider">Provider</Label>
                  <Select
                    value={provider}
                    onValueChange={(v) => setProvider(v as AIProvider)}
                  >
                    <SelectTrigger id="key-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-label">Label</Label>
                  <Input
                    id="key-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Production key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key-value">API Key</Label>
                  <Input
                    id="key-value"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={!label.trim() || !apiKey.trim()}
                  className="w-full"
                >
                  Add Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {apiKeys.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No API keys configured.
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2 pr-2">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{key.label}</span>
                    <Badge variant="secondary">{key.provider}</Badge>
                    <Badge
                      variant={key.isActive ? 'default' : 'destructive'}
                    >
                      {key.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {key.maskedKey}
                  </p>
                </div>
                {canManage && key.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setRevokeId(key.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <AlertDialog
        open={Boolean(revokeId)}
        onOpenChange={(open) => {
          if (!open) setRevokeId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently deactivate this API key. Any services using
              it will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
