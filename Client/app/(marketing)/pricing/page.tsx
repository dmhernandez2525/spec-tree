// app/(marketing)/pricing/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import Link from 'next/link';
import { HeadingSection } from '@/components/shared/HeadingSection';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingFaq } from '@/components/pricing/PricingFaq';
import { useState } from 'react';

interface PricingTier {
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: string[];
  highlight?: boolean;
  button: {
    text: string;
    href: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    description: 'Perfect for small teams and individual projects',
    price: {
      monthly: 29,
      annual: 24,
    },
    features: [
      'Up to 5 team members',
      '10 active projects',
      'Basic AI context gathering',
      'Pre-built templates',
      'Email support',
      'Basic integrations',
    ],
    button: {
      text: 'Start Free Trial',
      href: '/register',
      variant: 'outline',
    },
  },
  {
    name: 'Professional',
    description: 'Ideal for growing teams and multiple projects',
    price: {
      monthly: 79,
      annual: 69,
    },
    features: [
      'Up to 20 team members',
      'Unlimited projects',
      'Advanced AI features',
      'Custom templates',
      'Priority support',
      'Advanced integrations',
      'Analytics dashboard',
      'Team collaboration tools',
    ],
    highlight: true,
    button: {
      text: 'Get Started',
      href: '/register',
    },
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    price: {
      monthly: 199,
      annual: 169,
    },
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Premium AI capabilities',
      'Enterprise templates',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'SSO & advanced security',
      'Custom training',
      'SLA guarantee',
    ],
    button: {
      text: 'Contact Sales',
      href: '/contact',
      variant: 'secondary',
    },
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="container py-8 md:py-12">
      {/* Hero Section */}
      <HeadingSection
        heading="Simple, Transparent Pricing"
        description="Choose the perfect plan for your team. All plans include a 14-day free trial."
        className="text-center"
      />

      {/* Pricing Toggle */}
      <div className="mt-8 flex justify-center">
        <PricingToggle
          isAnnual={isAnnual}
          onToggle={() => setIsAnnual(!isAnnual)}
        />
      </div>

      {/* Pricing Cards */}
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={
              tier.highlight ? 'relative border-primary shadow-lg' : ''
            }
          >
            {tier.highlight && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle>
                <h3 className="text-2xl font-bold">{tier.name}</h3>
                <p className="mt-2 text-base font-normal text-muted-foreground">
                  {tier.description}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">
                    ${isAnnual ? tier.price.annual : tier.price.monthly}
                  </span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
                {isAnnual && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Billed annually (save{' '}
                    {Math.round(
                      (((tier.price.monthly - tier.price.annual) * 12) /
                        (tier.price.monthly * 12)) *
                        100
                    )}
                    %)
                  </p>
                )}
              </div>
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icons.check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={tier.button.variant || 'default'}
                className="w-full"
                asChild
              >
                <Link href={tier.button.href}>{tier.button.text}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-24">
        <h2 className="text-center text-3xl font-bold">Compare Plans</h2>
        <div className="mt-8">
          <PricingTable />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24">
        <PricingFaq />
      </div>

      {/* Enterprise CTA */}
      <div className="mt-24 rounded-lg bg-muted p-8 text-center">
        <h2 className="text-2xl font-bold">Need a Custom Solution?</h2>
        <p className="mt-2 text-muted-foreground">
          Contact our sales team for a custom plan tailored to your
          organization's needs.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </div>
    </div>
  );
}
