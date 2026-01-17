'use client';

import { useState } from 'react';
import { ResourceGrid } from '@/components/marketing/resources/ResourceGrid';
import { ResourceSearch } from '@/components/marketing/resources/ResourceSearch';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResourceType, Resource } from '@/types/resources';

const resourcesData: Resource[] = [
  {
    id: '1',
    title: 'Getting Started with Spec Tree',
    description:
      'Learn the basics of creating and managing your first project.',
    type: 'documentation',
    category: 'getting-started',
    readTime: 5,
    lastUpdated: '2024-04-01',
    imageUrl: '/images/resource-user-guide.svg',
    href: '/resources/documentation/getting-started',
  },
  {
    id: '2',
    title: 'AI Context Generation Guide',
    description: 'Deep dive into AI-powered context generation features.',
    type: 'guide',
    category: 'advanced',
    readTime: 15,
    lastUpdated: '2024-04-01',
    imageUrl: '/images/resource-tutorial.svg',
    href: '/resources/guides/ai-context',
  },
  {
    id: '3',
    title: 'REST API Documentation',
    description: 'Complete API reference for Spec Tree integration.',
    type: 'api-reference',
    category: 'development',
    readTime: 30,
    lastUpdated: '2024-04-01',
    imageUrl: '/images/resource-case-studies.svg',
    href: '/resources/api-reference/rest',
  },
  {
    id: '4',
    title: 'Enterprise Case Study: TechCorp',
    description: 'How TechCorp improved project delivery by 40%.',
    type: 'case-study',
    category: 'enterprise',
    readTime: 10,
    lastUpdated: '2024-04-01',
    imageUrl: '/images/resource-api-docs.svg',
    href: '/resources/case-studies/techcorp',
  },
];

const resourceTypes: ResourceType[] = [
  'all',
  'documentation',
  'guide',
  'api-reference',
  'case-study',
  'tutorial',
];

export default function ResourcesPage() {
  const [selectedType, setSelectedType] = useState<ResourceType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resourcesData.filter((resource) => {
    const matchesType =
      selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className=" py-8 md:py-12">
      <HeadingSection
        heading="Resources"
        description="Everything you need to succeed with Spec Tree"
        className="mb-12"
      />

      <div className="mb-8">
        <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <Tabs
        value={selectedType}
        onValueChange={(value) => setSelectedType(value as ResourceType)}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {resourceTypes.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="capitalize"
              aria-label={`Filter by ${type}`}
            >
              {type.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResourceGrid resources={filteredResources} />
    </div>
  );
}
