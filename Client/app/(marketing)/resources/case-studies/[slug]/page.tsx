'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Quote } from 'lucide-react';
import Link from 'next/link';
import Section from '@/components/layout/Section';

interface CaseStudyDetail {
  company: string;
  title: string;
  description: string;
  industry: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  quote: {
    text: string;
    author: string;
    role: string;
  };
  implementation: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
  logoUrl: string;
  imageUrl: string;
}

const mockCaseStudy: CaseStudyDetail = {
  company: 'TechCorp Solutions',
  title: 'Streamlining Project Management with AI',
  description:
    'How TechCorp improved project delivery time by 40% using Spec Tree',
  industry: 'Software Development',
  challenge:
    'TechCorp was struggling with inconsistent project documentation, leading to delayed deliveries and miscommunication between teams.',
  solution:
    'By implementing Spec Tree, TechCorp automated their context gathering and work item generation, creating a standardized approach across all projects.',
  results: [
    {
      metric: 'Faster Project Delivery',
      value: '40%',
      description:
        'Reduced average project delivery time from 12 weeks to 7 weeks',
    },
    {
      metric: 'Cost Reduction',
      value: '25%',
      description: 'Decreased project management overhead costs',
    },
    {
      metric: 'Team Productivity',
      value: '+60%',
      description: 'Increased number of completed tasks per sprint',
    },
  ],
  quote: {
    text: 'Spec Tree transformed how we manage projects. The AI-driven approach has made our planning process incredibly efficient while maintaining high quality standards.',
    author: 'Sarah Johnson',
    role: 'Director of Engineering, TechCorp',
  },
  implementation: {
    title: 'Implementation Process',
    description:
      'TechCorp followed a structured approach to implement Spec Tree across their organization.',
    steps: [
      {
        title: 'Initial Setup and Training',
        description:
          'Teams were onboarded through a series of workshops and hands-on training sessions.',
      },
      {
        title: 'Process Integration',
        description:
          'Spec Tree was integrated with existing project management tools and workflows.',
      },
      {
        title: 'AI Model Customization',
        description:
          "The AI context generation was fine-tuned based on TechCorp's specific needs and terminology.",
      },
    ],
  },
  logoUrl: '/images/project-success.png',
  imageUrl: '/images/case-study-success.png',
};

export default function CaseStudyPage() {
  return (
    <Section className=" max-w-4xl py-8 md:py-12">
      <Button variant="ghost" className="mb-8" asChild>
        <Link href="/resources/case-studies">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Case Studies
        </Link>
      </Button>

      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden">
              <Image
                src={mockCaseStudy.logoUrl}
                alt={`${mockCaseStudy.company} logo`}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Badge variant="secondary" className="mb-1">
                {mockCaseStudy.industry}
              </Badge>
              <h3 className="font-semibold">{mockCaseStudy.company}</h3>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{mockCaseStudy.title}</h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            {mockCaseStudy.description}
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={mockCaseStudy.imageUrl}
            alt={mockCaseStudy.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Results */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {mockCaseStudy.results.map((result, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                  {result.value}
                </div>
                <div className="font-medium mb-2">{result.metric}</div>
                <div className="text-sm text-muted-foreground">
                  {result.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Challenge & Solution */}
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Challenge</h2>
            <p className="text-muted-foreground">{mockCaseStudy.challenge}</p>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Solution</h2>
            <p className="text-muted-foreground">{mockCaseStudy.solution}</p>
          </div>
        </div>

        {/* Quote */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <Quote className="h-8 w-8 mb-4 opacity-50" />
            <blockquote className="text-base sm:text-xl italic mb-4">
              {mockCaseStudy.quote.text}
            </blockquote>
            <div>
              <div className="font-semibold">{mockCaseStudy.quote.author}</div>
              <div className="text-primary-foreground/80">
                {mockCaseStudy.quote.role}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            {mockCaseStudy.implementation.title}
          </h2>
          <p className="text-muted-foreground">
            {mockCaseStudy.implementation.description}
          </p>
          <div className="space-y-4">
            {mockCaseStudy.implementation.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
