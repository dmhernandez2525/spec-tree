import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { Resource } from '@/types/resources';

interface ResourceGridProps {
  resources: Resource[];
}

export function ResourceGrid({ resources }: ResourceGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <Link key={resource.id} href={resource.href}>
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <Image
                  src={resource.imageUrl}
                  alt={resource.title}
                  fill
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="capitalize">
                  {resource.type.replace('-', ' ')}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {resource.readTime} min read
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-muted-foreground mb-4">
                {resource.description}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Updated{' '}
                {formatDistanceToNow(new Date(resource.lastUpdated), {
                  addSuffix: true,
                })}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
