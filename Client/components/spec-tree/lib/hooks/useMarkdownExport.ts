/**
 * useMarkdownExport
 *
 * F1.1.13 - Markdown export
 *
 * Hook for exporting spec tree work items to Markdown format.
 * Provides utilities for formatting hierarchical structures and downloading.
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
  // Acceptance criteria
  acceptanceCriteria?: string[];
}

/**
 * Markdown format style
 */
export type MarkdownStyle = 'hierarchical' | 'flat' | 'table' | 'checklist';

/**
 * Export options
 */
export interface MarkdownExportOptions {
  style?: MarkdownStyle;
  includeMetadata?: boolean;
  includeAcceptanceCriteria?: boolean;
  includeIds?: boolean;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  filename?: string;
  filterTypes?: ExportableWorkItemType[];
}

/**
 * Export result
 */
export interface MarkdownExportResult {
  content: string;
  filename: string;
  itemCount: number;
  timestamp: string;
}

/**
 * Hook options
 */
export interface UseMarkdownExportOptions {
  defaultFilename?: string;
  defaultStyle?: MarkdownStyle;
  onExportComplete?: (result: MarkdownExportResult) => void;
}

/**
 * Hook return type
 */
export interface UseMarkdownExportReturn {
  // Export functions
  exportToMarkdown: (items: ExportableWorkItem[], options?: MarkdownExportOptions) => MarkdownExportResult;
  downloadMarkdown: (content: string, filename?: string) => void;

  // Utilities
  formatWorkItemAsMarkdown: (item: ExportableWorkItem, options?: MarkdownExportOptions) => string;
  getHeadingPrefix: (level: number) => string;

  // Style presets
  getStyleDescription: (style: MarkdownStyle) => string;
  getAvailableStyles: () => MarkdownStyle[];

