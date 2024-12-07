import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../lib/store';
import { WizardStep } from '../wizard/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import Wizard from '../wizard/wizard';
import { generateUpdatedExplanationForGlobalRefinement } from '../../lib/api/openai';
import useQuestionGeneration from '../../lib/hooks/use-question-generation';
import compileContext from '../../lib/utils/compile-context';
import { ContextualQuestion } from '../../lib/types/work-items';

import {
  addGlobalContextualQuestion,
  addGlobalContextualQuestions,
  removeGlobalContextualQuestion,
  replaceGlobalContextualQuestions,
  updateGlobalInformation,
  selectGlobalContextualQuestions,
  selectGlobalInformation,
  selectChatApi,
} from '../../../../lib/store/sow-slice';

interface GlobalContextualInfoProps {
  onClose?: () => void;
}

const GlobalContextualInfo: React.FC<GlobalContextualInfoProps> = ({
  onClose,
}) => {
  const selectedModel = useSelector(
    (state: RootState) => state.sow.selectedModel
  );
  const dispatch = useDispatch();
  const mainGlobalContextualQuestions = useSelector(
    selectGlobalContextualQuestions
  );
  const mainGlobalInformation = useSelector(selectGlobalInformation);
  const chatApi = useSelector(selectChatApi);

  const [globalInformation, setGlobalInformation] = useState<string>('');
  const [updatedExplanation, setUpdatedExplanation] = useState<string | null>(
    null
  );
  const [isLoadingExplanation, setIsLoadingExplanation] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const {
    loading: questionsLoading,
    error: questionsError,
    questions,
    generateQuestions,
    removeQuestion,
    setQuestions,
  } = useQuestionGeneration('Global');

  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    if (mainGlobalContextualQuestions) {
      setQuestions(mainGlobalContextualQuestions);
      setAnswers(mainGlobalContextualQuestions.map((q) => q.answer || ''));
    }
    if (mainGlobalInformation) {
      setGlobalInformation(mainGlobalInformation);
    }
  }, [mainGlobalContextualQuestions, mainGlobalInformation]);

  const handleGenerateQuestions = async (): Promise<void> => {
    if (!globalInformation) {
      setError('Please enter information about the entire application.');
      return;
    }
    const newQuestions = await generateQuestions(globalInformation);
    if (newQuestions) {
      dispatch(addGlobalContextualQuestions(newQuestions));
      setError(null);
      return;
    }
    return;
  };

  const handleGenerateExplanation = async (): Promise<void> => {
    setIsLoadingExplanation(true);
    setError(null);
    try {
      const context = compileContext(
        questions.map((q) => q.question),
        answers
      );
      const explanation = await generateUpdatedExplanationForGlobalRefinement({
        chatApi,
        globalInformation,
        context,
        selectedModel,
      });
      setUpdatedExplanation(explanation);
      dispatch(updateGlobalInformation(explanation));
    } catch (err) {
      setError('Failed to generate explanation. Please try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const steps: WizardStep[] = [
    {
      id: 0,
      title: 'Enter Information',
      text: 'Enter project information',
      component: (
        <div className="space-y-4">
          <Label>Project Information</Label>
          <Textarea
            value={globalInformation}
            onChange={(e) => {
              setGlobalInformation(e.target.value);
              dispatch(updateGlobalInformation(e.target.value));
            }}
            className="min-h-[200px]"
            placeholder="Enter information about the project..."
          />
        </div>
      ),
      onNext: handleGenerateQuestions,
    },
    {
      id: 1,
      title: 'Answer Questions',
      text: 'Answer generated questions',
      component: (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <Label>{question.question}</Label>
                <Textarea
                  value={answers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                    dispatch(
                      replaceGlobalContextualQuestions({
                        value: e.target.value,
                        index,
                      })
                    );
                  }}
                  className="mt-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    removeQuestion(index);
                    dispatch(removeGlobalContextualQuestion(question.id));
                  }}
                  className="mt-2"
                >
                  Remove Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
      onNext: handleGenerateExplanation,
    },
    {
      id: 2,
      title: 'Review',
      text: 'Review updated explanation',
      component: (
        <div className="space-y-4">
          <Label>Updated Explanation</Label>
          <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
            {updatedExplanation}
          </div>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          )}
        </div>
      ),
      noNextButton: true,
    },
  ];

  if (error || questionsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || questionsError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Wizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={questionsLoading || isLoadingExplanation}
      className="max-w-4xl mx-auto"
    />
  );
};

export default GlobalContextualInfo;
