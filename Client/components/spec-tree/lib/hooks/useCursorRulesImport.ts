/**
 * Cursor Rules Import Hook
 *
 * F2.1.2 - Cursor Rules import
 *
 * Parses and imports Cursor MDC rule files to extract project context,
 * tech stack, conventions, and coding patterns.
 */

import { useState, useCallback } from 'react';

/**
 * Frontmatter from a Cursor MDC file
 */
export interface CursorRuleFrontmatter {
  /** Title of the rule file */
  title?: string;
  /** Description of the rule */
  description?: string;
  /** Glob patterns for file scope */
  globs?: string[];
  /** Whether to always apply this rule */
  alwaysApply?: boolean;
  /** Additional custom properties */
  [key: string]: unknown;
}

/**
 * Parsed tech stack from rules
 */
export interface ParsedTechStack {
  framework?: string;
  language?: string;
  styling?: string;
  stateManagement?: string;
  forms?: string;
  ui?: string;
  testing?: string;
  database?: string;
  orm?: string;
  /** Raw tech stack items */
  items: Array<{ name: string; value: string }>;
}

/**
 * Code convention extracted from rules
 */
export interface ParsedConvention {
  /** Convention name/category */
  name: string;
  /** Description or rule */
  rule: string;
  /** Example if provided */
  example?: string;
}

/**
 * Forbidden pattern from rules
 */
export interface ParsedForbiddenPattern {
  /** The pattern to avoid */
  pattern: string;
  /** Reason or context */
  reason?: string;
}

/**
 * File structure entry
 */
export interface ParsedFileStructure {
  /** Path relative to root */
  path: string;
  /** Description of what's in this path */
  description?: string;
}

/**
 * Reference pattern
 */
export interface ParsedPattern {
  /** Pattern name */
  name: string;
  /** File path for reference */
  path: string;
  /** Description of the pattern */
  description?: string;
}

/**
 * Complete parsed Cursor rule
 */
export interface ParsedCursorRule {
  /** Frontmatter metadata */
  frontmatter: CursorRuleFrontmatter;
  /** Raw content (after frontmatter) */
  content: string;
  /** Project name if found */
  projectName?: string;
  /** Parsed tech stack */
  techStack: ParsedTechStack;
  /** Code conventions */
  conventions: ParsedConvention[];
  /** Forbidden patterns */
  forbiddenPatterns: ParsedForbiddenPattern[];
  /** File structure */
  fileStructure: ParsedFileStructure[];
  /** Reference patterns */
  patterns: ParsedPattern[];
  /** Raw sections for custom parsing */
  sections: Map<string, string>;
}

/**
 * Import result
 */
export interface CursorRulesImportResult {
  /** Successfully parsed rules */
  rules: ParsedCursorRule[];
  /** Parsing errors */
  errors: Array<{ file: string; error: string }>;
  /** Aggregated project context */
  projectContext: {
    name?: string;
    techStack: ParsedTechStack;
    conventions: ParsedConvention[];
    forbiddenPatterns: ParsedForbiddenPattern[];
    patterns: ParsedPattern[];
  };
}

/**
 * Options for useCursorRulesImport
 */
