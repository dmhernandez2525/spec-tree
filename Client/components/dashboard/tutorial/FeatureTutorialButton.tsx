'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Icons } from '@/components/shared/icons';
import { useTutorialManager } from './TutorialManager';
import { cn } from '@/lib/utils';

interface FeatureTutorialButtonProps {
  featureId: string;
  className?: string;
}

export function FeatureTutorialButton({
  featureId,
  className,
}: FeatureTutorialButtonProps) {
  const { startFeatureTutorial, isTutorialAvailable, getTutorialProgress } =
    useTutorialManager();

  if (!isTutorialAvailable(featureId)) {
    return null;
  }

  const progress = getTutorialProgress(featureId);
  const isCompleted = progress === 100;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            isCompleted ? 'text-green-500' : 'text-muted-foreground',
            className
          )}
          onClick={() => startFeatureTutorial(featureId)}
        >
          <Icons.alert className="h-4 w-4" />
          {progress > 0 && progress < 100 && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {Math.round(progress)}%
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>View tutorial for this feature</p>
      </TooltipContent>
    </Tooltip>
  );
}
