'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { useTutorial } from './TutorialContext';
import { allFeatureTutorials } from './feature-tutorials';
import { TutorialSection } from '@/types/tutorial';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialManagerContextType {
  startFeatureTutorial: (featureId: string) => void;
  isTutorialAvailable: (featureId: string) => boolean;
  getFeatureTutorial: (featureId: string) => TutorialSection | undefined;
  getTutorialProgress: (featureId: string) => number;
  suggestNextTutorial: () => TutorialSection | undefined;
  resetTutorialProgress: () => void;
}

const TutorialManagerContext = createContext<
  TutorialManagerContextType | undefined
>(undefined);

interface TutorialManagerProviderProps {
  children: React.ReactNode;
}

export function TutorialManagerProvider({
  children,
}: TutorialManagerProviderProps) {
  const { toast } = useToast();
  const { startTutorial, progress, endTutorial } = useTutorial();
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  const startFeatureTutorial = useCallback(
    (featureId: string) => {
      const tutorial = allFeatureTutorials.find((t) => t.id === featureId);
      if (tutorial) {
        setActiveTutorial(featureId);
        startTutorial(featureId);

        toast({
          title: 'Tutorial Started',
          description: `Starting ${tutorial.title} tutorial`,
        });
      }
    },
    [startTutorial, toast]
  );

  const isTutorialAvailable = useCallback((featureId: string) => {
    return allFeatureTutorials.some((t) => t.id === featureId);
  }, []);

  const getFeatureTutorial = useCallback((featureId: string) => {
    return allFeatureTutorials.find((t) => t.id === featureId);
  }, []);

  const getTutorialProgress = useCallback(
    (featureId: string) => {
      const tutorial = allFeatureTutorials.find((t) => t.id === featureId);
      if (!tutorial) return 0;

      const completedSteps = progress.completedSteps.filter((stepId) =>
        tutorial.steps.some((step) => step.id === stepId)
      ).length;

      return Math.round((completedSteps / tutorial.steps.length) * 100);
    },
    [progress.completedSteps]
  );

  const suggestNextTutorial = useCallback(() => {
    const incompleteTutorials = allFeatureTutorials.filter((tutorial) => {
      const tutorialProgress = getTutorialProgress(tutorial.id);
      return tutorialProgress < 100;
    });

    // Sort by progress (descending) to suggest the most progressed tutorial first
    incompleteTutorials.sort((a, b) => {
      const progressA = getTutorialProgress(a.id);
      const progressB = getTutorialProgress(b.id);
      return progressB - progressA;
    });

    return incompleteTutorials[0];
  }, [getTutorialProgress]);

  const resetTutorialProgress = useCallback(() => {
    endTutorial();
    setActiveTutorial(null);

    toast({
      title: 'Tutorial Progress Reset',
      description: 'All tutorial progress has been reset.',
    });
  }, [endTutorial, toast]);

  const value = {
    startFeatureTutorial,
    isTutorialAvailable,
    getFeatureTutorial,
    getTutorialProgress,
    suggestNextTutorial,
    resetTutorialProgress,
  };

  return (
    <TutorialManagerContext.Provider value={value}>
      {children}
      <AnimatePresence mode="wait">
        {activeTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50 w-80"
          >
            <Card>
              <CardHeader>
                <CardTitle>Active Tutorial</CardTitle>
                <CardDescription>
                  Currently viewing {getFeatureTutorial(activeTutorial)?.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    endTutorial();
                    setActiveTutorial(null);
                  }}
                >
                  End Tutorial
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </TutorialManagerContext.Provider>
  );
}

export const useTutorialManager = () => {
  const context = useContext(TutorialManagerContext);
  if (context === undefined) {
    throw new Error(
      'useTutorialManager must be used within a TutorialManagerProvider'
    );
  }
  return context;
};
