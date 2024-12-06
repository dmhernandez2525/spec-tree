import { ReactNode } from 'react';

export interface WizardStep {
  id?: number;
  title: string;
  text: string;
  component: ReactNode;
  validate?: () => boolean;
  onNext?: () => void | Promise<void>;
  onPrevious?: () => void | Promise<void>;
  noNextButton?: boolean;
  removeButtons?: boolean;
}

export interface WizardProps {
  steps: WizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  error?: string;
  nextButtonLabel?: string;
  previousButtonLabel?: string;
  onStepChanging?: (step: number) => Promise<void>;
  loading?: boolean;
  hasNextButton?: boolean;
  hideProgressBar?: boolean;
  className?: string;
}
