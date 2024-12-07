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
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/shared/icons';
import { cn } from '@/lib/utils';
import { TutorialStep } from '@/types/tutorial';

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
        'absolute border-2 border-primary bg-primary/10 pointer-events-none rounded-lg',
        className
      )}
      style={{
        top: targetElement.top - 4,
        left: targetElement.left - 4,
        width: targetElement.width + 8,
        height: targetElement.height + 8,
      }}
    />
  );
};

interface StepProgressProps {
  currentStep: TutorialStep;
  totalSteps: number;
  currentStepIndex: number;
}

const StepProgress = ({
  currentStep,
  totalSteps,
  currentStepIndex,
}: StepProgressProps) => {
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span className="font-medium">{progress.toFixed(0)}%</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
};

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentSection,
    nextStep,
    previousStep,
    skipTutorial,
    endTutorial,
    markStepComplete,
  } = useTutorial();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && currentStep?.target) {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll target into view if needed
        const buffer = 100; // pixels from top/bottom
        const isInView =
          rect.top >= buffer && rect.bottom <= window.innerHeight - buffer;

        if (!isInView) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (currentStep?.id) {
      markStepComplete(currentStep.id);
    }
  }, [currentStep]);

  if (!isActive || !currentStep || !currentSection) return null;

  const currentStepIndex = currentSection.steps.findIndex(
    (step) => step.id === currentStep.id
  );

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
                <div className="flex items-center justify-between">
                  <CardTitle>{currentStep.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={endTutorial}
                    className="h-6 w-6"
                  >
                    <Icons.x className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>{currentSection.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {currentStep.description}
                </p>
                <StepProgress
                  currentStep={currentStep}
                  totalSteps={currentSection.steps.length}
                  currentStepIndex={currentStepIndex}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousStep}
                    disabled={currentStepIndex === 0}
                  >
                    <Icons.chevronDown className="h-4 w-4 rotate-90 mr-1" />
                    Previous
                  </Button>
                  <Button size="sm" onClick={nextStep}>
                    Next
                    <Icons.chevronDown className="h-4 w-4 -rotate-90 ml-1" />
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
