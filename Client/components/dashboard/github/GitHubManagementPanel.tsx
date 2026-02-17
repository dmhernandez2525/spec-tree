'use client';

/**
 * Top-level tabbed panel for the GitHub integration.
 * Organises Connection, Sync, and Issues sub-panels under a single view.
 */

import React, { useState } from 'react';
import { Github, FolderSync, CircleDot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GitHubConnectButton from './GitHubConnectButton';
import RepoSelector from './RepoSelector';
import SyncConfigPanel from './SyncConfigPanel';
import IssueLinkPanel from './IssueLinkPanel';
import type { GitHubRepo } from '@/types/github';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GitHubManagementPanelProps {
  specNodeId?: string;
}

const GitHubManagementPanel: React.FC<GitHubManagementPanelProps> = ({
  specNodeId,
}) => {
  const [activeTab, setActiveTab] = useState('connection');

  const handleRepoSelect = (_repo: GitHubRepo) => {
    // Navigate to the sync tab after selecting a repo so the user can
    // configure the sync settings for the chosen repository.
    setActiveTab('sync');
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">GitHub Integration</h2>
        <p className="text-sm text-muted-foreground">
          Connect repositories, sync spec trees, and link issues.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="connection">
            <Github className="mr-1.5 h-3.5 w-3.5" />
            Connection
          </TabsTrigger>
          <TabsTrigger value="sync">
            <FolderSync className="mr-1.5 h-3.5 w-3.5" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="issues">
            <CircleDot className="mr-1.5 h-3.5 w-3.5" />
            Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connection" className="mt-4 space-y-4">
          <GitHubConnectButton />
          <RepoSelector onSelect={handleRepoSelect} />
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <SyncConfigPanel />
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <IssueLinkPanel specNodeId={specNodeId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GitHubManagementPanel;
