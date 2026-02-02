'use client';

/**
 * JSON Export Button
 *
 * F1.1.11 - JSON Import/Export UI
 *
 * Provides UI for exporting project specifications as JSON, CSV, or Markdown.
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
  exportToJSON,
  exportToCSV,
  exportToMarkdown,
  downloadFile,
} from '../../lib/utils/import-export';

export interface JsonExportButtonProps {
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional class names */
  className?: string;
  /** Callback when export completes */
  onExportComplete?: (format: string, success: boolean) => void;
}

type ExportStatus = 'idle' | 'exporting' | 'success' | 'error';
type ExportFormat = 'json' | 'csv' | 'markdown';

export function JsonExportButton({
  variant = 'outline',
  size = 'default',
  className,
  onExportComplete,
}: JsonExportButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [lastFormat, setLastFormat] = useState<ExportFormat>('json');
  const state = useSelector((state: RootState) => state);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      setStatus('exporting');
      setLastFormat(format);

      try {
        let content: string;
        let filename: string;
        let mimeType: string;

        switch (format) {
          case 'json':
            content = exportToJSON(state);
            filename = `spec-tree-export-${Date.now()}.json`;
            mimeType = 'application/json';
            break;
          case 'csv':
            content = exportToCSV(state);
            filename = `spec-tree-export-${Date.now()}.csv`;
            mimeType = 'text/csv';
            break;
          case 'markdown':
            content = exportToMarkdown(state);
            filename = `spec-tree-export-${Date.now()}.md`;
            mimeType = 'text/markdown';
            break;
        }

        downloadFile(content, filename, mimeType);
        setStatus('success');
        onExportComplete?.(format, true);

        // Reset status after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Export failed:', error);
        setStatus('error');
        onExportComplete?.(format, false);

        // Reset status after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      }
    },
    [state, onExportComplete]
  );

  const handleCopyToClipboard = useCallback(
    async (format: ExportFormat) => {
      setStatus('exporting');
      setLastFormat(format);

      try {
        let content: string;

        switch (format) {
          case 'json':
            content = exportToJSON(state);
            break;
          case 'csv':
            content = exportToCSV(state);
            break;
          case 'markdown':
            content = exportToMarkdown(state);
            break;
        }

        await navigator.clipboard.writeText(content);
        setStatus('success');
        onExportComplete?.(format, true);

        // Reset status after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Copy to clipboard failed:', error);
        setStatus('error');
        onExportComplete?.(format, false);

        // Reset status after 3 seconds
        setTimeout(() => setStatus('idle'), 3000);
      }
    },
    [state, onExportComplete]
  );

  // Get statistics for display
  const sowState = state.sow;
  const stats = {
    epics: Object.values(sowState.epics || {}).filter(Boolean).length,
    features: Object.values(sowState.features || {}).filter(Boolean).length,
    stories: Object.values(sowState.userStories || {}).filter(Boolean).length,
    tasks: Object.values(sowState.tasks || {}).filter(Boolean).length,
  };

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
          Exported {lastFormat.toUpperCase()}!
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
        <DownloadIcon />
        Export
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Project</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJsonIcon />
          Download as JSON
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleCopyToClipboard('json')}>
          <ClipboardIcon />
          Copy JSON to Clipboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheetIcon />
          Download as CSV
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          <FileTextIcon />
          Download as Markdown
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <div>Epics: {stats.epics}</div>
          <div>Features: {stats.features}</div>
          <div>Stories: {stats.stories}</div>
          <div>Tasks: {stats.tasks}</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Icon components
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
      className={`h-4 w-4 ${className || ''}`}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
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

function FileJsonIcon({ className }: { className?: string }) {
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
      <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
      <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
    </svg>
  );
}

function FileSpreadsheetIcon({ className }: { className?: string }) {
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
      <path d="M8 13h2" />
      <path d="M8 17h2" />
      <path d="M14 13h2" />
      <path d="M14 17h2" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
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
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <polyline points="10 9 9 9 8 9" />
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

export default JsonExportButton;
