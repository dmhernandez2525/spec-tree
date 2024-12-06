'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTutorial } from './TutorialContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { cn } from '@/lib/utils';

interface HighlightBoxProps {
  targetElement: DOMRect | null;
  className?: string;
}

const HighlightBox = ({ targetElement, className }: HighlightBoxProps) => {
  if (!targetElement) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute border-2 border-primary bg-primary/10 pointer-events-none',
        className
      )}
      style={{
        top: targetElement.top - 4,
        left: targetElement.left - 4,
        width: targetElement.width + 8,
        height: targetElement.height + 8,
        borderRadius: '4px',
      }}
    />
  );
};

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    nextStep,
    previousStep,
    skipTutorial,
    endTutorial,
  } = useTutorial();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && currentStep?.target) {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);
      }
    }
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="relative h-full w-full">
        <HighlightBox targetElement={targetRect} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <Card className="w-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {currentStep.title}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={endTutorial}
                    className="h-6 w-6"
                  >
                    <Icons.x className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={previousStep}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={nextStep}>
                    Next
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={skipTutorial}>
                  Skip Tutorial
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
