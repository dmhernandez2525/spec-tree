'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Icons } from '@/components/shared/icons';

interface Feature {
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

const features: Feature[] = [
  {
    title: 'AI-Powered Context Gathering',
    description:
      'Intelligent system that asks relevant questions to capture comprehensive project requirements.',
    icon: 'brain',
  },
  {
    title: 'Smart Work Item Generation',
    description:
      'Automatically generate epics, features, and user stories based on context.',
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

export function Features() {
  return (
    <div className="container">
      <HeadingSection
        heading="Powerful Features"
        description="Transform how you plan and execute projects with our AI-powered tools"
        className="text-center mb-12"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features?.map((feature) => {
          const Icon = Icons[feature.icon];
          return (
            <Card key={feature.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
