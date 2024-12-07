'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/shared/icons';
import { TutorialTranscript } from '@/components/resources/TutorialTranscript';
import { TutorialResources } from '@/components/resources/TutorialResources';
import { Tutorial } from '@/types/tutorials';
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
    thumbnailUrl: '/api/placeholder/800/400',
    videoUrl: 'https://example.com/tutorial-1',
    chapters: [
      { title: 'Introduction', timestamp: '0:00' },
      { title: 'Creating Your First Project', timestamp: '2:30' },
      { title: 'Basic Navigation', timestamp: '5:45' },
    ],
    author: {
      name: 'Sarah Chen',
      role: 'Product Manager',
      avatarUrl: '/api/placeholder/100/100',
    },
  },
];

interface TutorialDetailPageProps {
  params: {
    id: string;
  };
}

export default function TutorialDetailPage({
  params,
}: TutorialDetailPageProps) {
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [activeTab, setActiveTab] = useState('video');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the tutorial data from an API
    const foundTutorial = tutorials.find((t) => t.id === params.id);
    if (foundTutorial) {
      setTutorial(foundTutorial);
    }
    setIsLoading(false);
  }, [params.id]);

  if (isLoading) {
    return (
      <Section className=" flex items-center justify-center py-16">
        <Icons.alert className="h-8 w-8 animate-spin" />
      </Section>
    );
  }

  if (!tutorial) {
    return (
      <Section className=" py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Tutorial not found</h2>
          <Button
            onClick={() => router.push('/resources/tutorials')}
            className="mt-4"
          >
            Back to Tutorials
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-8 md:py-12"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
        <div className="space-y-8">
          {/* Video Player and Info */}
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              {/* Video player would go here */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.alert className="h-16 w-16 text-white opacity-50" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="capitalize">
                  {tutorial.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Icons.alert className="mr-1 h-4 w-4" />
                  {tutorial.duration} min
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Icons.alert className="mr-2 h-4 w-4" />
                Download Resources
              </Button>
            </div>
          </div>

          {/* Tutorial Content */}
          <div>
            <h1 className="text-3xl font-bold">{tutorial.title}</h1>
            <p className="mt-2 text-muted-foreground">{tutorial.description}</p>
          </div>

          <Separator />

          {/* Tabs for different content sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="video">Video</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>
            <TabsContent value="video">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Chapters</h3>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {tutorial.chapters.map((chapter, index) => (
                      <AccordionItem key={index} value={`chapter-${index}`}>
                        <AccordionTrigger>
                          <div className="flex items-center justify-between w-full">
                            <span>{chapter.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {chapter.timestamp}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 text-muted-foreground">
                            Chapter description would go here...
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transcript">
              <TutorialTranscript tutorialId={tutorial.id} />
            </TabsContent>
            <TabsContent value="resources">
              <TutorialResources tutorialId={tutorial.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={tutorial.author.avatarUrl}
                    alt={tutorial.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{tutorial.author.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tutorial.author.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Related Tutorials</h3>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {tutorials.map((relatedTutorial) => (
                    <Link
                      key={relatedTutorial.id}
                      href={`/resources/tutorials/${relatedTutorial.id}`}
                    >
                      <div className="group flex gap-4 rounded-lg p-2 hover:bg-muted">
                        <div className="relative aspect-video w-24 rounded overflow-hidden">
                          <Image
                            src={relatedTutorial.thumbnailUrl}
                            alt={relatedTutorial.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium group-hover:text-primary">
                            {relatedTutorial.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {relatedTutorial.duration} min
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
