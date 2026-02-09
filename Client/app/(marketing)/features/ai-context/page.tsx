'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/layout/Section';
import { InteractiveDemo } from '@/components/marketing/features/InteractiveDemo';
import { HeadingSection } from '@/components/shared/HeadingSection';

interface BenefitProps {
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

const benefits: BenefitProps[] = [
  {
    title: 'Intelligent Question Generation',
    description:
      'Our AI analyzes your project type and goals to ask relevant, context-specific questions that ensure comprehensive requirements gathering.',
    icon: 'brain',
  },
  {
    title: 'Context Inheritance',
    description:
      'Automatically propagate relevant context from epics to features to user stories, ensuring consistency throughout your project hierarchy.',
    icon: 'search',
  },
  {
    title: 'Gap Analysis',
    description:
      'AI-powered analysis identifies potential gaps in requirements and suggests additional areas to consider.',
    icon: 'search',
  },
  {
    title: 'Smart Updates',
    description:
      'When context changes at any level, our system intelligently updates related items while preserving specific details.',
    icon: 'search',
  },
];

const useCases = [
  {
    title: 'Software Development',
    description:
      'Capture technical requirements, dependencies, and constraints with AI-guided questioning.',
    scenarios: [
      'Feature specification refinement',
      'Technical debt assessment',
      'Integration requirements gathering',
      'Security consideration checklist',
    ],
  },
  {
    title: 'Product Management',
    description:
      'Ensure comprehensive market and user requirements are captured for product planning.',
    scenarios: [
      'Market analysis integration',
      'User research findings',
      'Competitive feature analysis',
      'Release planning context',
    ],
  },
  {
    title: 'Agile Teams',
    description:
      'Support sprint planning and backlog refinement with intelligent context gathering.',
    scenarios: [
      'Sprint scope definition',
      'Story point estimation context',
      'Definition of Done criteria',
      'Sprint dependencies mapping',
    ],
  },
];

export default function AIContextPage() {
  return (
    <Section className=" py-8 md:py-12">
      {/* Hero Section */}
      <HeadingSection
        heading="AI-Powered Context Gathering"
        description="Transform your project planning with intelligent context gathering that ensures nothing falls through the cracks."
        className="text-center"
      />

      {/* Main Feature Demo/Screenshot */}
      <div className="mt-16 rounded-lg border bg-card p-4 sm:p-6 lg:p-8">
        <InteractiveDemo />
      </div>

      {/* Benefits Section */}
      <div className="mt-24">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">Key Benefits</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {benefits.map((benefit) => {
            const Icon = Icons[benefit.icon];
            return (
              <Card key={benefit.title}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{benefit.title}</h3>
                      <p className="mt-2 text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="mt-24">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">Use Cases</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="relative overflow-hidden">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {useCase.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {useCase.scenarios.map((scenario) => (
                    <li key={scenario} className="flex items-center gap-2">
                      <Icons.check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{scenario}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-24">
        <h2 className="text-center text-2xl sm:text-3xl font-bold">How It Works</h2>
        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <div className="relative aspect-video">
            <Image
              src="/images/context-propagation.png"
              alt="AI Context Flow"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">1. Initial Analysis</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your project type, goals, and existing
                documentation to understand the context needed.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                2. Smart Question Generation
              </h3>
              <p className="text-muted-foreground">
                Based on the analysis, the system generates relevant questions
                to gather comprehensive context.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">3. Context Propagation</h3>
              <p className="text-muted-foreground">
                Gathered context is intelligently distributed across work items
                while maintaining relationships.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                4. Continuous Refinement
              </h3>
              <p className="text-muted-foreground">
                The system learns from user feedback and project patterns to
                improve question relevance over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-24 rounded-lg bg-primary p-4 sm:p-6 lg:p-8 text-primary-foreground">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to Transform Your Project Planning?
          </h2>
          <p className="mt-4 text-base sm:text-xl opacity-90">
            Start using Spec Trees AI-powered context gathering today.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
