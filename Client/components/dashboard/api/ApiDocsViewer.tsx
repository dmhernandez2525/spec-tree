/**
 * Interactive API documentation viewer.
 * Renders endpoints from the OpenAPI spec with expandable details.
 */

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface PathOperation {
  method: string;
  path: string;
  summary: string;
  tags: string[];
  parameters?: Array<{ name: string; in: string; required: boolean; description: string }>;
}

const methodColors: Record<string, string> = {
  get: 'bg-green-100 text-green-700',
  post: 'bg-blue-100 text-blue-700',
  put: 'bg-amber-100 text-amber-700',
  patch: 'bg-orange-100 text-orange-700',
  delete: 'bg-red-100 text-red-700',
};

const ApiDocsViewer: React.FC = () => {
  const [endpoints, setEndpoints] = useState<PathOperation[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSpec() {
      try {
        const response = await fetch('/api/v1/docs');
        if (!response.ok) throw new Error('Failed to load spec');
        const spec = await response.json();

        const ops: PathOperation[] = [];
        const paths = spec.paths as Record<string, Record<string, Record<string, unknown>>> || {};
        for (const [path, methods] of Object.entries(paths)) {
          for (const [method, operation] of Object.entries(methods)) {
            if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
              ops.push({
                method: method.toUpperCase(),
                path,
                summary: (operation.summary as string) || '',
                tags: (operation.tags as string[]) || [],
                parameters: operation.parameters as PathOperation['parameters'],
              });
            }
          }
        }
        setEndpoints(ops);
      } catch (error) {
        logger.error('ApiDocsViewer', 'Failed to load OpenAPI spec', { error });
      } finally {
        setIsLoading(false);
      }
    }
    void loadSpec();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">API Documentation</h3>
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Loading API documentation...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">API Documentation (v1)</h3>
        <Button variant="outline" size="sm" asChild>
          <a href="/api/v1/docs" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-3 w-3" /> Raw Spec
          </a>
        </Button>
      </div>

      <div className="space-y-1">
        {endpoints.map((ep, idx) => (
          <div key={`${ep.method}-${ep.path}`} className="rounded-md border border-border">
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50"
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            >
              {expandedIndex === idx ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              <Badge
                variant="outline"
                className={cn('min-w-[60px] justify-center text-xs', methodColors[ep.method.toLowerCase()])}
              >
                {ep.method}
              </Badge>
              <code className="text-xs text-foreground">{ep.path}</code>
              <span className="ml-auto text-xs text-muted-foreground">{ep.summary}</span>
            </button>

            {expandedIndex === idx && (
              <div className="border-t border-border px-3 py-2">
                {ep.tags.length > 0 && (
                  <div className="mb-2 flex gap-1">
                    {ep.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
                {ep.parameters && ep.parameters.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Parameters</p>
                    <div className="space-y-1">
                      {ep.parameters.map((param) => (
                        <div key={param.name} className="flex items-center gap-2 text-xs">
                          <code className="font-medium">{param.name}</code>
                          <span className="text-muted-foreground">({param.in})</span>
                          {param.required && <Badge variant="destructive" className="text-[10px]">required</Badge>}
                          <span className="text-muted-foreground">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(!ep.parameters || ep.parameters.length === 0) && (
                  <p className="text-xs text-muted-foreground">No parameters.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDocsViewer;
