/**
 * Privacy-respecting analytics event tracking for SpecTree.
 * Queues events locally and flushes them to the analytics endpoint.
 * Respects Do Not Track (DNT) headers.
 */

export type EventCategory =
  | 'page_view'
  | 'feature_use'
  | 'export'
  | 'generation'
  | 'collaboration'
  | 'error';

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties: Record<string, string | number | boolean>;
  timestamp: number;
}

export interface AnalyticsTracker {
  track: (
    name: string,
    category: EventCategory,
    properties?: Record<string, string | number | boolean>,
  ) => void;
  pageView: (path: string, title?: string) => void;
  getEvents: () => AnalyticsEvent[];
  flush: () => Promise<void>;
  getEventCounts: () => Record<string, number>;
}

/**
 * Creates an analytics tracker that queues events and provides
 * convenience methods for tracking page views and flushing to the server.
 */
export function createAnalyticsTracker(
  fetchFn: typeof fetch = typeof window !== 'undefined' ? window.fetch.bind(window) : (fetch as typeof fetch),
): AnalyticsTracker {
  let events: AnalyticsEvent[] = [];

  const track = (
    name: string,
    category: EventCategory,
    properties: Record<string, string | number | boolean> = {},
  ): void => {
    events.push({
      name,
      category,
      properties,
      timestamp: Date.now(),
    });
  };

  const pageView = (path: string, title?: string): void => {
    const properties: Record<string, string> = { path };
    if (title) {
      properties.title = title;
    }
    track('page_view', 'page_view', properties);
  };

  const getEvents = (): AnalyticsEvent[] => {
    return [...events];
  };

  const flush = async (): Promise<void> => {
    if (events.length === 0) return;

    const eventsToSend = [...events];
    events = [];

    try {
      await fetchFn('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend }),
      });
    } catch {
      // On failure, re-queue the events so they are not lost
      events = [...eventsToSend, ...events];
    }
  };

  const getEventCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (const event of events) {
      counts[event.category] = (counts[event.category] || 0) + 1;
    }
    return counts;
  };

  return { track, pageView, getEvents, flush, getEventCounts };
}

/**
 * Checks whether tracking is allowed by inspecting the navigator.doNotTrack setting.
 * Returns true if tracking is permitted, false if the user has opted out.
 */
export function isTrackingAllowed(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.doNotTrack !== '1';
}

/**
 * Hashes a user ID for privacy using a simple non-reversible hash.
 * This is not cryptographically secure, but sufficient for anonymizing
 * analytics identifiers.
 */
export function anonymizeUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}
