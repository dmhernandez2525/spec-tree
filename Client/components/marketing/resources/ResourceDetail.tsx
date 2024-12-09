import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Section from '@/components/layout/Section';

interface ResourceDetailProps {
  title: string;
  description: string;
  content: string;
  type: string;
  readTime: number;
  lastUpdated: string;
  category: string;
  relatedResources: {
    id: string;
    title: string;
    href: string;
  }[];
}

export function ResourceDetail({
  title,
  description,
  content,
  type,
  readTime,
  lastUpdated,
  category,
  relatedResources,
}: ResourceDetailProps) {
  // TODO: use content,category then remove console.log
  console.log({ content, category });
  return (
    <Section className=" max-w-4xl py-8 md:py-12">
      <Button variant="ghost" className="mb-8" asChild>
        <Link href="/resources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Link>
      </Button>

      <article className="prose prose-zinc dark:prose-invert max-w-none">
        <div className="flex items-center gap-4 mb-8">
          <Badge variant="secondary" className="capitalize">
            {type.replace('-', ' ')}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {readTime} min read
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            Updated{' '}
            {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-muted-foreground mb-8">{description}</p>

        <Separator className="my-12" />

        <section>
          <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedResources.map((resource) => (
              <Card key={resource.id} className="p-6">
                <Link href={resource.href} className="hover:underline">
                  <h3 className="font-semibold">{resource.title}</h3>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </Section>
  );
}
