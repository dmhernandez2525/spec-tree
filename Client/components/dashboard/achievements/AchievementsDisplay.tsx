'use client';

import { motion } from 'framer-motion';
import { useAchievements } from './AchievementsProvider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Icons } from '@/components/shared/icons';
import { Achievement } from '@/types/achievements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress?: number;
}

function AchievementCard({
  achievement,
  isUnlocked,
  progress,
}: AchievementCardProps) {
  const Icon = Icons[achievement.icon as keyof typeof Icons];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card
        className={`${
          isUnlocked ? 'border-primary' : 'opacity-90'
        } transition-all hover:shadow-md`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">
            {achievement.title}
          </CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <div
                className={`rounded-full p-1 ${
                  isUnlocked
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {/* <Icon className="h-4 w-4" /> */}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{achievement.category} achievement</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            {achievement.description}
          </CardDescription>
          <div className="space-y-3">
            {progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge variant={isUnlocked ? 'default' : 'secondary'}>
                {isUnlocked ? 'Unlocked' : 'Locked'}
              </Badge>
              {achievement.reward && (
                <Badge variant="outline" className="ml-2">
                  Reward: {achievement.reward.type}
                </Badge>
              )}
            </div>
            {achievement.unlockedAt && isUnlocked && (
              <p className="text-xs text-muted-foreground">
                Unlocked on{' '}
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function AchievementsDisplay() {
  const { achievements, hasUnlockedAchievement, progress } = useAchievements();
  const [filter, setFilter] = useState<'all' | 'locked' | 'unlocked'>('all');

  const calculateProgress = (achievement: Achievement): number => {
    const completedSteps = achievement.requiredSteps.filter((step) =>
      progress.completedSteps.includes(step)
    ).length;
    return Math.round(
      (completedSteps / achievement.requiredSteps.length) * 100
    );
  };

  const filteredAchievements = achievements.filter((achievement) => {
    const isUnlocked = hasUnlockedAchievement(achievement.id);
    if (filter === 'locked') return !isUnlocked;
    if (filter === 'unlocked') return isUnlocked;
    return true;
  });

  const totalUnlocked = achievements.filter((a) =>
    hasUnlockedAchievement(a.id)
  ).length;
  const totalProgress = Math.round((totalUnlocked / achievements.length) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>
              {totalUnlocked} of {achievements.length} achievements unlocked
            </CardDescription>
          </div>
          <Select
            value={filter}
            onValueChange={(value) => setFilter(value as typeof filter)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid gap-4">
            {filteredAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={hasUnlockedAchievement(achievement.id)}
                progress={
                  hasUnlockedAchievement(achievement.id)
                    ? 100
                    : calculateProgress(achievement)
                }
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
