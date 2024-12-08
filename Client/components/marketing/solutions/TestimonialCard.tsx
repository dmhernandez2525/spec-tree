import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  image,
}: TestimonialCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Icons.quote className="h-8 w-8 text-primary" />
          <p className="text-lg">{quote}</p>
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image src={image} alt={author} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
