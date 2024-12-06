import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, Calendar, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Tutorial } from '@/types/tutorials';

interface TutorialGridProps {
  tutorials: Tutorial[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function TutorialGrid({ tutorials }: TutorialGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tutorials.map((tutorial) => (
        <motion.div key={tutorial.id} variants={itemVariants}>
          <Link href={`/resources/tutorials/${tutorial.id}`}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader className="p-0">
                <div className="group relative aspect-video w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={tutorial.thumbnailUrl}
                    alt={tutorial.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="capitalize">
                    {tutorial.category}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {tutorial.duration} min
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2">{tutorial.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={tutorial.author.avatarUrl}
                        alt={tutorial.author.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{tutorial.author.name}</p>
                      <p className="text-muted-foreground">
                        {tutorial.author.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(tutorial.lastUpdated), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
