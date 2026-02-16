/**
 * API usage analytics dashboard.
 * Shows request counts, error rates, and latency metrics.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Activity, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import type { RootState } from '@/lib/store';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, sublabel }) => (
  <div className="rounded-md border border-border p-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
  </div>
);

const ApiUsageDashboard: React.FC = () => {
  const usage = useSelector((state: RootState) => state.restApi.usage);

  if (!usage) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">API Usage</h3>
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No usage data available yet. Usage stats appear after API keys are used.
        </div>
      </div>
    );
  }

  const errorRate = usage.totalRequests > 0
    ? ((usage.errorCount / usage.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">API Usage</h3>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Total Requests"
          value={usage.totalRequests.toLocaleString()}
        />
        <MetricCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Error Rate"
          value={`${errorRate}%`}
          sublabel={`${usage.errorCount} errors`}
        />
        <MetricCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg Latency"
          value={`${Math.round(usage.avgLatencyMs)}ms`}
        />
        <MetricCard
          icon={<Activity className="h-4 w-4" />}
          label="Endpoints"
          value={String(Object.keys(usage.requestsByEndpoint).length)}
        />
      </div>

      {Object.keys(usage.requestsByEndpoint).length > 0 && (
        <div className="rounded-md border border-border p-3">
          <h4 className="mb-2 text-xs font-medium text-muted-foreground">Requests by Endpoint</h4>
          <div className="space-y-1">
            {Object.entries(usage.requestsByEndpoint)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([endpoint, count]) => (
                <div key={endpoint} className="flex items-center justify-between text-xs">
                  <code className="text-muted-foreground">{endpoint}</code>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiUsageDashboard;
