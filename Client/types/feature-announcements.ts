export interface FeatureSlide {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string; // Call to action button text
  ctaAction?: () => void;
  releaseDate: Date;
}

export interface FeatureAnnouncement {
  id: string;
  version: string;
  releaseDate: Date;
  slides: FeatureSlide[];
  requiredFeatureIds?: string[]; // Features that must be seen before this one
  routes?: string[]; // Routes where this announcement can appear
  priority: number; // Higher numbers appear first
}

export interface AnnouncementState {
  seenAnnouncements: {
    id: string;
    seenAt: Date;
  }[];
  currentAnnouncement?: string;
  lastSeenAt?: Date;
}

export type FeatureAnnouncementContextType = {
  announcements: FeatureAnnouncement[];
  seenAnnouncements: Set<string>;
  currentAnnouncement?: FeatureAnnouncement;
  showAnnouncement: (id: string) => void;
  dismissAnnouncement: (id: string) => void;
  hasUnseenAnnouncements: boolean;
  markAnnouncementAsSeen: (id: string) => void;
};
