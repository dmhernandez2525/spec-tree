'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Icons } from '@/components/shared/icons';
import { cn } from '@/lib/utils';
import Section from '@/components/layout/Section';

interface WorkflowStep {
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

interface Workflow {
  title: string;
  description: string;
  steps: WorkflowStep[];
  image: string;
}

const workflows: Workflow[] = [
  {
    title: 'Feature Development',
    description: 'From concept to implementation with AI-assisted planning',
    steps: [
      {
        title: 'Initial Context',
        description:
          'AI guides you through capturing comprehensive requirements',
        icon: 'brain',
      },
      {
        title: 'Auto Generation',
        description: 'System generates complete feature hierarchy',
        icon: 'users',
      },
      {
        title: 'Review & Refine',
        description: 'Team reviews and adjusts generated items',
        icon: 'check',
      },
      {
        title: 'Implementation',
        description: 'Execute with clear context and dependencies',
        icon: 'users',
      },
    ],

    image:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    title: 'Sprint Planning',
    description: 'Streamlined sprint organization and story breakdown',
    steps: [
      {
        title: 'Backlog Review',
        description: 'AI helps prioritize and group related items',
        icon: 'users',
      },
      {
        title: 'Story Generation',
        description: 'Automatic creation of well-formed user stories',
        icon: 'users',
      },
      {
        title: 'Task Breakdown',
        description: 'AI assists in creating detailed tasks',
        icon: 'users',
      },
      {
        title: 'Assignment',
        description: 'Smart suggestions for task assignments',
        icon: 'users',
      },
    ],
    image:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export function SampleWorkflows() {
  return (
    <Section className=" space-y-16">
      <HeadingSection
        heading="Sample Workflows"
        description="See how Spec Tree streamlines common development processes"
        className="text-center"
      />

      {workflows.map((workflow, index) => (
        <div
          key={workflow.title}
          className={cn(
            'grid gap-8 items-center',
            'lg:grid-cols-2',
            index % 2 === 1 && 'lg:[&>:first-child]:order-2'
          )}
        >
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">{workflow.title}</h3>
              <p className="text-muted-foreground">{workflow.description}</p>
            </div>

            <div className="grid gap-4">
              {workflow.steps.map((step) => {
                const Icon = Icons[step.icon];
                return (
                  <Card key={step.title}>
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="relative aspect-square">
            <Image
              src={workflow.image}
              alt={workflow.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </Section>
  );
}
