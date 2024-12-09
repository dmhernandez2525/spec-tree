'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    value: '10,000+',
    label: 'Active Users',
  },
  {
    value: '94%',
    label: 'Trial Satisfaction',
  },
  {
    value: '40%',
    label: 'Average Time Saved',
  },
  {
    value: '98%',
    label: 'Support Response Rate',
  },
];

export function TrialStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