  // State
  lastExport: MarkdownExportResult | null;
  isExporting: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_FILENAME = 'spec-tree-export.md';
const DEFAULT_STYLE: MarkdownStyle = 'hierarchical';
const DEFAULT_HEADING_LEVEL = 1;

// ============================================================================
// Utility Functions
// ============================================================================

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
 * Get work item type emoji
 */
export function getWorkItemTypeEmoji(type: ExportableWorkItemType): string {
  const emojis: Record<ExportableWorkItemType, string> = {
    epic: '🎯',
    feature: '✨',
    userStory: '📝',
    task: '✅',
  };
  return emojis[type] || '📌';
}

/**
 * Get heading prefix for a given level
 */
export function getHeadingPrefix(level: number): string {
  const clampedLevel = Math.max(1, Math.min(6, level));
  return '#'.repeat(clampedLevel);
}

/**
 * Format user story description from role/action/goal
 */
export function formatUserStoryDescription(item: ExportableWorkItem): string {
  if (item.type !== 'userStory') {
    return item.description || item.details || '';
  }

  const parts: string[] = [];
  if (item.role) parts.push(`As a **${item.role}**`);
  if (item.action) parts.push(`I want to **${item.action}**`);
  if (item.goal) parts.push(`so that **${item.goal}**`);

  return parts.length > 0 ? parts.join(', ') : item.description || '';
}

/**
 * Get style description
 */
export function getStyleDescription(style: MarkdownStyle): string {
  const descriptions: Record<MarkdownStyle, string> = {
    hierarchical: 'Nested headings following item hierarchy',
    flat: 'All items as same-level sections',
    table: 'Tabular format with columns',
    checklist: 'Checkbox list format',
  };
  return descriptions[style] || style;
}

/**
 * Get available styles
 */
export function getAvailableStyles(): MarkdownStyle[] {
  return ['hierarchical', 'flat', 'table', 'checklist'];
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format a single work item as markdown
 */
export function formatWorkItemAsMarkdown(
  item: ExportableWorkItem,
  options: MarkdownExportOptions = {}
): string {
  const {
    style = DEFAULT_STYLE,
    includeMetadata = true,
    includeAcceptanceCriteria = true,
    includeIds = false,
    headingLevel = DEFAULT_HEADING_LEVEL,
  } = options;

  switch (style) {
    case 'table':
      return formatAsTableRow(item, includeIds);
    case 'checklist':
      return formatAsChecklist(item, includeIds);
    case 'flat':
      return formatAsFlat(item, headingLevel, includeMetadata, includeAcceptanceCriteria, includeIds);
    case 'hierarchical':
    default:
      return formatAsHierarchical(item, headingLevel, includeMetadata, includeAcceptanceCriteria, includeIds);
  }
}

/**
 * Format item as hierarchical markdown
 */
function formatAsHierarchical(
  item: ExportableWorkItem,
  headingLevel: number,
  includeMetadata: boolean,
  includeAcceptanceCriteria: boolean,
  includeIds: boolean
): string {
  const lines: string[] = [];
  const prefix = getHeadingPrefix(headingLevel);
  const emoji = getWorkItemTypeEmoji(item.type);

  // Title
  const idPart = includeIds ? ` (${item.id})` : '';
  lines.push(`${prefix} ${emoji} ${item.title}${idPart}`);
  lines.push('');

  // Description
  const description = formatUserStoryDescription(item);
  if (description) {
    lines.push(description);
    lines.push('');
  }

  // Metadata
  if (includeMetadata) {
    const metadata: string[] = [];
    metadata.push(`**Type:** ${getWorkItemTypeDisplayName(item.type)}`);
    if (item.status) metadata.push(`**Status:** ${item.status}`);
    if (item.points) metadata.push(`**Points:** ${item.points}`);
    if (item.priority) metadata.push(`**Priority:** ${item.priority}`);

    if (metadata.length > 0) {
      lines.push(metadata.join(' | '));
      lines.push('');
    }
  }

  // Acceptance Criteria
  if (includeAcceptanceCriteria && item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
    lines.push('**Acceptance Criteria:**');
    for (const criterion of item.acceptanceCriteria) {
      lines.push(`- [ ] ${criterion}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format item as flat markdown
 */
function formatAsFlat(
  item: ExportableWorkItem,
  headingLevel: number,
  includeMetadata: boolean,
  includeAcceptanceCriteria: boolean,
  includeIds: boolean
): string {
  return formatAsHierarchical(item, headingLevel, includeMetadata, includeAcceptanceCriteria, includeIds);
}

/**
 * Format item as table row
 */
function formatAsTableRow(item: ExportableWorkItem, includeIds: boolean): string {
  const description = formatUserStoryDescription(item);
  const escapedDescription = description.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const escapedTitle = item.title.replace(/\|/g, '\\|');

  if (includeIds) {
    return `| ${item.id} | ${getWorkItemTypeDisplayName(item.type)} | ${escapedTitle} | ${escapedDescription} | ${item.status || ''} |`;
  }
  return `| ${getWorkItemTypeDisplayName(item.type)} | ${escapedTitle} | ${escapedDescription} | ${item.status || ''} |`;
}

/**
 * Format item as checklist item
 */
function formatAsChecklist(item: ExportableWorkItem, includeIds: boolean): string {
  const emoji = getWorkItemTypeEmoji(item.type);
  const idPart = includeIds ? ` \`${item.id}\`` : '';
  const statusCheck = item.status === 'completed' || item.status === 'done' ? 'x' : ' ';
  return `- [${statusCheck}] ${emoji} **${item.title}**${idPart}`;
}

/**
 * Build hierarchical tree from flat items
 */
export function buildItemTree(
  items: ExportableWorkItem[]
): Map<string | null, ExportableWorkItem[]> {
  const tree = new Map<string | null, ExportableWorkItem[]>();

  for (const item of items) {
    const parentId = item.parentId || null;
    if (!tree.has(parentId)) {
      tree.set(parentId, []);
    }
    tree.get(parentId)!.push(item);
  }

  return tree;
}

/**
 * Render hierarchical markdown recursively
 */
function renderHierarchicalTree(
  tree: Map<string | null, ExportableWorkItem[]>,
  parentId: string | null,
  baseLevel: number,
  options: MarkdownExportOptions
): string[] {
  const children = tree.get(parentId) || [];
  const lines: string[] = [];

  for (const item of children) {
    // Determine heading level based on type
    const typeLevel: Record<ExportableWorkItemType, number> = {
      epic: 0,
      feature: 1,
      userStory: 2,
      task: 3,
    };
    const level = Math.min(6, baseLevel + typeLevel[item.type]);

    lines.push(formatAsHierarchical(
      item,
      level,
      options.includeMetadata ?? true,
      options.includeAcceptanceCriteria ?? true,
      options.includeIds ?? false
    ));

    // Recursively render children
    const childLines = renderHierarchicalTree(tree, item.id, baseLevel, options);
    lines.push(...childLines);
  }

  return lines;
}

// ============================================================================
// Core Export Functions
// ============================================================================

/**
 * Generate table header
 */
function generateTableHeader(includeIds: boolean): string {
  if (includeIds) {
    return `| ID | Type | Title | Description | Status |
|---|---|---|---|---|`;
  }
  return `| Type | Title | Description | Status |
|---|---|---|---|`;
}

/**
 * Generate Markdown content from work items
 */
export function generateMarkdownContent(
  items: ExportableWorkItem[],
  options: MarkdownExportOptions = {}
): string {
  const {
    style = DEFAULT_STYLE,
    includeMetadata = true,
    includeAcceptanceCriteria = true,
    includeIds = false,
    headingLevel = DEFAULT_HEADING_LEVEL,
    filterTypes,
  } = options;

  // Filter items by type if specified
  const filteredItems = filterTypes
    ? items.filter((item) => filterTypes.includes(item.type))
    : items;

  if (filteredItems.length === 0) {
    return '# Spec Tree Export\n\n*No items to export.*\n';
  }

  const lines: string[] = [];

  // Add document title
  lines.push('# Spec Tree Export');
  lines.push('');

  switch (style) {
    case 'table':
      lines.push(generateTableHeader(includeIds));
      for (const item of filteredItems) {
        lines.push(formatAsTableRow(item, includeIds));
      }
      lines.push('');
      break;

    case 'checklist':
      for (const item of filteredItems) {
        lines.push(formatAsChecklist(item, includeIds));
      }
      lines.push('');
      break;

    case 'hierarchical':
      // Build tree and render hierarchically
      const tree = buildItemTree(filteredItems);
      const treeLines = renderHierarchicalTree(tree, null, headingLevel, {
        ...options,
        includeMetadata,
        includeAcceptanceCriteria,
        includeIds,
      });
      lines.push(...treeLines);
      break;

    case 'flat':
    default:
      for (const item of filteredItems) {
        lines.push(formatAsFlat(item, headingLevel + 1, includeMetadata, includeAcceptanceCriteria, includeIds));
      }
      break;
  }

  // Add footer with timestamp
  lines.push('---');
  lines.push(`*Exported on ${new Date().toISOString().split('T')[0]}*`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Trigger file download in browser
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/markdown'): void {
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
 * Hook for exporting work items to Markdown format
 */
export function useMarkdownExport(options: UseMarkdownExportOptions = {}): UseMarkdownExportReturn {
  const {
    defaultFilename = DEFAULT_FILENAME,
    defaultStyle = DEFAULT_STYLE,
    onExportComplete,
  } = options;

  const [lastExport, setLastExport] = useState<MarkdownExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export items to Markdown
   */
  const exportToMarkdown = useCallback(
    (items: ExportableWorkItem[], exportOptions: MarkdownExportOptions = {}): MarkdownExportResult => {
      setIsExporting(true);

      try {
        const filename = exportOptions.filename || defaultFilename;
        const content = generateMarkdownContent(items, {
          style: defaultStyle,
          ...exportOptions,
        });

        // Filter items for count
        const filteredItems = exportOptions.filterTypes
          ? items.filter((item) => exportOptions.filterTypes!.includes(item.type))
          : items;

        const result: MarkdownExportResult = {
          content,
          filename,
          itemCount: filteredItems.length,
          timestamp: new Date().toISOString(),
        };

        setLastExport(result);
        onExportComplete?.(result);

        return result;
      } finally {
        setIsExporting(false);
      }
    },
    [defaultFilename, defaultStyle, onExportComplete]
  );

  /**
   * Download Markdown content
   */
  const downloadMarkdown = useCallback(
    (content: string, filename?: string): void => {
      downloadFile(content, filename || defaultFilename);
    },
    [defaultFilename]
  );

  /**
   * Format a single work item for Markdown
   */
  const formatWorkItemForMarkdown = useCallback(
    (item: ExportableWorkItem, formatOptions?: MarkdownExportOptions): string => {
      return formatWorkItemAsMarkdown(item, {
        style: defaultStyle,
        ...formatOptions,
      });
    },
    [defaultStyle]
  );

  return {
    // Export functions
    exportToMarkdown,
    downloadMarkdown,

    // Utilities
    formatWorkItemAsMarkdown: formatWorkItemForMarkdown,
    getHeadingPrefix,

    // Style presets
    getStyleDescription,
    getAvailableStyles,

    // State
    lastExport,
    isExporting,
  };
}

export default useMarkdownExport;
