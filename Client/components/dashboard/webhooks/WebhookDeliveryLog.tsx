'use client';

/**
 * Delivery log viewer for a specific webhook.
 * Shows delivery history with expandable payload/response details and retry controls.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchDeliveries, retryDelivery } from '@/lib/store/webhook-slice';
import type { WebhookDelivery } from '@/types/webhook';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function statusBadgeVariant(success: boolean): 'default' | 'destructive' {
  return success ? 'default' : 'destructive';
}

// ---------------------------------------------------------------------------
// Expandable Row
// ---------------------------------------------------------------------------

interface DeliveryRowProps {
  delivery: WebhookDelivery;
  isExpanded: boolean;
  onToggle: () => void;
  onRetry: (deliveryId: string) => void;
}

const DeliveryRow: React.FC<DeliveryRowProps> = ({
  delivery,
  isExpanded,
  onToggle,
  onRetry,
}) => (
  <>
    <TableRow className="cursor-pointer" onClick={onToggle}>
      <TableCell className="w-8">
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell className="text-xs">{formatTimestamp(delivery.createdAt)}</TableCell>
      <TableCell className="text-xs">
        <code>{delivery.event}</code>
      </TableCell>
      <TableCell className="text-xs">
        {delivery.statusCode ?? 'N/A'}
      </TableCell>
      <TableCell>
        <Badge variant={statusBadgeVariant(delivery.success)} className="text-[10px]">
          {delivery.success ? 'Success' : 'Failed'}
        </Badge>
      </TableCell>
      <TableCell className="text-xs">{delivery.latencyMs}ms</TableCell>
      <TableCell className="text-xs">
        {delivery.attemptNumber}/{delivery.maxAttempts}
      </TableCell>
      <TableCell>
        {!delivery.success && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRetry(delivery.id);
            }}
            title="Retry delivery"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        )}
      </TableCell>
    </TableRow>

    {isExpanded && (
      <TableRow>
        <TableCell colSpan={8} className="bg-muted/30 p-0">
          <div className="space-y-3 p-4">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Request Payload</p>
              <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-2 text-xs">
                {JSON.stringify(delivery.payload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Response Body</p>
              <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-2 text-xs">
                {delivery.responseBody ?? 'No response body'}
              </pre>
            </div>
            {delivery.nextRetryAt && (
              <p className="text-xs text-muted-foreground">
                Next retry at: {formatTimestamp(delivery.nextRetryAt)}
              </p>
            )}
          </div>
        </TableCell>
      </TableRow>
    )}
  </>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface WebhookDeliveryLogProps {
  webhookId: string;
}

const WebhookDeliveryLog: React.FC<WebhookDeliveryLogProps> = ({ webhookId }) => {
  const dispatch = useAppDispatch();
  const { deliveries, isLoading } = useAppSelector((state) => state.webhooks);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const webhookDeliveries = deliveries.filter((d) => d.webhookId === webhookId);

  useEffect(() => {
    void dispatch(fetchDeliveries(webhookId));
  }, [dispatch, webhookId]);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const handleRetry = useCallback(
    (deliveryId: string) => {
      void dispatch(retryDelivery({ webhookId, deliveryId }));
    },
    [dispatch, webhookId]
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Delivery Log</h3>

      {isLoading ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Loading deliveries...
        </div>
      ) : webhookDeliveries.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No deliveries recorded yet. Deliveries appear after events are triggered.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs">Event</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Result</TableHead>
                <TableHead className="text-xs">Latency</TableHead>
                <TableHead className="text-xs">Attempt</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhookDeliveries.map((delivery) => (
                <DeliveryRow
                  key={delivery.id}
                  delivery={delivery}
                  isExpanded={expandedId === delivery.id}
                  onToggle={() => handleToggle(delivery.id)}
                  onRetry={handleRetry}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default WebhookDeliveryLog;
