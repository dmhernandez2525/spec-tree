/**
 * Uptime and availability tracking for SpecTree.
 * Records check results and calculates uptime statistics.
 */

export interface UptimeRecord {
  timestamp: number;
  isUp: boolean;
  latency: number | null;
}

export interface UptimeStats {
  uptimePercentage: number;
  totalChecks: number;
  successfulChecks: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
}

export interface UptimeTracker {
  recordCheck(isUp: boolean, latency?: number): void;
  getRecords(): UptimeRecord[];
  getStats(): UptimeStats;
  getRecentRecords(count: number): UptimeRecord[];
  isCurrentlyUp(): boolean;
}

export function createUptimeTracker(): UptimeTracker {
  const records: UptimeRecord[] = [];

  function recordCheck(isUp: boolean, latency?: number): void {
    records.push({
      timestamp: Date.now(),
      isUp,
      latency: latency !== undefined ? latency : null,
    });
  }

  function getRecords(): UptimeRecord[] {
    return [...records];
  }

  function getStats(): UptimeStats {
    if (records.length === 0) {
      return {
        uptimePercentage: 0,
        totalChecks: 0,
        successfulChecks: 0,
        averageLatency: 0,
        maxLatency: 0,
        minLatency: 0,
      };
    }

    const successfulChecks = records.filter((r) => r.isUp).length;
    const uptimePercentage = (successfulChecks / records.length) * 100;

    const latencies = records
      .map((r) => r.latency)
      .filter((l): l is number => l !== null);

    let averageLatency = 0;
    let maxLatency = 0;
    let minLatency = 0;

    if (latencies.length > 0) {
      averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      maxLatency = Math.max(...latencies);
      minLatency = Math.min(...latencies);
    }

    return {
      uptimePercentage,
      totalChecks: records.length,
      successfulChecks,
      averageLatency,
      maxLatency,
      minLatency,
    };
  }

  function getRecentRecords(count: number): UptimeRecord[] {
    return records.slice(-count);
  }

  function isCurrentlyUp(): boolean {
    if (records.length === 0) return false;
    return records[records.length - 1].isUp;
  }

  return {
    recordCheck,
    getRecords,
    getStats,
    getRecentRecords,
    isCurrentlyUp,
  };
}

export function formatUptime(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

export function getUptimeColor(percentage: number): string {
  if (percentage > 99.9) return '#22c55e'; // green
  if (percentage > 99) return '#eab308'; // yellow
  return '#ef4444'; // red
}
