import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardProps } from './types';
import {
  Steps,
  StepsContent,
  StepsHeader,
  StepsItem,
} from '@/components/ui/steps';

const Wizard: React.FC<WizardProps> = ({
  steps,
  currentStep: externalCurrentStep,
  onStepChange: externalOnStepChange,
  error: externalError,
  nextButtonLabel = 'Next',
  previousButtonLabel = 'Previous',
  loading: externalLoading,
  onStepChanging,
  hideProgressBar,
  className,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepStates, setStepStates] = useState<unknown[]>(
    new Array(steps.length)
  );
  const [error, setError] = useState<string | undefined>(externalError);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (externalCurrentStep !== undefined) {
      setCurrentStepIndex(externalCurrentStep);
    }
  }, [externalCurrentStep]);

  useEffect(() => {
    setError(externalError);
  }, [externalError]);

  useEffect(() => {
    setIsLoading(externalLoading || false);
  }, [externalLoading]);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = async () => {
    const currentStep = steps[currentStepIndex];
    if (currentStep.validate && !currentStep.validate()) {
      return;
    }

    setIsLoading(true);
    try {
      if (currentStep.onNext) {
        await currentStep.onNext();
      }

      if (onStepChanging) {
        await onStepChanging(currentStepIndex + 1);
      }

      const newStep = currentStepIndex + 1;
      setCurrentStepIndex(newStep);
      externalOnStepChange?.(newStep);
      scrollToTop();
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = async () => {
    const currentStep = steps[currentStepIndex];

    setIsLoading(true);
    try {
      if (currentStep.onPrevious) {
        await currentStep.onPrevious();
      }

      if (onStepChanging) {
        await onStepChanging(currentStepIndex - 1);
      }

      const newStep = currentStepIndex - 1;
      setCurrentStepIndex(newStep);
      externalOnStepChange?.(newStep);
      scrollToTop();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepChange = (index: number) => {
    if (index !== currentStepIndex && !isLoading && index <= currentStepIndex) {
      setCurrentStepIndex(index);
      externalOnStepChange?.(index);
      scrollToTop();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        {!hideProgressBar && (
          <Steps value={currentStepIndex}>
            <StepsHeader>
              {steps.map((step, index) => (
                <StepsItem
                  key={step.id || index}
                  value={index}
                  title={step.title}
                  onClick={() => handleStepChange(index)}
                  disabled={isLoading || index > currentStepIndex}
                />
              ))}
            </StepsHeader>

            <StepsContent value={currentStepIndex}>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="min-h-[200px] py-6">
                {React.cloneElement(
                  currentStep.component as React.ReactElement,
                  {
                    stepState: stepStates[currentStepIndex],
                    onStepChange: (stepState: unknown) => {
                      const newStepStates = [...stepStates];
                      newStepStates[currentStepIndex] = stepState;
                      setStepStates(newStepStates);
                    },
                  }
                )}
              </div>

              {!currentStep.removeButtons && (
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStepIndex === 0 || isLoading}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {previousButtonLabel}
                  </Button>

                  {!currentStep.noNextButton && (
                    <Button
                      onClick={handleNext}
                      disabled={
                        currentStepIndex === steps.length - 1 ||
                        isLoading ||
                        (currentStep.validate && !currentStep.validate())
                      }
                    >
                      {nextButtonLabel}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </StepsContent>
          </Steps>
        )}
      </CardContent>
    </Card>
  );
};

export default Wizard;
