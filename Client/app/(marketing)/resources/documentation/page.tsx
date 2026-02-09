'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { ResourceSearch } from '@/components/marketing/resources/ResourceSearch';
import { Book, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Section from '@/components/layout/Section';

interface DocumentationCategory {
  id: string;
  title: string;
  description: string;
  articles: {
    id: string;
    title: string;
    description: string;
    readTime: number;
    href: string;
  }[];
}

const documentationData: DocumentationCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Everything you need to begin with Spec Tree',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        description: 'Get up and running with Spec Tree in minutes',
        readTime: 5,
        href: '/resources/documentation/getting-started/quick-start',
      },
      {
        id: 'core-concepts',
        title: 'Core Concepts',
        description: 'Learn the fundamental concepts and terminology',
        readTime: 10,
        href: '/resources/documentation/getting-started/core-concepts',
      },
    ],
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    description: 'Deep dive into AI-powered capabilities',
    articles: [
      {
        id: 'context-generation',
        title: 'Context Generation',
        description: 'How to use AI to generate rich context for your projects',
        readTime: 8,
        href: '/resources/documentation/ai-features/context-generation',
      },
      {
        id: 'work-item-generation',
        title: 'Work Item Generation',
        description: 'Automatically generate work items from context',
        readTime: 12,
        href: '/resources/documentation/ai-features/work-item-generation',
      },
    ],
  },
];

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = documentationData.filter((category) => {
    const matchesSearch = category.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const hasMatchingArticles = category.articles.some((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSearch || hasMatchingArticles;
  });

  return (
    <Section className=" py-8 md:py-12">
      <HeadingSection
        heading="Documentation"
        description="Comprehensive guides and references for Spec Tree"
        className="mb-12"
      />

      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-[300px,1fr]">
        <aside className="lg:border-r lg:pr-8 hidden lg:block">
          <div className="mb-4 lg:sticky lg:top-8">
            <ResourceSearch value={searchQuery} onChange={setSearchQuery} />
            <ScrollArea className="mt-8 h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? 'secondary' : 'ghost'
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Book className="mr-2 h-4 w-4" />
                    {category.title}
                  </Button>
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </div>
        </aside>

        <main className="space-y-8">
          {filteredCategories.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
              <p className="text-muted-foreground mb-6">
                {category.description}
              </p>
              <div className="grid gap-4">
                {category.articles.map((article) => (
                  <Link key={article.id} href={article.href}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold">{article.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {article.description}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <Separator className="mt-8" />
            </section>
          ))}
        </main>
      </div>
    </Section>
  );
}
