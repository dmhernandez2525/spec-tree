'use client';

/**
 * Error Fallback
 *
 * F1.1.6 - Error Boundary Implementation
 *
 * A user-friendly fallback UI displayed when an error is caught.
 * Features friendly messaging, retry functionality, and optional error reporting.
 */

import React, { ErrorInfo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** React error info with component stack */
  errorInfo?: ErrorInfo | null;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
  /** Whether to show stack trace (usually only in development) */
  showStackTrace?: boolean;
  /** Whether to enable error reporting */
  enableReporting?: boolean;
  /** Custom report error handler */
  onReportError?: () => void;
  /** Section name for context */
  sectionName?: string;
}

/**
 * Default error fallback UI
 */
export function ErrorFallback({
  error,
  errorInfo,
  resetErrorBoundary,
  showStackTrace = false,
  enableReporting = true,
  onReportError,
  sectionName,
}: ErrorFallbackProps) {
  const [isStackOpen, setIsStackOpen] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const handleReport = () => {
    if (onReportError) {
      onReportError();
    } else {
      // Default: open GitHub issues page
      const issueUrl = createGitHubIssueUrl(error, errorInfo, sectionName);
      window.open(issueUrl, '_blank');
    }
    setIsReported(true);
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ErrorIcon className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            {sectionName
              ? `An error occurred in the ${sectionName} section.`
              : 'An unexpected error has occurred.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <p className="font-medium">Error: {error.message || 'Unknown error'}</p>
          </div>

          {showStackTrace && (error.stack || errorInfo?.componentStack) && (
            <Collapsible open={isStackOpen} onOpenChange={setIsStackOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <ChevronIcon className={`h-4 w-4 transition-transform ${isStackOpen ? 'rotate-90' : ''}`} />
                  {isStackOpen ? 'Hide' : 'Show'} technical details
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-3 text-xs font-mono">
                  {error.stack && (
                    <div className="mb-4">
                      <p className="mb-1 font-semibold text-muted-foreground">Stack Trace:</p>
                      <pre className="whitespace-pre-wrap break-all">{error.stack}</pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="mb-1 font-semibold text-muted-foreground">Component Stack:</p>
                      <pre className="whitespace-pre-wrap break-all">{errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={resetErrorBoundary} className="w-full sm:w-auto">
            <RefreshIcon className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            Reload page
          </Button>
          {enableReporting && (
            <Button
              variant="secondary"
              onClick={handleReport}
              disabled={isReported}
              className="w-full sm:w-auto"
            >
              <ReportIcon className="mr-2 h-4 w-4" />
              {isReported ? 'Reported' : 'Report issue'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Minimal error fallback for less critical sections
 */
export function MinimalErrorFallback({
  error: _error,
  resetErrorBoundary,
  sectionName,
}: Pick<ErrorFallbackProps, 'error' | 'resetErrorBoundary' | 'sectionName'>) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
      <p className="text-muted-foreground">
        {sectionName ? `Failed to load ${sectionName}` : 'Something went wrong'}
      </p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

/**
 * Inline error fallback for small components
 */
export function InlineErrorFallback({
  resetErrorBoundary,
}: Pick<ErrorFallbackProps, 'resetErrorBoundary'>) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-destructive">
      <ErrorIcon className="h-4 w-4" />
      Error
      <button
        onClick={resetErrorBoundary}
        className="underline hover:no-underline"
      >
        Retry
      </button>
    </span>
  );
}

/**
 * Create GitHub issue URL with error details
 */
function createGitHubIssueUrl(
  error: Error,
  errorInfo?: ErrorInfo | null,
  sectionName?: string
): string {
  const title = encodeURIComponent(`[Bug] ${error.message || 'Unknown error'}`);
  const body = encodeURIComponent(`
## Description
An error occurred${sectionName ? ` in the ${sectionName} section` : ''}.

## Error Message
\`\`\`
${error.message}
\`\`\`

## Stack Trace
\`\`\`
${error.stack || 'Not available'}
\`\`\`

## Browser/Environment
- URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
- User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
- Time: ${new Date().toISOString()}

## Steps to Reproduce
1. [Describe what you were doing]
2. [When the error occurred]

## Additional Context
[Add any other context about the problem here]
  `.trim());

  // Replace with actual repository URL
  return `https://github.com/dmhernandez2525/spec-tree/issues/new?title=${title}&body=${body}&labels=bug`;
}

// Icon components
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function ReloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function ReportIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

export default ErrorFallback;
