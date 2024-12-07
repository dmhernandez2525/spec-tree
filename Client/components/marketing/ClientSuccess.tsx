'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { ArrowRight, Quote } from 'lucide-react';
import Section from '@/components/layout/Section';

interface SuccessStory {
  company: string;
  industry: string;
  title: string;
  description: string;
  quote: {
    text: string;
    author: string;
    role: string;
  };
  results: {
    metric: string;
    value: string;
  }[];
  logoUrl: string;
  href: string;
}

const successStories: SuccessStory[] = [
  {
    company: 'TechCorp Solutions',
    industry: 'Software Development',
    title: '40% Faster Project Delivery',
    description:
      'How TechCorp streamlined their development process with AI-assisted planning',
    quote: {
      text: 'Spec Tree transformed how we manage projects. The AI-driven approach has made our planning process incredibly efficient while maintaining high quality standards.',
      author: 'Sarah Chen',
      role: 'Director of Engineering',
    },
    results: [
      { metric: 'Planning Time', value: '-40%' },
      { metric: 'Team Productivity', value: '+60%' },
      { metric: 'Cost Reduction', value: '25%' },
    ],
    logoUrl: '/images/logos/techcorp.svg',
    href: '/resources/case-studies/techcorp-solutions',
  },
  {
    company: 'Global Marketing Agency',
    industry: 'Marketing',
    title: '50% Reduced Planning Time',
    description:
      'Revolutionizing campaign planning with AI-powered context gathering',
    quote: {
      text: 'The contextual understanding and template system have dramatically improved our ability to plan and execute campaigns consistently.',
      author: 'Michael Rodriguez',
      role: 'Agency Director',
    },
    results: [
      { metric: 'Client Satisfaction', value: '+45%' },
      { metric: 'Campaign Success', value: '92%' },
      { metric: 'Time Saved', value: '50%' },
    ],
    logoUrl: '/images/logos/global-marketing.svg',
    href: '/resources/case-studies/global-marketing',
  },
];

export function ClientSuccess() {
  return (
    <Section>
      <HeadingSection
        heading="Client Success Stories"
        description="See how organizations are transforming their projects with Spec Tree"
        className="text-center mb-12"
      />

      <div className="grid gap-8 md:grid-cols-2">
        {successStories.map((story) => (
          <Link key={story.company} href={story.href}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={story.logoUrl}
                    alt={story.company}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <Badge variant="secondary">{story.industry}</Badge>
                  <h3 className="font-semibold mt-1">{story.company}</h3>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold mb-2">{story.title}</h4>
                  <p className="text-muted-foreground">{story.description}</p>
                </div>

                <div className="relative bg-muted rounded-lg p-6">
                  <Quote className="absolute -top-3 -left-3 h-8 w-8 text-primary/20" />
                  <blockquote className="relative">
                    <p className="text-sm italic mb-4">{story.quote.text}</p>
                    <footer>
                      <p className="font-semibold">{story.quote.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {story.quote.role}
                      </p>
                    </footer>
                  </blockquote>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {story.results.map((result) => (
                    <div key={result.metric} className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {result.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.metric}
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full group">
                  Read Case Study
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
