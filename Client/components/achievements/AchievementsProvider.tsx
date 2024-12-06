'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { Achievement, AchievementProgress } from '@/types/achievements';
import { tutorialAchievements } from './achievements-data';
import { useToast } from '@/lib/hooks/use-toast';
import { useTutorial } from '../tutorial/TutorialContext';
import { CelebrationModal } from '../tutorial/CelebrationModal';
import confetti from 'canvas-confetti';

interface AchievementsContextType {
  achievements: Achievement[];
  progress: AchievementProgress;
  checkAchievements: () => void;
  getUnlockedAchievements: () => Achievement[];
  hasUnlockedAchievement: (id: string) => boolean;
  getAchievementProgress: (id: string) => number;
  resetProgress: () => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(
  undefined
);

interface AchievementsProviderProps {
  children: React.ReactNode;
}

export function AchievementsProvider({ children }: AchievementsProviderProps) {
  const { toast } = useToast();
  const { progress: tutorialProgress } = useTutorial();
  const [celebrateAchievement, setCelebrateAchievement] =
    useState<Achievement | null>(null);

  const [progress, setProgress] = useLocalStorage<AchievementProgress>(
    'achievements-progress',
    {
      completedSteps: [],
      unlockedAchievements: [],
      lastAchievementDate: undefined,
      completedTutorials: [],
    }
  );

  const triggerCelebration = useCallback((achievement: Achievement) => {
    setCelebrateAchievement(achievement);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const checkAchievements = useCallback(() => {
    let newlyUnlocked = false;

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

        newlyUnlocked = true;
        triggerCelebration(achievement);

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
                  : {achievement.reward.value}
                </p>
              )}
            </div>
          ),
        });
      }
    });

    // If multiple achievements were unlocked, trigger a special celebration
    if (newlyUnlocked) {
      const unlockedCount = progress.unlockedAchievements.length;
      if (unlockedCount === tutorialAchievements.length) {
        toast({
          title: '🏆 Congratulations!',
          description: 'Youve unlocked all achievements!',
        });
      } else if (unlockedCount % 5 === 0) {
        toast({
          title: '🌟 Milestone Reached!',
          description: `You've unlocked ${unlockedCount} achievements!`,
        });
      }
    }
  }, [
    progress.unlockedAchievements,
    tutorialProgress.completedSteps,
    setProgress,
    toast,
    triggerCelebration,
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

  const getAchievementProgress = useCallback(
    (id: string) => {
      const achievement = tutorialAchievements.find((a) => a.id === id);
      if (!achievement) return 0;

      const completedSteps = achievement.requiredSteps.filter((step) =>
        tutorialProgress.completedSteps.includes(step)
      ).length;

      return Math.round(
        (completedSteps / achievement.requiredSteps.length) * 100
      );
    },
    [tutorialProgress.completedSteps]
  );

  const resetProgress = useCallback(() => {
    setProgress({
      completedSteps: [],
      unlockedAchievements: [],
      lastAchievementDate: undefined,
      completedTutorials: [],
    });
    toast({
      title: 'Progress Reset',
      description: 'All achievement progress has been reset.',
    });
  }, [setProgress, toast]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements, tutorialProgress.completedSteps]);

  const value = {
    achievements: tutorialAchievements,
    progress,
    checkAchievements,
    getUnlockedAchievements,
    hasUnlockedAchievement,
    getAchievementProgress,
    resetProgress,
  };

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      {celebrateAchievement && (
        <CelebrationModal
          achievement={celebrateAchievement}
          onClose={() => setCelebrateAchievement(null)}
        />
      )}
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
