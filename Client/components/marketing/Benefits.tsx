// components/marketing/Benefits.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Icons } from '@/components/shared/icons';

interface Benefit {
  title: string;
  description: string;
  metrics: {
    value: string;
    label: string;
  }[];
}

const benefits: Benefit[] = [
  {
    title: 'Faster Project Delivery',
    description:
      'Reduce project planning time and accelerate delivery with AI-assisted workflows.',
    metrics: [
      { value: '40%', label: 'Faster Planning' },
      { value: '25%', label: 'Reduced Rework' },
      { value: '60%', label: 'Team Productivity' },
    ],
  },
  {
    title: 'Better Requirements',
    description:
      'Capture comprehensive requirements with AI-guided questioning and context propagation.',
    metrics: [
      { value: '85%', label: 'More Complete' },
      { value: '50%', label: 'Fewer Changes' },
      { value: '30%', label: 'Cost Savings' },
    ],
  },
  {
    title: 'Enhanced Collaboration',
    description:
      'Keep everyone aligned with shared context and clear dependencies.',
    metrics: [
      { value: '75%', label: 'Better Alignment' },
      { value: '45%', label: 'Fewer Meetings' },
      { value: '90%', label: 'Team Satisfaction' },
    ],
  },
];

export function Benefits() {
  return (
    <div className="container">
      <HeadingSection
        heading="Real Results"
        description="See how Spec Tree transforms project management"
        className="text-center mb-12"
      />

      <div className="grid gap-8 md:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.title} className="relative overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground mb-6">
                {benefit.description}
              </p>

              <div className="grid grid-cols-3 gap-4">
                {benefit.metrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {metric.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
