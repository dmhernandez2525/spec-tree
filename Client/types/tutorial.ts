export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  placement: 'top' | 'right' | 'bottom' | 'left';
  order: number;
  section: TutorialSection;
};

export type TutorialSection = {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  completed: boolean;
};

export type TutorialProgress = {
  completedSections: string[];
  completedSteps: string[];
  currentSection: string | null;
  currentStep: string | null;
};

export type TutorialContextType = {
  isActive: boolean;
  currentStep: TutorialStep | null;
  currentSection: TutorialSection | null;
  progress: TutorialProgress;
  startTutorial: (sectionId: string) => void;
  endTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  goToStep: (stepId: string) => void;
  markStepComplete: (stepId: string) => void;
  markSectionComplete: (sectionId: string) => void;
};

export type TutorialProviderProps = {
  children: React.ReactNode;
};
