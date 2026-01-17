'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { addEpics, addFeatures, addUserStories } from '@/lib/store/sow-slice';
import { toast } from 'sonner';
import generateId from '../../lib/utils/generate-id';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutTemplate, Rocket, ShoppingCart, Users, Smartphone, Globe, Database } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  epics: Array<{
    title: string;
    description: string;
    goal: string;
    features: Array<{
      title: string;
      description: string;
      userStories: Array<{
        title: string;
        description: string;
        role: string;
        action: string;
        goal: string;
      }>;
    }>;
  }>;
}

const templates: Template[] = [
  {
    id: 'saas-mvp',
    name: 'SaaS MVP',
    description: 'Essential features for launching a SaaS product',
    category: 'startup',
    icon: <Rocket className="h-6 w-6" />,
    epics: [
      {
        title: 'User Authentication & Authorization',
        description: 'Secure user authentication system with role-based access control',
        goal: 'Enable users to securely sign up, log in, and manage their accounts',
        features: [
          {
            title: 'User Registration',
            description: 'Allow new users to create accounts',
            userStories: [
              {
                title: 'Email Registration',
                description: 'Register with email and password',
                role: 'new user',
                action: 'sign up with my email and password',
                goal: 'create an account and access the platform',
              },
              {
                title: 'OAuth Registration',
                description: 'Register with social providers',
                role: 'new user',
                action: 'sign up using Google or GitHub',
                goal: 'quickly create an account without remembering another password',
              },
            ],
          },
          {
            title: 'User Login',
            description: 'Secure login functionality',
            userStories: [
              {
                title: 'Email Login',
                description: 'Login with credentials',
                role: 'registered user',
                action: 'log in with my email and password',
                goal: 'access my account securely',
              },
              {
                title: 'Password Reset',
                description: 'Reset forgotten password',
                role: 'user who forgot password',
                action: 'reset my password via email',
                goal: 'regain access to my account',
              },
            ],
          },
        ],
      },
      {
        title: 'Core Product Features',
        description: 'Main functionality that delivers value to users',
        goal: 'Provide the primary value proposition of the product',
        features: [
          {
            title: 'Dashboard',
            description: 'Central hub for user activity',
            userStories: [
              {
                title: 'Dashboard Overview',
                description: 'View key metrics and recent activity',
                role: 'logged-in user',
                action: 'see my dashboard with key metrics',
                goal: 'quickly understand my current status',
              },
            ],
          },
        ],
      },
      {
        title: 'Billing & Subscription',
        description: 'Payment processing and subscription management',
        goal: 'Enable monetization through subscriptions',
        features: [
          {
            title: 'Subscription Plans',
            description: 'Multiple pricing tiers',
            userStories: [
              {
                title: 'View Plans',
                description: 'Compare available plans',
                role: 'potential customer',
                action: 'view and compare subscription plans',
                goal: 'choose the right plan for my needs',
              },
              {
                title: 'Subscribe',
                description: 'Purchase a subscription',
                role: 'user',
                action: 'subscribe to a paid plan',
                goal: 'access premium features',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Platform',
    description: 'Complete online store with cart and checkout',
    category: 'business',
    icon: <ShoppingCart className="h-6 w-6" />,
    epics: [
      {
        title: 'Product Catalog',
        description: 'Browse and search products',
        goal: 'Allow customers to discover and explore products',
        features: [
          {
            title: 'Product Listing',
            description: 'Display products with filtering',
            userStories: [
              {
                title: 'Browse Products',
                description: 'View all products',
                role: 'customer',
                action: 'browse through product listings',
                goal: 'find products I might want to purchase',
              },
              {
                title: 'Filter Products',
                description: 'Filter by category, price, etc.',
                role: 'customer',
                action: 'filter products by various criteria',
                goal: 'narrow down my search to relevant items',
              },
            ],
          },
          {
            title: 'Product Details',
            description: 'Detailed product information',
            userStories: [
              {
                title: 'View Product',
                description: 'See full product details',
                role: 'customer',
                action: 'view detailed product information',
                goal: 'make an informed purchase decision',
              },
            ],
          },
        ],
      },
      {
        title: 'Shopping Cart & Checkout',
        description: 'Purchase flow from cart to order',
        goal: 'Enable seamless purchasing experience',
        features: [
          {
            title: 'Shopping Cart',
            description: 'Manage items before purchase',
            userStories: [
              {
                title: 'Add to Cart',
                description: 'Add products to cart',
                role: 'customer',
                action: 'add products to my shopping cart',
                goal: 'save items for purchase',
              },
              {
                title: 'Update Cart',
                description: 'Modify cart contents',
                role: 'customer',
                action: 'update quantities or remove items',
                goal: 'adjust my order before checkout',
              },
            ],
          },
          {
            title: 'Checkout Process',
            description: 'Complete the purchase',
            userStories: [
              {
                title: 'Enter Shipping',
                description: 'Add shipping information',
                role: 'customer',
                action: 'enter my shipping address',
                goal: 'receive my order at the correct location',
              },
              {
                title: 'Payment',
                description: 'Process payment',
                role: 'customer',
                action: 'enter payment information securely',
                goal: 'complete my purchase',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Tool',
    description: 'Project management and team communication',
    category: 'productivity',
    icon: <Users className="h-6 w-6" />,
    epics: [
      {
        title: 'Team Management',
        description: 'Organize teams and members',
        goal: 'Enable team structure and member management',
        features: [
          {
            title: 'Team Creation',
            description: 'Create and configure teams',
            userStories: [
              {
                title: 'Create Team',
                description: 'Set up a new team',
                role: 'team admin',
                action: 'create a new team',
                goal: 'organize my colleagues into a working group',
              },
              {
                title: 'Invite Members',
                description: 'Add members to team',
                role: 'team admin',
                action: 'invite colleagues to join my team',
                goal: 'build my team roster',
              },
            ],
          },
        ],
      },
      {
        title: 'Project Management',
        description: 'Track projects and tasks',
        goal: 'Enable project planning and execution',
        features: [
          {
            title: 'Project Board',
            description: 'Kanban-style project view',
            userStories: [
              {
                title: 'Create Project',
                description: 'Start a new project',
                role: 'team member',
                action: 'create a new project',
                goal: 'organize work into manageable units',
              },
              {
                title: 'Create Tasks',
                description: 'Add tasks to project',
                role: 'team member',
                action: 'create tasks within a project',
                goal: 'break down work into actionable items',
              },
              {
                title: 'Move Tasks',
                description: 'Update task status',
                role: 'team member',
                action: 'drag tasks between columns',
                goal: 'track progress visually',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile App MVP',
    description: 'Essential mobile app features',
    category: 'mobile',
    icon: <Smartphone className="h-6 w-6" />,
    epics: [
      {
        title: 'Onboarding',
        description: 'First-time user experience',
        goal: 'Guide new users through app setup',
        features: [
          {
            title: 'Welcome Screens',
            description: 'Introduce app features',
            userStories: [
              {
                title: 'Feature Tour',
                description: 'Walk through key features',
                role: 'new user',
                action: 'see a tour of app features',
                goal: 'understand what the app offers',
              },
            ],
          },
          {
            title: 'Account Setup',
            description: 'Create or link account',
            userStories: [
              {
                title: 'Quick Sign Up',
                description: 'Fast account creation',
                role: 'new user',
                action: 'create an account quickly',
                goal: 'start using the app immediately',
              },
            ],
          },
        ],
      },
      {
        title: 'Core Mobile Features',
        description: 'Main app functionality',
        goal: 'Deliver the primary app experience',
        features: [
          {
            title: 'Home Screen',
            description: 'Main app landing',
            userStories: [
              {
                title: 'View Home',
                description: 'See personalized home screen',
                role: 'user',
                action: 'view my personalized home screen',
                goal: 'access the most relevant content quickly',
              },
            ],
          },
          {
            title: 'Push Notifications',
            description: 'Engage users with notifications',
            userStories: [
              {
                title: 'Receive Notifications',
                description: 'Get timely updates',
                role: 'user',
                action: 'receive push notifications',
                goal: 'stay informed about important updates',
              },
              {
                title: 'Manage Preferences',
                description: 'Control notification settings',
                role: 'user',
                action: 'customize my notification preferences',
                goal: 'only receive notifications I care about',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'api-platform',
    name: 'API Platform',
    description: 'Developer-focused API product',
    category: 'developer',
    icon: <Database className="h-6 w-6" />,
    epics: [
      {
        title: 'API Management',
        description: 'Core API infrastructure',
        goal: 'Provide reliable and scalable API access',
        features: [
          {
            title: 'API Keys',
            description: 'Manage API authentication',
            userStories: [
              {
                title: 'Generate Key',
                description: 'Create new API key',
                role: 'developer',
                action: 'generate a new API key',
                goal: 'authenticate my API requests',
              },
              {
                title: 'Revoke Key',
                description: 'Disable compromised keys',
                role: 'developer',
                action: 'revoke an API key',
                goal: 'secure my account if a key is compromised',
              },
            ],
          },
          {
            title: 'Rate Limiting',
            description: 'Control API usage',
            userStories: [
              {
                title: 'View Limits',
                description: 'See current rate limits',
                role: 'developer',
                action: 'view my rate limit status',
                goal: 'plan my API usage accordingly',
              },
            ],
          },
        ],
      },
      {
        title: 'Developer Experience',
        description: 'Tools and documentation for developers',
        goal: 'Enable developers to integrate quickly',
        features: [
          {
            title: 'Documentation',
            description: 'API reference and guides',
            userStories: [
              {
                title: 'Browse Docs',
                description: 'Read API documentation',
                role: 'developer',
                action: 'browse API documentation',
                goal: 'understand how to use the API',
              },
              {
                title: 'Try Endpoints',
                description: 'Interactive API explorer',
                role: 'developer',
                action: 'test API endpoints interactively',
                goal: 'experiment without writing code',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'marketing-website',
    name: 'Marketing Website',
    description: 'Company website with lead generation',
    category: 'marketing',
    icon: <Globe className="h-6 w-6" />,
    epics: [
      {
        title: 'Landing Pages',
        description: 'High-converting landing pages',
        goal: 'Attract and convert visitors',
        features: [
          {
            title: 'Homepage',
            description: 'Main landing page',
            userStories: [
              {
                title: 'View Homepage',
                description: 'See company overview',
                role: 'visitor',
                action: 'view the homepage',
                goal: 'understand what the company offers',
              },
              {
                title: 'Navigate Site',
                description: 'Find relevant sections',
                role: 'visitor',
                action: 'navigate to different sections',
                goal: 'find the information I need',
              },
            ],
          },
          {
            title: 'Product Pages',
            description: 'Detailed product information',
            userStories: [
              {
                title: 'View Product',
                description: 'Learn about products',
                role: 'potential customer',
                action: 'view product details',
                goal: 'evaluate if the product fits my needs',
              },
            ],
          },
        ],
      },
      {
        title: 'Lead Generation',
        description: 'Capture and nurture leads',
        goal: 'Convert visitors into leads',
        features: [
          {
            title: 'Contact Form',
            description: 'Capture visitor information',
            userStories: [
              {
                title: 'Submit Inquiry',
                description: 'Send a contact request',
                role: 'interested visitor',
                action: 'submit a contact form',
                goal: 'get in touch with the company',
              },
            ],
          },
          {
            title: 'Newsletter Signup',
            description: 'Email list building',
            userStories: [
              {
                title: 'Subscribe',
                description: 'Join email list',
                role: 'visitor',
                action: 'subscribe to the newsletter',
                goal: 'receive updates and content',
              },
            ],
          },
        ],
      },
    ],
  },
];

const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'startup', name: 'Startup' },
  { id: 'business', name: 'Business' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'developer', name: 'Developer' },
  { id: 'marketing', name: 'Marketing' },
];

interface TemplatesProps {
  appId: string | null;
}

export default function Templates({ appId }: TemplatesProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isApplying, setIsApplying] = useState(false);

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const applyTemplate = async (template: Template) => {
    if (!appId) {
      toast.error('Please select an app first');
      return;
    }

    setIsApplying(true);
    try {
      // Create epics, features, and user stories from template
      for (const epicData of template.epics) {
        const epicId = generateId();

        // Create the epic
        dispatch(
          addEpics({
            id: epicId,
            parentAppId: appId,
            title: epicData.title,
            description: epicData.description,
            goal: epicData.goal,
            successCriteria: '',
            dependencies: '',
            timeline: '',
            resources: '',
            risksAndMitigation: [],
            featureIds: [],
            notes: '',
            contextualQuestions: [],
          })
        );

        // Create features for this epic
        for (const featureData of epicData.features) {
          const featureId = generateId();

          dispatch(
            addFeatures({
              id: featureId,
              parentEpicId: epicId,
              title: featureData.title,
              description: featureData.description,
              details: '',
              dependencies: '',
              acceptanceCriteria: [],
              userStoryIds: [],
              notes: '',
              contextualQuestions: [],
            })
          );

          // Create user stories for this feature
          for (const storyData of featureData.userStories) {
            const storyId = generateId();

            dispatch(
              addUserStories({
                id: storyId,
                parentFeatureId: featureId,
                title: storyData.title,
                description: storyData.description,
                role: storyData.role,
                action: storyData.action,
                goal: storyData.goal,
                storyPoints: 0,
                acceptanceCriteria: [],
                taskIds: [],
                notes: '',
                contextualQuestions: [],
              })
            );
          }
        }
      }

      toast.success(`Template "${template.name}" applied successfully`);
      setOpen(false);
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <LayoutTemplate className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Project Templates</DialogTitle>
          <DialogDescription>
            Start with a pre-built template to jumpstart your project
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[60vh]">
              <div className="grid gap-4 md:grid-cols-2 pr-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                    onClick={() => applyTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">{template.icon}</div>
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {template.epics.length} Epics
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.epics.reduce((acc, e) => acc + e.features.length, 0)}{' '}
                          Features
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.epics.reduce(
                            (acc, e) =>
                              acc +
                              e.features.reduce((facc, f) => facc + f.userStories.length, 0),
                            0
                          )}{' '}
                          Stories
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {isApplying && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Applying template...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
