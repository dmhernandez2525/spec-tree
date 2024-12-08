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
      {
        title: 'API Access',
        description: 'Access to Spec Tree API',
        included: 'Limited',
      },
      {
        title: 'Custom Integrations',
        description: 'Ability to create custom integrations',
        included: false,
      },
      {
        title: 'Training',
        description: 'Product training and onboarding',
        included: 'Documentation',
      },
      {
        title: 'Custom AI Training',
        description: 'Train AI on your organization’s data',
        included: false,
      },
      {
        title: 'SLA Guarantee',
        description: 'Service level agreement',
        included: false,
      },
      {
        title: 'Custom Deployment',
        description: 'Custom deployment options',
        included: false,
      },
    ],
    maxProjects: 10,
    maxTeamSize: 5,
    supportLevel: 'Email',
    hasTrial: true, // This tier includes a free trial
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
      {
        title: 'API Access',
        description: 'Access to Spec Tree API',
        included: true,
      },
      {
        title: 'Custom Integrations',
        description: 'Ability to create custom integrations',
        included: 'Basic',
      },
      {
        title: 'Training',
        description: 'Product training and onboarding',
        included: 'Group Sessions',
      },
      {
        title: 'Custom AI Training',
        description: 'Train AI on your organization’s data',
        included: false,
      },
      {
        title: 'SLA Guarantee',
        description: 'Service level agreement',
        included: false,
      },
      {
        title: 'Custom Deployment',
        description: 'Custom deployment options',
        included: false,
      },
    ],
    maxProjects: -1,
    maxTeamSize: 20,
    supportLevel: 'Priority',
    highlight: true,
    hasTrial: true, // This tier includes a free trial
    button: {
      text: 'Get Started',
      href: '/register',
    },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Advanced features for established organizations',
    price: {
      monthly: 129,
      annual: 109,
    },
    features: [
      {
        title: 'Team Members',
        description: 'Number of team members who can access the system',
        included: 'Up to 50',
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
        description: 'Expanded template library + custom templates',
        included: 'Expanded + Custom',
      },
      {
        title: 'Support',
        description: 'Access to customer support',
        included: 'Priority with Faster SLAs',
      },
      {
        title: 'Analytics',
        description: 'Project and team analytics with advanced filters',
        included: 'Enhanced',
      },
      {
        title: 'API Access',
        description: 'Access to Spec Tree API',
        included: 'Enhanced API Access',
      },
      {
        title: 'Custom Integrations',
        description: 'Ability to create advanced custom integrations',
        included: 'Advanced',
      },
      {
        title: 'Training',
        description: 'Product training and onboarding',
        included: 'Dedicated Sessions + Tailored Modules',
      },
      {
        title: 'Custom AI Training',
        description: 'Train AI on your organization’s data',
        included: 'Partial (Up to X Models)',
      },
      {
        title: 'SLA Guarantee',
        description: 'Service level agreement',
        included: false,
      },
      {
        title: 'Custom Deployment',
        description: 'Custom deployment options',
        included: false,
      },
    ],
    maxProjects: -1,
    maxTeamSize: 50,
    supportLevel: 'Priority',
    hasTrial: false, // This tier does NOT include a free trial
    button: {
      text: 'Upgrade',
      href: '/register',
      variant: 'secondary',
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
      {
        title: 'API Access',
        description: 'Access to Spec Tree API',
        included: 'Custom & Enhanced',
      },
      {
        title: 'Custom Integrations',
        description: 'Build custom integrations with full flexibility',
        included: 'Advanced + Custom',
      },
      {
        title: 'Training',
        description: 'Product training and onboarding',
        included: 'Custom Training (On-site/Virtual)',
      },
      {
        title: 'Custom AI Training',
        description: 'Train AI on your organization’s data',
        included: 'Full Customization',
      },
      {
        title: 'SLA Guarantee',
        description: 'Service level agreement',
        included: true,
      },
      {
        title: 'Custom Deployment',
        description: 'Custom deployment options',
        included: true,
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
    hasTrial: false, // No trial for enterprise
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
      business: 'Up to 50',
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
      business: 'Unlimited',
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
      business: 'Advanced',
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
      business: 'Partial',
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
      business: 'Expanded + Custom',
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
      business: 'Enhanced',
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
      business: 'Enhanced',
      enterprise: 'Custom & Enhanced',
    },
    category: 'Integrations',
  },
  {
    name: 'Custom Integrations',
    description: 'Build custom integrations',
    plans: {
      starter: false,
      professional: 'Basic',
      business: 'Advanced',
      enterprise: 'Advanced + Custom',
    },
    category: 'Integrations',
  },
  {
    name: 'Support Level',
    description: 'Customer support access',
    plans: {
      starter: 'Email',
      professional: 'Priority',
      business: 'Priority (Faster SLAs)',
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
      business: 'Dedicated + Tailored Modules',
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
      business: false,
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
      business: false,
      enterprise: true,
    },
    category: 'Enterprise',
  },
];
