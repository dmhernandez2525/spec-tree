'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { tutorialData } from './tutorial-data';
import { useTutorial } from './TutorialContext';
import { Icons } from '../shared/icons';

export function TutorialControls() {
  const { startTutorial, isActive } = useTutorial();

  if (isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Icons.alert className="h-4 w-4" />
            Help & Tutorials
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {tutorialData.map((section) => (
            <DropdownMenuItem
              key={section.id}
              onClick={() => startTutorial(section.id)}
            >
              <div className="flex flex-col">
                <span className="font-medium">{section.title}</span>
                <span className="text-xs text-muted-foreground">
                  {section.description}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
