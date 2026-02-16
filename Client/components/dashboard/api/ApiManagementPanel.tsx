/**
 * Main API Management panel combining key management, usage, and docs.
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeyList from './ApiKeyList';
import ApiUsageDashboard from './ApiUsageDashboard';
import ApiDocsViewer from './ApiDocsViewer';

const ApiManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('keys');

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">REST API</h2>
        <p className="text-sm text-muted-foreground">
          Manage API keys, view usage analytics, and browse API documentation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4">
          <ApiKeyList />
        </TabsContent>

        <TabsContent value="usage" className="mt-4">
          <ApiUsageDashboard />
        </TabsContent>

        <TabsContent value="docs" className="mt-4">
          <ApiDocsViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiManagementPanel;
