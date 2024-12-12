'use client';

import React from 'react';
import { useFeatureAnnouncements } from './FeatureAnnouncementContext';
import { FeatureAnnouncementModal } from './FeatureAnnouncementModal';

export function FeatureAnnouncementManager() {
  const { currentAnnouncement, dismissAnnouncement, markAnnouncementAsSeen } =
    useFeatureAnnouncements();

  if (!currentAnnouncement) return null;

  return (
    <FeatureAnnouncementModal
      announcement={currentAnnouncement}
      onDismiss={() => dismissAnnouncement(currentAnnouncement.id)}
      onComplete={() => markAnnouncementAsSeen(currentAnnouncement.id)}
    />
  );
}
