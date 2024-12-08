export interface TrialStatus {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  planId: string | null;
  daysRemaining: number | null;
}

export interface TrialPlan {
  id: string;
  name: string;
  trialDuration: number;
  featuresIncluded: string[];
  restrictions?: {
    maxProjects?: number;
    maxUsers?: number;
    maxStorage?: number;
  };
}

export interface TrialConversion {
  trialId: string;
  userId: string;
  selectedPlan: string;
  conversionDate: string;
  trialFeedback?: {
    rating: number;
    feedback: string;
  };
}
