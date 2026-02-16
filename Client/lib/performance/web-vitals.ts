/**
 * Web Vitals monitoring utilities.
 * Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP) using the
 * PerformanceObserver API and rates each metric against Google's
 * recommended thresholds.
 */

export type WebVitalName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalsMetric {
  name: WebVitalName;
  value: number;
  rating: MetricRating;
  timestamp: number;
}

export interface PerformanceSummary {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  domInteractive: number;
  responseEnd: number;
  transferSize: number;
}

/**
 * Thresholds for each Web Vital metric.
 * First value is the "good" upper bound; second is the "poor" lower bound.
 * Values between the two are rated "needs-improvement".
 */
export const THRESHOLDS: Record<WebVitalName, [number, number]> = {
  LCP: [2500, 4000],
  FID: [100, 300],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
  INP: [200, 500],
};

/**
 * Rates a metric value against its thresholds.
 */
export function rateMetric(name: WebVitalName, value: number): MetricRating {
  const [good, poor] = THRESHOLDS[name];

  if (value <= good) {
    return 'good';
  }

  if (value <= poor) {
    return 'needs-improvement';
  }

  return 'poor';
}

/**
 * Observes Web Vitals using PerformanceObserver and invokes the callback
 * with each metric as it is captured. Handles CLS accumulation by summing
 * layout-shift values that occur without recent user input.
 *
 * Returns a cleanup function that disconnects all observers.
 */
export function collectWebVitals(
  callback: (metric: WebVitalsMetric) => void
): () => void {
  const observers: PerformanceObserver[] = [];
  let clsValue = 0;

  function createMetric(name: WebVitalName, value: number): WebVitalsMetric {
    return {
      name,
      value,
      rating: rateMetric(name, value),
      timestamp: Date.now(),
    };
  }

  function observe(
    type: string,
    handler: (entries: PerformanceEntryList) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        handler(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      // PerformanceObserver may not support this entry type in all browsers
    }
  }

  // Largest Contentful Paint
  observe('largest-contentful-paint', (entries) => {
    const last = entries[entries.length - 1];
    if (last) {
      callback(createMetric('LCP', last.startTime));
    }
  });

  // First Input Delay
  observe('first-input', (entries) => {
    const first = entries[0] as PerformanceEventTiming | undefined;
    if (first) {
      callback(createMetric('FID', first.processingStart - first.startTime));
    }
  });

  // Cumulative Layout Shift (accumulated, excluding shifts with recent input)
  observe('layout-shift', (entries) => {
    for (const entry of entries) {
      const layoutEntry = entry as PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      };

      if (!layoutEntry.hadRecentInput && layoutEntry.value !== undefined) {
        clsValue += layoutEntry.value;
      }
    }
    callback(createMetric('CLS', clsValue));
  });

  // First Contentful Paint
  observe('paint', (entries) => {
    for (const entry of entries) {
      if (entry.name === 'first-contentful-paint') {
        callback(createMetric('FCP', entry.startTime));
      }
    }
  });

  // Time to First Byte
  observe('navigation', (entries) => {
    const navEntry = entries[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      callback(createMetric('TTFB', navEntry.responseStart - navEntry.requestStart));
    }
  });

  // Interaction to Next Paint
  observe('event', (entries) => {
    let maxDuration = 0;
    for (const entry of entries) {
      const eventEntry = entry as PerformanceEventTiming;
      if (eventEntry.duration > maxDuration) {
        maxDuration = eventEntry.duration;
      }
    }
    if (maxDuration > 0) {
      callback(createMetric('INP', maxDuration));
    }
  });

  return () => {
    for (const observer of observers) {
      observer.disconnect();
    }
  };
}

/**
 * Returns a summary of the current page's performance timing data.
 * Falls back to zeros if the Navigation Timing API is not available.
 */
export function getPerformanceSummary(): PerformanceSummary {
  if (typeof window === 'undefined' || !window.performance) {
    return {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      domInteractive: 0,
      responseEnd: 0,
      transferSize: 0,
    };
  }

  const entries = performance.getEntriesByType('navigation');
  const navEntry = entries[0] as PerformanceNavigationTiming | undefined;

  if (!navEntry) {
    return {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      domInteractive: 0,
      responseEnd: 0,
      transferSize: 0,
    };
  }

  return {
    navigationStart: navEntry.startTime,
    domContentLoaded: navEntry.domContentLoadedEventEnd,
    loadComplete: navEntry.loadEventEnd,
    domInteractive: navEntry.domInteractive,
    responseEnd: navEntry.responseEnd,
    transferSize: navEntry.transferSize,
  };
}
