'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useTutorial } from './TutorialContext';
import { allFeatureTutorials } from './feature-tutorials';
import { TutorialSection } from '@/types/tutorial';

interface TutorialManagerContextType {
  startFeatureTutorial: (featureId: string) => void;
  isTutorialAvailable: (featureId: string) => boolean;
  getFeatureTutorial: (featureId: string) => TutorialSection | undefined;
  getTutorialProgress: (featureId: string) => number;
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
  const { startTutorial, progress } = useTutorial();

  const startFeatureTutorial = useCallback(
    (featureId: string) => {
      const tutorial = allFeatureTutorials.find((t) => t.id === featureId);
      if (tutorial) {
        startTutorial(tutorial.id);
      }
    },
    [startTutorial]
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

      return (completedSteps / tutorial.steps.length) * 100;
    },
    [progress.completedSteps]
  );

  return (
    <TutorialManagerContext.Provider
      value={{
        startFeatureTutorial,
        isTutorialAvailable,
        getFeatureTutorial,
        getTutorialProgress,
      }}
    >
      {children}
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
