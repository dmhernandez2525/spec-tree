'use client';

/**
 * Copilot Export Button
 *
 * F2.1.5 - GitHub Copilot Export
 *
 * Provides UI for exporting project specifications as GitHub Copilot-compatible formats.
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RootState } from '@/lib/store';
import {
  exportCopilotInstructions,
  exportTaskAsWRAP,
  exportUserStoryTasksAsWRAP,
  exportFeatureTasksAsWRAP,
  downloadCopilotInstructions,
  downloadWRAPIssues,
  copyCopilotToClipboard,
  getWRAPStatistics,
  CopilotExportOptions,
} from '../../lib/export/copilot-export';

export interface CopilotExportButtonProps {
  /** Optional task ID to export single task as WRAP */
  taskId?: string;
  /** Optional user story ID to export tasks as WRAP */
  userStoryId?: string;
  /** Optional feature ID to export tasks as WRAP */
  featureId?: string;
  /** Custom export options */
  options?: CopilotExportOptions;
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

export function CopilotExportButton({
  taskId,
  userStoryId,
  featureId,
  options,
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: CopilotExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastAction, setLastAction] = useState<string>('');
  const state = useSelector((state: RootState) => state);

  const getInstructionsContent = useCallback((): string => {
    return exportCopilotInstructions(state, options);
  }, [state, options]);

  const getWRAPContent = useCallback((): string => {
    if (taskId) {
      return exportTaskAsWRAP(taskId, state);
    }
    if (userStoryId) {
      return exportUserStoryTasksAsWRAP(userStoryId, state);
    }
    if (featureId) {
      return exportFeatureTasksAsWRAP(featureId, state);
    }
    // Export all tasks if no specific ID
    throw new Error('Please provide taskId, userStoryId, or featureId for WRAP export');
  }, [taskId, userStoryId, featureId, state]);

  const handleDownloadInstructions = useCallback(async () => {
    setStatus('exporting');
    setLastAction('download-instructions');

    try {
      const content = getInstructionsContent();
      downloadCopilotInstructions(content);
      setStatus('success');
      onExportComplete?.(true);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Copilot instructions export failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getInstructionsContent, onExportComplete]);

  const handleCopyInstructions = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-instructions');

    try {
      const content = getInstructionsContent();
      const success = await copyCopilotToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Copilot instructions copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getInstructionsContent, onExportComplete]);

  const handleDownloadWRAP = useCallback(async () => {
    setStatus('exporting');
    setLastAction('download-wrap');

    try {
      const content = getWRAPContent();
      downloadWRAPIssues(content);
      setStatus('success');
      onExportComplete?.(true);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('WRAP export failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getWRAPContent, onExportComplete]);

  const handleCopyWRAP = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-wrap');

    try {
      const content = getWRAPContent();
      const success = await copyCopilotToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('WRAP copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getWRAPContent, onExportComplete]);

  const stats = getWRAPStatistics(state);
  const hasWRAPTarget = taskId || userStoryId || featureId;

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
          {lastAction.includes('copy') ? 'Copied!' : 'Downloaded!'}
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
        <CopilotIcon />
        Copilot Export
        <ChevronDownIcon />
      </>
    );
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
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>GitHub Copilot Export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Project Instructions */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileIcon />
            copilot-instructions.md
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleDownloadInstructions}>
              <DownloadIcon />
              Download file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyInstructions}>
              <ClipboardIcon />
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* WRAP Format */}
        {hasWRAPTarget && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IssueIcon />
              WRAP Issue Format
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={handleDownloadWRAP}>
                <DownloadIcon />
                Download issues
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyWRAP}>
                <ClipboardIcon />
                Copy to clipboard
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div>Total Tasks: {stats.totalTasks}</div>
          <div>With Context: {stats.tasksWithEpics}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Icon components
function CopilotIcon({ className }: { className?: string }) {
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
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v6l4 2" />
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

function FileIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IssueIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
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

export default CopilotExportButton;
