'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import {
  FeatureAnnouncement,
  AnnouncementState,
  FeatureAnnouncementContextType,
} from '@/types/feature-announcements';
import { FEATURE_ANNOUNCEMENTS } from '@/lib/data/mocks/feature-announcements';

const FeatureAnnouncementContext = createContext<
  FeatureAnnouncementContextType | undefined
>(undefined);

interface FeatureAnnouncementProviderProps {
  children: React.ReactNode;
}

export function FeatureAnnouncementProvider({
  children,
}: FeatureAnnouncementProviderProps) {
  const pathname = usePathname();
  const [announcementState, setAnnouncementState] =
    useLocalStorage<AnnouncementState>('feature-announcements', {
      seenAnnouncements: [],
      lastSeenAt: undefined,
    });

  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<FeatureAnnouncement>();
  const seenAnnouncements = new Set(
    announcementState.seenAnnouncements.map((a) => a.id)
  );

  useEffect(() => {
    checkForAnnouncements();
  }, [pathname]);

  const checkForAnnouncements = () => {
    const availableAnnouncements = FEATURE_ANNOUNCEMENTS.filter(
      (announcement) => {
        // Check if announcement is valid for current route
        const routeMatch =
          !announcement.routes || announcement.routes.includes(pathname);
        // Check if announcement hasn't been seen
        const notSeen = !seenAnnouncements.has(announcement.id);
        // Check if release date is valid
        const isReleased = new Date(announcement.releaseDate) <= new Date();
        // Check if required features have been seen
        const prerequisitesMet =
          !announcement.requiredFeatureIds?.length ||
          announcement.requiredFeatureIds.every((id) =>
            seenAnnouncements.has(id)
          );

        return routeMatch && notSeen && isReleased && prerequisitesMet;
      }
    ).sort((a, b) => b.priority - a.priority);

    if (availableAnnouncements.length > 0) {
      setCurrentAnnouncement(availableAnnouncements[0]);
    }
  };

  const showAnnouncement = (id: string) => {
    const announcement = FEATURE_ANNOUNCEMENTS.find((a) => a.id === id);
    if (announcement) {
      setCurrentAnnouncement(announcement);
    }
  };

  const dismissAnnouncement = (id: string) => {
    setAnnouncementState((prev) => ({
      ...prev,
      seenAnnouncements: [
        ...prev.seenAnnouncements,
        { id, seenAt: new Date() },
      ],
      lastSeenAt: new Date(),
    }));
    setCurrentAnnouncement(undefined);
  };

  const markAnnouncementAsSeen = (id: string) => {
    setAnnouncementState((prev) => ({
      ...prev,
      seenAnnouncements: [
        ...prev.seenAnnouncements,
        { id, seenAt: new Date() },
      ],
      lastSeenAt: new Date(),
    }));
    dismissAnnouncement(id);
  };

  const value = {
    announcements: FEATURE_ANNOUNCEMENTS,
    seenAnnouncements,
    currentAnnouncement,
    showAnnouncement,
    dismissAnnouncement,
    hasUnseenAnnouncements: FEATURE_ANNOUNCEMENTS.some(
      (a) => !seenAnnouncements.has(a.id)
    ),
    markAnnouncementAsSeen,
  };

  return (
    <FeatureAnnouncementContext.Provider value={value}>
      {children}
    </FeatureAnnouncementContext.Provider>
  );
}

export const useFeatureAnnouncements = () => {
  const context = useContext(FeatureAnnouncementContext);
  if (context === undefined) {
    throw new Error(
      'useFeatureAnnouncements must be used within a FeatureAnnouncementProvider'
    );
  }
  return context;
};
