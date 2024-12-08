'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { HeadingSection } from '@/components/shared/HeadingSection';
import Section from '@/components/layout/Section';

interface Benefit {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

const benefits: Benefit[] = [
  {
    title: 'Faster Project Delivery',
    description:
      'Reduce project planning time and accelerate delivery with AI-assisted workflows.',
    icon: 'brain',
    stats: [
      { value: '40%', label: 'Faster Planning' },
      { value: '25%', label: 'Reduced Rework' },
      { value: '60%', label: 'Team Productivity' },
    ],
  },
  {
    title: 'Better Requirements',
    description:
      'Capture comprehensive requirements with AI-guided questioning and context propagation.',
    icon: 'eye',
    stats: [
      { value: '85%', label: 'More Complete' },
      { value: '50%', label: 'Fewer Changes' },
      { value: '30%', label: 'Cost Savings' },
    ],
  },
  {
    title: 'Enhanced Collaboration',
    description:
      'Keep everyone aligned with shared context and clear dependencies.',
    icon: 'users',
    stats: [
      { value: '75%', label: 'Better Alignment' },
      { value: '45%', label: 'Fewer Meetings' },
      { value: '90%', label: 'Team Satisfaction' },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Benefits() {
  return (
    <Section>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <HeadingSection
          heading="Real Results"
          description="See how Spec Tree transforms project management"
          className="text-center mb-12"
        />

        <div className="grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = Icons[benefit.icon];
            return (
              <motion.div
                key={benefit.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      {benefit.stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {stat.value}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Section>
  );
}
