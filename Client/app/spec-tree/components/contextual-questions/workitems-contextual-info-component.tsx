import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../lib/store';
import { WizardStep } from '../wizard/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import Wizard from '../wizard/wizard';
import useQuestionGeneration from '../../lib/hooks/use-question-generation';
import useWorkItemUpdate from '../../lib/hooks/use-work-item-update';
import {
  ExtendedWorkItemType,
  ContextualQuestion,
  WorkItemTypeTypes,
} from '../../lib/types/work-items';
import compileContext from '../../lib/utils/compile-context';

interface WorkitemsContextualInfoProps {
  workItem: WorkItemTypeTypes;
  workItemType: ExtendedWorkItemType;
  onClose?: () => void;
}

const WorkitemsContextualInfo: React.FC<WorkitemsContextualInfoProps> = ({
  workItem,
  workItemType,
  onClose,
}) => {
  const localState = useSelector((state: RootState) => state);
  const {
    loading: questionsLoading,
    error: questionsError,
    questions,
    generateQuestions,
    removeQuestion,
    updateQuestion,
    setQuestions,
  } = useQuestionGeneration(workItemType);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [workItemStatus, setWorkItemStatus] = useState<
    'original' | 'edited' | 'accepted'
  >('original');
  const [editableWorkItem, setEditableWorkItem] = useState<any>(null);

  const {
    loading: updateLoading,
    error: updateError,
    updatedWorkItem,
    generateUpdatedWorkItem,
  } = useWorkItemUpdate(workItemType);

  useEffect(() => {
    if (workItem?.contextualQuestions) {
      setQuestions(workItem.contextualQuestions);
      setAnswers(
        workItem.contextualQuestions.map(
          (q: ContextualQuestion) => q.answer || ''
        )
      );
    }
  }, [workItem]);

  const handleGenerateInitialQuestions = async () => {
    const newQuestions = await generateQuestions(workItem);
    if (newQuestions) {
      return true;
    }
    return false;
  };

  const handleUpdateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    updateQuestion(index, { ...questions[index], answer: value });
  };

  const handleGenerateUpdatedWorkItem = async () => {
    const context = compileContext(
      questions.map((q) => q.question),
      answers
    );
    await generateUpdatedWorkItem({ context, state: localState });
    return true;
  };

  const steps: WizardStep[] = [
    {
      id: 0,
      title: 'Generate Questions',
      text: 'Generate initial questions',
      component: (
        <div className="space-y-4">
          <Label>Current Work Item Information</Label>
          <pre className="p-4 bg-muted rounded-lg whitespace-pre-wrap overflow-auto">
            {JSON.stringify(workItem, null, 2)}
          </pre>
        </div>
      ),
      onNext: handleGenerateInitialQuestions,
    },
    {
      id: 1,
      title: 'Answer Questions',
      text: 'Provide answers to generated questions',
      component: (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <Label>{question.question}</Label>
                <Textarea
                  value={answers[index] || ''}
                  onChange={(e) => handleUpdateAnswer(index, e.target.value)}
                  className="mt-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeQuestion(index)}
                  className="mt-2"
                >
                  Remove Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
      onNext: handleGenerateUpdatedWorkItem,
    },
    {
      id: 2,
      title: 'Review Changes',
      text: 'Review and accept changes',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Original</h3>
              <pre className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {JSON.stringify(workItem, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Updated</h3>
              <pre className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                {JSON.stringify(updatedWorkItem, null, 2)}
                //
                app/spec-tree/components/contextual-questions/workitems-contextual-info.tsx
                (continued)
              </pre>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setWorkItemStatus('original');
                setEditableWorkItem(null);
              }}
            >
              Reject Changes
            </Button>
            <Button
              onClick={() => {
                setWorkItemStatus('accepted');
                setEditableWorkItem(updatedWorkItem);
                setCurrentStep(3);
              }}
            >
              Accept Changes
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Complete',
      text: 'Finish updating work item',
      component: (
        <div className="space-y-6">
          <Alert>
            <AlertDescription>
              Changes have been accepted. You can now close this dialog.
            </AlertDescription>
          </Alert>
          {onClose && (
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      ),
      noNextButton: true,
    },
  ];

  if (questionsError || updateError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{questionsError || updateError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Wizard
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      loading={questionsLoading || updateLoading}
      className="max-w-4xl mx-auto"
    />
  );
};

export default WorkitemsContextualInfo;
