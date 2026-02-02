'use client';

/**
 * Devin Export Button
 *
 * F2.2.1 - Devin Task Format Export
 *
 * Provides UI for exporting task specifications as Devin-compatible formats.
 * Devin by Cognition works best with atomic, 4-8 hour task specifications.
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import {
  DevinIcon,
  ChevronDownIcon,
  TaskIcon,
  DownloadIcon,
  ClipboardIcon,
  SpinnerIcon,
  CheckIcon,
  ErrorIcon,
} from './export-icons';
import { cn } from '@/lib/utils';

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
  onExportComplete?: (success: boolean, error?: string) => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

interface ExportState {
  status: ExportStatus;
  lastAction: string;
  errorMessage: string | null;
}

// Linear icon (specific to Devin export)
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
      className={cn('h-4 w-4 mr-2', className)}
      aria-hidden="true"
    >
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
    </svg>
  );
}

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
  const [exportState, setExportState] = useState<ExportState>({
    status: 'idle',
    lastAction: '',
    errorMessage: null,
  });

  // Only select the sow slice, not entire state - prevents unnecessary re-renders
  const sowState = useSelector((state: RootState) => state.sow);

  // Memoize the full state object for export functions that need RootState
  const fullState = useMemo(() => ({ sow: sowState } as RootState), [sowState]);

  // Memoize statistics calculation - expensive operation
  const stats = useMemo(
    () => getDevinExportStatistics(fullState),
    [fullState]
  );

  const getTasksContent = useCallback((): string => {
    if (taskId) {
      return exportTaskAsDevin(taskId, fullState, options);
    }
    if (userStoryId) {
      return exportUserStoryTasksAsDevin(userStoryId, fullState, options);
    }
    if (featureId) {
      return exportFeatureTasksAsDevin(featureId, fullState, options);
    }
    if (epicId) {
      return exportEpicTasksAsDevin(epicId, fullState, options);
    }
    return exportAllTasksAsDevin(fullState, options);
  }, [taskId, userStoryId, featureId, epicId, fullState, options]);

  const getLinearContent = useCallback((): string => {
    if (taskId) {
      return generateLinearDevinTask(taskId, fullState, options);
    }
    throw new Error('Task ID required for Linear export');
  }, [taskId, fullState, options]);

  const handleError = useCallback((error: unknown, action: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setExportState({
      status: 'error',
      lastAction: action,
      errorMessage,
    });
    onExportComplete?.(false, errorMessage);
    setTimeout(() => setExportState({ status: 'idle', lastAction: '', errorMessage: null }), 3000);
  }, [onExportComplete]);

  const handleSuccess = useCallback((action: string) => {
    setExportState({
      status: 'success',
      lastAction: action,
      errorMessage: null,
    });
    onExportComplete?.(true);
    setTimeout(() => setExportState({ status: 'idle', lastAction: '', errorMessage: null }), 2000);
  }, [onExportComplete]);

  const handleDownloadTasks = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'download-tasks', errorMessage: null });

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
      handleSuccess('download-tasks');
    } catch (error) {
      handleError(error, 'download-tasks');
    }
  }, [getTasksContent, taskId, userStoryId, featureId, epicId, handleSuccess, handleError]);

  const handleCopyTasks = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'copy-tasks', errorMessage: null });

    try {
      const content = getTasksContent();
      const success = await copyDevinTasksToClipboard(content);

      if (success) {
        handleSuccess('copy-tasks');
      } else {
        handleError(new Error('Failed to copy to clipboard'), 'copy-tasks');
      }
    } catch (error) {
      handleError(error, 'copy-tasks');
    }
  }, [getTasksContent, handleSuccess, handleError]);

  const handleCopyLinear = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'copy-linear', errorMessage: null });

    try {
      const content = getLinearContent();
      const success = await copyDevinTasksToClipboard(content);

      if (success) {
        handleSuccess('copy-linear');
      } else {
        handleError(new Error('Failed to copy to clipboard'), 'copy-linear');
      }
    } catch (error) {
      handleError(error, 'copy-linear');
    }
  }, [getLinearContent, handleSuccess, handleError]);

  const hasTaskTarget = Boolean(taskId);
  const { status, lastAction, errorMessage } = exportState;

  const getButtonContent = () => {
    if (status === 'exporting') {
      return (
        <>
          <SpinnerIcon className="animate-spin" />
          <span className="ml-2">Exporting...</span>
        </>
      );
    }

    if (status === 'success') {
      return (
        <>
          <CheckIcon />
          <span className="ml-2">{lastAction.includes('copy') ? 'Copied!' : 'Downloaded!'}</span>
        </>
      );
    }

    if (status === 'error') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center">
                <ErrorIcon />
                <span className="ml-2">Export Failed</span>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{errorMessage || 'An error occurred during export'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <>
        <DevinIcon />
        <span className="ml-2">Devin Export</span>
        <ChevronDownIcon className="ml-1" />
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
          aria-label="Export tasks for Devin"
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
            <span>Task Specification</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleDownloadTasks}>
              <DownloadIcon />
              <span>Download file</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyTasks}>
              <ClipboardIcon />
              <span>Copy to clipboard</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Linear Format */}
        {hasTaskTarget && (
          <DropdownMenuItem onClick={handleCopyLinear}>
            <LinearIcon />
            <span>Copy as Linear issue</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
          <div>Total Tasks: {stats.totalTasks}</div>
          <div>With Criteria: {stats.tasksWithAcceptanceCriteria}</div>
          <div>Avg per Story: {stats.averageTasksPerStory}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DevinExportButton;
