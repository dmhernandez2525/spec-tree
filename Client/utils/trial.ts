import { TrialStatus } from '@/types/trial';

export const DEFAULT_TRIAL_DURATION = 14; // days

export function calculateTrialDaysRemaining(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime =
    start.getTime() -
    now.getTime() +
    DEFAULT_TRIAL_DURATION * 24 * 60 * 60 * 1000;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isTrialExpired(trialStatus: TrialStatus): boolean {
  if (!trialStatus.endDate) return false;
  return new Date(trialStatus.endDate) < new Date();
}

export function getTrialFeatures(planId: string): string[] {
  // This would typically come from your pricing data
  const trialFeatures: Record<string, string[]> = {
    starter: [
      'Up to 5 team members',
      '10 active projects',
      'Basic AI context gathering',
      'Pre-built templates',
      'Email support',
    ],
    professional: [
      'Up to 20 team members',
      'Unlimited projects',
      'Advanced AI features',
      'Custom templates',
      'Priority support',
      'Analytics dashboard',
    ],
    enterprise: [
      'Unlimited team members',
      'Unlimited projects',
      'Premium AI capabilities',
      'Enterprise templates',
      'Dedicated support',
      'Advanced security features',
    ],
  };

  return trialFeatures[planId] || [];
}

export function formatTrialDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
