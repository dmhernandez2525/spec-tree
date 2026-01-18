import { describe, it, expect, vi, beforeEach } from 'vitest';
import subscriptionReducer, {
  setSubscription,
  clearSubscription,
  updateSeats,
  fetchSubscription,
  updateSubscription,
  changePlan,
  selectSubscription,
  selectBillingHistory,
  selectIsLoading,
  selectError,
} from './subscription-slice';
import type { OrganizationSubscription } from '@/types/organization';

// Mock the subscription mocks
vi.mock('@/lib/data/mocks/subscription-mocks', () => ({
  generateMockSubscriptionData: vi.fn((scenario) => ({
    id: `sub_${scenario}`,
    organizationId: 'org_123',
    plan: scenario,
    seats: 10,
    usedSeats: 5,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-04-15T00:00:00Z',
  })),
  mockSubscriptionScenarios: {
    newSignup: {
      id: 'sub_new',
      organizationId: 'org_123',
      plan: 'free',
      seats: 1,
      usedSeats: 1,
      pricePerSeat: 0,
      billingCycle: 'monthly',
      status: 'active',
    },
    nearingLimit: {
      id: 'sub_nearing',
      organizationId: 'org_123',
      plan: 'pro',
      seats: 10,
      usedSeats: 9,
      pricePerSeat: 10,
      billingCycle: 'monthly',
      status: 'active',
    },
    recentlyUpgraded: {
      id: 'sub_upgraded',
      organizationId: 'org_123',
      plan: 'enterprise',
      seats: 50,
      usedSeats: 10,
      pricePerSeat: 8,
      billingCycle: 'monthly',
      status: 'active',
    },
  },
}));

describe('subscription-slice', () => {
  const mockSubscription: OrganizationSubscription = {
    id: 'sub_123',
    organizationId: 'org_123',
    plan: 'pro',
    seats: 10,
    usedSeats: 8,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-04-15T00:00:00Z',
  };

  const initialState = {
    subscription: mockSubscription,
    isLoading: false,
    error: null,
    billingHistory: [
      {
        id: 'inv_123',
        date: '2024-03-15',
        amount: 49.99,
        status: 'paid' as const,
        description: 'Professional Plan - Monthly',
        invoiceUrl: '#',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setSubscription', () => {
    it('sets subscription data', () => {
      const emptyState = { ...initialState, subscription: null };
      const newSubscription: OrganizationSubscription = {
        id: 'sub_new',
        organizationId: 'org_456',
        plan: 'enterprise',
        seats: 50,
        usedSeats: 25,
        pricePerSeat: 8,
        billingCycle: 'yearly',
        status: 'active',
        currentPeriodEnd: '2025-01-01T00:00:00Z',
      };

      const newState = subscriptionReducer(emptyState, setSubscription(newSubscription));

      expect(newState.subscription).toEqual(newSubscription);
    });
  });

  describe('clearSubscription', () => {
    it('clears subscription to null', () => {
      const newState = subscriptionReducer(initialState, clearSubscription());

      expect(newState.subscription).toBeNull();
    });
  });

  describe('updateSeats', () => {
    it('updates seat count', () => {
      const newState = subscriptionReducer(initialState, updateSeats(20));

      expect(newState.subscription?.seats).toBe(20);
    });

    it('does nothing when subscription is null', () => {
      const stateWithNoSubscription = { ...initialState, subscription: null };
      const newState = subscriptionReducer(stateWithNoSubscription, updateSeats(20));

      expect(newState.subscription).toBeNull();
    });
  });

  describe('fetchSubscription async thunk', () => {
    it('sets loading state on pending', () => {
      const action = { type: fetchSubscription.pending.type };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('sets subscription on fulfilled', () => {
      const newSubscription: OrganizationSubscription = {
        ...mockSubscription,
        plan: 'enterprise',
      };
      const action = {
        type: fetchSubscription.fulfilled.type,
        payload: newSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.subscription).toEqual(newSubscription);
    });

    it('sets error on rejected', () => {
      const action = {
        type: fetchSubscription.rejected.type,
        error: { message: 'Failed to fetch' },
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to fetch');
    });

    it('uses default error message when none provided', () => {
      const action = {
        type: fetchSubscription.rejected.type,
        error: {},
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.error).toBe('Failed to fetch subscription');
    });
  });

  describe('updateSubscription async thunk', () => {
    it('updates subscription on fulfilled', () => {
      const updatedSubscription: OrganizationSubscription = {
        ...mockSubscription,
        seats: 15,
      };
      const action = {
        type: updateSubscription.fulfilled.type,
        payload: updatedSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.seats).toBe(15);
    });
  });

  describe('changePlan async thunk', () => {
    it('changes plan on fulfilled', () => {
      const changedSubscription: OrganizationSubscription = {
        ...mockSubscription,
        plan: 'enterprise',
        seats: 50,
      };
      const action = {
        type: changePlan.fulfilled.type,
        payload: changedSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.plan).toBe('enterprise');
      expect(newState.subscription?.seats).toBe(50);
    });
  });

  describe('selectors', () => {
    const mockRootState = {
      subscription: initialState,
    } as any;

    it('selectSubscription returns subscription', () => {
      const result = selectSubscription(mockRootState);
      expect(result).toEqual(mockSubscription);
    });

    it('selectBillingHistory returns billing history', () => {
      const result = selectBillingHistory(mockRootState);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('inv_123');
    });

    it('selectIsLoading returns loading state', () => {
      const result = selectIsLoading(mockRootState);
      expect(result).toBe(false);
    });

    it('selectError returns error', () => {
      const result = selectError(mockRootState);
      expect(result).toBeNull();
    });
  });
});
