/**
 * Memory leak detection and monitoring utilities.
 * Tracks JavaScript heap usage snapshots over time and analyzes
 * growth trends to flag potential memory leaks.
 */

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export type MemoryTrend = 'stable' | 'growing' | 'shrinking';

export interface MemoryAnalysis {
  trend: MemoryTrend;
  /** Average growth rate in bytes per second */
  averageGrowthRate: number;
  /** Peak usedJSHeapSize observed across all snapshots */
  peakUsage: number;
  /** True when growth rate exceeds 1 MB/min over 5+ snapshots */
  leakSuspected: boolean;
}

export interface MemoryMonitor {
  start: () => void;
  stop: () => void;
  getSnapshots: () => MemorySnapshot[];
  analyze: () => MemoryAnalysis;
}

/** 1 MB per minute expressed as bytes per second */
const LEAK_THRESHOLD_BYTES_PER_SEC = (1024 * 1024) / 60;

/** Minimum number of snapshots required to suspect a leak */
const MIN_SNAPSHOTS_FOR_LEAK = 5;

/** Default capture interval in milliseconds (30 seconds) */
const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Extends the Performance interface to include the non-standard
 * memory property available in Chromium-based browsers.
 */
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Takes a single memory snapshot using the performance.memory API.
 * Returns null when the API is not available (e.g., in Firefox or Safari).
 */
export function takeSnapshot(): MemorySnapshot | null {
  const perf = performance as PerformanceWithMemory;

  if (!perf.memory) {
    return null;
  }

  return {
    timestamp: Date.now(),
    usedJSHeapSize: perf.memory.usedJSHeapSize,
    totalJSHeapSize: perf.memory.totalJSHeapSize,
    jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
  };
}

/**
 * Analyzes an array of memory snapshots and returns trend information,
 * average growth rate, peak usage, and whether a leak is suspected.
 *
 * A leak is suspected when the average growth rate exceeds 1 MB per
 * minute and there are at least 5 snapshots in the dataset.
 */
export function analyzeSnapshots(snapshots: MemorySnapshot[]): MemoryAnalysis {
  if (snapshots.length === 0) {
    return {
      trend: 'stable',
      averageGrowthRate: 0,
      peakUsage: 0,
      leakSuspected: false,
    };
  }

  const peakUsage = Math.max(...snapshots.map((s) => s.usedJSHeapSize));

  if (snapshots.length < 2) {
    return {
      trend: 'stable',
      averageGrowthRate: 0,
      peakUsage,
      leakSuspected: false,
    };
  }

  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const durationSec = (last.timestamp - first.timestamp) / 1000;

  if (durationSec <= 0) {
    return {
      trend: 'stable',
      averageGrowthRate: 0,
      peakUsage,
      leakSuspected: false,
    };
  }

  const bytesChanged = last.usedJSHeapSize - first.usedJSHeapSize;
  const averageGrowthRate = bytesChanged / durationSec;

  let trend: MemoryTrend = 'stable';
  // Use a small threshold (1 KB/s) to avoid labeling tiny fluctuations
  if (averageGrowthRate > 1024) {
    trend = 'growing';
  } else if (averageGrowthRate < -1024) {
    trend = 'shrinking';
  }

  const leakSuspected =
    snapshots.length >= MIN_SNAPSHOTS_FOR_LEAK &&
    averageGrowthRate > LEAK_THRESHOLD_BYTES_PER_SEC;

  return {
    trend,
    averageGrowthRate,
    peakUsage,
    leakSuspected,
  };
}

/**
 * Creates a memory monitor that captures snapshots at a regular interval.
 * Call start() to begin capturing and stop() to halt. Use getSnapshots()
 * to retrieve the collected data and analyze() for trend analysis.
 */
export function createMemoryMonitor(
  intervalMs = DEFAULT_INTERVAL_MS
): MemoryMonitor {
  const snapshots: MemorySnapshot[] = [];
  let timerId: ReturnType<typeof setInterval> | null = null;

  function capture(): void {
    const snapshot = takeSnapshot();
    if (snapshot) {
      snapshots.push(snapshot);
    }
  }

  function start(): void {
    if (timerId !== null) {
      return;
    }
    capture();
    timerId = setInterval(capture, intervalMs);
  }

  function stop(): void {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function getSnapshots(): MemorySnapshot[] {
    return [...snapshots];
  }

  function analyze(): MemoryAnalysis {
    return analyzeSnapshots(snapshots);
  }

  return { start, stop, getSnapshots, analyze };
}

/**
 * Formats a byte count into a human-readable string
 * (e.g., "1.5 MB", "256 KB", "32 B").
 */
export function formatMemorySize(bytes: number): string {
  if (bytes < 0) {
    return `-${formatMemorySize(-bytes)}`;
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const formatted = unitIndex === 0 ? value.toString() : value.toFixed(2);
  return `${formatted} ${units[unitIndex]}`;
}
