'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';
import { FeatureHighlight } from '@/components/features/FeatureHighlight';
import { FeatureComparison } from '@/components/features/FeatureComparison';
import { HeadingSection } from '@/components/shared/HeadingSection';

interface FeatureCard {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  href: string;
}

const features: FeatureCard[] = [
  {
    title: 'AI-Powered Context Gathering',
    description:
      'Intelligent system that asks the right questions to gather comprehensive project context',
    icon: 'brain',
    href: '/features/ai-context',
  },
  {
    title: 'Work Item Generation',
    description:
      'Automatically generate epics, features, user stories, and tasks with smart dependencies',
    icon: 'eye',
    href: '/features/work-items',
  },
  {
    title: 'Template System',
    description:
      'Save and reuse project templates to start new initiatives faster',
    icon: 'eye',
    href: '/features/templates',
  },
  {
    title: 'Context Propagation',
    description:
      'Automatically sync and update context across related work items',
    icon: 'eye',
    href: '/features/context-propagation',
  },
  {
    title: 'Integration Hub',
    description:
      'Connect with your favorite project management tools seamlessly',
    icon: 'plug',
    href: '/features/integrations',
  },
  {
    title: 'Analytics & Insights',
    description:
      'Gain valuable insights into your project planning and execution',
    icon: 'barChart',
    href: '/features/analytics',
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <HeadingSection
        heading="Powerful Features for Modern Project Management"
        description="Transform how you plan and execute projects with our AI-powered tools and intelligent workflows."
        className="text-center"
      />

      {/* Feature Cards Grid */}
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = Icons[feature.icon];
          return (
            <Card
              key={feature.title}
              className="group relative overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="mt-4 text-muted-foreground">
                  {feature.description}
                </p>
                <Button asChild className="mt-6" variant="ghost">
                  <Link href={feature.href}>
                    Learn More
                    <Icons.arrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div className="mt-24 space-y-24">
        <FeatureHighlight
          title="AI-Powered Context Gathering"
          description="Our intelligent system asks targeted questions to gather comprehensive project context, ensuring nothing is overlooked in your planning process."
          image="/images/features/ai-context.svg"
          features={[
            'Dynamic question generation based on project type',
            'Smart context propagation across work items',
            'Automatic identification of gaps and dependencies',
            'Integration with existing project documentation',
          ]}
        />

        <FeatureHighlight
          title="Intelligent Work Item Generation"
          description="Generate complete project hierarchies from high-level concepts, with smart dependency mapping and context inheritance."
          image="/images/features/work-items.svg"
          features={[
            'Automatic epic, feature, and story generation',
            'Smart task breakdown and organization',
            'Contextual relationship mapping',
            'Effort estimation suggestions',
          ]}
          imageLeft={false}
        />

        <FeatureHighlight
          title="Powerful Template System"
          description="Save time by creating and reusing templates for common project patterns, complete with context and dependencies."
          image="/images/features/templates.svg"
          features={[
            'Custom template creation and management',
            'Industry-specific template library',
            'Flexible template modification',
            'Template sharing across teams',
          ]}
        />
      </div>

      {/* Feature Comparison */}
      <div className="mt-24">
        <FeatureComparison />
      </div>

      {/* CTA Section */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold">
          Ready to Transform Your Project Planning?
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          Start using Spec Tree today and experience the future of
          project management.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
