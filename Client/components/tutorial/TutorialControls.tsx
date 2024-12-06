'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/shared/icons';
import { tutorialData } from './tutorial-data';
import { useTutorial } from './TutorialContext';
import { useAchievements } from '../achievements/AchievementsProvider';
import { TutorialSection } from '@/types/tutorial';

interface TutorialSummaryCardProps {
  section: TutorialSection;
  progress: number;
  onStart: () => void;
}

const TutorialSummaryCard = ({
  section,
  progress,
  onStart,
}: TutorialSummaryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg mb-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{section.title}</h3>
        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
          {progress}%
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {section.description}
      </p>
      <div className="space-y-2">
        <Progress value={progress} className="h-1" />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {section.steps.length} steps
          </span>
          <Button variant="outline" size="sm" onClick={onStart}>
            {progress > 0 ? 'Continue' : 'Start'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export function TutorialControls() {
  const { startTutorial, isActive, progress } = useTutorial();
  const { achievements, hasUnlockedAchievement } = useAchievements();

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

  if (isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {hasUnlockedAchievement('tutorial-master') && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="h-9 px-4">
              Tutorial Master
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>You've mastered all tutorials!</p>
          </TooltipContent>
        </Tooltip>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Icons.alert className="h-4 w-4" />
            Tutorials
            {totalProgress > 0 && totalProgress < 100 && (
              <Badge variant="secondary" className="ml-2">
                {totalProgress}%
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Available Tutorials</DialogTitle>
            <DialogDescription>
              Learn how to use Spec Tree effectively
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {totalProgress > 0 && (
              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span>{totalProgress}%</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
              </div>
            )}
            <ScrollArea className="h-[400px] pr-4">
              {tutorialData.map((section) => (
                <TutorialSummaryCard
                  key={section.id}
                  section={section}
                  progress={calculateSectionProgress(section.id)}
                  onStart={() => startTutorial(section.id)}
                />
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Icons.alert className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => startTutorial('getting-started')}>
            Quick Start Guide
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startTutorial('analytics-deep-dive')}
          >
            Analytics Tutorial
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {tutorialData
            .filter(
              (section) =>
                !['getting-started', 'analytics-deep-dive'].includes(section.id)
            )
            .map((section) => (
              <DropdownMenuItem
                key={section.id}
                onClick={() => startTutorial(section.id)}
              >
                {section.title}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
