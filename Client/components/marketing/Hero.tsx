'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
    <div className="relative min-h-[90vh] w-full flex flex-col justify-center items-center text-center bg-gradient-to-b from-primary/5 to-background">
      {data.heroImage?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={data.heroImage.url}
            alt={data.heroImage.caption || 'Hero background'}
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-4 py-16 max-w-4xl"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={cn(
            'text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6',
            'tracking-tight leading-tight'
          )}
        >
          {data.header ? (
            data.header
          ) : (
            <>
              Transform Your
              <span className="text-primary">Project Planning</span>
              with AI
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          {data.subHeader}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" asChild>
            <Link href="/register">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Watch Demo</Link>
          </Button>
        </motion.div>
      </motion.div>

      {onScrollDown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <Button
            variant="ghost"
            size="icon"
            className="animate-bounce"
            onClick={onScrollDown}
          >
            <ChevronDown className="h-8 w-8" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
