/**
 * Enterprise Audit Logging
 *
 * Provides an in-memory audit event logger with filtering, export,
 * and formatting capabilities for compliance and security tracking.
 */

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout'
  | 'invite'
  | 'permission_change';

export interface AuditEvent {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: number;
  ip: string | null;
}

export interface AuditLogger {
  log: (event: AuditEvent) => void;
  getEvents: () => AuditEvent[];
  filterByUser: (userId: string) => AuditEvent[];
  filterByAction: (action: string) => AuditEvent[];
  filterByDateRange: (start: number, end: number) => AuditEvent[];
  getEventCount: () => number;
  exportAsCSV: () => string;
  clear: () => void;
}

/**
 * Create an in-memory audit logger instance.
 *
 * The logger stores events in an internal array and provides methods
 * for querying, filtering, exporting, and clearing the event log.
 */
export function createAuditLogger(): AuditLogger {
  let events: AuditEvent[] = [];

  return {
    /**
     * Add an audit event to the log.
     */
    log(event: AuditEvent): void {
      events.push(event);
    },

    /**
     * Retrieve all recorded audit events.
     */
    getEvents(): AuditEvent[] {
      return [...events];
    },

    /**
     * Filter events by the user who performed the action.
     */
    filterByUser(userId: string): AuditEvent[] {
      return events.filter((e) => e.userId === userId);
    },

    /**
     * Filter events by action type.
     */
    filterByAction(action: string): AuditEvent[] {
      return events.filter((e) => e.action === action);
    },

    /**
     * Filter events within a timestamp range (inclusive on both ends).
     */
    filterByDateRange(start: number, end: number): AuditEvent[] {
      return events.filter((e) => e.timestamp >= start && e.timestamp <= end);
    },

    /**
     * Get the total number of recorded events.
     */
    getEventCount(): number {
      return events.length;
    },

    /**
     * Export all events as a CSV string.
     * Includes a header row and one data row per event.
     * The details field is serialized as JSON.
     */
    exportAsCSV(): string {
      const headers = ['id', 'tenantId', 'userId', 'action', 'resource', 'resourceId', 'details', 'timestamp', 'ip'];
      const rows = events.map((e) => {
        const detailsStr = JSON.stringify(e.details).replace(/"/g, '""');
        return [
          e.id,
          e.tenantId,
          e.userId,
          e.action,
          e.resource,
          e.resourceId,
          `"${detailsStr}"`,
          String(e.timestamp),
          e.ip ?? '',
        ].join(',');
      });

      return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Remove all events from the log.
     */
    clear(): void {
      events = [];
    },
  };
}

/**
 * Format an audit event as a human-readable string suitable for
 * display in logs or notification feeds.
 */
export function formatAuditEvent(event: AuditEvent): string {
  const date = new Date(event.timestamp).toISOString();
  return `[${date}] User ${event.userId} performed ${event.action} on ${event.resource} (${event.resourceId})`;
}
