import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';

interface SolutionCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
  features: string[];
  type: 'industry' | 'role';
  className?: string;
}

export default function SolutionCard({
  title,
  description,
  imageUrl,
  href,
  features,
  type,
  className,
}: SolutionCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={className}
      >
        <Card className="overflow-hidden h-full">
          <div className="relative aspect-video">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              {type === 'industry' ? 'Industry' : 'Role'}
            </Badge>
            <h3 className="text-xl font-bold mt-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
