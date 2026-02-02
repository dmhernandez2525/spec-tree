'use client';

/**
 * V0 Export Button
 *
 * F2.1.8 - v0 UI Spec Export
 *
 * Provides UI for exporting project specifications as v0-compatible UI specs.
 * v0 by Vercel excels at generating React/Next.js/Tailwind UI components.
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
  exportFeatureAsV0Spec,
  exportEpicFeaturesAsV0Specs,
  exportAllFeaturesAsV0Specs,
  generateV0Prompt,
  downloadV0Spec,
  copyV0SpecToClipboard,
  getV0ExportStatistics,
  V0ExportOptions,
} from '../../lib/export/v0-export';

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
  onExportComplete?: (success: boolean) => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';

export function V0ExportButton({
  featureId,
  epicId,
  options,
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: V0ExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastAction, setLastAction] = useState<string>('');
  const state = useSelector((state: RootState) => state);

  const getSpecContent = useCallback((): string => {
    if (featureId) {
      return exportFeatureAsV0Spec(featureId, state, options);
    }
    if (epicId) {
      return exportEpicFeaturesAsV0Specs(epicId, state, options);
    }
    return exportAllFeaturesAsV0Specs(state, options);
  }, [featureId, epicId, state, options]);

  const getPromptContent = useCallback((): string => {
    if (featureId) {
      return generateV0Prompt(featureId, state);
    }
    throw new Error('Feature ID required for v0 prompt generation');
  }, [featureId, state]);

  const handleDownloadSpec = useCallback(async () => {
    setStatus('exporting');
    setLastAction('download-spec');

    try {
      const content = getSpecContent();
      const filename = featureId
        ? `v0-spec-feature.md`
        : epicId
        ? `v0-spec-epic.md`
        : `v0-spec-all.md`;
      downloadV0Spec(content, filename);
      setStatus('success');
      onExportComplete?.(true);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('v0 spec export failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getSpecContent, featureId, epicId, onExportComplete]);

  const handleCopySpec = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-spec');

    try {
      const content = getSpecContent();
      const success = await copyV0SpecToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('v0 spec copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getSpecContent, onExportComplete]);

  const handleCopyPrompt = useCallback(async () => {
    setStatus('exporting');
    setLastAction('copy-prompt');

    try {
      const content = getPromptContent();
      const success = await copyV0SpecToClipboard(content);

      if (success) {
        setStatus('success');
        onExportComplete?.(true);
      } else {
        setStatus('error');
        onExportComplete?.(false);
      }
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error('v0 prompt copy failed:', error);
      setStatus('error');
      onExportComplete?.(false);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [getPromptContent, onExportComplete]);

  const stats = getV0ExportStatistics(state);
  const hasFeatureTarget = Boolean(featureId);

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
        <V0Icon />
        v0 Export
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
        <DropdownMenuLabel>v0 UI Spec Export</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Full UI Spec */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileIcon />
            UI Specification
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={handleDownloadSpec}>
              <DownloadIcon />
              Download file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopySpec}>
              <ClipboardIcon />
              Copy to clipboard
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Quick v0 Prompt */}
        {hasFeatureTarget && (
          <DropdownMenuItem onClick={handleCopyPrompt}>
            <PromptIcon />
            Copy v0 Prompt
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div>Features: {stats.totalFeatures}</div>
          <div>With Stories: {stats.featuresWithStories}</div>
          <div>User Stories: {stats.totalUserStories}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Icon components
function V0Icon({ className }: { className?: string }) {
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
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
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

function PromptIcon({ className }: { className?: string }) {
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
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
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

export default V0ExportButton;
