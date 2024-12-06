import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface MetricDisplayProps {
  metrics: {
    value: string;
    label: string;
  }[];
}

export function MetricDisplay({ metrics }: MetricDisplayProps) {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
