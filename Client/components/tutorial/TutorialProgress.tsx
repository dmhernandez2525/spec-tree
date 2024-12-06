// /components/tutorial/TutorialProgress.tsx

'use client';

import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTutorial } from './TutorialContext';
import { tutorialData } from './tutorial-data';
import { Badge } from '@/components/ui/badge';
import { Icons } from '../shared/icons';

export function TutorialProgress() {
  const { progress } = useTutorial();

  const totalSections = tutorialData.length;
  const completedSections = progress.completedSections.length;
  const percentComplete = (completedSections / totalSections) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.alert className="h-5 w-5" />
          Tutorial Progress
        </CardTitle>
        <CardDescription>
          Track your progress through the Spec Tree tutorials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {completedSections} of {totalSections} sections completed
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(percentComplete)}%
            </span>
          </div>
          <Progress value={percentComplete} className="h-2" />

          <div className="grid gap-4 pt-4">
            {tutorialData.map((section) => {
              const isCompleted = progress.completedSections.includes(
                section.id
              );
              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <Icons.alert className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icons.alert className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <Badge variant={isCompleted ? 'default' : 'secondary'}>
                    {isCompleted ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
