// File: Client/lib/mocks/subscription-mocks.ts

import { OrganizationSubscription } from '@/types/organization';

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl?: string;
}

export const mockSubscriptions: Record<string, OrganizationSubscription> = {
  freeTier: {
    id: 'sub_free_123',
    organizationId: 'org_123',
    plan: 'free',
    seats: 5,
    usedSeats: 3,
    pricePerSeat: 0,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-04-15T00:00:00Z',
  },
  proPlan: {
    id: 'sub_pro_123',
    organizationId: 'org_123',
    plan: 'pro',
    seats: 20,
    usedSeats: 18,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-04-15T00:00:00Z',
  },
  enterprise: {
    id: 'sub_ent_123',
    organizationId: 'org_123',
    plan: 'enterprise',
    seats: 100,
    usedSeats: 75,
    pricePerSeat: 8,
    billingCycle: 'yearly',
    status: 'active',
    currentPeriodEnd: '2025-03-15T00:00:00Z',
  },
  pastDue: {
    id: 'sub_past_123',
    organizationId: 'org_123',
    plan: 'pro',
    seats: 15,
    usedSeats: 12,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'past_due',
    currentPeriodEnd: '2024-03-20T00:00:00Z',
  },
  canceled: {
    id: 'sub_canceled_123',
    organizationId: 'org_123',
    plan: 'pro',
    seats: 10,
    usedSeats: 8,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'canceled',
    currentPeriodEnd: '2024-03-15T00:00:00Z',
  },
  trial: {
    id: 'sub_trial_123',
    organizationId: 'org_123',
    plan: 'pro',
    seats: 5,
    usedSeats: 2,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-03-30T00:00:00Z',
  },
};

export const mockBillingHistory: Record<string, BillingHistoryItem[]> = {
  regular: [
    {
      id: 'inv_123',
      date: '2024-03-15',
      amount: 200.0,
      status: 'paid',
      description: 'Professional Plan - 20 seats',
      invoiceUrl: '#',
    },
    {
      id: 'inv_122',
      date: '2024-02-15',
      amount: 200.0,
      status: 'paid',
      description: 'Professional Plan - 20 seats',
      invoiceUrl: '#',
    },
    {
      id: 'inv_121',
      date: '2024-01-15',
      amount: 150.0,
      status: 'paid',
      description: 'Professional Plan - 15 seats',
      invoiceUrl: '#',
    },
  ],
  pastDue: [
    {
      id: 'inv_124',
      date: '2024-03-15',
      amount: 150.0,
      status: 'failed',
      description: 'Professional Plan - 15 seats',
      invoiceUrl: '#',
    },
    {
      id: 'inv_123',
      date: '2024-02-15',
      amount: 150.0,
      status: 'paid',
      description: 'Professional Plan - 15 seats',
      invoiceUrl: '#',
    },
  ],
  enterprise: [
    {
      id: 'inv_e123',
      date: '2024-03-15',
      amount: 9600.0,
      status: 'paid',
      description: 'Enterprise Plan - Annual (100 seats)',
      invoiceUrl: '#',
    },
    {
      id: 'inv_e122',
      date: '2023-03-15',
      amount: 7200.0,
      status: 'paid',
      description: 'Enterprise Plan - Annual (75 seats)',
      invoiceUrl: '#',
    },
  ],
  upgradeHistory: [
    {
      id: 'inv_up123',
      date: '2024-03-15',
      amount: 200.0,
      status: 'paid',
      description: 'Professional Plan - 20 seats',
      invoiceUrl: '#',
    },
    {
      id: 'inv_up122',
      date: '2024-02-15',
      amount: 29.99,
      status: 'paid',
      description: 'Starter Plan - 5 seats',
      invoiceUrl: '#',
    },
  ],
  trial: [
    {
      id: 'inv_trial',
      date: '2024-03-15',
      amount: 0,
      status: 'paid',
      description: 'Professional Plan Trial - 5 seats',
      invoiceUrl: '#',
    },
  ],
};

export const mockUsageData = {
  seatUsageHistory: [
    { date: '2024-01', seats: 8, allocated: 10 },
    { date: '2024-02', seats: 12, allocated: 15 },
    { date: '2024-03', seats: 18, allocated: 20 },
  ],
  featureUsage: {
    aiContextGeneration: 245,
    projectsCreated: 12,
    documentsProcessed: 156,
    integrationsCalled: 89,
  },
  costBreakdown: {
    baseSubscription: 100,
    additionalSeats: 50,
    overages: 0,
    total: 150,
  },
};

export const generateMockSubscriptionData = (
  type: 'free' | 'pro' | 'enterprise' | 'past_due' | 'canceled' | 'trial'
) => {
  const subscription =
    mockSubscriptions[
      type === 'free'
        ? 'freeTier'
        : type === 'pro'
        ? 'proPlan'
        : type === 'enterprise'
        ? 'enterprise'
        : type === 'past_due'
        ? 'pastDue'
        : type === 'canceled'
        ? 'canceled'
        : 'trial'
    ];

  const billingHistory =
    mockBillingHistory[
      type === 'past_due'
        ? 'pastDue'
        : type === 'enterprise'
        ? 'enterprise'
        : type === 'trial'
        ? 'trial'
        : 'regular'
    ];

  return {
    subscription,
    billingHistory,
    usageData: mockUsageData,
  };
};

export const mockSubscriptionScenarios = {
  newSignup: {
    subscription: null,
    billingHistory: [],
    usageData: {
      seatUsageHistory: [],
      featureUsage: {
        aiContextGeneration: 0,
        projectsCreated: 0,
        documentsProcessed: 0,
        integrationsCalled: 0,
      },
      costBreakdown: {
        baseSubscription: 0,
        additionalSeats: 0,
        overages: 0,
        total: 0,
      },
    },
  },
  nearingLimit: {
    subscription: {
      ...mockSubscriptions.proPlan,
      usedSeats: 19,
      seats: 20,
    },
    billingHistory: mockBillingHistory.regular,
    usageData: {
      ...mockUsageData,
      seatUsageHistory: [
        { date: '2024-01', seats: 15, allocated: 20 },
        { date: '2024-02', seats: 17, allocated: 20 },
        { date: '2024-03', seats: 19, allocated: 20 },
      ],
    },
  },
  recentlyUpgraded: {
    subscription: mockSubscriptions.proPlan,
    billingHistory: mockBillingHistory.upgradeHistory,
    usageData: {
      ...mockUsageData,
      seatUsageHistory: [
        { date: '2024-01', seats: 4, allocated: 5 },
        { date: '2024-02', seats: 5, allocated: 5 },
        { date: '2024-03', seats: 18, allocated: 20 },
      ],
    },
  },
};
