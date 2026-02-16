'use client';

/**
 * Webhook creation and editing form.
 * Supports template pre-fill, event multi-select, and secret display on creation.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch } from '@/lib/hooks/use-store';
import { createWebhook, updateWebhook } from '@/lib/store/webhook-slice';
import type {
  WebhookConfig,
  WebhookEvent,
  WebhookService,
  CreateWebhookRequest,
} from '@/types/webhook';
import {
  ALL_EVENTS,
  PAYLOAD_FIELDS,
  TEMPLATE_PRESETS,
  validateWebhookForm,
  type ValidationErrors,
} from './webhook-form-helpers';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface WebhookFormProps {
  webhook?: WebhookConfig;
  onSubmit: () => void;
  onCancel: () => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ webhook, onSubmit, onCancel }) => {
  const dispatch = useAppDispatch();
  const isEditing = !!webhook;

  const [name, setName] = useState(webhook?.name ?? '');
  const [url, setUrl] = useState(webhook?.url ?? 'https://');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>(webhook?.events ?? []);
  const [selectedFields, setSelectedFields] = useState<string[]>(webhook?.payloadFields ?? []);
  const [template, setTemplate] = useState<WebhookService>('custom');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateChange = useCallback((value: string) => {
    const preset = TEMPLATE_PRESETS.find((t) => t.service === value);
    if (!preset) return;
    setTemplate(preset.service);
    setUrl(preset.urlPattern);
  }, []);

  const toggleEvent = useCallback((event: WebhookEvent) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }, []);

  const toggleField = useCallback((field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  }, []);

  const selectAllEvents = useCallback(() => {
    setSelectedEvents(
      selectedEvents.length === ALL_EVENTS.length ? [] : [...ALL_EVENTS]
    );
  }, [selectedEvents.length]);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = validateWebhookForm(name, url, selectedEvents);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      if (isEditing && webhook) {
        await dispatch(
          updateWebhook({
            id: webhook.id,
            name: name.trim(),
            url,
            events: selectedEvents,
            payloadFields: selectedFields.length > 0 ? selectedFields : undefined,
          })
        );
        onSubmit();
      } else {
        const payload: CreateWebhookRequest = {
          name: name.trim(),
          url,
          events: selectedEvents,
          payloadFields: selectedFields.length > 0 ? selectedFields : undefined,
        };
        const result = await dispatch(createWebhook(payload));
        if (createWebhook.fulfilled.match(result)) {
          const secret = (result.payload as { secret?: string }).secret;
          if (secret) {
            setCreatedSecret(secret);
          } else {
            onSubmit();
          }
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, isEditing, name, url, selectedEvents, selectedFields, webhook, onSubmit]);

  const handleCopySecret = useCallback(async () => {
    if (!createdSecret) return;
    await navigator.clipboard.writeText(createdSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [createdSecret]);

  // After creation, show the signing secret
  if (createdSecret) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Webhook Created</h3>
        <p className="text-xs text-muted-foreground">
          Copy this signing secret now. It will not be shown again.
        </p>
        <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
          <code className="flex-1 break-all text-sm">{createdSecret}</code>
          <Button variant="ghost" size="sm" onClick={handleCopySecret}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <Button onClick={onSubmit}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">
        {isEditing ? 'Edit Webhook' : 'Create Webhook'}
      </h3>

      {/* Template selector */}
      {!isEditing && (
        <div className="space-y-1.5">
          <Label>Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_PRESETS.map((preset) => (
                <SelectItem key={preset.service} value={preset.service}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {TEMPLATE_PRESETS.find((t) => t.service === template)?.description}
          </p>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="webhook-name">Name</Label>
        <Input
          id="webhook-name"
          placeholder="e.g., Production Slack Notifications"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label htmlFor="webhook-url">URL</Label>
        <Input
          id="webhook-url"
          type="url"
          placeholder="https://example.com/webhook"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
      </div>

      {/* Events */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Events</Label>
          <Button variant="ghost" size="sm" className="text-xs" onClick={selectAllEvents}>
            {selectedEvents.length === ALL_EVENTS.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_EVENTS.map((event) => (
            <label
              key={event}
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedEvents.includes(event)}
                onCheckedChange={() => toggleEvent(event)}
              />
              {event}
            </label>
          ))}
        </div>
        {errors.events && <p className="text-xs text-destructive">{errors.events}</p>}
      </div>

      {/* Payload fields filter */}
      <div className="space-y-2">
        <Label>Payload Fields (optional)</Label>
        <p className="text-xs text-muted-foreground">
          Leave empty to include all fields. Select specific fields to filter the payload.
        </p>
        <div className="flex flex-wrap gap-2">
          {PAYLOAD_FIELDS.map((field) => (
            <label
              key={field}
              className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedFields.includes(field)}
                onCheckedChange={() => toggleField(field)}
              />
              {field}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || hasErrors}>
          {isEditing ? 'Save Changes' : 'Create Webhook'}
        </Button>
      </div>
    </div>
  );
};

export default WebhookForm;
