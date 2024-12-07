'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTutorial } from './TutorialContext';
import { tutorialData } from './tutorial-data';
import { Icons } from '../shared/icons';
import { TutorialSection } from '@/types/tutorial';

interface TutorialSectionCardProps {
  section: TutorialSection;
  isCompleted: boolean;
  progress: number;
  onStart: () => void;
}

const TutorialSectionCard = ({
  section,
  isCompleted,
  progress,
  onStart,
}: TutorialSectionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className={isCompleted ? 'border-primary' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {isCompleted ? (
                <Icons.check className="h-5 w-5 text-primary" />
              ) : (
                <Icons.alert className="h-5 w-5 text-muted-foreground" />
              )}
              {section.title}
            </CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </div>
          <Badge variant={isCompleted ? 'default' : 'secondary'}>
            {progress}% Complete
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {section.steps.length} steps
              </div>
              {!isCompleted && (
                <Button variant="outline" size="sm" onClick={onStart}>
                  {progress > 0 ? 'Continue' : 'Start'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function TutorialProgress() {
  const { progress, startTutorial } = useTutorial();

  const calculateSectionProgress = (sectionId: string): number => {
    const section = tutorialData.find((s) => s.id === sectionId);
    if (!section) return 0;

    const completedSteps = progress.completedSteps.filter((stepId) =>
      section.steps.some((step) => step.id === stepId)
    ).length;

    return Math.round((completedSteps / section.steps.length) * 100);
  };

  const totalProgress = Math.round(
    (progress.completedSections.length / tutorialData.length) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tutorial Progress</h3>
          <p className="text-sm text-muted-foreground">
            {progress.completedSections.length} of {tutorialData.length}{' '}
            sections completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{totalProgress}%</span>
        </div>
      </div>

      <Progress value={totalProgress} className="h-2" />

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {tutorialData.map((section) => {
            const isCompleted = progress.completedSections.includes(section.id);
            const sectionProgress = calculateSectionProgress(section.id);

            return (
              <TutorialSectionCard
                key={section.id}
                section={section}
                isCompleted={isCompleted}
                progress={sectionProgress}
                onStart={() => startTutorial(section.id)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
