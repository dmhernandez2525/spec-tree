'use client';
import { useEffect } from 'react';
import { useFeatureAnnouncements } from '@/components/dashboard/announcement/FeatureAnnouncementContext';

export function useFeatureAnnouncement(featureId: string) {
  const { showAnnouncement, seenAnnouncements, markAnnouncementAsSeen } =
    useFeatureAnnouncements();

  useEffect(() => {
    // Check if this feature hasn't been seen yet
    if (!seenAnnouncements.has(featureId)) {
      showAnnouncement(featureId);
    }
  }, [featureId, seenAnnouncements, showAnnouncement]);

  return {
    hasSeenFeature: seenAnnouncements.has(featureId),
    markFeatureAsSeen: () => markAnnouncementAsSeen(featureId),
  };
}
