'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icons } from '@/components/shared/icons';
import { Separator } from '@/components/ui/separator';
import { pricingTiers } from '@/lib/data/pricing';
import { getTrialFeatures } from '@/utils/trial';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: (planId: string) => Promise<void>;
}

export function TrialModal({ isOpen, onClose, onStartTrial }: TrialModalProps) {
  // Default selected plan: if we have trial tiers, select the first trial one; otherwise, just default to the first tier
  const defaultSelectedId =
    pricingTiers.find((tier) => tier.hasTrial)?.id || pricingTiers[0].id;
  const [selectedPlan, setSelectedPlan] = useState<string>(defaultSelectedId);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTier = pricingTiers.find((tier) => tier.id === selectedPlan);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await onStartTrial(selectedPlan);
      onClose();
    } catch (error) {
      console.error('Failed to start trial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Your Plan</DialogTitle>
          <DialogDescription>
            Choose the plan that best fits your needs. Trial plans offer a
            14-day free trial
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <Label className="text-base">Choose your plan</Label>
          <RadioGroup
            value={selectedPlan}
            onValueChange={setSelectedPlan}
            className="mt-3 space-y-4"
          >
            {pricingTiers.map((tier) => {
              const isSelected = selectedPlan === tier.id;

              // Determine the price label
              const priceLabel = tier.hasTrial
                ? `$${tier.price.monthly}/mo after trial`
                : `$${tier.price.monthly}/mo`;

              return (
                <Card
                  key={tier.id}
                  className={`relative cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
                    isSelected ? 'border-primary' : ''
                  }`}
                >
                  <RadioGroupItem
                    value={tier.id}
                    id={tier.id}
                    className="absolute right-4 top-4"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={tier.id}
                        className="text-base font-semibold"
                      >
                        {tier.name}
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {priceLabel}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            {tier.hasTrial ? (
                              <>
                                <Label>Included in trial:</Label>
                                <ul className="grid gap-2 text-sm">
                                  {getTrialFeatures(tier.id).map(
                                    (feature, index) => (
                                      <li
                                        key={index}
                                        className="flex items-center gap-2"
                                      >
                                        <Icons.check className="h-4 w-4 text-primary" />
                                        <span>{feature}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </>
                            ) : (
                              <>
                                <Label>What’s included:</Label>
                                <ul className="grid gap-2 text-sm">
                                  {tier.features.map((featureItem, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <Icons.check className="h-4 w-4 text-primary" />
                                      <span>
                                        <strong>{featureItem.title}:</strong>{' '}
                                        {featureItem.included ||
                                          featureItem.description}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              );
            })}
          </RadioGroup>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedTier && (
            <Button onClick={handleStartTrial} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.alert className="mr-2 h-4 w-4 animate-spin" />
                  {selectedTier.hasTrial
                    ? 'Starting Trial...'
                    : 'Processing...'}
                </>
              ) : selectedTier.hasTrial ? (
                'Start Free Trial'
              ) : (
                'Check Out Now'
              )}
            </Button>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          By selecting a plan, you agree to our{' '}
          <Button variant="link" className="h-auto p-0" asChild>
            <a href="/terms">Terms of Service</a>
          </Button>{' '}
          and{' '}
          <Button variant="link" className="h-auto p-0" asChild>
            <a href="/privacy">Privacy Policy</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
