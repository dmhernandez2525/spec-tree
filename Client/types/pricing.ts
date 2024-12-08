export type PlanInterval = 'monthly' | 'annual';

export interface PricingFeature {
  title: string;
  description: string;
  included: boolean | string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  features: PricingFeature[];
  highlight?: boolean;
  button: {
    text: string;
    href: string;
    variant?: 'default' | 'secondary' | 'outline';
  };
  maxProjects?: number;
  maxTeamSize?: number;
  supportLevel?: string;
  customFeatures?: string[];
}

export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  buttonText: string;
  buttonLink: string;
  recommended?: boolean;
}

export interface ComparisonFeature {
  name: string;
  description: string;
  plans: {
    [key: string]: boolean | string;
  };
  category?: string;
}
