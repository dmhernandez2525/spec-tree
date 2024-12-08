import { PricingTier, ComparisonFeature } from '@/types/pricing';

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams and individual projects',
    price: {
      monthly: 29,
      annual: 24,
    },
    features: [
      {
        title: 'Team Members',
        description: 'Number of team members who can access the system',
        included: 'Up to 5',
      },
      {
        title: 'Active Projects',
        description: 'Number of concurrent projects',
        included: '10',
      },
      {
        title: 'AI Context Gathering',
        description: 'AI-powered requirements and context collection',
        included: 'Basic',
      },
      {
        title: 'Templates',
        description: 'Pre-built project templates',
        included: 'Pre-built only',
      },
      {
        title: 'Support',
        description: 'Access to customer support',
        included: 'Email',
      },
      {
        title: 'Analytics',
        description: 'Project and team analytics',
        included: false,
      },
    ],
    maxProjects: 10,
    maxTeamSize: 5,
    supportLevel: 'Email',
    button: {
      text: 'Start Free Trial',
      href: '/register',
      variant: 'outline',
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Ideal for growing teams and multiple projects',
    price: {
      monthly: 79,
      annual: 69,
    },
    features: [
      {
        title: 'Team Members',
        description: 'Number of team members who can access the system',
        included: 'Up to 20',
      },
      {
        title: 'Active Projects',
        description: 'Number of concurrent projects',
        included: 'Unlimited',
      },
      {
        title: 'AI Context Gathering',
        description: 'AI-powered requirements and context collection',
        included: 'Advanced',
      },
      {
        title: 'Templates',
        description: 'Custom and pre-built project templates',
        included: 'Custom + Pre-built',
      },
      {
        title: 'Support',
        description: 'Access to customer support',
        included: 'Priority',
      },
      {
        title: 'Analytics',
        description: 'Project and team analytics',
        included: true,
      },
    ],
    maxProjects: -1,
    maxTeamSize: 20,
    supportLevel: 'Priority',
    highlight: true,
    button: {
      text: 'Get Started',
      href: '/register',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: {
      monthly: 199,
      annual: 169,
    },
    features: [
      {
        title: 'Team Members',
        description: 'Number of team members who can access the system',
        included: 'Unlimited',
      },
      {
        title: 'Active Projects',
        description: 'Number of concurrent projects',
        included: 'Unlimited',
      },
      {
        title: 'AI Context Gathering',
        description: 'AI-powered requirements and context collection',
        included: 'Premium',
      },
      {
        title: 'Templates',
        description: 'Enterprise template library',
        included: 'Enterprise Library',
      },
      {
        title: 'Support',
        description: 'Access to customer support',
        included: 'Dedicated',
      },
      {
        title: 'Analytics',
        description: 'Advanced analytics and custom reporting',
        included: 'Advanced',
      },
    ],
    maxProjects: -1,
    maxTeamSize: -1,
    supportLevel: 'Dedicated',
    customFeatures: [
      'Custom AI model training',
      'Advanced security features',
      'Custom integrations',
      'SLA guarantees',
    ],
    button: {
      text: 'Contact Sales',
      href: '/contact',
      variant: 'secondary',
    },
  },
];

export const featureComparison: ComparisonFeature[] = [
  {
    name: 'Team Members',
    description: 'Maximum number of team members',
    plans: {
      starter: 'Up to 5',
      professional: 'Up to 20',
      enterprise: 'Unlimited',
    },
    category: 'Basics',
  },
  {
    name: 'Active Projects',
    description: 'Number of concurrent projects',
    plans: {
      starter: '10',
      professional: 'Unlimited',
      enterprise: 'Unlimited',
    },
    category: 'Basics',
  },
  {
    name: 'AI Context Gathering',
    description: 'AI-powered requirements collection',
    plans: {
      starter: 'Basic',
      professional: 'Advanced',
      enterprise: 'Premium',
    },
    category: 'AI Features',
  },
  {
    name: 'Custom AI Training',
    description: "Train AI on your organization's data",
    plans: {
      starter: false,
      professional: false,
      enterprise: true,
    },
    category: 'AI Features',
  },
  {
    name: 'Templates',
    description: 'Project templates and reusable components',
    plans: {
      starter: 'Pre-built only',
      professional: 'Custom + Pre-built',
      enterprise: 'Enterprise Library',
    },
    category: 'Features',
  },
  {
    name: 'Analytics Dashboard',
    description: 'Project and team performance analytics',
    plans: {
      starter: false,
      professional: true,
      enterprise: 'Advanced',
    },
    category: 'Features',
  },
  {
    name: 'API Access',
    description: 'Access to Spec Tree API',
    plans: {
      starter: 'Limited',
      professional: true,
      enterprise: 'Custom',
    },
    category: 'Integrations',
  },
  {
    name: 'Custom Integrations',
    description: 'Build custom integrations',
    plans: {
      starter: false,
      professional: 'Basic',
      enterprise: 'Advanced',
    },
    category: 'Integrations',
  },
  {
    name: 'Support Level',
    description: 'Customer support access',
    plans: {
      starter: 'Email',
      professional: 'Priority',
      enterprise: 'Dedicated',
    },
    category: 'Support',
  },
  {
    name: 'Training',
    description: 'Product training and onboarding',
    plans: {
      starter: 'Documentation',
      professional: 'Group Sessions',
      enterprise: 'Custom Training',
    },
    category: 'Support',
  },
  {
    name: 'SLA Guarantee',
    description: 'Service level agreement',
    plans: {
      starter: false,
      professional: false,
      enterprise: true,
    },
    category: 'Enterprise',
  },
  {
    name: 'Custom Deployment',
    description: 'Custom deployment options',
    plans: {
      starter: false,
      professional: false,
      enterprise: true,
    },
    category: 'Enterprise',
  },
];
