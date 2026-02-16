'use client';

/**
 * Issue linking panel.
 * Displays linked GitHub issues and provides controls to link, create, and unlink issues.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Link2,
  Unlink,
  Plus,
  CircleDot,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import {
  fetchIssueLinks,
  linkIssue,
  unlinkIssue,
  createIssueFromSpec,
} from '@/lib/store/github-slice';
import type { GitHubIssueLink } from '@/types/github';

// ---------------------------------------------------------------------------
// Issue Row
// ---------------------------------------------------------------------------

interface IssueRowProps {
  issue: GitHubIssueLink;
  onUnlink: (id: string) => void;
}

const IssueRow: React.FC<IssueRowProps> = ({ issue, onUnlink }) => (
  <div className="flex items-center justify-between rounded-md border px-3 py-2">
    <div className="flex items-center gap-3">
      {issue.issueState === 'open' ? (
        <CircleDot className="h-4 w-4 text-green-500" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-purple-500" />
      )}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            #{issue.issueNumber} {issue.issueTitle}
          </span>
          <Badge
            variant={issue.issueState === 'open' ? 'default' : 'secondary'}
            className="text-[10px]"
          >
            {issue.issueState}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{issue.repoFullName}</p>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onUnlink(issue.id)}
      title="Unlink issue"
    >
      <Unlink className="h-3.5 w-3.5 text-destructive" />
    </Button>
  </div>
);

// ---------------------------------------------------------------------------
// Link Issue Dialog
// ---------------------------------------------------------------------------

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLink: (repoFullName: string, issueNumber: number) => void;
  isLoading: boolean;
}

const LinkDialog: React.FC<LinkDialogProps> = ({ open, onOpenChange, onLink, isLoading }) => {
  const [repoFullName, setRepoFullName] = useState('');
  const [issueNumber, setIssueNumber] = useState('');

  const handleSubmit = useCallback(() => {
    const num = parseInt(issueNumber, 10);
    if (!repoFullName.trim() || isNaN(num) || num <= 0) return;
    onLink(repoFullName.trim(), num);
    setRepoFullName('');
    setIssueNumber('');
  }, [repoFullName, issueNumber, onLink]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link GitHub Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Repository (owner/name)
            </label>
            <Input
              placeholder="owner/repo"
              value={repoFullName}
              onChange={(e) => setRepoFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Issue Number
            </label>
            <Input
              type="number"
              placeholder="42"
              min={1}
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Linking...
              </>
            ) : (
              <>
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Link Issue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface IssueLinkPanelProps {
  specNodeId?: string;
  specNodeType?: string;
}

const IssueLinkPanel: React.FC<IssueLinkPanelProps> = ({ specNodeId, specNodeType = 'task' }) => {
  const dispatch = useAppDispatch();
  const issueLinks = useAppSelector((state) => state.github.issueLinks);
  const isLoading = useAppSelector((state) => state.github.isLoading);
  const error = useAppSelector((state) => state.github.error);
  const authStatus = useAppSelector((state) => state.github.authStatus);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  useEffect(() => {
    if (authStatus === 'connected' && specNodeId) {
      void dispatch(fetchIssueLinks(specNodeId));
    }
  }, [dispatch, authStatus, specNodeId]);

  const handleLink = useCallback(
    (repoFullName: string, issueNumber: number) => {
      if (!specNodeId) return;
      void dispatch(linkIssue({ specNodeId, specNodeType, repoFullName, issueNumber }));
      setLinkDialogOpen(false);
    },
    [dispatch, specNodeId],
  );

  const handleUnlink = useCallback(
    (linkId: string) => {
      void dispatch(unlinkIssue(linkId));
    },
    [dispatch],
  );

  const handleCreate = useCallback(() => {
    if (!specNodeId) return;
    void dispatch(createIssueFromSpec({ specNodeId, specNodeType }));
  }, [dispatch, specNodeId, specNodeType]);

  if (authStatus !== 'connected') {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Connect your GitHub account to link issues.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Linked Issues</h3>
          <p className="text-xs text-muted-foreground">
            Connect spec nodes to GitHub issues for traceability.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleCreate} disabled={!specNodeId}>
            <Plus className="mr-1 h-4 w-4" /> Create Issue
          </Button>
          <Button size="sm" onClick={() => setLinkDialogOpen(true)}>
            <Link2 className="mr-1 h-4 w-4" /> Link Issue
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading linked issues...
        </div>
      ) : issueLinks.length === 0 ? (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No issues linked yet. Link an existing issue or create a new one from this spec node.
        </div>
      ) : (
        <div className="space-y-1.5">
          {issueLinks.map((issue) => (
            <IssueRow key={issue.id} issue={issue} onUnlink={handleUnlink} />
          ))}
        </div>
      )}

      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onLink={handleLink}
        isLoading={isLoading}
      />
    </div>
  );
};

export default IssueLinkPanel;
