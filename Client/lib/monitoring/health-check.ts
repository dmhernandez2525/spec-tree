/**
 * Application health monitoring for SpecTree.
 * Checks service endpoints, measures latency, and aggregates overall health.
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface HealthCheckResult {
  service: string;
  status: ServiceStatus;
  latency: number | null;
  lastChecked: number;
  message: string | null;
}

export interface OverallHealth {
  status: ServiceStatus;
  services: HealthCheckResult[];
  uptime: number;
  version: string;
}

type StatusChangeCallback = (health: OverallHealth) => void;

export interface HealthMonitor {
  start(): void;
  stop(): void;
  getLastResults(): OverallHealth | null;
  onStatusChange(callback: StatusChangeCallback): () => void;
}

export async function checkEndpointHealth(
  url: string,
  timeout: number = 5000,
): Promise<HealthCheckResult> {
  const serviceName = url.replace(/^https?:\/\//, '').split('/').pop() || url;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    if (response.ok) {
      return {
        service: serviceName,
        status: 'healthy',
        latency,
        lastChecked: Date.now(),
        message: null,
      };
    }

    return {
      service: serviceName,
      status: 'degraded',
      latency,
      lastChecked: Date.now(),
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (err) {
    const latency = Date.now() - start;
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';

    return {
      service: serviceName,
      status: 'down',
      latency: isTimeout ? null : latency,
      lastChecked: Date.now(),
      message: isTimeout
        ? `Request timed out after ${timeout}ms`
        : err instanceof Error
          ? err.message
          : 'Unknown error',
    };
  }
}

export async function checkApiHealth(): Promise<HealthCheckResult> {
  const result = await checkEndpointHealth('/api/health');
  return { ...result, service: 'api' };
}

export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const result = await checkEndpointHealth('/api/health/db');
  return { ...result, service: 'database' };
}

export async function checkMicroserviceHealth(): Promise<HealthCheckResult> {
  const result = await checkEndpointHealth('http://localhost:3001/health');
  return { ...result, service: 'microservice' };
}

export function aggregateHealth(results: HealthCheckResult[]): ServiceStatus {
  if (results.length === 0) return 'unknown';

  const statuses = results.map((r) => r.status);
  const allHealthy = statuses.every((s) => s === 'healthy');
  const allDown = statuses.every((s) => s === 'down');

  if (allHealthy) return 'healthy';
  if (allDown) return 'down';
  return 'degraded';
}

export function createHealthMonitor(interval: number = 30000): HealthMonitor {
  let timerId: ReturnType<typeof setInterval> | null = null;
  let lastResults: OverallHealth | null = null;
  const listeners: Set<StatusChangeCallback> = new Set();
  const startTime = Date.now();

  async function runChecks(): Promise<void> {
    const results = await Promise.all([
      checkApiHealth(),
      checkDatabaseHealth(),
      checkMicroserviceHealth(),
    ]);

    const overallStatus = aggregateHealth(results);
    const previousStatus = lastResults?.status;

    const health: OverallHealth = {
      status: overallStatus,
      services: results,
      uptime: Date.now() - startTime,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0',
    };

    lastResults = health;

    if (previousStatus !== overallStatus) {
      listeners.forEach((callback) => {
        try {
          callback(health);
        } catch {
          // Prevent listener errors from breaking the monitor
        }
      });
    }
  }

  function start(): void {
    if (timerId !== null) return;
    runChecks();
    timerId = setInterval(runChecks, interval);
  }

  function stop(): void {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function getLastResults(): OverallHealth | null {
    return lastResults;
  }

  function onStatusChange(callback: StatusChangeCallback): () => void {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }

  return {
    start,
    stop,
    getLastResults,
    onStatusChange,
  };
}
