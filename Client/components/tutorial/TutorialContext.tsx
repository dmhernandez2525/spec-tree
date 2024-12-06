'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import {
  TutorialContextType,
  TutorialProviderProps,
  TutorialProgress,
  TutorialSection,
  TutorialStep,
} from '@/types/tutorial';
import { tutorialData } from './tutorial-data';

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentSection, setCurrentSection] = useState<TutorialSection | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);

  const [progress, setProgress] = useLocalStorage<TutorialProgress>(
    'tutorial-progress',
    {
      completedSections: [],
      completedSteps: [],
      currentSection: null,
      currentStep: null,
    }
  );

  const startTutorial = useCallback(
    (sectionId: string) => {
      const section = tutorialData.find((s) => s.id === sectionId);
      if (section) {
        setCurrentSection(section);
        setCurrentStep(section.steps[0]);
        setIsActive(true);
        setProgress((prev) => ({
          ...prev,
          currentSection: sectionId,
          currentStep: section.steps[0].id,
        }));
      }
    },
    [setProgress]
  );

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentSection(null);
    setCurrentStep(null);
    setProgress((prev) => ({
      ...prev,
      currentSection: null,
      currentStep: null,
    }));
  }, [setProgress]);

  const nextStep = useCallback(() => {
    if (!currentSection || !currentStep) return;

    const currentStepIndex = currentSection.steps.findIndex(
      (step) => step.id === currentStep.id
    );

    if (currentStepIndex < currentSection.steps.length - 1) {
      const nextStep = currentSection.steps[currentStepIndex + 1];
      setCurrentStep(nextStep);
      setProgress((prev) => ({
        ...prev,
        currentStep: nextStep.id,
      }));
    } else {
      endTutorial();
    }
  }, [currentSection, currentStep, endTutorial, setProgress]);

  const previousStep = useCallback(() => {
    if (!currentSection || !currentStep) return;

    const currentStepIndex = currentSection.steps.findIndex(
      (step) => step.id === currentStep.id
    );

    if (currentStepIndex > 0) {
      const prevStep = currentSection.steps[currentStepIndex - 1];
      setCurrentStep(prevStep);
      setProgress((prev) => ({
        ...prev,
        currentStep: prevStep.id,
      }));
    }
  }, [currentSection, currentStep, setProgress]);

  const skipTutorial = useCallback(() => {
    endTutorial();
    setProgress((prev) => ({
      ...prev,
      completedSections: [...prev.completedSections, currentSection?.id ?? ''],
    }));
  }, [currentSection, endTutorial, setProgress]);

  const goToStep = useCallback(
    (stepId: string) => {
      if (!currentSection) return;

      const step = currentSection.steps.find((s) => s.id === stepId);
      if (step) {
        setCurrentStep(step);
        setProgress((prev) => ({
          ...prev,
          currentStep: stepId,
        }));
      }
    },
    [currentSection, setProgress]
  );

  const markStepComplete = useCallback(
    (stepId: string) => {
      setProgress((prev) => ({
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
      }));
    },
    [setProgress]
  );

  const markSectionComplete = useCallback(
    (sectionId: string) => {
      setProgress((prev) => ({
        ...prev,
        completedSections: [...prev.completedSections, sectionId],
      }));
    },
    [setProgress]
  );

  const value = {
    isActive,
    currentStep,
    currentSection,
    progress,
    startTutorial,
    endTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    goToStep,
    markStepComplete,
    markSectionComplete,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
