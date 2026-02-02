'use client';

/**
 * V0 Export Button
 *
 * F2.1.8 - v0 UI Spec Export
 *
 * Provides UI for exporting project specifications as v0-compatible UI specs.
 * v0 by Vercel excels at generating React/Next.js/Tailwind UI components.
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
  exportFeatureAsV0Spec,
  exportEpicFeaturesAsV0Specs,
  exportAllFeaturesAsV0Specs,
  generateV0Prompt,
  downloadV0Spec,
  copyV0SpecToClipboard,
  getV0ExportStatistics,
  V0ExportOptions,
} from '../../lib/export/v0-export';
import {
  V0Icon,
  ChevronDownIcon,
  FileIcon,
  PromptIcon,
  DownloadIcon,
  ClipboardIcon,
  SpinnerIcon,
  CheckIcon,
  ErrorIcon,
} from './export-icons';

export interface V0ExportButtonProps {
  /** Optional feature ID to export single feature */
  featureId?: string;
  /** Optional epic ID to export all features in the epic */
  epicId?: string;
  /** Custom export options */
  options?: V0ExportOptions;
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

export function V0ExportButton({
  featureId,
  epicId,
  options,
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: V0ExportButtonProps) {
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
    () => getV0ExportStatistics(fullState),
    [fullState]
  );

  const getSpecContent = useCallback((): string => {
    if (featureId) {
      return exportFeatureAsV0Spec(featureId, fullState, options);
    }
    if (epicId) {
      return exportEpicFeaturesAsV0Specs(epicId, fullState, options);
    }
    return exportAllFeaturesAsV0Specs(fullState, options);
  }, [featureId, epicId, fullState, options]);

  const getPromptContent = useCallback((): string => {
    if (featureId) {
      return generateV0Prompt(featureId, fullState);
    }
    throw new Error('Feature ID required for v0 prompt generation');
  }, [featureId, fullState]);

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

  const handleDownloadSpec = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'download-spec', errorMessage: null });

    try {
      const content = getSpecContent();
      const filename = featureId
        ? `v0-spec-feature.md`
        : epicId
        ? `v0-spec-epic.md`
        : `v0-spec-all.md`;
      downloadV0Spec(content, filename);
      handleSuccess('download-spec');
    } catch (error) {
      handleError(error, 'download-spec');
    }
  }, [getSpecContent, featureId, epicId, handleSuccess, handleError]);

  const handleCopySpec = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'copy-spec', errorMessage: null });

    try {
      const content = getSpecContent();
      const success = await copyV0SpecToClipboard(content);

      if (success) {
        handleSuccess('copy-spec');
      } else {
        handleError(new Error('Failed to copy to clipboard'), 'copy-spec');
      }
    } catch (error) {
      handleError(error, 'copy-spec');
    }
  }, [getSpecContent, handleSuccess, handleError]);

  const handleCopyPrompt = useCallback(async () => {
    setExportState({ status: 'exporting', lastAction: 'copy-prompt', errorMessage: null });

    try {
      const content = getPromptContent();
      const success = await copyV0SpecToClipboard(content);

      if (success) {
        handleSuccess('copy-prompt');
      } else {
        handleError(new Error('Failed to copy to clipboard'), 'copy-prompt');
      }
    } catch (error) {
      handleError(error, 'copy-prompt');
    }
  }, [getPromptContent, handleSuccess, handleError]);

  const hasFeatureTarget = Boolean(featureId);
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
        <V0Icon />
        <span className="ml-2">v0 Export</span>
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
          aria-label="Export to v0 UI specification"
        >
          {getButtonContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>v0 UI Spec Export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Full UI Spec */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileIcon />
            <span>UI Specification</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleDownloadSpec}>
              <DownloadIcon />
              <span>Download file</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopySpec}>
              <ClipboardIcon />
              <span>Copy to clipboard</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Quick v0 Prompt */}
        {hasFeatureTarget && (
          <DropdownMenuItem onClick={handleCopyPrompt}>
            <PromptIcon />
            <span>Copy v0 Prompt</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
          <div>Features: {stats.totalFeatures}</div>
          <div>With Stories: {stats.featuresWithStories}</div>
          <div>User Stories: {stats.totalUserStories}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default V0ExportButton;
