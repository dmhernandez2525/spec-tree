import { Achievement } from '@/types/achievements';

export const tutorialAchievements: Achievement[] = [
  {
    id: 'tutorial-master',
    title: 'Tutorial Master',
    description: 'Complete all main dashboard tutorials',
    icon: 'trophy',
    category: 'tutorial',
    requiredSteps: [
      'dashboard-overview',
      'analytics-deep-dive',
      'projects-management',
      'settings-configuration',
    ],
    reward: {
      type: 'badge',
      value: 'tutorial-master',
    },
  },
  {
    id: 'analytics-expert',
    title: 'Analytics Expert',
    description: 'Complete all analytics tutorials',
    icon: 'barChart',
    category: 'tutorial',
    requiredSteps: [
      'analytics-overview',
      'metrics-overview',
      'performance-charts',
      'team-metrics',
      'custom-reports',
    ],
    reward: {
      type: 'feature',
      value: 'advanced-analytics',
    },
  },
  {
    id: 'project-pioneer',
    title: 'Project Pioneer',
    description: 'Complete all project management tutorials',
    icon: 'folder',
    category: 'tutorial',
    requiredSteps: [
      'project-list',
      'project-creation',
      'project-details',
      'team-management',
      'project-settings',
    ],
    reward: {
      type: 'theme',
      value: 'pro-dark',
    },
  },
];
