'use client';

import { useState } from 'react';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { ResourceSearch } from '@/components/resources/ResourceSearch';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Resource } from '@/types/resources';
import Section from '@/components/layout/Section';

type GuideCategory =
  | 'all'
  | 'basics'
  | 'advanced'
  | 'integration'
  | 'best-practices';

const guideData: Resource[] = [
  {
    id: '1',
    title: 'Mastering Context Creation',
    description:
      'Learn how to create effective context for better AI generation',
    type: 'guide',
    category: 'basics',
    readTime: 15,
    lastUpdated: '2024-04-01',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/resources/guides/mastering-context-creation',
  },
  {
    id: '2',
    title: 'Advanced AI Prompt Engineering',
    description:
      'Advanced techniques for getting the best results from AI generation',
    type: 'guide',
    category: 'advanced',
    readTime: 25,
    lastUpdated: '2024-04-01',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1723507319323-a429e23b04d2?q=80&w=3326&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    href: '/resources/guides/advanced-prompt-engineering',
  },
];

const categories: GuideCategory[] = [
  'all',
  'basics',
  'advanced',
  'integration',
  'best-practices',
];

export default function GuidesPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<GuideCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guideData.filter((guide) => {
    const matchesCategory =
      selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Section className=" py-8 md:py-12">
      <HeadingSection
        heading="Guides & Tutorials"
        description="Step-by-step guides to help you get the most out of Spec Tree"
        className="mb-12"
      />

      <div className="mb-8">
        <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as GuideCategory)}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResourceGrid resources={filteredGuides} />
    </Section>
  );
}
