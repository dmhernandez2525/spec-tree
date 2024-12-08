import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SolutionShowcaseProps {
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
  }[];
  image: string;
  imageLeft?: boolean;
}

export function SolutionShowcase({
  title,
  description,
  features,
  image,
  imageLeft = true,
}: SolutionShowcaseProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <div
        className={cn('relative aspect-video', !imageLeft && 'lg:order-last')}
      >
        <Image src={image} alt={title} fill className="object-contain" />
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="mt-4 text-lg text-muted-foreground">{description}</p>
        <div className="mt-8 grid gap-6">
          {features.map((feature) => (
            <div key={feature.title}>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
