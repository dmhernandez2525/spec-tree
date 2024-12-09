'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/shared/icons';

interface TrialFeature {
  title: string;
  description: string;
  icon: keyof typeof Icons;
  details?: string[];
}

const trialFeatures: TrialFeature[] = [
  {
    title: 'Full Feature Access',
    description: 'Try every feature of your selected plan without limitations',
    icon: 'check',
    details: [
      'AI-powered context gathering',
      'Custom templates',
      'Advanced analytics',
      'Integration capabilities',
    ],
  },
  {
    title: 'No Credit Card Required',
    description: 'Start your trial instantly - no payment details needed',
    icon: 'alert',
    details: [
      'Instant access',
      'No automatic billing',
      'No hidden charges',
      'Cancel anytime',
    ],
  },
  {
    title: 'Comprehensive Support',
    description: 'Get full support during your trial period',
    icon: 'users',
    details: [
      'Dedicated onboarding',
      'Live chat support',
      'Documentation access',
      'Community resources',
    ],
  },
  {
    title: 'Easy Setup Process',
    description: 'Get started with Spec Tree in minutes',
    icon: 'sparkles',
    details: [
      'Guided onboarding',
      'Pre-built templates',
      'Sample projects',
      'Best practices guide',
    ],
  },
  {
    title: 'Data Security',
    description: 'Your trial data is secure and portable',
    icon: 'alert',
    details: [
      'Enterprise-grade security',
      'Data encryption',
      'Export capabilities',
      'Privacy compliance',
    ],
  },
  {
    title: 'Free Training Resources',
    description: 'Access all training materials during your trial',
    icon: 'alert',
    details: [
      'Video tutorials',
      'Documentation library',
      'Best practices guides',
      'Community forums',
    ],
  },
];

interface FeatureCardProps {
  feature: TrialFeature;
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = Icons[feature.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
          {feature.details && (
            <>
              <Separator className="my-4" />
              <ul className="grid gap-2">
                {feature.details.map((detail, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <Icons.check className="h-4 w-4 text-primary" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrialFeatures() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Start Your Free Trial Today
        </h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Experience the full power of Spec Tree for 14 days
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trialFeatures.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
}
