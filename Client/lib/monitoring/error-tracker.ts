/**
 * Error tracking and reporting for SpecTree monitoring.
 * Captures, deduplicates, and reports application errors.
 */

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export interface TrackedError {
  id: string;
  message: string;
  stack: string | null;
  severity: ErrorSeverity;
  timestamp: number;
  context: Record<string, unknown>;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

export interface ErrorStats {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  uniqueCount: number;
}

export interface ErrorTracker {
  capture(error: unknown, severity?: ErrorSeverity, context?: Record<string, unknown>): TrackedError;
  getErrors(): TrackedError[];
  getErrorsBySeverity(severity: ErrorSeverity): TrackedError[];
  getTopErrors(limit?: number): TrackedError[];
  clear(): void;
  getStats(): ErrorStats;
}

function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

function extractStack(error: unknown): string | null {
  if (error instanceof Error && error.stack) return error.stack;
  return null;
}

export function createErrorTracker(): ErrorTracker {
  const errors: Map<string, TrackedError> = new Map();

  function capture(
    error: unknown,
    severity: ErrorSeverity = 'error',
    context: Record<string, unknown> = {},
  ): TrackedError {
    const message = extractMessage(error);
    const now = Date.now();

    const existing = errors.get(message);
    if (existing) {
      existing.count += 1;
      existing.lastSeen = now;
      existing.context = { ...existing.context, ...context };
      return existing;
    }

    const tracked: TrackedError = {
      id: generateErrorId(),
      message,
      stack: extractStack(error),
      severity,
      timestamp: now,
      context,
      count: 1,
      firstSeen: now,
      lastSeen: now,
    };

    errors.set(message, tracked);
    return tracked;
  }

  function getErrors(): TrackedError[] {
    return Array.from(errors.values());
  }

  function getErrorsBySeverity(severity: ErrorSeverity): TrackedError[] {
    return getErrors().filter((e) => e.severity === severity);
  }

  function getTopErrors(limit: number = 10): TrackedError[] {
    return getErrors()
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  function clear(): void {
    errors.clear();
  }

  function getStats(): ErrorStats {
    const all = getErrors();
    const bySeverity: Record<ErrorSeverity, number> = {
      fatal: 0,
      error: 0,
      warning: 0,
      info: 0,
    };

    let total = 0;
    for (const tracked of all) {
      bySeverity[tracked.severity] += tracked.count;
      total += tracked.count;
    }

    return {
      total,
      bySeverity,
      uniqueCount: all.length,
    };
  }

  return {
    capture,
    getErrors,
    getErrorsBySeverity,
    getTopErrors,
    clear,
    getStats,
  };
}

export function setupGlobalErrorHandler(tracker: ErrorTracker): () => void {
  const handleError = (event: ErrorEvent): void => {
    tracker.capture(event.error ?? event.message, 'error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      source: 'window.onerror',
    });
  };

  const handleRejection = (event: PromiseRejectionEvent): void => {
    tracker.capture(event.reason, 'error', {
      source: 'unhandledrejection',
    });
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}

export function formatErrorReport(errors: TrackedError[]): string {
  if (errors.length === 0) {
    return '# Error Report\n\nNo errors recorded.';
  }

  const lines: string[] = [
    '# Error Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Total unique errors: ${errors.length}`,
    `Total occurrences: ${errors.reduce((sum, e) => sum + e.count, 0)}`,
    '',
    '---',
    '',
  ];

  for (const error of errors) {
    lines.push(`## ${error.severity.toUpperCase()}: ${error.message}`);
    lines.push('');
    lines.push(`- **ID:** ${error.id}`);
    lines.push(`- **Count:** ${error.count}`);
    lines.push(`- **First seen:** ${new Date(error.firstSeen).toISOString()}`);
    lines.push(`- **Last seen:** ${new Date(error.lastSeen).toISOString()}`);

    if (error.stack) {
      lines.push('');
      lines.push('```');
      lines.push(error.stack);
      lines.push('```');
    }

    if (Object.keys(error.context).length > 0) {
      lines.push('');
      lines.push(`**Context:** ${JSON.stringify(error.context, null, 2)}`);
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
