'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TutorialGrid } from '@/components/marketing/resources/TutorialGrid';
import { ResourceSearch } from '@/components/marketing/resources/ResourceSearch';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tutorial, TutorialCategory } from '@/types/tutorials';
import Section from '@/components/layout/Section';

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with Spec Tree',
    description:
      'Learn the basics of creating your first project in Spec Tree.',
    type: 'tutorial',
    category: 'beginner',
    duration: 15,
    lastUpdated: '2024-04-01',
    thumbnailUrl: '/images/tutorial-video.png',
    videoUrl:
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
    chapters: [
      { title: 'Introduction', timestamp: '0:00' },
      { title: 'Creating Your First Project', timestamp: '2:30' },
      { title: 'Basic Navigation', timestamp: '5:45' },
    ],
    author: {
      name: 'Sarah Chen',
      role: 'Product Manager',
      avatarUrl: '/images/hierarchy-tree-view.png',
    },
  },
  {
    id: '2',
    title: 'Advanced Context Generation',
    description:
      'Master AI-powered context generation for better project planning.',
    type: 'tutorial',
    category: 'advanced',
    duration: 25,
    lastUpdated: '2024-04-01',
    thumbnailUrl: '/images/ai-project-planning.png',
    videoUrl:
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley',
    chapters: [
      { title: 'Understanding Context', timestamp: '0:00' },
      { title: 'AI Configuration', timestamp: '4:15' },
      { title: 'Best Practices', timestamp: '12:30' },
    ],
    author: {
      name: 'Michael Rodriguez',
      role: 'Technical Lead',
      avatarUrl: '/images/context-propagation.png',
    },
  },
];

const categories: TutorialCategory[] = [
  'all',
  'beginner',
  'intermediate',
  'advanced',
  'expert',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<TutorialCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesCategory =
      selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch =
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Section className=" py-8 md:py-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <HeadingSection
          heading="Video Tutorials"
          description="Learn Spec Tree through step-by-step video guides"
          className="mb-12"
        />

        <div className="mb-8">
          <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        <Tabs
          value={selectedCategory}
          onValueChange={(value) =>
            setSelectedCategory(value as TutorialCategory)
          }
          className="mb-8"
        >
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category.replace('-', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <TutorialGrid tutorials={filteredTutorials} />
      </motion.div>
    </Section>
  );
}
