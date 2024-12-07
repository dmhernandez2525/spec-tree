export type FeatureCategory =
  | 'ai-context'
  | 'work-items'
  | 'templates'
  | 'integrations'
  | 'analytics'
  | 'context-propagation';

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: FeatureCategory;
  icon: keyof typeof import('@/components/shared/icons').Icons;
  benefits: string[];
  details: {
    title: string;
    description: string;
  }[];
  technicalSpecs?: {
    label: string;
    value: string;
  }[];
  useCases: {
    title: string;
    description: string;
    examples: string[];
  }[];
}

export const features: Record<FeatureCategory, Feature> = {
  'ai-context': {
    id: 'ai-context',
    title: 'AI-Powered Context Gathering',
    description:
      'Intelligent system that asks the right questions to capture comprehensive project requirements.',
    category: 'ai-context',
    icon: 'brain',
    benefits: [
      'Reduce planning time by 40%',
      'Ensure nothing is overlooked',
      'Improve requirement quality',
      'Maintain consistency across projects',
    ],
    details: [
      {
        title: 'Dynamic Question Generation',
        description:
          'AI analyzes your project type and goals to generate relevant, contextual questions.',
      },
      {
        title: 'Smart Context Analysis',
        description:
          'Advanced algorithms process responses to identify gaps and dependencies.',
      },
      {
        title: 'Continuous Learning',
        description:
          'System improves over time by learning from your teams responses and patterns.',
      },
    ],
    technicalSpecs: [
      {
        label: 'AI Model',
        value: 'GPT-4 & Custom NLP Models',
      },
      {
        label: 'Response Time',
        value: '< 2 seconds',
      },
      {
        label: 'Accuracy Rate',
        value: '95%+',
      },
    ],
    useCases: [
      {
        title: 'Software Development',
        description: 'Capture technical requirements and system dependencies',
        examples: [
          'Architecture planning',
          'API design',
          'Security requirements',
        ],
      },
      {
        title: 'Product Development',
        description: 'Define comprehensive product specifications',
        examples: [
          'Feature planning',
          'User research integration',
          'Market requirements',
        ],
      },
    ],
  },
  'work-items': {
    id: 'work-items',
    title: 'Smart Work Item Generation',
    description:
      'Automatically generate and organize work items with intelligent relationships.',
    category: 'work-items',
    icon: 'eye',
    benefits: [
      'Automated hierarchy creation',
      'Smart dependency mapping',
      'Consistent structure',
      'Time-saving templates',
    ],
    details: [
      {
        title: 'Automated Generation',
        description:
          'Create complete work item hierarchies from high-level concepts.',
      },
      {
        title: 'Intelligent Relationships',
        description:
          'Automatically identify and map dependencies between items.',
      },
    ],
    useCases: [
      {
        title: 'Agile Teams',
        description: 'Break down epics into manageable stories and tasks',
        examples: ['Sprint planning', 'Backlog refinement', 'Release planning'],
      },
    ],
  },
  // Add similar entries for other categories...
  templates: {
    id: 'templates',
    title: 'Template System',
    category: 'templates',
    description:
      'Reusable project templates for faster setup and consistent execution.',
    icon: 'eye',
    benefits: [],
    details: [],
    useCases: [],
  },
  integrations: {
    id: 'integrations',
    title: 'Integrations Hub',
    category: 'integrations',
    description: 'Connect with your favorite tools seamlessly.',
    icon: 'plug',
    benefits: [],
    details: [],
    useCases: [],
  },
  analytics: {
    id: 'analytics',
    title: 'Advanced Analytics',
    category: 'analytics',
    description:
      'Gain insights into your project performance and team efficiency.',
    icon: 'barChart',
    benefits: [],
    details: [],
    useCases: [],
  },
  'context-propagation': {
    id: 'context-propagation',
    title: 'Context Propagation',
    category: 'context-propagation',
    description: 'Automatically sync context across related items.',
    icon: 'eye',
    benefits: [],
    details: [],
    useCases: [],
  },
};
