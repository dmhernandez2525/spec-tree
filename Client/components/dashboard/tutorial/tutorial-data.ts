import { TutorialSection, TutorialStep } from '@/types/tutorial';

const gettingStartedSection: TutorialSection = {
  id: 'getting-started',
  title: 'Getting Started',
  description: 'Learn the basics of Spec Tree',
  completed: false,
  steps: [],
};

const aiContextSection: TutorialSection = {
  id: 'ai-context',
  title: 'AI Context Creation',
  description: 'Master the AI-powered context gathering system',
  completed: false,
  steps: [],
};

const analyticsDeepDiveSection: TutorialSection = {
  id: 'analytics-deep-dive',
  title: 'Analytics & Reporting',
  description: 'Master the analytics dashboard and reporting features',
  completed: false,
  steps: [],
};

const projectManagementSection: TutorialSection = {
  id: 'project-management',
  title: 'Project Management',
  description: 'Learn to effectively manage your projects',
  completed: false,
  steps: [],
};

const advancedFeaturesSection: TutorialSection = {
  id: 'advanced-features',
  title: 'Advanced Features',
  description: 'Explore advanced features and customization options',
  completed: false,
  steps: [],
};

// Now define the steps for each section, referencing the section objects above

// Getting Started Steps
const gettingStartedSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Spec Tree',
    description:
      'Get started with the basics of creating and managing project requirements.',
    target: '.dashboard-header',
    placement: 'bottom',
    order: 1,
    section: gettingStartedSection,
  },
  {
    id: 'navigation',
    title: 'Navigation Overview',
    description:
      'Learn how to navigate through different sections of the application.',
    target: '.sidebar-nav',
    placement: 'right',
    order: 2,
    section: gettingStartedSection,
  },
  {
    id: 'projects-overview',
    title: 'Projects Overview',
    description:
      'View and manage your active projects from one central location.',
    target: '.project-overview',
    placement: 'bottom',
    order: 3,
    section: gettingStartedSection,
  },
  {
    id: 'analytics-intro',
    title: 'Analytics Dashboard',
    description:
      'Get insights into your project performance and team productivity.',
    target: '.analytics-metrics',
    placement: 'left',
    order: 4,
    section: gettingStartedSection,
  },
  {
    id: 'achievements-intro',
    title: 'Achievements System',
    description:
      'Track your progress and unlock rewards as you master Spec Tree.',
    target: '.achievements-display',
    placement: 'right',
    order: 5,
    section: gettingStartedSection,
  },
];

// Assign steps to their parent section
gettingStartedSection.steps = gettingStartedSteps;

// AI Context Steps
const aiContextSteps: TutorialStep[] = [
  {
    id: 'context-overview',
    title: 'Context Overview',
    description: 'Learn how AI helps gather and refine project requirements.',
    target: '.context-overview',
    placement: 'bottom',
    order: 1,
    section: aiContextSection,
  },
  {
    id: 'question-generation',
    title: 'Question Generation',
    description:
      'See how AI generates relevant questions based on your project type.',
    target: '.question-generator',
    placement: 'right',
    order: 2,
    section: aiContextSection,
  },
  {
    id: 'context-refinement',
    title: 'Context Refinement',
    description: 'Learn to refine and improve context using AI suggestions.',
    target: '.context-editor',
    placement: 'left',
    order: 3,
    section: aiContextSection,
  },
  {
    id: 'context-propagation',
    title: 'Context Propagation',
    description: 'Understand how context flows through your project hierarchy.',
    target: '.context-flow',
    placement: 'right',
    order: 4,
    section: aiContextSection,
  },
];

// Assign steps to the AI Context section
aiContextSection.steps = aiContextSteps;

// Analytics & Reporting Steps
const analyticsDeepDiveSteps: TutorialStep[] = [
  {
    id: 'analytics-overview',
    title: 'Analytics Dashboard',
    description: 'Get a comprehensive view of your analytics dashboard.',
    target: '.analytics-header',
    placement: 'bottom',
    order: 1,
    section: analyticsDeepDiveSection,
  },
  {
    id: 'metrics-overview',
    title: 'Key Performance Metrics',
    description:
      'Learn about important metrics tracking task completion and team performance.',
    target: '.metrics-cards',
    placement: 'bottom',
    order: 2,
    section: analyticsDeepDiveSection,
  },
  {
    id: 'performance-charts',
    title: 'Performance Charts',
    description: 'Analyze trends and patterns in your project data.',
    target: '.performance-charts',
    placement: 'right',
    order: 3,
    section: analyticsDeepDiveSection,
  },
  {
    id: 'custom-reports',
    title: 'Custom Reports',
    description: 'Create and customize reports for your specific needs.',
    target: '.custom-reports',
    placement: 'left',
    order: 4,
    section: analyticsDeepDiveSection,
  },
  {
    id: 'export-options',
    title: 'Export & Share',
    description:
      'Learn how to export and share your analytics with stakeholders.',
    target: '.export-controls',
    placement: 'top',
    order: 5,
    section: analyticsDeepDiveSection,
  },
];

// Assign steps to the analytics deep dive section
analyticsDeepDiveSection.steps = analyticsDeepDiveSteps;

// Project Management Steps
const projectManagementSteps: TutorialStep[] = [
  {
    id: 'create-project',
    title: 'Creating Projects',
    description: 'Start a new project using AI-powered templates.',
    target: '.create-project-button',
    placement: 'right',
    order: 1,
    section: projectManagementSection,
  },
  {
    id: 'work-hierarchy',
    title: 'Work Item Hierarchy',
    description:
      'Understand how Epics, Features, and Stories relate to each other.',
    target: '.work-hierarchy',
    placement: 'left',
    order: 2,
    section: projectManagementSection,
  },
  {
    id: 'team-collaboration',
    title: 'Team Collaboration',
    description: 'Learn how to collaborate effectively with your team.',
    target: '.team-section',
    placement: 'right',
    order: 3,
    section: projectManagementSection,
  },
  {
    id: 'tracking-progress',
    title: 'Progress Tracking',
    description: 'Monitor project progress and track deliverables.',
    target: '.progress-tracking',
    placement: 'bottom',
    order: 4,
    section: projectManagementSection,
  },
];

// Assign steps to the project management section
projectManagementSection.steps = projectManagementSteps;

// Advanced Features Steps
const advancedFeaturesSteps: TutorialStep[] = [
  {
    id: 'custom-templates',
    title: 'Custom Templates',
    description: 'Create and manage custom project templates.',
    target: '.template-manager',
    placement: 'right',
    order: 1,
    section: advancedFeaturesSection,
  },
  {
    id: 'integrations',
    title: 'External Integrations',
    description: 'Connect Spec Tree with your favorite tools.',
    target: '.integrations-panel',
    placement: 'left',
    order: 2,
    section: advancedFeaturesSection,
  },
  {
    id: 'automation',
    title: 'Workflow Automation',
    description: 'Set up automated workflows and notifications.',
    target: '.automation-settings',
    placement: 'bottom',
    order: 3,
    section: advancedFeaturesSection,
  },
  {
    id: 'api-access',
    title: 'API Access',
    description: 'Learn how to access and use the Spec Tree API.',
    target: '.api-documentation',
    placement: 'right',
    order: 4,
    section: advancedFeaturesSection,
  },
];

// Assign steps to the advanced features section
advancedFeaturesSection.steps = advancedFeaturesSteps;

// Finally, assemble all sections into the tutorialData array
export const tutorialData: TutorialSection[] = [
  gettingStartedSection,
  aiContextSection,
  analyticsDeepDiveSection,
  projectManagementSection,
  advancedFeaturesSection,
];
