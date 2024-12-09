export interface NavItem {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

export const routes: NavItem[] = [
  {
    title: 'About',
    href: '/about',
    children: [
      {
        title: 'About Us',
        href: '/about',
        description: 'Learn more about our company and mission',
      },
      {
        title: 'Our Process',
        href: '/our-process',
        description: 'Discover how we work with our clients',
      },
      {
        title: 'Team',
        href: '/about#team',
        description: 'Meet the people behind Spec Tree',
      },
      {
        title: 'Careers',
        href: '/careers',
        description: 'Join our growing team',
      },
    ],
  },
  {
    title: 'Features',
    href: '/features',
    children: [
      {
        title: 'AI-Powered Context',
        href: '/features/ai-context',
        description: 'Intelligent context gathering and analysis',
      },
      {
        title: 'Work Item Generation',
        href: '/features/work-items',
        description: 'Automated generation of epics, features, and tasks',
      },
      {
        title: 'Template System',
        href: '/features/templates',
        description: 'Reusable templates for faster project setup',
      },
      {
        title: 'Context Propagation',
        href: '/features/context-propagation',
        description: 'Automatically sync context across work items',
      },
      {
        title: 'Integration Hub',
        href: '/features/integrations',
        description: 'Connect with your favorite project management tools',
      },
      {
        title: 'Analytics',
        href: '/features/analytics',
        description: 'Track project progress and team performance',
      },
    ],
  },
  {
    title: 'Solutions',
    href: '/solutions',
    children: [
      {
        title: 'By Industry',
        href: '/solutions/industry',
        description: 'Solutions tailored to your industry',
        children: [
          {
            title: 'Enterprise',
            href: '/solutions/industry/enterprise',
            description: 'Scale your project management across teams',
          },
          {
            title: 'Software Development',
            href: '/solutions/industry/software-development',
            description: 'Streamline your development process',
          },
          {
            title: 'Digital Marketing',
            href: '/solutions/industry/digital-marketing',
            description: 'Manage multiple client projects seamlessly',
          },
          {
            title: 'Construction',
            href: '/solutions/industry/construction',
            description: 'Coordinate complex projects and teams',
          },
          {
            title: 'Healthcare',
            href: '/solutions/industry/healthcare',
            description: 'Ensure compliance and patient care excellence',
          },
          {
            title: 'Education',
            href: '/solutions/industry/education',
            description: 'Transform educational program management',
          },
        ],
      },
      {
        title: 'By Role',
        href: '/solutions/role',
        description: 'Solutions designed for your role',
        children: [
          {
            title: 'Product Owners',
            href: '/solutions/role/product-owners',
            description: 'Take control of your product roadmap',
          },
          {
            title: 'Project Managers',
            href: '/solutions/role/project-managers',
            description: 'Deliver projects on time and within budget',
          },
          {
            title: 'Developers',
            href: '/solutions/role/developers',
            description: 'Write better code faster',
          },
          {
            title: 'Designers',
            href: '/solutions/role/designers',
            description: 'Create exceptional user experiences',
          },
        ],
      },
    ],
  },
  {
    title: 'Resources',
    href: '/resources',
    children: [
      {
        title: 'Documentation',
        href: '/resources/documentation',
        description: 'Detailed guides and API references',
      },
      {
        title: 'API Reference',
        href: '/resources/api-reference',
        description: 'Complete API documentation and examples',
      },
      {
        title: 'Guides',
        href: '/resources/guides',
        description: 'Step-by-step tutorials and best practices',
      },
      {
        title: 'Case Studies',
        href: '/resources/case-studies',
        description: 'Real-world success stories',
      },
      {
        title: 'Blog',
        href: '/blog',
        description: 'Latest updates and insights',
      },
      {
        title: 'Tutorials',
        href: '/resources/tutorials',
        description: 'Video tutorials and walkthroughs',
      },
    ],
  },
  {
    title: 'Pricing',
    href: '/pricing',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
  {
    title: 'Demo',
    href: '/demo',
  },
];

// Auth routes - not shown in nav but needed for reference
export const authRoutes: NavItem[] = [
  {
    title: 'Login',
    href: '/login',
  },
  {
    title: 'Register',
    href: '/register',
  },
  {
    title: 'Forgot Password',
    href: '/forgot-password',
  },
  {
    title: 'Reset Password',
    href: '/reset-password',
  },
  {
    title: 'Email Confirmation',
    href: '/email-confirmation',
  },
];

// Footer-only routes
export const legalRoutes: NavItem[] = [
  {
    title: 'Privacy Policy',
    href: '/privacy',
  },
  {
    title: 'Terms of Service',
    href: '/terms',
  },
  {
    title: 'Cookie Policy',
    href: '/cookies',
  },
];
