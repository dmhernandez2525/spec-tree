export interface Organization {
  id: string;
  name: string;
  size: OrganizationSize;
  industry: Industry;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  description?: string;
  websiteUrl?: string;
}

export type OrganizationSize =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001+';

export type Industry =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'education'
  | 'manufacturing'
  | 'retail'
  | 'other';

export type OrganizationRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'member'
  | 'viewer';

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  joinedAt: string;
}

export interface OrganizationInvite {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  status: 'pending' | 'accepted' | 'expired';
  invitedById: string;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  plan: 'free' | 'pro' | 'enterprise';
  seats: number;
  usedSeats: number;
  pricePerSeat: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

export interface OrganizationState {
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  subscription: OrganizationSubscription | null;
  isLoading: boolean;
  error: string | null;
}
