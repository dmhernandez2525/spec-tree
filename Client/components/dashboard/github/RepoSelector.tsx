'use client';

/**
 * Repository selection component.
 * Fetches available repos, provides search/filter by org, and emits the chosen repo.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Search, GitBranch, Lock, Globe, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { fetchRepos } from '@/lib/store/github-slice';
import type { GitHubRepo } from '@/types/github';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RepoSelectorProps {
  onSelect: (repo: GitHubRepo) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uniqueOwners(repos: GitHubRepo[]): string[] {
  const owners = new Set(repos.map((r) => r.owner));
  return Array.from(owners).sort();
}

// ---------------------------------------------------------------------------
// Repo Row
// ---------------------------------------------------------------------------

interface RepoRowProps {
  repo: GitHubRepo;
  onSelect: (repo: GitHubRepo) => void;
}

const RepoRow: React.FC<RepoRowProps> = ({ repo, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(repo)}
    className="flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
  >
    <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="truncate text-sm font-medium">{repo.fullName}</span>
        {repo.private ? (
          <Lock className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Globe className="h-3 w-3 text-muted-foreground" />
        )}
      </div>
      {repo.description && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {repo.description}
        </p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {repo.defaultBranch}
        </Badge>
        <span className="text-[10px] text-muted-foreground">{repo.owner}</span>
      </div>
    </div>
  </button>
);

// ---------------------------------------------------------------------------
// Org Filter Tabs
// ---------------------------------------------------------------------------

interface OrgTabsProps {
  owners: string[];
  selected: string;
  onChange: (owner: string) => void;
}

const OrgTabs: React.FC<OrgTabsProps> = ({ owners, selected, onChange }) => (
  <div className="flex flex-wrap gap-1">
    <Button
      variant={selected === 'all' ? 'default' : 'outline'}
      size="sm"
      className="h-7 text-xs"
      onClick={() => onChange('all')}
    >
      All
    </Button>
    {owners.map((owner) => (
      <Button
        key={owner}
        variant={selected === owner ? 'default' : 'outline'}
        size="sm"
        className="h-7 text-xs"
        onClick={() => onChange(owner)}
      >
        {owner}
      </Button>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const RepoSelector: React.FC<RepoSelectorProps> = ({ onSelect }) => {
  const dispatch = useAppDispatch();
  const repos = useAppSelector((state) => state.github.repos);
  const isLoading = useAppSelector((state) => state.github.isLoading);
  const authStatus = useAppSelector((state) => state.github.authStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');

  useEffect(() => {
    if (authStatus === 'connected') {
      void dispatch(fetchRepos());
    }
  }, [dispatch, authStatus]);

  const owners = useMemo(() => uniqueOwners(repos), [repos]);

  const filteredRepos = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return repos.filter((repo) => {
      const matchesOwner = selectedOwner === 'all' || repo.owner === selectedOwner;
      const matchesSearch =
        repo.fullName.toLowerCase().includes(query) ||
        repo.description.toLowerCase().includes(query);
      return matchesOwner && matchesSearch;
    });
  }, [repos, searchQuery, selectedOwner]);

  const handleOwnerChange = useCallback((owner: string) => {
    setSelectedOwner(owner);
  }, []);

  if (authStatus !== 'connected') {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Connect your GitHub account to browse repositories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="text-sm">Select Repository</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>

        {/* Org filter tabs */}
        {owners.length > 1 && (
          <OrgTabs owners={owners} selected={selectedOwner} onChange={handleOwnerChange} />
        )}

        {/* Repo list */}
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading repositories...
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            {repos.length === 0
              ? 'No repositories found. Make sure your token has the required scopes.'
              : 'No repositories match your search.'}
          </div>
        ) : (
          <ScrollArea className="h-[280px]">
            <div className="space-y-1.5">
              {filteredRepos.map((repo) => (
                <RepoRow key={repo.id} repo={repo} onSelect={onSelect} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RepoSelector;
