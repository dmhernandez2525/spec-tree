'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { Badge } from '@/components/ui/badge';
import { PricingTier } from '@/types/pricing';
import { TrialStatus } from '@/types/trial';

interface PricingCardProps {
  plan: PricingTier;
  isAnnual: boolean;
  trialStatus?: TrialStatus | null;
  onStartTrial?: (planId: string) => void;
}

export function PricingCard({
  plan,
  isAnnual,
  trialStatus,
  onStartTrial,
}: PricingCardProps) {
  const price = isAnnual ? plan.price.annual : plan.price.monthly;
  const isCurrentTrialPlan = trialStatus?.planId === plan.id;

  const handleAction = () => {
    if (plan.hasTrial && onStartTrial) {
      onStartTrial(plan.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: plan.highlight ? 1.03 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={
          plan.highlight ? 'relative border-primary shadow-lg' : 'relative'
        }
      >
        {plan.highlight && (
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
              Most Popular
            </span>
          </div>
        )}

        {isCurrentTrialPlan && (
          <div className="absolute -top-4 right-4">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Current Trial Plan
            </Badge>
          </div>
        )}

        <CardHeader>
          <CardTitle>
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="mt-2 text-base font-normal text-muted-foreground">
              {plan.description}
            </p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">${price}</span>
              <span className="ml-1 text-muted-foreground">/month</span>
            </div>
            {isAnnual && (
              <p className="mt-1 text-sm text-muted-foreground">
                Billed annually (save{' '}
                {Math.round(
                  (((plan.price.monthly - plan.price.annual) * 12) /
                    (plan.price.monthly * 12)) *
                    100
                )}
                %)
              </p>
            )}
          </div>

          <ul className="mt-8 space-y-4">
            {plan.features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                {typeof feature.included === 'boolean' ? (
                  feature.included ? (
                    <Icons.check className="h-4 w-4 translate-y-1 text-primary" />
                  ) : (
                    <Icons.x className="h-4 w-4 translate-y-1 text-muted-foreground" />
                  )
                ) : (
                  <Icons.check className="h-4 w-4 translate-y-1 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  {typeof feature.included === 'string' && (
                    <span className="text-xs text-primary">
                      {feature.included}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {plan.customFeatures && (
            <div className="mt-6 space-y-4">
              <h4 className="text-sm font-semibold">Also includes:</h4>
              <ul className="space-y-2">
                {plan.customFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icons.alert className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trialStatus?.isActive && isCurrentTrialPlan ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-muted-foreground">
                Current trial plan - {trialStatus.daysRemaining} days remaining
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/user-dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <Button
              variant={plan.button.variant || 'default'}
              className="mt-8 w-full"
              onClick={plan.hasTrial ? handleAction : undefined}
              asChild={!plan.hasTrial}
            >
              {plan.hasTrial ? (
                !trialStatus?.isActive ? (
                  'Start Free Trial'
                ) : (
                  plan.button.text
                )
              ) : (
                <Link href={plan.button.href}>{plan.button.text}</Link>
              )}
            </Button>
          )}

          {plan.hasTrial && !trialStatus?.isActive && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              14-day free trial, no credit card required
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
