import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: number | string;
  description?: string;
}

interface MetricsDisplayProps {
  metrics: Metric[];
  className?: string;
  cardClassName?: string;
}

const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  className,
  cardClassName,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4',
        className
      )}
    >
      {metrics.map((metric, index) => (
        <Card
          key={`${metric.label}-${index}`}
          className={cn('border', cardClassName)}
        >
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.description && (
              <CardDescription className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </CardDescription>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsDisplay;
