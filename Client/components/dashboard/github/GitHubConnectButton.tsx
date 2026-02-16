'use client';

/**
 * GitHub OAuth connection button.
 * Shows the current connection status and handles the OAuth redirect flow.
 */

import React, { useCallback, useState } from 'react';
import { Github, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/use-store';
import { disconnectGitHub } from '@/lib/store/github-slice';
import type { GitHubAuthStatus } from '@/types/github';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusConfig: Record<
  GitHubAuthStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }
> = {
  connected: {
    label: 'Connected',
    variant: 'default',
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  disconnected: {
    label: 'Not Connected',
    variant: 'secondary',
    icon: <Github className="h-4 w-4 text-muted-foreground" />,
  },
  expired: {
    label: 'Token Expired',
    variant: 'destructive',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const GitHubConnectButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.github.authStatus);
  const isLoading = useAppSelector((state) => state.github.isLoading);
  const error = useAppSelector((state) => state.github.error);

  const [isRedirecting, setIsRedirecting] = useState(false);

  const config = statusConfig[authStatus];

  const handleConnect = useCallback(() => {
    setIsRedirecting(true);
    // Redirect to the internal OAuth initiation endpoint which builds
    // the GitHub authorization URL server-side (keeping the client secret safe).
    window.location.href = '/api/v1/github/auth';
  }, []);

  const handleDisconnect = useCallback(() => {
    void dispatch(disconnectGitHub());
  }, [dispatch]);

  const busy = isLoading || isRedirecting;

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className="text-sm font-medium">GitHub</p>
            <div className="flex items-center gap-2">
              <Badge variant={config.variant} className="text-[10px]">
                {config.label}
              </Badge>
              {authStatus === 'connected' && (
                <span className="text-xs text-muted-foreground">
                  Authenticated via OAuth
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {authStatus === 'connected' && (
            <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={busy}>
              Disconnect
            </Button>
          )}

          {authStatus === 'disconnected' && (
            <Button size="sm" onClick={handleConnect} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="mr-1.5 h-3.5 w-3.5" />
                  Connect GitHub
                </>
              )}
            </Button>
          )}

          {authStatus === 'expired' && (
            <Button size="sm" variant="outline" onClick={handleConnect} disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Reconnecting...
                </>
              ) : (
                'Reconnect'
              )}
            </Button>
          )}
        </div>
      </CardContent>

      {error && (
        <div className="border-t px-4 py-2 text-xs text-destructive">{error}</div>
      )}
    </Card>
  );
};

export default GitHubConnectButton;
