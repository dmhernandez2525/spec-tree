/**
 * Bundle size tracking and analysis utilities.
 * Provides helpers for monitoring JavaScript bundle sizes,
 * checking against size limits, and suggesting dynamic imports
 * for heavy dependencies.
 */

export interface BundleStats {
  totalSize: number;
  routeChunks: Map<string, number>;
  sharedChunks: Map<string, number>;
}

export interface BundleWarning {
  type: 'total' | 'route' | 'initial';
  message: string;
  actual: number;
  limit: number;
}

export interface DynamicImportSuggestion {
  importPath: string;
  reason: string;
}

/** Size limits in bytes */
export const SIZE_LIMITS = {
  total: 500_000,
  perRoute: 150_000,
  initialLoad: 200_000,
} as const;

/** Libraries that are known to be heavy and benefit from lazy loading */
const HEAVY_LIBRARIES = [
  'chart.js',
  'recharts',
  'd3',
  'three',
  'monaco-editor',
  'codemirror',
  'highlight.js',
  'prismjs',
  'lodash',
  'moment',
  'pdf',
  'xlsx',
  'markdown',
  'katex',
  'mathjax',
  'ace-builds',
  'quill',
  'draft-js',
  'slate',
  'tiptap',
  'plotly',
];

/** Patterns that indicate route-level components suitable for lazy loading */
const ROUTE_PATTERNS = [
  /\/pages\//,
  /\/app\/.*\/page/,
  /\/views\//,
  /\/routes\//,
  /\/screens\//,
];

/**
 * Checks bundle stats against size limits and returns an array
 * of warnings for any limits that are exceeded.
 */
export function checkBundleSize(stats: BundleStats): BundleWarning[] {
  const warnings: BundleWarning[] = [];

  if (stats.totalSize > SIZE_LIMITS.total) {
    warnings.push({
      type: 'total',
      message: `Total bundle size (${formatBytes(stats.totalSize)}) exceeds limit of ${formatBytes(SIZE_LIMITS.total)}`,
      actual: stats.totalSize,
      limit: SIZE_LIMITS.total,
    });
  }

  stats.routeChunks.forEach((size, route) => {
    if (size > SIZE_LIMITS.perRoute) {
      warnings.push({
        type: 'route',
        message: `Route chunk "${route}" (${formatBytes(size)}) exceeds per-route limit of ${formatBytes(SIZE_LIMITS.perRoute)}`,
        actual: size,
        limit: SIZE_LIMITS.perRoute,
      });
    }
  });

  let initialLoadSize = 0;
  stats.sharedChunks.forEach((size) => {
    initialLoadSize += size;
  });

  if (initialLoadSize > SIZE_LIMITS.initialLoad) {
    warnings.push({
      type: 'initial',
      message: `Initial load size (${formatBytes(initialLoadSize)}) exceeds limit of ${formatBytes(SIZE_LIMITS.initialLoad)}`,
      actual: initialLoadSize,
      limit: SIZE_LIMITS.initialLoad,
    });
  }

  return warnings;
}

/**
 * Converts a byte count to a human-readable string
 * with appropriate unit (B, KB, or MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calculates the compression ratio between original and compressed sizes,
 * returned as a percentage (e.g., 70 means 70% compression).
 */
export function calculateCompressionRatio(
  original: number,
  compressed: number
): number {
  if (original === 0) {
    return 0;
  }

  return ((1 - compressed / original) * 100);
}

/**
 * Analyzes import paths and suggests which ones could benefit from
 * dynamic importing (lazy loading). Identifies heavy third-party
 * libraries and route-level components.
 */
export function getDynamicImportSuggestions(
  importPaths: string[]
): DynamicImportSuggestion[] {
  const suggestions: DynamicImportSuggestion[] = [];

  for (const importPath of importPaths) {
    const lowerPath = importPath.toLowerCase();

    // Check for known heavy libraries
    const matchedLibrary = HEAVY_LIBRARIES.find((lib) =>
      lowerPath.includes(lib)
    );

    if (matchedLibrary) {
      suggestions.push({
        importPath,
        reason: `"${matchedLibrary}" is a heavy library that should be dynamically imported to reduce initial bundle size`,
      });
      continue;
    }

    // Check for route-level components
    const isRouteComponent = ROUTE_PATTERNS.some((pattern) =>
      pattern.test(importPath)
    );

    if (isRouteComponent) {
      suggestions.push({
        importPath,
        reason: 'Route components should use dynamic imports with next/dynamic or React.lazy for code splitting',
      });
      continue;
    }
  }

  return suggestions;
}
