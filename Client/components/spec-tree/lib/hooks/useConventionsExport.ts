/**
 * useConventionsExport
 *
 * F2.1.3 - Project conventions export
 *
 * Hook for exporting project conventions to Cursor MDC format.
 * Generates .mdc files containing tech stack, naming conventions,
 * code patterns, and project structure.
 */

import { useCallback, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

/**
 * Tech stack item with category and value
 */
export interface TechStackItem {
  category: string;
  value: string;
  description?: string;
}

/**
 * Naming convention rule
 */
export interface NamingConvention {
  scope: string; // e.g., 'Components', 'Hooks', 'Utils'
  pattern: string; // e.g., 'PascalCase', 'useXxx'
  example?: string;
  location?: string; // e.g., 'src/components/'
}

/**
 * Code pattern reference
 */
export interface CodePattern {
  name: string;
  path: string;
  description?: string;
}

/**
 * Forbidden pattern/anti-pattern
 */
export interface ForbiddenPattern {
  pattern: string;
  reason?: string;
  alternative?: string;
}

/**
 * Directory structure entry
 */
export interface DirectoryEntry {
  path: string;
  purpose: string;
}

/**
 * Project context for export
 */
export interface ProjectContext {
  name: string;
  description?: string;
  techStack: TechStackItem[];
  namingConventions: NamingConvention[];
  codePatterns: CodePattern[];
  forbiddenPatterns: ForbiddenPattern[];
  directoryStructure: DirectoryEntry[];
  additionalNotes?: string[];
}

/**
 * MDC frontmatter configuration
 */
export interface MDCFrontmatter {
  title?: string;
  description?: string;
  globs?: string[];
  alwaysApply?: boolean;
  tags?: string[];
}

/**
 * Export options
 */
export interface ExportOptions {
  frontmatter?: MDCFrontmatter;
  includeTimestamp?: boolean;
  includeTechStack?: boolean;
  includeNamingConventions?: boolean;
  includeCodePatterns?: boolean;
  includeForbiddenPatterns?: boolean;
  includeDirectoryStructure?: boolean;
  includeNotes?: boolean;
}

/**
 * Generated MDC file
 */
export interface GeneratedMDCFile {
  filename: string;
  content: string;
  category: 'conventions' | 'patterns' | 'structure' | 'combined';
}

/**
 * Export result
 */
export interface ExportResult {
  files: GeneratedMDCFile[];
  combinedContent: string;
  timestamp: string;
}

/**
 * Hook options
 */
export interface UseConventionsExportOptions {
  defaultGlobs?: string[];
  projectName?: string;
  onExportComplete?: (result: ExportResult) => void;
}

/**
 * Hook return type
 */
export interface UseConventionsExportReturn {
  // Export functions
  exportToMDC: (context: ProjectContext, options?: ExportOptions) => ExportResult;
  exportToSeparateFiles: (context: ProjectContext, options?: ExportOptions) => GeneratedMDCFile[];
  downloadMDC: (content: string, filename: string) => void;
  downloadAllFiles: (files: GeneratedMDCFile[]) => void;

  // Formatting utilities
  formatFrontmatter: (frontmatter: MDCFrontmatter) => string;
  formatTechStack: (items: TechStackItem[]) => string;
  formatNamingConventions: (conventions: NamingConvention[]) => string;
  formatCodePatterns: (patterns: CodePattern[]) => string;
  formatForbiddenPatterns: (patterns: ForbiddenPattern[]) => string;
  formatDirectoryStructure: (entries: DirectoryEntry[]) => string;

  // State
  lastExport: ExportResult | null;
  isExporting: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_GLOBS = ['src/**/*', 'lib/**/*'];

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeTimestamp: false,
  includeTechStack: true,
  includeNamingConventions: true,
  includeCodePatterns: true,
  includeForbiddenPatterns: true,
  includeDirectoryStructure: true,
  includeNotes: true,
};

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format frontmatter as YAML
 */
export function formatFrontmatter(frontmatter: MDCFrontmatter): string {
  const lines: string[] = ['---'];

  if (frontmatter.title) {
    lines.push(`title: ${frontmatter.title}`);
  }
  if (frontmatter.description) {
    lines.push(`description: ${frontmatter.description}`);
  }
  if (frontmatter.globs && frontmatter.globs.length > 0) {
    lines.push(`globs: [${frontmatter.globs.map((g) => `"${g}"`).join(', ')}]`);
  }
  if (frontmatter.alwaysApply !== undefined) {
    lines.push(`alwaysApply: ${frontmatter.alwaysApply}`);
  }
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    lines.push(`tags: [${frontmatter.tags.map((t) => `"${t}"`).join(', ')}]`);
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Format tech stack section
 */
export function formatTechStack(items: TechStackItem[]): string {
  if (items.length === 0) return '';

  const lines: string[] = ['## Tech Stack'];

  for (const item of items) {
    let line = `- **${item.category}**: ${item.value}`;
    if (item.description) {
      line += ` (${item.description})`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Format naming conventions section
 */
export function formatNamingConventions(conventions: NamingConvention[]): string {
  if (conventions.length === 0) return '';

  const lines: string[] = ['## Naming Conventions'];

  for (const conv of conventions) {
    let line = `- **${conv.scope}**: ${conv.pattern}`;
    if (conv.location) {
      line += ` in \`${conv.location}\``;
    }
    if (conv.example) {
      line += ` (e.g., \`${conv.example}\`)`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Format code patterns section
 */
export function formatCodePatterns(patterns: CodePattern[]): string {
  if (patterns.length === 0) return '';

  const lines: string[] = ['## Reference Patterns'];

  for (const pattern of patterns) {
    let line = `- **${pattern.name}**: \`${pattern.path}\``;
    if (pattern.description) {
      line += ` - ${pattern.description}`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Format forbidden patterns section
 */
export function formatForbiddenPatterns(patterns: ForbiddenPattern[]): string {
  if (patterns.length === 0) return '';

  const lines: string[] = ['## Forbidden Patterns'];

  for (const pattern of patterns) {
    let line = `- NO \`${pattern.pattern}\``;
    if (pattern.reason) {
      line += ` - ${pattern.reason}`;
    }
    if (pattern.alternative) {
      line += ` (use ${pattern.alternative} instead)`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

/**
 * Format directory structure section
 */
export function formatDirectoryStructure(entries: DirectoryEntry[]): string {
  if (entries.length === 0) return '';

  const lines: string[] = ['## File Structure', '```'];

  // Build tree representation
  const sortedEntries = [...entries].sort((a, b) => a.path.localeCompare(b.path));

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const depth = entry.path.split('/').length - 1;
    const isLast = i === sortedEntries.length - 1 || !sortedEntries[i + 1]?.path.startsWith(entry.path);
    const prefix = depth === 0 ? '' : '│   '.repeat(depth - 1) + (isLast ? '└── ' : '├── ');

    const pathPart = entry.path.split('/').pop() || entry.path;
    const line = `${prefix}${pathPart}/`;
    const comment = entry.purpose ? `  # ${entry.purpose}` : '';
    lines.push(line + comment);
  }

  lines.push('```');
  return lines.join('\n');
}

/**
 * Format additional notes section
 */
export function formatNotes(notes: string[]): string {
  if (notes.length === 0) return '';

  const lines: string[] = ['## Additional Notes'];

  for (const note of notes) {
    lines.push(`- ${note}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Generator Functions
// ============================================================================

/**
 * Generate combined MDC content
 */
export function generateCombinedMDC(
  context: ProjectContext,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): string {
  const sections: string[] = [];

  // Frontmatter
  const frontmatter = options.frontmatter || {
    title: `${context.name} Development Rules`,
    description: 'AI coding rules generated by Spec Tree',
    globs: DEFAULT_GLOBS,
    alwaysApply: false,
  };
  sections.push(formatFrontmatter(frontmatter));

  // Project header
  sections.push(`\n# Project: ${context.name}`);
  if (context.description) {
    sections.push(`\n${context.description}`);
  }

  // Timestamp
  if (options.includeTimestamp) {
    sections.push(`\n_Generated: ${new Date().toISOString()}_`);
  }

  // Tech Stack
  if (options.includeTechStack && context.techStack.length > 0) {
    sections.push('\n' + formatTechStack(context.techStack));
  }

  // Naming Conventions
  if (options.includeNamingConventions && context.namingConventions.length > 0) {
    sections.push('\n' + formatNamingConventions(context.namingConventions));
  }

  // Code Patterns
  if (options.includeCodePatterns && context.codePatterns.length > 0) {
    sections.push('\n' + formatCodePatterns(context.codePatterns));
  }

  // Forbidden Patterns
  if (options.includeForbiddenPatterns && context.forbiddenPatterns.length > 0) {
    sections.push('\n' + formatForbiddenPatterns(context.forbiddenPatterns));
  }

  // Directory Structure
  if (options.includeDirectoryStructure && context.directoryStructure.length > 0) {
    sections.push('\n' + formatDirectoryStructure(context.directoryStructure));
  }

  // Additional Notes
  if (options.includeNotes && context.additionalNotes && context.additionalNotes.length > 0) {
    sections.push('\n' + formatNotes(context.additionalNotes));
  }

  return sections.join('\n');
}

/**
 * Generate separate MDC files for each category
 */
export function generateSeparateFiles(
  context: ProjectContext,
  options: ExportOptions = DEFAULT_EXPORT_OPTIONS
): GeneratedMDCFile[] {
  const files: GeneratedMDCFile[] = [];
  const baseTitle = context.name;

  // Tech Stack file
  if (options.includeTechStack && context.techStack.length > 0) {
    const frontmatter = formatFrontmatter({
      title: `${baseTitle} - Tech Stack`,
      description: 'Technology stack configuration',
      globs: options.frontmatter?.globs || DEFAULT_GLOBS,
      tags: ['tech-stack'],
    });

    const content = [frontmatter, `\n# ${baseTitle} Tech Stack`, '\n' + formatTechStack(context.techStack)].join(
      '\n'
    );

    files.push({
      filename: 'tech-stack.mdc',
      content,
      category: 'conventions',
    });
  }

  // Naming Conventions file
  if (options.includeNamingConventions && context.namingConventions.length > 0) {
    const frontmatter = formatFrontmatter({
      title: `${baseTitle} - Naming Conventions`,
      description: 'Code naming conventions and patterns',
      globs: options.frontmatter?.globs || DEFAULT_GLOBS,
      tags: ['naming', 'conventions'],
    });

    const content = [
      frontmatter,
      `\n# ${baseTitle} Naming Conventions`,
      '\n' + formatNamingConventions(context.namingConventions),
    ].join('\n');

    files.push({
      filename: 'naming-conventions.mdc',
      content,
      category: 'conventions',
    });
  }

  // Code Patterns file
  if (options.includeCodePatterns && context.codePatterns.length > 0) {
    const frontmatter = formatFrontmatter({
      title: `${baseTitle} - Code Patterns`,
      description: 'Reference code patterns',
      globs: options.frontmatter?.globs || DEFAULT_GLOBS,
      tags: ['patterns', 'reference'],
    });

    const content = [
      frontmatter,
      `\n# ${baseTitle} Code Patterns`,
      '\n' + formatCodePatterns(context.codePatterns),
    ].join('\n');

    files.push({
      filename: 'code-patterns.mdc',
      content,
      category: 'patterns',
    });
  }

  // Forbidden Patterns file
  if (options.includeForbiddenPatterns && context.forbiddenPatterns.length > 0) {
    const frontmatter = formatFrontmatter({
      title: `${baseTitle} - Forbidden Patterns`,
      description: 'Anti-patterns and forbidden code styles',
      globs: options.frontmatter?.globs || DEFAULT_GLOBS,
      tags: ['forbidden', 'anti-patterns'],
    });

    const content = [
      frontmatter,
      `\n# ${baseTitle} Forbidden Patterns`,
      '\n' + formatForbiddenPatterns(context.forbiddenPatterns),
    ].join('\n');

    files.push({
      filename: 'forbidden-patterns.mdc',
      content,
      category: 'conventions',
    });
  }

  // Directory Structure file
  if (options.includeDirectoryStructure && context.directoryStructure.length > 0) {
    const frontmatter = formatFrontmatter({
      title: `${baseTitle} - File Structure`,
      description: 'Project directory structure',
      globs: options.frontmatter?.globs || DEFAULT_GLOBS,
      tags: ['structure', 'directories'],
    });

    const content = [
      frontmatter,
      `\n# ${baseTitle} File Structure`,
      '\n' + formatDirectoryStructure(context.directoryStructure),
    ].join('\n');

    files.push({
      filename: 'file-structure.mdc',
      content,
      category: 'structure',
    });
  }

  return files;
}

/**
 * Sanitize filename for safe file system usage
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Trigger browser download
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/markdown'): void {
  const blob = new Blob([content], { type: mimeType });
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
 * Hook for exporting project conventions to Cursor MDC format
 */
export function useConventionsExport(options: UseConventionsExportOptions = {}): UseConventionsExportReturn {
  const { onExportComplete } = options;

  const [lastExport, setLastExport] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export to combined MDC content
   */
  const exportToMDC = useCallback(
    (context: ProjectContext, exportOptions: ExportOptions = DEFAULT_EXPORT_OPTIONS): ExportResult => {
      setIsExporting(true);

      try {
        const combinedContent = generateCombinedMDC(context, exportOptions);
        const files: GeneratedMDCFile[] = [
          {
            filename: `${sanitizeFilename(context.name)}-rules.mdc`,
            content: combinedContent,
            category: 'combined',
          },
        ];

        const result: ExportResult = {
          files,
          combinedContent,
          timestamp: new Date().toISOString(),
        };

        setLastExport(result);
        onExportComplete?.(result);

        return result;
      } finally {
        setIsExporting(false);
      }
    },
    [onExportComplete]
  );

  /**
   * Export to separate files by category
   */
  const exportToSeparateFiles = useCallback(
    (context: ProjectContext, exportOptions: ExportOptions = DEFAULT_EXPORT_OPTIONS): GeneratedMDCFile[] => {
      setIsExporting(true);

      try {
        const files = generateSeparateFiles(context, exportOptions);
        const combinedContent = generateCombinedMDC(context, exportOptions);

        const result: ExportResult = {
          files,
          combinedContent,
          timestamp: new Date().toISOString(),
        };

        setLastExport(result);
        onExportComplete?.(result);

        return files;
      } finally {
        setIsExporting(false);
      }
    },
    [onExportComplete]
  );

  /**
   * Download MDC content as file
   */
  const downloadMDC = useCallback((content: string, filename: string): void => {
    downloadFile(content, filename);
  }, []);

  /**
   * Download all generated files
   */
  const downloadAllFiles = useCallback((files: GeneratedMDCFile[]): void => {
    for (const file of files) {
      downloadFile(file.content, file.filename);
    }
  }, []);

  return {
    // Export functions
    exportToMDC,
    exportToSeparateFiles,
    downloadMDC,
    downloadAllFiles,

    // Formatting utilities (exposed for custom use)
    formatFrontmatter,
    formatTechStack,
    formatNamingConventions,
    formatCodePatterns,
    formatForbiddenPatterns,
    formatDirectoryStructure,

    // State
    lastExport,
    isExporting,
  };
}

export default useConventionsExport;
