'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Icons } from '@/components/shared/icons';
import Section from '@/components/layout/Section';

interface Feature {
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

const features: Feature[] = [
  {
    title: 'AI-Powered Context Gathering',
    description:
      'Intelligent system that asks relevant questions to gather comprehensive project requirements.',
    icon: 'brain',
  },
  {
    title: 'Smart Work Item Generation',
    description:
      'Automatically generate epics, features, user stories, and tasks with smart dependencies.',
    icon: 'plug',
  },
  {
    title: 'Context Propagation',
    description:
      'Automatically sync and update context across related work items.',
    icon: 'plug',
  },
  {
    title: 'Template System',
    description:
      'Save and reuse project templates to start new initiatives faster.',
    icon: 'plug',
  },
  {
    title: 'Integration Hub',
    description:
      'Connect with your favorite project management tools seamlessly.',
    icon: 'plug',
  },
  {
    title: 'Real-time Analytics',
    description:
      'Track project progress and team performance with detailed insights.',
    icon: 'barChart',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export function Features() {
  return (
    <Section>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-12"
      >
        <HeadingSection
          heading="Powerful Features"
          description="Transform how you plan and execute projects with our AI-powered tools"
          className="text-center"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = Icons[feature.icon];
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="relative h-full overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="rounded-lg bg-primary/10 p-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
