// /components/marketing/pricing/PricingCard.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { PricingTier } from '@/types/pricing';

interface PricingCardProps {
  plan: PricingTier;
  isAnnual: boolean;
}

export function PricingCard({ plan, isAnnual }: PricingCardProps) {
  const price = isAnnual ? plan.price.annual : plan.price.monthly;

  return (
    <motion.div
      whileHover={{ scale: plan.highlight ? 1.03 : 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={plan.highlight ? 'border-primary shadow-lg' : ''}>
        {plan.highlight && (
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <span className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
              Most Popular
            </span>
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
              <li key={feature.title} className="flex items-center gap-2">
                {typeof feature.included === 'boolean' ? (
                  feature.included ? (
                    <Icons.check className="h-4 w-4 text-primary" />
                  ) : (
                    <Icons.x className="h-4 w-4 text-muted-foreground" />
                  )
                ) : (
                  <Icons.check className="h-4 w-4 text-primary" />
                )}
                <div>
                  <span className="text-sm">{feature.title}</span>
                  {typeof feature.included === 'string' && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({feature.included})
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {plan.customFeatures && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold">Also includes:</h4>
              <ul className="mt-2 space-y-2">
                {plan.customFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Icons.alert className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button
            variant={plan.button.variant || 'default'}
            className="mt-8 w-full"
            asChild
          >
            <Link href={plan.button.href}>{plan.button.text}</Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
