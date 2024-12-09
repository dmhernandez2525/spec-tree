'use client';

import { ResourceDetail } from '@/components/marketing/resources/ResourceDetail';
import { notFound } from 'next/navigation';

interface ResourcePageProps {
  params: {
    type: string;
    slug: string;
  };
}

// TODO: pull form API
const getMockResourceData = (type: string, slug: string) => {
  // Mock data - replace with actual data fetching
  console.log(type, slug);
  return {
    title: 'Getting Started with Spec Tree',
    description:
      'A comprehensive guide to getting started with Spec Tree',
    content: '# Introduction\n\nWelcome to Spec Tree...',
    type: type,
    readTime: 15,
    lastUpdated: '2024-04-01',
    category: 'getting-started',
    relatedResources: [
      {
        id: '1',
        title: 'Advanced Features Guide',
        href: '/resources/guides/advanced-features',
      },
      {
        id: '2',
        title: 'Best Practices',
        href: '/resources/guides/best-practices',
      },
    ],
  };
};

export default function ResourcePage({ params }: ResourcePageProps) {
  const resourceData = getMockResourceData(params.type, params.slug);

  if (!resourceData) {
    notFound();
  }

  return <ResourceDetail {...resourceData} />;
}
