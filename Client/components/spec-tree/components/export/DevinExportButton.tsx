'use client';

/**
 * Devin Export Button
 *
 * F2.2.1 - Devin Task Format Export
 *
 * Provides UI for exporting task specifications as Devin-compatible formats.
 * Devin by Cognition works best with atomic, 4-8 hour task specifications.
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
  exportTaskAsDevin,
  exportUserStoryTasksAsDevin,
  exportFeatureTasksAsDevin,
  exportEpicTasksAsDevin,
  exportAllTasksAsDevin,
  generateLinearDevinTask,
  downloadDevinTasks,
  copyDevinTasksToClipboard,
  getDevinExportStatistics,
  DevinExportOptions,
} from '../../lib/export/devin-export';

export interface DevinExportButtonProps {
  /** Optional task ID to export single task */
  taskId?: string;
  /** Optional user story ID to export all tasks in the story */
  userStoryId?: string;
  /** Optional feature ID to export all tasks in the feature */
  featureId?: string;
  /** Optional epic ID to export all tasks in the epic */
  epicId?: string;
  /** Custom export options */
  options?: DevinExportOptions;
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

export function DevinExportButton({
  taskId,
  userStoryId,
  featureId,
  epicId,
  options,
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: DevinExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastAction, setLastAction] = useState<string>('');
  const state = useSelector((state: RootState) => state);

  const getTasksContent = useCallback((): string => {
    if (taskId) {
      return exportTaskAsDevin(taskId, state, options);
    }
    if (userStoryId) {
      return exportUserStoryTasksAsDevin(userStoryId, state, options);
    }
    if (featureId) {
      return exportFeatureTasksAsDevin(featureId, state, options);
    }
    if (epicId) {
      return exportEpicTasksAsDevin(epicId, state, options);
    }
    return exportAllTasksAsDevin(state, options);
  }, [taskId, userStoryId, featureId, epicId, state, options]);

  const getLinearContent = useCallback((): string => {
    if (taskId) {
      return generateLinearDevinTask(taskId, state, options);
    }
    throw new Error('Task ID required for Linear export');
  }, [taskId, state, options]);

  const handleDownloadTasks = useCallback(async () => {
    setStatus('exporting');
    setLastAction('download-tasks');

    try {
      const content = getTasksContent();
      const filename = taskId
        ? `devin-task.md`
        : userStoryId
        ? `devin-story-tasks.md`
        : featureId
        ? `devin-feature-tasks.md`
        : epicId
        ? `devin-epic-tasks.md`
        : `devin-all-tasks.md`;
      downloadDevinTasks(content, filename);
      setStatus('success');
      onExportComplete?.(true);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Devin export failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getTasksContent, taskId, userStoryId, featureId, epicId, onExportComplete]);

  const handleCopyTasks = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-tasks');

    try {
      const content = getTasksContent();
      const success = await copyDevinTasksToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Devin copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getTasksContent, onExportComplete]);

  const handleCopyLinear = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-linear');

    try {
      const content = getLinearContent();
      const success = await copyDevinTasksToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('Linear copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getLinearContent, onExportComplete]);

  const stats = getDevinExportStatistics(state);
  const hasTaskTarget = Boolean(taskId);

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
        <DevinIcon />
        Devin Export
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
        <DropdownMenuLabel>Devin Task Export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Task Specification */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <TaskIcon />
            Task Specification
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleDownloadTasks}>
              <DownloadIcon />
              Download file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyTasks}>
              <ClipboardIcon />
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Linear Format */}
        {hasTaskTarget && (
          <DropdownMenuItem onClick={handleCopyLinear}>
            <LinearIcon />
            Copy as Linear issue
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div>Total Tasks: {stats.totalTasks}</div>
          <div>With Criteria: {stats.tasksWithAcceptanceCriteria}</div>
          <div>Avg per Story: {stats.averageTasksPerStory}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Icon components
function DevinIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v2" />
      <path d="M15 1v2" />
      <path d="M9 21v2" />
      <path d="M15 21v2" />
      <path d="M1 9h2" />
      <path d="M1 15h2" />
      <path d="M21 9h2" />
      <path d="M21 15h2" />
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

function TaskIcon({ className }: { className?: string }) {
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
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function LinearIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
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

export default DevinExportButton;
