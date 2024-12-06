import { TutorialSection } from '@/types/tutorial';

export const analyticsTutorial: TutorialSection = {
  id: 'analytics-deep-dive',
  title: 'Analytics & Reporting',
  description: 'Master the analytics dashboard and reporting features',
  completed: false,
  steps: [
    {
      id: 'analytics-overview',
      title: 'Analytics Dashboard',
      description:
        'Your analytics dashboard provides real-time insights into project performance and team productivity.',
      target: '.analytics-header',
      placement: 'bottom',
      order: 1,
      section: 'analytics-deep-dive',
    },
    {
      id: 'metrics-overview',
      title: 'Key Performance Metrics',
      description:
        'Track important metrics including task completion rates, team velocity, and project health scores.',
      target: '.metrics-cards',
      placement: 'bottom',
      order: 2,
      section: 'analytics-deep-dive',
    },
    {
      id: 'performance-charts',
      title: 'Performance Charts',
      description:
        'Interactive charts showing trends and patterns in your project data.',
      target: '.performance-charts',
      placement: 'left',
      order: 3,
      section: 'analytics-deep-dive',
    },
    {
      id: 'team-metrics',
      title: 'Team Performance',
      description: 'Analyze individual and team performance metrics.',
      target: '.team-metrics',
      placement: 'right',
      order: 4,
      section: 'analytics-deep-dive',
    },
    {
      id: 'custom-reports',
      title: 'Custom Reports',
      description: 'Create and save custom reports for your specific needs.',
      target: '.custom-reports',
      placement: 'top',
      order: 5,
      section: 'analytics-deep-dive',
    },
  ],
};

export const projectsTutorial: TutorialSection = {
  id: 'projects-management',
  title: 'Project Management',
  description: 'Learn to effectively manage your projects',
  completed: false,
  steps: [
    {
      id: 'project-list',
      title: 'Project Overview',
      description:
        'View and manage all your active projects from one central location.',
      target: '.project-list',
      placement: 'bottom',
      order: 1,
      section: 'projects-management',
    },
    {
      id: 'project-creation',
      title: 'Creating Projects',
      description:
        'Start a new project using our AI-powered project templates.',
      target: '.create-project-btn',
      placement: 'right',
      order: 2,
      section: 'projects-management',
    },
    {
      id: 'project-details',
      title: 'Project Details',
      description:
        'Access detailed project information, timelines, and resource allocation.',
      target: '.project-details',
      placement: 'right',
      order: 3,
      section: 'projects-management',
    },
    {
      id: 'team-management',
      title: 'Team Management',
      description: 'Manage team members and their roles within projects.',
      target: '.team-management',
      placement: 'left',
      order: 4,
      section: 'projects-management',
    },
    {
      id: 'project-settings',
      title: 'Project Settings',
      description: 'Configure project-specific settings and integrations.',
      target: '.project-settings',
      placement: 'left',
      order: 5,
      section: 'projects-management',
    },
  ],
};

export const settingsTutorial: TutorialSection = {
  id: 'settings-configuration',
  title: 'Settings & Configuration',
  description: 'Customize your Spec Tree experience',
  completed: false,
  steps: [
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      description: 'Manage your personal profile and preferences.',
      target: '.profile-settings',
      placement: 'right',
      order: 1,
      section: 'settings-configuration',
    },
    {
      id: 'notification-settings',
      title: 'Notifications',
      description: 'Configure your notification preferences and alerts.',
      target: '.notification-settings',
      placement: 'right',
      order: 2,
      section: 'settings-configuration',
    },
    {
      id: 'integration-settings',
      title: 'Integrations',
      description: 'Set up and manage third-party integrations.',
      target: '.integration-settings',
      placement: 'right',
      order: 3,
      section: 'settings-configuration',
    },
    {
      id: 'team-settings',
      title: 'Team Settings',
      description: 'Manage team members and permissions.',
      target: '.team-settings',
      placement: 'right',
      order: 4,
      section: 'settings-configuration',
    },
    {
      id: 'billing-settings',
      title: 'Billing & Subscription',
      description: 'Manage your subscription and billing information.',
      target: '.billing-settings',
      placement: 'right',
      order: 5,
      section: 'settings-configuration',
    },
  ],
};

export const allFeatureTutorials: TutorialSection[] = [
  analyticsTutorial,
  projectsTutorial,
  settingsTutorial,
];
