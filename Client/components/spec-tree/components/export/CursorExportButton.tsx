'use client';

/**
 * Cursor Export Button
 *
 * F2.1.1 - Cursor Rules Export
 *
 * Provides UI for exporting project specifications as Cursor-compatible rules.
 */

import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RootState } from '@/lib/store';
import {
  exportProjectToCursorRules,
  exportFeatureToCursorRules,
  exportEpicToCursorRules,
  downloadCursorRules,
  copyCursorRulesToClipboard,
  getExportStatistics,
  CursorExportOptions,
} from '../../lib/export/cursor-export';

export interface CursorExportButtonProps {
  /** Optional feature ID to export a single feature */
  featureId?: string;
  /** Optional epic ID to export an entire epic */
  epicId?: string;
  /** Custom export options */
  options?: CursorExportOptions;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional class names */
  className?: string;
  /** Callback when export completes */
  onExportComplete?: (success: boolean) => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function CursorExportButton({
  featureId,
  epicId,
  options,
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: CursorExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastAction, setLastAction] = useState<string>('');
  const state = useSelector((state: RootState) => state);

  const getExportContent = useCallback((): string => {
    if (featureId) {
      return exportFeatureToCursorRules(featureId, state, options);
    }
    if (epicId) {
      return exportEpicToCursorRules(epicId, state, options);
    }
    return exportProjectToCursorRules(state, options);
  }, [featureId, epicId, state, options]);

  const handleDownload = useCallback(async () => {
    setStatus('exporting');
    setLastAction('download');

    try {
      const content = getExportContent();
      const filename = featureId
        ? `feature-rules.mdc`
        : epicId
          ? `epic-rules.mdc`
          : `project.mdc`;

      downloadCursorRules(content, filename);
      setStatus('success');
      onExportComplete?.(true);

      // Reset status after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Cursor export failed:', error);
      setStatus('error');
      onExportComplete?.(false);

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getExportContent, featureId, epicId, onExportComplete]);

  const handleCopyToClipboard = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy');

    try {
      const content = getExportContent();
      const success = await copyCursorRulesToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }

      // Reset status after 2 seconds
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Cursor export failed:', error);
      setStatus('error');
      onExportComplete?.(false);

      // Reset status after 3 seconds
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getExportContent, onExportComplete]);

  const stats = getExportStatistics(state);

  const getButtonContent = () => {
    if (status === 'exporting') {
      return (
        <>
          <ExportIcon className="animate-spin" />
          Exporting...
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckIcon />
          {lastAction === 'copy' ? 'Copied!' : 'Downloaded!'}
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <ErrorIcon />
          Export Failed
        </>
      );
    }

    return (
      <>
        <CursorIcon />
        Cursor Export
        <ChevronDownIcon />
      </>
    );
  };

  const getExportLabel = () => {
    if (featureId) return 'feature';
    if (epicId) return 'epic';
    return 'project';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={status === 'exporting'}
        >
          {getButtonContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Export {getExportLabel()} to Cursor
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDownload}>
          <DownloadIcon />
          Download as .mdc file
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleCopyToClipboard}>
          <ClipboardIcon />
          Copy to clipboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div>Epics: {stats.totalEpics}</div>
          <div>Features: {stats.totalFeatures}</div>
          <div>Stories: {stats.totalUserStories}</div>
          <div>Tasks: {stats.totalTasks}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Icon components
function CursorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${className || ''}`}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${className || ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 mr-2 ${className || ''}`}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 mr-2 ${className || ''}`}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${className || ''}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${className || ''}`}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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
      className={`h-4 w-4 ${className || ''}`}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  );
}

export default CursorExportButton;
