'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Section from '@/components/layout/Section';

interface CaseStudy {
  id: string;
  company: string;
  title: string;
  description: string;
  industry: string;
  results: {
    metric: string;
    value: string;
  }[];
  logoUrl: string;
  imageUrl: string;
  href: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: '1',
    company: 'TechCorp Solutions',
    title: 'Streamlining Project Management with AI',
    description:
      'How TechCorp improved project delivery time by 40% using Spec Tree',
    industry: 'Software Development',
    results: [
      { metric: 'Faster Project Delivery', value: '40%' },
      { metric: 'Cost Reduction', value: '25%' },
      { metric: 'Team Productivity', value: '+60%' },
    ],
    logoUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/resources/case-studies/techcorp-solutions',
  },
  {
    id: '2',
    company: 'Global Marketing Agency',
    title: 'Revolutionizing Campaign Planning',
    description:
      'How a leading marketing agency transformed their campaign planning process',
    industry: 'Marketing',
    results: [
      { metric: 'Planning Time Reduced', value: '50%' },
      { metric: 'Client Satisfaction', value: '+45%' },
      { metric: 'Campaign Success Rate', value: '92%' },
    ],
    logoUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/resources/case-studies/global-marketing',
  },
];

type Industry =
  | 'All'
  | 'Software Development'
  | 'Marketing'
  | 'Construction'
  | 'Consulting';

export default function CaseStudiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('All');

  const filteredCaseStudies = caseStudies.filter((study) => {
    const matchesSearch =
      study.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry =
      selectedIndustry === 'All' || study.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <Section className="py-8 md:py-12">
      <HeadingSection
        heading="Case Studies"
        description="Learn how organizations are transforming their projects with Spec Tree"
        className="mb-12"
      />

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search case studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as Industry)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="All">All Industries</option>
          <option value="Software Development">Software Development</option>
          <option value="Marketing">Marketing</option>
          <option value="Construction">Construction</option>
          <option value="Consulting">Consulting</option>
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {filteredCaseStudies.map((study) => (
          <Link key={study.id} href={study.href}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={study.imageUrl}
                    alt={study.company}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={study.logoUrl}
                      alt={`${study.company} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-1">
                      {study.industry}
                    </Badge>
                    <h3 className="font-semibold">{study.company}</h3>
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-4">{study.title}</h2>
                <p className="text-muted-foreground mb-6">
                  {study.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {study.results.map((result, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {result.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.metric}
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="group w-full">
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
