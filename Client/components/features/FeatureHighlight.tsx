import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/shared/icons';

interface FeatureHighlightProps {
  title: string;
  description: string;
  image: string;
  features: string[];
  imageLeft?: boolean;
}

export function FeatureHighlight({
  title,
  description,
  image,
  features,
  imageLeft = true,
}: FeatureHighlightProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div
        className={cn('relative aspect-square', !imageLeft && 'lg:order-last')}
      >
        <Image src={image} alt={title} fill className="object-contain" />
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        <ul className="mt-8 grid gap-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-1">
                <Icons.check className="h-4 w-4 text-primary" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
