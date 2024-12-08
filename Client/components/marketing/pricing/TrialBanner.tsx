'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/shared/icons';
import { TrialStatus } from '@/types/trial';
import { calculateTrialDaysRemaining, formatTrialDate } from '@/utils/trial';

interface TrialBannerProps {
  trialStatus: TrialStatus | null;
  onStartTrial?: () => void;
}

export function TrialBanner({ trialStatus, onStartTrial }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const daysRemaining = trialStatus?.startDate
    ? calculateTrialDaysRemaining(trialStatus.startDate)
    : null;

  const progress = daysRemaining ? ((14 - daysRemaining) / 14) * 100 : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className="relative border-primary/50 bg-primary/5">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={() => setIsVisible(false)}
          >
            <Icons.x className="h-4 w-4" />
          </Button>

          {trialStatus?.isActive ? (
            <>
              <AlertTitle className="flex items-center gap-2">
                <Icons.alert className="h-4 w-4" />
                Trial Status
              </AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {trialStatus.endDate &&
                        `Trial ends on ${formatTrialDate(trialStatus.endDate)}`}
                    </span>
                    <span className="font-medium text-primary">
                      {daysRemaining !== null &&
                        `${daysRemaining} days remaining`}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between gap-4 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/user-dashboard/settings">
                        View Trial Details
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/pricing">Upgrade Now</Link>
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </>
          ) : (
            <>
              <AlertTitle className="flex items-center gap-2">
                <Icons.sparkles className="h-4 w-4" />
                Start Your Free Trial
              </AlertTitle>
              <AlertDescription>
                <p className="mt-2">
                  Try Spec Tree free for 14 days. No credit card
                  required.
                </p>
                <div className="mt-4 flex gap-4">
                  {onStartTrial && (
                    <Button size="sm" onClick={onStartTrial}>
                      Start Free Trial
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </AlertDescription>
            </>
          )}
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
