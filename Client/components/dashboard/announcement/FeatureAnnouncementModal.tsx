'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icons } from '@/components/shared/icons';
import { FeatureAnnouncement } from '@/types/feature-announcements';

interface FeatureAnnouncementModalProps {
  announcement: FeatureAnnouncement;
  onDismiss: () => void;
  onComplete: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export function FeatureAnnouncementModal({
  announcement,
  onDismiss,
  onComplete,
}: FeatureAnnouncementModalProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  const slideIndex = Math.abs(page % announcement.slides.length);
  const currentSlide = announcement.slides[slideIndex];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleNext = () => {
    if (currentSlideIndex === announcement.slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
      paginate(1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      paginate(-1);
    }
  };

  return (
    <Dialog open onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {announcement.version}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onDismiss}>
              <Icons.x className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="relative h-[400px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute w-full h-full"
            >
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-bold">{currentSlide.title}</h2>
                <p className="text-muted-foreground">
                  {currentSlide.description}
                </p>
                {currentSlide.imageUrl && (
                  <div className="relative h-48 w-full">
                    <img
                      src={currentSlide.imageUrl}
                      alt={currentSlide.title}
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {announcement.slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentSlideIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentSlideIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentSlideIndex === announcement.slides.length - 1
                ? 'Get Started'
                : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
