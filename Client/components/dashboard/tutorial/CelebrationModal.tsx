'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { Achievement } from '@/types/achievements';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const celebrationVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.1,
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
    },
  },
};

function triggerCelebrationEffects() {
  // First burst of confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#FFA500', '#FF69B4'],
  });

  // Second burst with different colors after a delay
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#00ff00', '#0099ff', '#ff0033'],
    });
  }, 250);

  // Third burst from the other side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#9932CC', '#00CED1', '#FF8C00'],
    });
  }, 400);
}

export function CelebrationModal({
  achievement,
  onClose,
}: CelebrationModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      triggerCelebrationEffects();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const Icon = Icons[achievement.icon as keyof typeof Icons];

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <motion.div
              variants={celebrationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center gap-2">
                  <motion.div
                    variants={iconVariants}
                    className={cn(
                      'p-2 rounded-full',
                      achievement.category === 'mastery' &&
                        'bg-primary/10 text-primary',
                      achievement.category === 'tutorial' &&
                        'bg-green-500/10 text-green-500',
                      achievement.category === 'usage' &&
                        'bg-blue-500/10 text-blue-500'
                    )}
                  >
                    <Icon className="h-8 w-8" />
                  </motion.div>
                </DialogTitle>
                <motion.div
                  variants={textVariants}
                  className="text-center space-y-4 mt-4"
                >
                  <h2 className="text-2xl font-bold">{achievement.title}</h2>
                  <p className="text-muted-foreground">
                    {achievement.description}
                  </p>

                  {achievement.reward && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium mb-2">
                        Reward Unlocked:
                      </h3>
                      <div className="flex items-center gap-2 justify-center">
                        <Badge variant="default">
                          {achievement.reward.type === 'badge' && 'New Badge'}
                          {achievement.reward.type === 'feature' &&
                            'New Feature'}
                          {achievement.reward.type === 'theme' && 'New Theme'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {achievement.reward.value}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </DialogHeader>
              <motion.div
                variants={textVariants}
                className="flex justify-center mt-6"
              >
                <Button onClick={handleClose} className="w-32">
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
