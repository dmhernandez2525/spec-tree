import { FeatureAnnouncement } from '@/types/feature-announcements';

export const FEATURE_ANNOUNCEMENTS: FeatureAnnouncement[] = [
  {
    id: 'new-dashboard-2024',
    version: '2.0.0',
    releaseDate: new Date('2024-03-01'),
    priority: 100,
    slides: [
      {
        id: 'welcome-slide',
        title: 'Everything you need is now in My Hub',
        description:
          'Welcome to the new Spec Tree experience! Weve redesigned everything to make your development process smoother and more efficient.',
        releaseDate: new Date('2024-03-01'),
      },
      {
        id: 'workspaces-slide',
        title: 'Introducing Workspaces',
        description:
          'Use workspaces to group apps and manage permissions more effectively. Keep your projects organized and your team in sync.',
        releaseDate: new Date('2024-03-01'),
      },
      {
        id: 'quick-access-slide',
        title: 'Quick Access to Everything',
        description:
          'Navigate faster with our new sidebar and quick access menu. Find what you need, when you need it.',
        releaseDate: new Date('2024-03-01'),
      },
    ],
    routes: ['/user-dashboard'],
  },
  {
    id: 'analytics-update-2024',
    version: '2.1.0',
    releaseDate: new Date('2024-03-15'),
    priority: 90,
    slides: [
      {
        id: 'analytics-overview',
        title: 'Enhanced Analytics Dashboard',
        description:
          'Get deeper insights into your projects with our new analytics features. Track progress, monitor team performance, and make data-driven decisions.',
        releaseDate: new Date('2024-03-15'),
      },
    ],
    routes: ['/user-dashboard/analytics'],
  },
];
