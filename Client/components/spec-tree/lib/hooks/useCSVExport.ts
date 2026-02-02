/**
 * useCSVExport
 *
 * F1.1.12 - CSV export
 *
 * Hook for exporting spec tree work items to CSV format.
 * Provides utilities for formatting, customizing columns, and downloading.
 */

import { useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Work item type for export
 */
export type ExportableWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Generic work item for export
 */
export interface ExportableWorkItem {
  id: string;
  type: ExportableWorkItemType;
  title: string;
  description?: string;
  parentId?: string | null;
  status?: string;
  points?: number | string;
  priority?: number | string;
  // User story specific
  role?: string;
  action?: string;
  goal?: string;
  // Task specific
  details?: string;
}

/**
 * CSV column configuration
 */
export interface CSVColumn {
  key: string;
  header: string;
  getValue: (item: ExportableWorkItem) => string;
}

/**
 * Export options
 */
export interface CSVExportOptions {
  columns?: CSVColumn[];
  includeHeader?: boolean;
  delimiter?: string;
  lineEnding?: '\n' | '\r\n';
  filename?: string;
  filterTypes?: ExportableWorkItemType[];
}

/**
 * Export result
 */
export interface CSVExportResult {
  content: string;
  filename: string;
  rowCount: number;
  timestamp: string;
}

/**
 * Hook options
 */
export interface UseCSVExportOptions {
  defaultFilename?: string;
  defaultDelimiter?: string;
  onExportComplete?: (result: CSVExportResult) => void;
}

/**
 * Hook return type
 */
export interface UseCSVExportReturn {
  // Export functions
  exportToCSV: (items: ExportableWorkItem[], options?: CSVExportOptions) => CSVExportResult;
  downloadCSV: (content: string, filename?: string) => void;

  // Utilities
  escapeCSVValue: (value: string) => string;
  formatWorkItemForCSV: (item: ExportableWorkItem) => Record<string, string>;

  // Column presets
  getDefaultColumns: () => CSVColumn[];
  getMinimalColumns: () => CSVColumn[];
  getDetailedColumns: () => CSVColumn[];

  // State
  lastExport: CSVExportResult | null;
  isExporting: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_DELIMITER = ',';
const DEFAULT_LINE_ENDING = '\n';
const DEFAULT_FILENAME = 'spec-tree-export.csv';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Characters that can trigger formula execution in spreadsheet applications
 */
const FORMULA_TRIGGER_CHARS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Escape a value for CSV format
 * Includes protection against CSV injection (formula execution in spreadsheets)
 */
export function escapeCSVValue(value: string, delimiter = DEFAULT_DELIMITER): string {
  if (!value) return '';

  let processedValue = value;

  // CSV injection prevention: prefix formula-triggering characters with single quote
  // This prevents spreadsheet applications from interpreting the cell as a formula
  if (FORMULA_TRIGGER_CHARS.some((char) => value.startsWith(char))) {
    processedValue = "'" + value;
  }

  // Check if escaping is needed
  const needsEscaping =
    processedValue.includes(delimiter) ||
    processedValue.includes('"') ||
    processedValue.includes('\n') ||
    processedValue.includes('\r');

  if (needsEscaping) {
    // Escape double quotes by doubling them
    const escaped = processedValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return processedValue;
}

/**
 * Get work item type display name
 */
export function getWorkItemTypeDisplayName(type: ExportableWorkItemType): string {
  const names: Record<ExportableWorkItemType, string> = {
    epic: 'Epic',
    feature: 'Feature',
    userStory: 'User Story',
    task: 'Task',
  };
  return names[type] || type;
}

/**
 * Format user story description from role/action/goal
 */
export function formatUserStoryDescription(item: ExportableWorkItem): string {
  if (item.type !== 'userStory') {
    return item.description || item.details || '';
  }

  const parts: string[] = [];
  if (item.role) parts.push(`As a ${item.role}`);
  if (item.action) parts.push(`I want to ${item.action}`);
  if (item.goal) parts.push(`so that ${item.goal}`);

  return parts.length > 0 ? parts.join(', ') : item.description || '';
}

// ============================================================================
// Column Presets
// ============================================================================

/**
 * Get default CSV columns
 */
export function getDefaultColumns(): CSVColumn[] {
  return [
    { key: 'type', header: 'Type', getValue: (item) => getWorkItemTypeDisplayName(item.type) },
    { key: 'id', header: 'ID', getValue: (item) => item.id },
    { key: 'title', header: 'Title', getValue: (item) => item.title || '' },
    {
      key: 'description',
      header: 'Description',
      getValue: (item) => formatUserStoryDescription(item),
    },
    { key: 'parentId', header: 'Parent ID', getValue: (item) => item.parentId || '' },
    { key: 'status', header: 'Status', getValue: (item) => item.status || '' },
    { key: 'points', header: 'Points', getValue: (item) => item.points?.toString() || '' },
  ];
}

/**
 * Get minimal CSV columns
 */
export function getMinimalColumns(): CSVColumn[] {
  return [
    { key: 'type', header: 'Type', getValue: (item) => getWorkItemTypeDisplayName(item.type) },
    { key: 'title', header: 'Title', getValue: (item) => item.title || '' },
    { key: 'parentId', header: 'Parent ID', getValue: (item) => item.parentId || '' },
  ];
}

/**
 * Get detailed CSV columns
 */
export function getDetailedColumns(): CSVColumn[] {
  return [
    { key: 'type', header: 'Type', getValue: (item) => getWorkItemTypeDisplayName(item.type) },
    { key: 'id', header: 'ID', getValue: (item) => item.id },
    { key: 'title', header: 'Title', getValue: (item) => item.title || '' },
    {
      key: 'description',
      header: 'Description',
      getValue: (item) => formatUserStoryDescription(item),
    },
    { key: 'parentId', header: 'Parent ID', getValue: (item) => item.parentId || '' },
    { key: 'status', header: 'Status', getValue: (item) => item.status || '' },
    { key: 'points', header: 'Points', getValue: (item) => item.points?.toString() || '' },
    { key: 'priority', header: 'Priority', getValue: (item) => item.priority?.toString() || '' },
    { key: 'role', header: 'Role', getValue: (item) => item.role || '' },
    { key: 'action', header: 'Action', getValue: (item) => item.action || '' },
    { key: 'goal', header: 'Goal', getValue: (item) => item.goal || '' },
    { key: 'details', header: 'Details', getValue: (item) => item.details || '' },
  ];
}

// ============================================================================
// Core Export Functions
// ============================================================================

/**
 * Generate CSV content from work items
 */
export function generateCSVContent(
  items: ExportableWorkItem[],
  options: CSVExportOptions = {}
): string {
  const {
    columns = getDefaultColumns(),
    includeHeader = true,
    delimiter = DEFAULT_DELIMITER,
    lineEnding = DEFAULT_LINE_ENDING,
    filterTypes,
  } = options;

  // Filter items by type if specified
  const filteredItems = filterTypes
    ? items.filter((item) => filterTypes.includes(item.type))
    : items;

  const rows: string[] = [];

  // Add header row
  if (includeHeader) {
    const headerRow = columns.map((col) => escapeCSVValue(col.header, delimiter)).join(delimiter);
    rows.push(headerRow);
  }

  // Add data rows
  for (const item of filteredItems) {
    const row = columns.map((col) => escapeCSVValue(col.getValue(item), delimiter)).join(delimiter);
    rows.push(row);
  }

  return rows.join(lineEnding);
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for exporting work items to CSV format
 */
export function useCSVExport(options: UseCSVExportOptions = {}): UseCSVExportReturn {
  const {
    defaultFilename = DEFAULT_FILENAME,
    defaultDelimiter = DEFAULT_DELIMITER,
    onExportComplete,
  } = options;

  const [lastExport, setLastExport] = useState<CSVExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export items to CSV
   */
  const exportToCSV = useCallback(
    (items: ExportableWorkItem[], exportOptions: CSVExportOptions = {}): CSVExportResult => {
      setIsExporting(true);

      try {
        const filename = exportOptions.filename || defaultFilename;
        const content = generateCSVContent(items, {
          delimiter: defaultDelimiter,
          ...exportOptions,
        });

        // Count actual data rows (excluding header)
        const rowCount = exportOptions.includeHeader !== false ? content.split('\n').length - 1 : content.split('\n').length;

        const result: CSVExportResult = {
          content,
          filename,
          rowCount: Math.max(0, rowCount),
          timestamp: new Date().toISOString(),
        };

        setLastExport(result);
        onExportComplete?.(result);

        return result;
      } finally {
        setIsExporting(false);
      }
    },
    [defaultFilename, defaultDelimiter, onExportComplete]
  );

  /**
   * Download CSV content
   */
  const downloadCSV = useCallback(
    (content: string, filename?: string): void => {
      downloadFile(content, filename || defaultFilename);
    },
    [defaultFilename]
  );

  /**
   * Format a single work item for CSV
   */
  const formatWorkItemForCSV = useCallback((item: ExportableWorkItem): Record<string, string> => {
    const columns = getDefaultColumns();
    const result: Record<string, string> = {};

    for (const col of columns) {
      result[col.key] = col.getValue(item);
    }

    return result;
  }, []);

  return {
    // Export functions
    exportToCSV,
    downloadCSV,

    // Utilities
    escapeCSVValue: useCallback(
      (value: string) => escapeCSVValue(value, defaultDelimiter),
      [defaultDelimiter]
    ),
    formatWorkItemForCSV,

    // Column presets
    getDefaultColumns,
    getMinimalColumns,
    getDetailedColumns,

    // State
    lastExport,
    isExporting,
  };
}

export default useCSVExport;
