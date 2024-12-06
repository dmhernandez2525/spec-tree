export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'tutorial' | 'usage' | 'mastery';
  requiredSteps: string[];
  reward?: {
    type: 'badge' | 'feature' | 'theme';
    value: string;
  };
  unlockedAt?: string;
}

export interface AchievementProgress {
  completedSteps: string[];
  unlockedAchievements: string[];
  lastAchievementDate?: string;
}
