'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';
import { sanitizeHtml } from '@/lib/sanitize';

interface DocCategory {
  id: string;
  title: string;
  icon: keyof typeof Icons;
  articles: DocArticle[];
}

interface DocArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  lastUpdated: string;
}

const docCategories: DocCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'alert',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        excerpt: 'Get up and running with Spec Tree in minutes.',
        content: 'Full article content here...',
        category: 'getting-started',
        lastUpdated: '2024-03-01',
      },
      {
        id: 'basic-concepts',
        title: 'Basic Concepts',
        excerpt: 'Learn the fundamental concepts of Spec Tree.',
        content: 'Full article content here...',
        category: 'getting-started',
        lastUpdated: '2024-03-05',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    icon: 'check',
    articles: [
      {
        id: 'ai-context',
        title: 'AI Context Gathering',
        excerpt: 'Learn how to use AI-powered context gathering.',
        content: 'Full article content here...',
        category: 'features',
        lastUpdated: '2024-03-10',
      },
    ],
  },
];

export function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<DocArticle | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = docCategories
    .map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.articles.length > 0);

  return (
    <div className="grid grid-cols-[250px_1fr] gap-6">
      <aside>
        <div className="space-y-4">
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {docCategories.map((category) => {
                const Icon = Icons[category.icon];
                return (
                  <div key={category.id} className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium',
                        selectedCategory === category.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.articles.length}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </aside>

      <main className="space-y-6">
        {selectedArticle ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedArticle.title}</CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedArticle(null)}
                >
                  <Icons.x className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="prose max-w-none dark:prose-invert">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    Last updated:{' '}
                    {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedArticle.content) }}
                />
              </motion.div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {filteredCategories.map((category) =>
              category.articles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="secondary">{category.title}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(article.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
