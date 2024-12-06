'use client';

import { motion } from 'framer-motion';
import { useAchievements } from './AchievementsProvider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { Achievement } from '@/types/achievements';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const Icon = Icons[achievement.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${isUnlocked ? 'border-primary' : 'opacity-50'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {achievement.title}
          </CardTitle>
          <Icon
            className={`h-4 w-4 ${
              isUnlocked ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
        </CardHeader>
        <CardContent>
          <CardDescription>{achievement.description}</CardDescription>
          <div className="mt-2 flex items-center justify-between">
            <Badge variant={isUnlocked ? 'default' : 'secondary'}>
              {isUnlocked ? 'Unlocked' : 'Locked'}
            </Badge>
            {achievement.reward && (
              <span className="text-xs text-muted-foreground">
                Reward: {achievement.reward.type}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AchievementsDisplay() {
  const { achievements, hasUnlockedAchievement } = useAchievements();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Track your progress and unlock rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid gap-4">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={hasUnlockedAchievement(achievement.id)}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
