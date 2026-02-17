/**
 * API Key List component for managing public REST API keys.
 * Shows existing keys with copy, revoke, and status info.
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Copy, Key, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { AppDispatch, RootState } from '@/lib/store';
import { fetchApiKeys, createApiKey, revokeApiKey } from '@/lib/store/rest-api-slice';

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

const ApiKeyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { keys, isLoading, error } = useSelector((state: RootState) => state.restApi);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void dispatch(fetchApiKeys());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    const result = await dispatch(createApiKey({ name: newKeyName.trim() }));
    if (createApiKey.fulfilled.match(result)) {
      setCreatedKey(result.payload.key);
      setNewKeyName('');
    }
  };

  const handleCopyKey = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (keyId: string) => {
    await dispatch(revokeApiKey(keyId));
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
          <p className="text-xs text-muted-foreground">
            Manage keys for the public REST API (v1)
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Key
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Loading API keys...
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between rounded-md border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{key.name}</span>
                    <Badge variant="outline" className={cn('text-xs', tierColors[key.tier])}>
                      {key.tier}
                    </Badge>
                    {!key.isActive && (
                      <Badge variant="destructive" className="text-xs">Revoked</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {key.prefix}... · Last used: {formatDate(key.lastUsedAt)} · Created: {formatDate(key.createdAt)}
                  </p>
                </div>
              </div>
              {key.isActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(key.id)}
                  title="Revoke key"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Key Dialog */}
      <Dialog open={showCreate && !createdKey} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="e.g., Production, CI/CD, Dev"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newKeyName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Created Key Dialog */}
      <Dialog open={!!createdKey} onOpenChange={() => setCreatedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Copy this key now. You will not be able to see it again.
          </p>
          <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
            <code className="flex-1 break-all text-sm">{createdKey}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createdKey && handleCopyKey(createdKey)}
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeyList;
