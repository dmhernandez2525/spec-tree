/**
 * Feature usage tracking for SpecTree.
 * Tracks which features are used, how often, and for how long.
 */

export interface UsageMetric {
  feature: string;
  count: number;
  lastUsed: number;
  averageDuration: number | null;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  pageViews: number;
  features: Record<string, UsageMetric>;
  duration: number;
}

export interface UsageTrackerSummary {
  totalFeatureUses: number;
  uniqueFeatures: number;
  pageViews: number;
  sessionDuration: number;
}

export interface UsageTracker {
  trackFeatureUse(feature: string, duration?: number): void;
  trackPageView(path: string): void;
  getMetrics(): Record<string, UsageMetric>;
  getTopFeatures(limit?: number): UsageMetric[];
  getSessionDuration(): number;
  getSummary(): UsageTrackerSummary;
}

export const TRACKED_FEATURES = [
  'spec-create',
  'spec-edit',
  'spec-delete',
  'ai-generate',
  'export-markdown',
  'export-json',
  'export-cursor',
  'export-copilot',
  'export-devin',
  'collaboration-comment',
  'github-sync',
  'webhook-create',
] as const;

export type TrackedFeature = (typeof TRACKED_FEATURES)[number];

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createUsageTracker(): UsageTracker {
  const sessionId = generateSessionId();
  const startTime = Date.now();
  const features: Map<string, UsageMetric> = new Map();
  let pageViews = 0;

  function trackFeatureUse(feature: string, duration?: number): void {
    const now = Date.now();
    const existing = features.get(feature);

    if (existing) {
      const newCount = existing.count + 1;

      let newAvgDuration = existing.averageDuration;
      if (duration !== undefined) {
        if (existing.averageDuration !== null) {
          newAvgDuration =
            (existing.averageDuration * existing.count + duration) / newCount;
        } else {
          newAvgDuration = duration;
        }
      }

      features.set(feature, {
        feature,
        count: newCount,
        lastUsed: now,
        averageDuration: newAvgDuration,
      });
    } else {
      features.set(feature, {
        feature,
        count: 1,
        lastUsed: now,
        averageDuration: duration !== undefined ? duration : null,
      });
    }
  }

  function trackPageView(_path: string): void {
    pageViews += 1;
  }

  function getMetrics(): Record<string, UsageMetric> {
    const result: Record<string, UsageMetric> = {};
    features.forEach((value, key) => {
      result[key] = { ...value };
    });
    return result;
  }

  function getTopFeatures(limit: number = 10): UsageMetric[] {
    return Array.from(features.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  function getSessionDuration(): number {
    return Date.now() - startTime;
  }

  function getSummary(): UsageTrackerSummary {
    let totalFeatureUses = 0;
    features.forEach((metric) => {
      totalFeatureUses += metric.count;
    });

    return {
      totalFeatureUses,
      uniqueFeatures: features.size,
      pageViews,
      sessionDuration: getSessionDuration(),
    };
  }

  return {
    trackFeatureUse,
    trackPageView,
    getMetrics,
    getTopFeatures,
    getSessionDuration,
    getSummary,
  };
}
