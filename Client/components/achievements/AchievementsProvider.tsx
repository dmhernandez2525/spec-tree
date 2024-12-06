'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Achievement, AchievementProgress } from '@/types/achievements';
import { tutorialAchievements } from './achievements-data';
import { useToast } from '@/lib/hooks/use-toast';
import { useTutorial } from '../tutorial/TutorialContext';

interface AchievementsContextType {
  achievements: Achievement[];
  progress: AchievementProgress;
  checkAchievements: () => void;
  getUnlockedAchievements: () => Achievement[];
  hasUnlockedAchievement: (id: string) => boolean;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(
  undefined
);

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { progress: tutorialProgress } = useTutorial();

  const [progress, setProgress] = useLocalStorage<AchievementProgress>(
    'achievements-progress',
    {
      completedSteps: [],
      unlockedAchievements: [],
    }
  );

  const checkAchievements = useCallback(() => {
    tutorialAchievements.forEach((achievement) => {
      const isUnlocked = progress.unlockedAchievements.includes(achievement.id);
      const isCompleted = achievement.requiredSteps.every((step) =>
        tutorialProgress.completedSteps.includes(step)
      );

      if (!isUnlocked && isCompleted) {
        setProgress((prev) => ({
          ...prev,
          unlockedAchievements: [...prev.unlockedAchievements, achievement.id],
          lastAchievementDate: new Date().toISOString(),
        }));

        toast({
          title: '🎉 Achievement Unlocked!',
          description: (
            <div className="flex flex-col gap-2">
              <p className="font-bold">{achievement.title}</p>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
              {achievement.reward && (
                <p className="text-sm">
                  Reward:{' '}
                  {achievement.reward.type === 'badge'
                    ? 'New Badge'
                    : achievement.reward.type === 'feature'
                    ? 'New Feature'
                    : 'New Theme'}
                </p>
              )}
            </div>
          ),
        });
      }
    });
  }, [
    progress.unlockedAchievements,
    tutorialProgress.completedSteps,
    setProgress,
    toast,
  ]);

  const getUnlockedAchievements = useCallback(() => {
    return tutorialAchievements.filter((achievement) =>
      progress.unlockedAchievements.includes(achievement.id)
    );
  }, [progress.unlockedAchievements]);

  const hasUnlockedAchievement = useCallback(
    (id: string) => {
      return progress.unlockedAchievements.includes(id);
    },
    [progress.unlockedAchievements]
  );

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements, tutorialProgress.completedSteps]);

  return (
    <AchievementsContext.Provider
      value={{
        achievements: tutorialAchievements,
        progress,
        checkAchievements,
        getUnlockedAchievements,
        hasUnlockedAchievement,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export const useAchievements = () => {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error(
      'useAchievements must be used within an AchievementsProvider'
    );
  }
  return context;
};
