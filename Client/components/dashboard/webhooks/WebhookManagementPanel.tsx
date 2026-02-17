'use client';

/**
 * Tabbed webhook management panel.
 * Provides access to the webhook list and built-in template browser.
 */

import React, { useState, useCallback } from 'react';
import { Webhook, LayoutTemplate } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WebhookService } from '@/types/webhook';
import WebhookList from './WebhookList';

// ---------------------------------------------------------------------------
// Template data
// ---------------------------------------------------------------------------

interface TemplateInfo {
  service: WebhookService;
  name: string;
  description: string;
  icon: string;
}

const BUILT_IN_TEMPLATES: TemplateInfo[] = [
  {
    service: 'slack',
    name: 'Slack',
    description:
      'Receive SpecTree event notifications directly in your Slack channels. Uses Slack Incoming Webhooks for rich message formatting with event details, links, and action buttons.',
    icon: '#',
  },
  {
    service: 'discord',
    name: 'Discord',
    description:
      'Post SpecTree events to Discord channels via webhook integration. Supports embedded messages with color-coded event types and structured field layouts.',
    icon: 'D',
  },
  {
    service: 'zapier',
    name: 'Zapier',
    description:
      'Connect SpecTree to 5,000+ apps through Zapier. Trigger Zaps on spec creation, updates, exports, and more. Build custom automation workflows without code.',
    icon: 'Z',
  },
  {
    service: 'make',
    name: 'Make (Integromat)',
    description:
      'Integrate SpecTree with Make scenarios for advanced multi-step automations. Supports conditional routing, data transformation, and connections to hundreds of services.',
    icon: 'M',
  },
];

// ---------------------------------------------------------------------------
// Template Browser
// ---------------------------------------------------------------------------

interface TemplateBrowserProps {
  onUseTemplate: (service: WebhookService) => void;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ onUseTemplate }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold text-foreground">Integration Templates</h3>
      <p className="text-xs text-muted-foreground">
        Pre-configured templates for popular services. Select one to auto-fill URL patterns and headers.
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      {BUILT_IN_TEMPLATES.map((tmpl) => (
        <Card key={tmpl.service}>
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
                {tmpl.icon}
              </div>
              <CardTitle className="text-sm">{tmpl.name}</CardTitle>
              <Badge variant="outline" className="ml-auto text-[10px]">
                Template
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="mb-3 text-xs text-muted-foreground">{tmpl.description}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUseTemplate(tmpl.service)}
            >
              Use Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

const WebhookManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('webhooks');

  const handleUseTemplate = useCallback((_service: WebhookService) => {
    // Switch to the webhooks tab so the user can create with the template.
    // The WebhookList component opens the create form, which has a template selector.
    setActiveTab('webhooks');
  }, []);

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Webhooks</h2>
        <p className="text-sm text-muted-foreground">
          Manage webhook subscriptions, view delivery logs, and browse integration templates.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="webhooks">
            <Webhook className="mr-1.5 h-3.5 w-3.5" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="templates">
            <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="mt-4">
          <WebhookList />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateBrowser onUseTemplate={handleUseTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookManagementPanel;
