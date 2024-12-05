'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroProps {
  data: {
    header: string;
    subHeader: string;
    heroImage?: {
      url: string;
      caption?: string;
    };
  };
  onScrollDown?: () => void;
}

export function Hero({ data, onScrollDown }: HeroProps) {
  return (
    <div className="relative min-h-[516px] w-full flex flex-col justify-center items-center text-center bg-secondary">
      {data.heroImage?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={data.heroImage.url}
            alt={data.heroImage.caption || 'Hero background'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" /> {/* Overlay */}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-16">
        <h1
          className={cn(
            'text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-3xl mx-auto',
            'font-heading tracking-tight'
          )}
        >
          {data.header}
        </h1>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
          {data.subHeader}
        </p>

        {onScrollDown && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 transition-colors"
            onClick={onScrollDown}
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
        )}
      </div>
    </div>
  );
}
