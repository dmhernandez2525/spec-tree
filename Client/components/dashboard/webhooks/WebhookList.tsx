'use client';

/**
 * Webhook list/management component.
 * Displays registered webhooks with status, actions, and quick controls.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  ListOrdered,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import {
  fetchWebhooks,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from '@/lib/store/webhook-slice';
import type { WebhookConfig, WebhookStatus } from '@/types/webhook';
import WebhookForm from './WebhookForm';
import WebhookDeliveryLog from './WebhookDeliveryLog';

const statusVariants: Record<WebhookStatus, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  disabled: 'bg-red-100 text-red-700',
};

function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + '...';
}

function formatDeliveryDate(date: string | null): string {
  if (!date) return 'Never';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type ViewMode = 'list' | 'create' | 'edit' | 'deliveries';

const WebhookList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { webhooks, isLoading, error } = useAppSelector((state) => state.webhooks);

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);

  useEffect(() => {
    void dispatch(fetchWebhooks());
  }, [dispatch]);

  const handleToggleStatus = useCallback(
    (webhook: WebhookConfig) => {
      const nextStatus: WebhookStatus = webhook.status === 'active' ? 'paused' : 'active';
      void dispatch(updateWebhook({ id: webhook.id, status: nextStatus }));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (webhookId: string) => {
      void dispatch(deleteWebhook(webhookId));
    },
    [dispatch]
  );

  const handleTest = useCallback(
    (webhook: WebhookConfig) => {
      const firstEvent = webhook.events[0];
      if (!firstEvent) return;
      void dispatch(testWebhook(webhook.id));
    },
    [dispatch]
  );

  const handleEdit = useCallback((webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setViewMode('edit');
  }, []);

  const handleViewDeliveries = useCallback((webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setViewMode('deliveries');
  }, []);

  const handleFormSubmit = useCallback(() => {
    setViewMode('list');
    setSelectedWebhook(null);
  }, []);

  const handleFormCancel = useCallback(() => {
    setViewMode('list');
    setSelectedWebhook(null);
  }, []);

  if (viewMode === 'create') {
    return <WebhookForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
  }

  if (viewMode === 'edit' && selectedWebhook) {
    return (
      <WebhookForm
        webhook={selectedWebhook}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    );
  }

  if (viewMode === 'deliveries' && selectedWebhook) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={handleFormCancel}>
          Back to Webhooks
        </Button>
        <WebhookDeliveryLog webhookId={selectedWebhook.id} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Webhooks</h3>
          <p className="text-xs text-muted-foreground">
            Manage event-driven webhook subscriptions
          </p>
        </div>
        <Button size="sm" onClick={() => setViewMode('create')}>
          <Plus className="mr-1 h-4 w-4" /> Create Webhook
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Loading webhooks...
        </div>
      ) : webhooks.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No webhooks configured yet. Create one to start receiving event notifications.
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <WebhookRow
              key={webhook.id}
              webhook={webhook}
              onToggleStatus={handleToggleStatus}
              onEdit={handleEdit}
              onTest={handleTest}
              onViewDeliveries={handleViewDeliveries}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface WebhookRowProps {
  webhook: WebhookConfig;
  onToggleStatus: (webhook: WebhookConfig) => void;
  onEdit: (webhook: WebhookConfig) => void;
  onTest: (webhook: WebhookConfig) => void;
  onViewDeliveries: (webhook: WebhookConfig) => void;
  onDelete: (webhookId: string) => void;
}

const WebhookRow: React.FC<WebhookRowProps> = ({
  webhook,
  onToggleStatus,
  onEdit,
  onTest,
  onViewDeliveries,
  onDelete,
}) => (
  <Card>
    <CardHeader className="p-3 pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm font-medium">{webhook.name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {truncateUrl(webhook.url)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusVariants[webhook.status]}>
            {webhook.status}
          </Badge>
          <Switch
            checked={webhook.status === 'active'}
            onCheckedChange={() => onToggleStatus(webhook)}
            disabled={webhook.status === 'disabled'}
            aria-label={`Toggle ${webhook.name}`}
          />
        </div>
      </div>
    </CardHeader>
    <CardContent className="p-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{webhook.events.length} event{webhook.events.length !== 1 ? 's' : ''}</span>
          <span>Last delivery: {formatDeliveryDate(webhook.lastDeliveryAt)}</span>
          {webhook.lastDeliveryStatus !== null && (
            <Badge
              variant={webhook.lastDeliveryStatus < 400 ? 'outline' : 'destructive'}
              className="text-[10px]"
            >
              {webhook.lastDeliveryStatus}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(webhook)} title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onTest(webhook)} title="Send test">
            <Send className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDeliveries(webhook)}
            title="View deliveries"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(webhook.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default WebhookList;
