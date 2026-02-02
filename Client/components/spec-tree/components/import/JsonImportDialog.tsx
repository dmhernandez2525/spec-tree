'use client';

/**
 * JSON Import Dialog
 *
 * F1.1.11 - JSON Import/Export UI
 *
 * Provides UI for importing project specifications from JSON or CSV files.
 * Includes validation, preview, and conflict handling.
 */

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { parseJSONImport, parseCSVImport } from '../../lib/utils/import-export';

export interface JsonImportDialogProps {
  /** Callback when import is confirmed */
  onImport: (data: ImportData) => void;
  /** Button variant for trigger */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Button size for trigger */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional class names for trigger */
  className?: string;
  /** Whether the import dialog is disabled */
  disabled?: boolean;
}

export interface ImportData {
  format: 'json' | 'csv';
  epics: unknown[];
  features: unknown[];
  userStories: unknown[];
  tasks: unknown[];
  metadata?: {
    version?: string;
    exportedAt?: string;
    appName?: string;
  };
}

type ImportStatus = 'idle' | 'parsing' | 'preview' | 'error';

interface ParsedData {
  format: 'json' | 'csv';
  epics: unknown[];
  features: unknown[];
  userStories: unknown[];
  tasks: unknown[];
  metadata?: {
    version?: string;
    exportedAt?: string;
    appName?: string;
  };
}

export function JsonImportDialog({
  onImport,
  variant = 'outline',
  size = 'default',
  className,
  disabled = false,
}: JsonImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setStatus('idle');
    setError(null);
    setParsedData(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      setStatus('parsing');
      setError(null);

      try {
        const content = await file.text();
        const isJson = file.name.endsWith('.json');
        const isCsv = file.name.endsWith('.csv');

        if (!isJson && !isCsv) {
          throw new Error('Unsupported file format. Please use .json or .csv files.');
        }

        if (isJson) {
          const data = parseJSONImport(content);
          if (!data) {
            throw new Error('Invalid JSON structure. The file must be a valid Spec Tree export.');
          }
          setParsedData({
            format: 'json',
            epics: data.epics || [],
            features: data.features || [],
            userStories: data.userStories || [],
            tasks: data.tasks || [],
            metadata: {
              version: data.version,
              exportedAt: data.exportedAt,
              appName: data.app?.name,
            },
          });
        } else {
          const data = parseCSVImport(content);
          if (!data) {
            throw new Error('Invalid CSV structure. The file must have Type and Title columns.');
          }
          setParsedData({
            format: 'csv',
            epics: data.epics || [],
            features: data.features || [],
            userStories: data.userStories || [],
            tasks: data.tasks || [],
          });
        }

        setStatus('preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
        setStatus('error');
      }
    },
    []
  );

  const handleImport = useCallback(() => {
    if (!parsedData) return;

    onImport({
      format: parsedData.format,
      epics: parsedData.epics,
      features: parsedData.features,
      userStories: parsedData.userStories,
      tasks: parsedData.tasks,
      metadata: parsedData.metadata,
    });

    setOpen(false);
    resetState();
  }, [parsedData, onImport, resetState]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetState();
      }
    },
    [resetState]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const totalItems = parsedData
    ? parsedData.epics.length +
      parsedData.features.length +
      parsedData.userStories.length +
      parsedData.tasks.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
        >
          <UploadIcon />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Project Data</DialogTitle>
          <DialogDescription>
            Import work items from a JSON or CSV file. Supported formats include
            Spec Tree exports and compatible CSV files.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select file to import"
          />

          {status === 'idle' && (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={triggerFileInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  triggerFileInput();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Click to select a file"
            >
              <FileUploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Click to select a file or drag and drop
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports JSON and CSV files
              </p>
            </div>
          )}

          {status === 'parsing' && (
            <div className="text-center py-8">
              <SpinnerIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Parsing {fileName}...</p>
            </div>
          )}

          {status === 'error' && error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>Import Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {status === 'preview' && parsedData && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {parsedData.format.toUpperCase()}
                  </span>
                </div>
                {parsedData.metadata?.exportedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Exported: {new Date(parsedData.metadata.exportedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Preview Stats */}
              <div className="border rounded-lg divide-y">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-sm">Epics</span>
                  <span className="text-sm font-medium">{parsedData.epics.length}</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-sm">Features</span>
                  <span className="text-sm font-medium">{parsedData.features.length}</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-sm">User Stories</span>
                  <span className="text-sm font-medium">{parsedData.userStories.length}</span>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <span className="text-sm">Tasks</span>
                  <span className="text-sm font-medium">{parsedData.tasks.length}</span>
                </div>
                <div className="p-3 flex justify-between items-center bg-gray-50">
                  <span className="text-sm font-medium">Total Items</span>
                  <span className="text-sm font-bold">{totalItems}</span>
                </div>
              </div>

              {/* Warning for overwrite */}
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Importing will add these items to your current project. Items with
                  matching IDs may be updated.
                </AlertDescription>
              </Alert>

              {/* Select Different File */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetState();
                }}
                className="w-full"
              >
                Select Different File
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={status !== 'preview' || totalItems === 0}
          >
            Import {totalItems > 0 ? `${totalItems} Items` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Icon components
function UploadIcon({ className }: { className?: string }) {
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
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function FileUploadIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" x2="12" y1="18" y2="12" />
      <polyline points="9 15 12 12 15 15" />
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
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
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

export default JsonImportDialog;