export interface UseCursorRulesImportOptions {
  /** Callback when import completes */
  onImportComplete?: (result: CursorRulesImportResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Return type for useCursorRulesImport
 */
export interface UseCursorRulesImportReturn {
  /** Import rules from MDC file content */
  importFromContent: (content: string, filename?: string) => ParsedCursorRule;
  /** Import multiple rules from files */
  importFromFiles: (files: File[]) => Promise<CursorRulesImportResult>;
  /** Parse frontmatter from MDC content */
  parseFrontmatter: (content: string) => { frontmatter: CursorRuleFrontmatter; body: string };
  /** Extract tech stack from content */
  extractTechStack: (content: string) => ParsedTechStack;
  /** Extract conventions from content */
  extractConventions: (content: string) => ParsedConvention[];
  /** Extract forbidden patterns from content */
  extractForbiddenPatterns: (content: string) => ParsedForbiddenPattern[];
  /** Extract file structure from content */
  extractFileStructure: (content: string) => ParsedFileStructure[];
  /** Extract reference patterns from content */
  extractPatterns: (content: string) => ParsedPattern[];
  /** Last import result */
  lastResult: CursorRulesImportResult | null;
  /** Is currently importing */
  isImporting: boolean;
  /** Import error */
  error: Error | null;
  /** Reset state */
  reset: () => void;
}

/**
 * Parse YAML frontmatter from MDC content
 */
export function parseFrontmatter(content: string): { frontmatter: CursorRuleFrontmatter; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const [, yamlContent, body] = match;
  const frontmatter: CursorRuleFrontmatter = {};

  // Simple YAML parsing for common fields
  const lines = yamlContent.split('\n');
  let currentKey: string | null = null;
  let currentArray: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Array continuation
    if (trimmed.startsWith('- ') && currentKey) {
      const value = trimmed.slice(2).replace(/^["']|["']$/g, '');
      currentArray.push(value);
      continue;
    }

    // Save previous array if any
    if (currentKey && currentArray.length > 0) {
      frontmatter[currentKey] = currentArray;
      currentArray = [];
    }

    // Key-value pair
    const keyValueMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (keyValueMatch) {
      const [, key, value] = keyValueMatch;
      currentKey = key;

      if (value) {
        // Inline value
        const cleanValue = value.replace(/^["']|["']$/g, '');
        if (cleanValue === 'true') {
          frontmatter[key] = true;
        } else if (cleanValue === 'false') {
          frontmatter[key] = false;
        } else if (/^\d+$/.test(cleanValue)) {
          frontmatter[key] = parseInt(cleanValue, 10);
        } else if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
          // Inline array
          frontmatter[key] = cleanValue
            .slice(1, -1)
            .split(',')
            .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        } else {
          frontmatter[key] = cleanValue;
        }
        currentKey = null;
      }
    }
  }

  // Save final array if any
  if (currentKey && currentArray.length > 0) {
    frontmatter[currentKey] = currentArray;
  }

  return { frontmatter, body };
}

/**
 * Extract tech stack from content
 */
export function extractTechStack(content: string): ParsedTechStack {
  const techStack: ParsedTechStack = { items: [] };

  // Look for ## Tech Stack section
  const techStackSection = extractSection(content, 'Tech Stack');
  if (!techStackSection) {
    return techStack;
  }

  // Parse bullet points: - **Name**: Value
  const bulletRegex = /^[-*]\s+\*\*(.+?)\*\*:\s*(.+)$/gm;
  let match;

  while ((match = bulletRegex.exec(techStackSection)) !== null) {
    const [, name, value] = match;
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const cleanValue = value.trim();

    techStack.items.push({ name, value: cleanValue });

    // Map to known fields
    if (cleanName.includes('framework')) {
      techStack.framework = cleanValue;
    } else if (cleanName.includes('language')) {
      techStack.language = cleanValue;
    } else if (cleanName.includes('styling') || cleanName.includes('css')) {
      techStack.styling = cleanValue;
    } else if (cleanName.includes('state')) {
      techStack.stateManagement = cleanValue;
    } else if (cleanName.includes('form')) {
      techStack.forms = cleanValue;
    } else if (cleanName.includes('ui') || cleanName.includes('component')) {
      techStack.ui = cleanValue;
    } else if (cleanName.includes('test')) {
      techStack.testing = cleanValue;
    } else if (cleanName.includes('database') || cleanName.includes('db')) {
      techStack.database = cleanValue;
    } else if (cleanName.includes('orm')) {
      techStack.orm = cleanValue;
    }
  }

  return techStack;
}

/**
 * Extract conventions from content
 */
export function extractConventions(content: string): ParsedConvention[] {
  const conventions: ParsedConvention[] = [];

  // Look for ## Code Style or ## Code Conventions section
  const section = extractSection(content, 'Code Style') || extractSection(content, 'Code Conventions');
  if (!section) {
    return conventions;
  }

  // Parse bullet points
  const bulletRegex = /^[-*]\s+(.+)$/gm;
  let match;

  while ((match = bulletRegex.exec(section)) !== null) {
    const [, text] = match;

    // Check for format: Use `example` for description
    const exampleMatch = text.match(/^(?:Use\s+)?`([^`]+)`\s+(?:utility\s+)?(?:for\s+)?(.+)$/i);
    if (exampleMatch) {
      conventions.push({
        name: 'Pattern',
        rule: exampleMatch[2].trim(),
        example: exampleMatch[1],
      });
      continue;
    }

    // Check for format: Name in PascalCase: Description
    const formatMatch = text.match(/^(.+?)\s+(?:in|with)\s+(.+?):\s+(.+)$/i);
    if (formatMatch) {
      conventions.push({
        name: formatMatch[1].trim(),
        rule: `${formatMatch[2].trim()}: ${formatMatch[3].trim()}`,
      });
      continue;
    }

    // Generic convention
    conventions.push({
      name: 'Convention',
      rule: text.trim(),
    });
  }

  return conventions;
}

/**
 * Extract forbidden patterns from content
 */
export function extractForbiddenPatterns(content: string): ParsedForbiddenPattern[] {
  const patterns: ParsedForbiddenPattern[] = [];

  // Look for ## Forbidden Patterns section
  const section = extractSection(content, 'Forbidden Patterns');
  if (!section) {
    return patterns;
  }

  // Parse bullet points: - NO `pattern` (reason)
  const bulletRegex = /^[-*]\s+(?:NO\s+)?`?([^`\n]+)`?\s*(?:\(([^)]+)\))?$/gm;
  let match;

  while ((match = bulletRegex.exec(section)) !== null) {
    const [, pattern, reason] = match;
    patterns.push({
      pattern: pattern.replace(/^NO\s+/i, '').trim(),
      reason: reason?.trim(),
    });
  }

  return patterns;
}

/**
 * Extract file structure from content
 */
export function extractFileStructure(content: string): ParsedFileStructure[] {
  const structure: ParsedFileStructure[] = [];

  // Look for ## File Structure section
  const section = extractSection(content, 'File Structure');
  if (!section) {
    return structure;
  }

  // Parse code block content
  const codeBlockMatch = section.match(/```[\s\S]*?([\s\S]+?)```/);
  if (!codeBlockMatch) {
    return structure;
  }

  const lines = codeBlockMatch[1].split('\n');
  for (const line of lines) {
    // Match lines like: ├── path/          # Description
    const match = line.match(/[├└│─\s]*(\S+)\s*#?\s*(.*)?$/);
    if (match && match[1] && !match[1].startsWith('#')) {
      const path = match[1].replace(/\/$/, '');
      if (path) {
        structure.push({
          path,
          description: match[2]?.trim() || undefined,
        });
      }
    }
  }

  return structure;
}

/**
 * Extract reference patterns from content
 */
export function extractPatterns(content: string): ParsedPattern[] {
  const patterns: ParsedPattern[] = [];

  // Look for ## Reference Patterns or ## Patterns section
  const section = extractSection(content, 'Reference Patterns') || extractSection(content, 'Patterns');
  if (!section) {
    return patterns;
  }

  // Parse bullet points: - Name pattern: `path`
  const bulletRegex = /^[-*]\s+(.+?)\s+pattern:\s+`([^`]+)`$/gm;
  let match;

  while ((match = bulletRegex.exec(section)) !== null) {
    const [, name, path] = match;
    patterns.push({
      name: name.trim(),
      path: path.trim(),
    });
  }

  // Also look for inline patterns: reference: `path`
  const inlineRegex = /(?:reference|pattern|follow):\s*`([^`]+)`/gi;
  while ((match = inlineRegex.exec(content)) !== null) {
    const path = match[1];
    if (!patterns.some((p) => p.path === path)) {
      patterns.push({
        name: 'Reference',
        path: path.trim(),
      });
    }
  }

  return patterns;
}

/**
 * Extract a markdown section by heading
 */
function extractSection(content: string, heading: string): string | null {
  // Split content into lines and find the section
  const lines = content.split('\n');
  let inSection = false;
  const sectionContent: string[] = [];

  for (const line of lines) {
    // Check if this is our target heading
    const headingMatch = line.match(/^(#{2,3})\s+(.+?)\s*$/);
    if (headingMatch) {
      const headingText = headingMatch[2];
      if (headingText.toLowerCase() === heading.toLowerCase()) {
        inSection = true;
        continue;
      } else if (inSection) {
        // Found another heading, stop collecting
        break;
      }
    }

    if (inSection) {
      sectionContent.push(line);
    }
  }

  if (sectionContent.length === 0) {
    return null;
  }

  return sectionContent.join('\n').trim();
}

/**
 * Extract project name from content
 */
function extractProjectName(content: string): string | undefined {
  // Look for # Project: Name
  const match = content.match(/^#\s+Project:\s+(.+)$/m);
  return match ? match[1].trim() : undefined;
}

/**
 * Extract all sections from content
 */
function extractAllSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Array<{ level: number; title: string; start: number }> = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
      start: match.index + match[0].length,
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const next = headings[i + 1];
    const end = next ? next.start - (next.title.length + next.level + 2) : content.length;
    const sectionContent = content.slice(current.start, end).trim();
    sections.set(current.title, sectionContent);
  }

  return sections;
}

/**
 * Hook for importing Cursor rules
 */
export function useCursorRulesImport(
  options: UseCursorRulesImportOptions = {}
): UseCursorRulesImportReturn {
  const { onImportComplete, onError } = options;

  const [lastResult, setLastResult] = useState<CursorRulesImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Import from content string
   */
  const importFromContent = useCallback(
    (content: string, _filename?: string): ParsedCursorRule => {
      const { frontmatter, body } = parseFrontmatter(content);

      return {
        frontmatter,
        content: body,
        projectName: extractProjectName(body),
        techStack: extractTechStack(body),
        conventions: extractConventions(body),
        forbiddenPatterns: extractForbiddenPatterns(body),
        fileStructure: extractFileStructure(body),
        patterns: extractPatterns(body),
        sections: extractAllSections(body),
      };
    },
    []
  );

  /**
   * Import from file objects
   */
  const importFromFiles = useCallback(
    async (files: File[]): Promise<CursorRulesImportResult> => {
      setIsImporting(true);
      setError(null);

      const result: CursorRulesImportResult = {
        rules: [],
        errors: [],
        projectContext: {
          techStack: { items: [] },
          conventions: [],
          forbiddenPatterns: [],
          patterns: [],
        },
      };

      try {
        for (const file of files) {
          try {
            const content = await file.text();
            const rule = importFromContent(content, file.name);
            result.rules.push(rule);

            // Aggregate context
            if (rule.projectName && !result.projectContext.name) {
              result.projectContext.name = rule.projectName;
            }

            // Merge tech stack
            for (const item of rule.techStack.items) {
              if (!result.projectContext.techStack.items.some((i) => i.name === item.name)) {
                result.projectContext.techStack.items.push(item);
              }
            }

            // Copy specific tech stack fields
            const ts = rule.techStack;
            const pcts = result.projectContext.techStack;
            if (ts.framework && !pcts.framework) pcts.framework = ts.framework;
            if (ts.language && !pcts.language) pcts.language = ts.language;
            if (ts.styling && !pcts.styling) pcts.styling = ts.styling;
            if (ts.stateManagement && !pcts.stateManagement) pcts.stateManagement = ts.stateManagement;
            if (ts.forms && !pcts.forms) pcts.forms = ts.forms;
            if (ts.ui && !pcts.ui) pcts.ui = ts.ui;
            if (ts.testing && !pcts.testing) pcts.testing = ts.testing;
            if (ts.database && !pcts.database) pcts.database = ts.database;
            if (ts.orm && !pcts.orm) pcts.orm = ts.orm;

            // Merge conventions (avoid duplicates by rule)
            for (const conv of rule.conventions) {
              if (!result.projectContext.conventions.some((c) => c.rule === conv.rule)) {
                result.projectContext.conventions.push(conv);
              }
            }

            // Merge forbidden patterns
            for (const fp of rule.forbiddenPatterns) {
              if (!result.projectContext.forbiddenPatterns.some((p) => p.pattern === fp.pattern)) {
                result.projectContext.forbiddenPatterns.push(fp);
              }
            }

            // Merge patterns
            for (const pattern of rule.patterns) {
              if (!result.projectContext.patterns.some((p) => p.path === pattern.path)) {
                result.projectContext.patterns.push(pattern);
              }
            }
          } catch (e) {
            result.errors.push({
              file: file.name,
              error: e instanceof Error ? e.message : 'Unknown error',
            });
          }
        }

        setLastResult(result);
        onImportComplete?.(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error('Import failed');
        setError(err);
        onError?.(err);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [importFromContent, onImportComplete, onError]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setLastResult(null);
    setIsImporting(false);
    setError(null);
  }, []);

  return {
    importFromContent,
    importFromFiles,
    parseFrontmatter,
    extractTechStack,
    extractConventions,
    extractForbiddenPatterns,
    extractFileStructure,
    extractPatterns,
    lastResult,
    isImporting,
    error,
    reset,
  };
}

/**
 * Format parsed tech stack as string
 */
export function formatTechStack(techStack: ParsedTechStack): string {
  const lines: string[] = [];

  if (techStack.framework) lines.push(`Framework: ${techStack.framework}`);
  if (techStack.language) lines.push(`Language: ${techStack.language}`);
  if (techStack.styling) lines.push(`Styling: ${techStack.styling}`);
  if (techStack.stateManagement) lines.push(`State: ${techStack.stateManagement}`);
  if (techStack.forms) lines.push(`Forms: ${techStack.forms}`);
  if (techStack.ui) lines.push(`UI: ${techStack.ui}`);
  if (techStack.testing) lines.push(`Testing: ${techStack.testing}`);
  if (techStack.database) lines.push(`Database: ${techStack.database}`);
  if (techStack.orm) lines.push(`ORM: ${techStack.orm}`);

  return lines.join('\n');
}

/**
 * Validate MDC file content
 */
export function validateMDCContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('Content is empty');
    return { valid: false, errors };
  }

  // Check for valid frontmatter (optional but should be well-formed if present)
  if (content.startsWith('---')) {
    // Look for closing --- at the start of a line
    const lines = content.split('\n');
    let foundClosing = false;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        foundClosing = true;
        break;
      }
    }
    if (!foundClosing) {
      errors.push('Frontmatter is not properly closed with ---');
    }
  }

  return { valid: errors.length === 0, errors };
}

export default useCursorRulesImport;
