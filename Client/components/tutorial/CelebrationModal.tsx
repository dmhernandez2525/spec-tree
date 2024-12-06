'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared/icons';
import { Achievement } from '@/types/achievements';
import confetti from 'canvas-confetti';

interface CelebrationModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export function CelebrationModal({
  achievement,
  onClose,
}: CelebrationModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Create confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
              }}
            >
              <Icons.alert className="h-6 w-6 text-yellow-500" />
            </motion.div>
            Achievement Unlocked!
          </DialogTitle>
          <DialogDescription className="text-center pt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-primary">
                {achievement.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {achievement.description}
              </p>

              {achievement.reward && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium">Reward Unlocked:</h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.reward.type === 'badge' && 'New Badge'}
                    {achievement.reward.type === 'feature' && 'New Feature'}
                    {achievement.reward.type === 'theme' && 'New Theme'}
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    {achievement.reward.value}
                  </p>
                </div>
              )}
            </motion.div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button onClick={handleClose}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
