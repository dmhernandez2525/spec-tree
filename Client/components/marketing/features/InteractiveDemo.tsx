'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/shared/icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

interface DemoQuestion {
  id: string;
  question: string;
  answered: boolean;
  answer?: string;
}

export function InteractiveDemo() {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState('');
  const [questions, setQuestions] = useState<DemoQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleProjectTypeSubmit = () => {
    setIsLoading(true);
    // Simulate AI generating questions
    setTimeout(() => {
      setQuestions([
        {
          id: '1',
          question:
            'What are the primary business objectives for this project?',
          answered: false,
        },
        {
          id: '2',
          question:
            'Who are the key stakeholders and what are their main concerns?',
          answered: false,
        },
        {
          id: '3',
          question:
            'Are there any specific technical constraints or requirements?',
          answered: false,
        },
      ]);
      setStep(2);
      setIsLoading(false);
    }, 1500);
  };

  const handleAnswerSubmit = (id: string, answer: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, answered: true, answer } : q))
    );

    // If all questions are answered, move to next step
    if (questions.every((q) => (q.id === id ? true : q.answered))) {
      setStep(3);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              step >= 1
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            1
          </div>
          <div
            className={cn('h-0.5 w-16', step >= 2 ? 'bg-primary' : 'bg-muted')}
          />
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              step >= 2
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            2
          </div>
          <div
            className={cn('h-0.5 w-16', step >= 3 ? 'bg-primary' : 'bg-muted')}
          />
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full',
              step >= 3
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            3
          </div>
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What type of project are you planning?</CardTitle>
            <CardDescription>
              This helps our AI generate relevant context-gathering questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="e.g., Mobile App Development"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
              />
              <Button
                onClick={handleProjectTypeSubmit}
                disabled={!projectType || isLoading}
              >
                {isLoading && (
                  <Icons.alert className="mr-2 h-4 w-4 animate-spin" />
                )}
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardHeader>
                <CardTitle className="text-base">{q.question}</CardTitle>
              </CardHeader>
              <CardContent>
                {!q.answered ? (
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="Your answer..."
                      className="min-h-[100px]"
                      onChange={(e) => handleAnswerSubmit(q.id, e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="rounded-md bg-muted p-4">
                    <p>{q.answer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Context Analysis Complete</CardTitle>
            <CardDescription>
              Based on your responses, here's what our AI has learned about your
              project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <h4 className="font-semibold">Project Overview</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  A {projectType} project with clearly defined business
                  objectives and stakeholder requirements.
                </p>
              </div>
              <div className="rounded-md bg-muted p-4">
                <h4 className="font-semibold">Key Considerations</h4>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {questions.map((q) => (
                    <li key={q.id}>{q.answer}</li>
                  ))}
                </ul>
              </div>
              <Button onClick={() => setStep(1)} className="w-full">
                Try Another Example
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
