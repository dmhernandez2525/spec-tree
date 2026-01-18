import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import subscriptionReducer, {
  setSubscription,
  clearSubscription,
  updateSeats,
  fetchSubscription,
  fetchSubscriptionData,
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

  const _emptyInitialState = {
    subscription: null,
    isLoading: false,
    error: null,
    billingHistory: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with mock subscription', () => {
      expect(initialState.subscription).toEqual(mockSubscription);
    });

    it('starts with loading false', () => {
      expect(initialState.isLoading).toBe(false);
    });

    it('starts with null error', () => {
      expect(initialState.error).toBeNull();
    });

    it('starts with billing history', () => {
      expect(initialState.billingHistory).toHaveLength(1);
    });

    it('returns initial state for unknown action', () => {
      const newState = subscriptionReducer(undefined, { type: 'UNKNOWN_ACTION' });
      expect(newState.subscription).toBeDefined();
      expect(newState.billingHistory).toBeDefined();
    });
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

    it('replaces existing subscription completely', () => {
      const newSubscription: OrganizationSubscription = {
        id: 'sub_replacement',
        organizationId: 'org_new',
        plan: 'enterprise',
        seats: 100,
        usedSeats: 10,
        pricePerSeat: 5,
        billingCycle: 'yearly',
        status: 'active',
        currentPeriodEnd: '2025-12-31T00:00:00Z',
      };
      const newState = subscriptionReducer(initialState, setSubscription(newSubscription));

      expect(newState.subscription?.id).toBe('sub_replacement');
      expect(newState.subscription?.seats).toBe(100);
    });

    it('preserves billing history when setting subscription', () => {
      const newSubscription: OrganizationSubscription = {
        ...mockSubscription,
        id: 'sub_new',
      };
      const newState = subscriptionReducer(initialState, setSubscription(newSubscription));

      expect(newState.billingHistory).toHaveLength(1);
    });

    it('preserves loading state when setting subscription', () => {
      const loadingState = { ...initialState, isLoading: true };
      const newState = subscriptionReducer(loadingState, setSubscription(mockSubscription));

      expect(newState.isLoading).toBe(true);
    });
  });

  describe('clearSubscription', () => {
    it('clears subscription to null', () => {
      const newState = subscriptionReducer(initialState, clearSubscription());

      expect(newState.subscription).toBeNull();
    });

    it('preserves billing history', () => {
      const newState = subscriptionReducer(initialState, clearSubscription());

      expect(newState.subscription).toBeNull();
      expect(newState.billingHistory).toHaveLength(1);
    });

    it('preserves error state', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const newState = subscriptionReducer(stateWithError, clearSubscription());

      expect(newState.subscription).toBeNull();
      expect(newState.error).toBe('Some error');
    });

    it('preserves loading state', () => {
      const loadingState = { ...initialState, isLoading: true };
      const newState = subscriptionReducer(loadingState, clearSubscription());

      expect(newState.subscription).toBeNull();
      expect(newState.isLoading).toBe(true);
    });

    it('does nothing when already null', () => {
      const nullSubState = { ...initialState, subscription: null };
      const newState = subscriptionReducer(nullSubState, clearSubscription());

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

    it('preserves other subscription properties', () => {
      const newState = subscriptionReducer(initialState, updateSeats(50));

      expect(newState.subscription?.seats).toBe(50);
      expect(newState.subscription?.plan).toBe('pro');
      expect(newState.subscription?.usedSeats).toBe(8);
      expect(newState.subscription?.pricePerSeat).toBe(10);
    });

    it('handles edge case seat values', () => {
      const stateWithSub = {
        ...initialState,
        subscription: { ...mockSubscription, seats: 5, usedSeats: 5 },
      };
      const newState = subscriptionReducer(stateWithSub, updateSeats(10));

      expect(newState.subscription?.seats).toBe(10);
    });

    it('can set seats to 0', () => {
      const newState = subscriptionReducer(initialState, updateSeats(0));

      expect(newState.subscription?.seats).toBe(0);
    });

    it('can set seats to large number', () => {
      const newState = subscriptionReducer(initialState, updateSeats(10000));

      expect(newState.subscription?.seats).toBe(10000);
    });
  });

  describe('fetchSubscription async thunk', () => {
    it('sets loading state on pending', () => {
      const action = { type: fetchSubscription.pending.type };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('clears error on pending', () => {
      const stateWithError = { ...initialState, error: 'Previous error' };
      const action = { type: fetchSubscription.pending.type };
      const newState = subscriptionReducer(stateWithError, action);

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

    it('preserves billing history on fetch', () => {
      const newSubscription: OrganizationSubscription = {
        ...mockSubscription,
        id: 'sub_new',
      };
      const action = {
        type: fetchSubscription.fulfilled.type,
        payload: newSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.billingHistory).toHaveLength(1);
    });

    describe('async thunk execution', () => {
      it('returns mock subscription after delay', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(fetchSubscription('org-123'));

        // Fast-forward timers
        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/fetchSubscription/fulfilled');
        expect(result.payload).toHaveProperty('id', 'sub_123');
      });

      it('sets loading state during fetch', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        store.dispatch(fetchSubscription('org-123'));

        expect(store.getState().subscription.isLoading).toBe(true);

        vi.advanceTimersByTime(1000);

        // Wait for state to update
        await vi.waitFor(() => {
          expect(store.getState().subscription.isLoading).toBe(false);
        });
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const action = { type: updateSubscription.pending.type };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription).toEqual(mockSubscription);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const action = {
        type: updateSubscription.rejected.type,
        error: { message: 'Update failed' },
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription).toEqual(mockSubscription);
    });

    describe('async thunk execution', () => {
      it('returns updated subscription after delay', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(updateSubscription({ seats: 20 }));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/updateSubscription/fulfilled');
        expect(result.payload).toHaveProperty('seats', 20);
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const action = { type: changePlan.pending.type };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.plan).toBe('pro');
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const action = {
        type: changePlan.rejected.type,
        error: { message: 'Plan change failed' },
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.plan).toBe('pro');
    });

    describe('async thunk execution', () => {
      it('returns changed plan after delay', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(changePlan({ planId: 'enterprise', seats: 100 }));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/changePlan/fulfilled');
        expect(result.payload).toHaveProperty('plan', 'enterprise');
        expect(result.payload).toHaveProperty('seats', 100);
      });

      it('sets new period end date', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(changePlan({ planId: 'enterprise', seats: 50 }));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.payload).toHaveProperty('currentPeriodEnd');
        expect(new Date(result.payload.currentPeriodEnd).getTime()).toBeGreaterThan(Date.now());
      });
    });
  });

  describe('fetchSubscriptionData async thunk', () => {
    it('does not modify state on pending (no handler defined)', () => {
      const action = { type: fetchSubscriptionData.pending.type };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription).toEqual(mockSubscription);
    });

    it('does not modify state on fulfilled (no handler defined)', () => {
      const mockData = {
        id: 'sub_new',
        organizationId: 'org_456',
        plan: 'enterprise',
        seats: 100,
        usedSeats: 50,
        pricePerSeat: 8,
        billingCycle: 'yearly',
        status: 'active',
        currentPeriodEnd: '2025-01-01T00:00:00Z',
      };
      const action = {
        type: fetchSubscriptionData.fulfilled.type,
        payload: mockData,
      };
      const newState = subscriptionReducer(initialState, action);

      // No handler defined for fetchSubscriptionData, so state unchanged
      expect(newState.subscription).toEqual(mockSubscription);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const action = {
        type: fetchSubscriptionData.rejected.type,
        error: { message: 'Fetch data failed' },
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription).toEqual(mockSubscription);
    });

    describe('async thunk execution', () => {
      it('returns pro scenario data by default', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(fetchSubscriptionData('pro'));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/fetchData/fulfilled');
        expect(result.payload).toHaveProperty('plan', 'pro');
      });

      it('returns newSignup scenario data', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(fetchSubscriptionData('new'));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/fetchData/fulfilled');
        expect(result.payload).toHaveProperty('plan', 'free');
      });

      it('returns nearingLimit scenario data', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(fetchSubscriptionData('nearingLimit'));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/fetchData/fulfilled');
        expect(result.payload).toHaveProperty('usedSeats', 9);
      });

      it('returns recentlyUpgraded scenario data', async () => {
        const store = configureStore({
          reducer: { subscription: subscriptionReducer },
        });

        const promise = store.dispatch(fetchSubscriptionData('recentlyUpgraded'));

        vi.advanceTimersByTime(1000);

        const result = await promise;

        expect(result.type).toBe('subscription/fetchData/fulfilled');
        expect(result.payload).toHaveProperty('plan', 'enterprise');
      });
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

  describe('selectors with different states', () => {
    it('selectSubscription returns null when cleared', () => {
      const clearedState = {
        subscription: {
          ...initialState,
          subscription: null,
        },
      } as any;
      const result = selectSubscription(clearedState);
      expect(result).toBeNull();
    });

    it('selectIsLoading returns true during fetch', () => {
      const loadingState = {
        subscription: {
          ...initialState,
          isLoading: true,
        },
      } as any;
      const result = selectIsLoading(loadingState);
      expect(result).toBe(true);
    });

    it('selectError returns error message when present', () => {
      const errorState = {
        subscription: {
          ...initialState,
          error: 'Something went wrong',
        },
      } as any;
      const result = selectError(errorState);
      expect(result).toBe('Something went wrong');
    });

    it('selectBillingHistory returns empty array when no history', () => {
      const noHistoryState = {
        subscription: {
          ...initialState,
          billingHistory: [],
        },
      } as any;
      const result = selectBillingHistory(noHistoryState);
      expect(result).toEqual([]);
    });

    it('selectBillingHistory returns multiple items', () => {
      const multiHistoryState = {
        subscription: {
          ...initialState,
          billingHistory: [
            { id: 'inv_1', date: '2024-01-15', amount: 49.99, status: 'paid' as const, description: 'Invoice 1' },
            { id: 'inv_2', date: '2024-02-15', amount: 49.99, status: 'paid' as const, description: 'Invoice 2' },
            { id: 'inv_3', date: '2024-03-15', amount: 99.99, status: 'pending' as const, description: 'Invoice 3' },
          ],
        },
      } as any;
      const result = selectBillingHistory(multiHistoryState);
      expect(result).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('handles subscription with different billing cycles', () => {
      const yearlySubscription: OrganizationSubscription = {
        ...mockSubscription,
        billingCycle: 'yearly',
        pricePerSeat: 8,
      };
      const action = {
        type: fetchSubscription.fulfilled.type,
        payload: yearlySubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.billingCycle).toBe('yearly');
    });

    it('handles subscription status changes', () => {
      const pastDueSubscription: OrganizationSubscription = {
        ...mockSubscription,
        status: 'past_due',
      };
      const action = {
        type: updateSubscription.fulfilled.type,
        payload: pastDueSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.status).toBe('past_due');
    });

    it('handles all plan types', () => {
      const plans = ['free', 'pro', 'enterprise'] as const;

      plans.forEach((plan) => {
        const planSubscription: OrganizationSubscription = {
          ...mockSubscription,
          plan,
          pricePerSeat: plan === 'free' ? 0 : plan === 'pro' ? 10 : 8,
        };
        const action = {
          type: changePlan.fulfilled.type,
          payload: planSubscription,
        };
        const newState = subscriptionReducer(initialState, action);

        expect(newState.subscription?.plan).toBe(plan);
      });
    });

    it('handles all status types', () => {
      const statuses = ['active', 'canceled', 'past_due'] as const;

      statuses.forEach((status) => {
        const statusSubscription: OrganizationSubscription = {
          ...mockSubscription,
          status,
        };
        const action = {
          type: updateSubscription.fulfilled.type,
          payload: statusSubscription,
        };
        const newState = subscriptionReducer(initialState, action);

        expect(newState.subscription?.status).toBe(status);
      });
    });

    it('handles free plan with zero price', () => {
      const freePlan: OrganizationSubscription = {
        ...mockSubscription,
        plan: 'free',
        pricePerSeat: 0,
      };
      const action = {
        type: changePlan.fulfilled.type,
        payload: freePlan,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.plan).toBe('free');
      expect(newState.subscription?.pricePerSeat).toBe(0);
    });

    it('handles subscription at seat limit', () => {
      const atLimitSubscription: OrganizationSubscription = {
        ...mockSubscription,
        seats: 10,
        usedSeats: 10,
      };
      const action = {
        type: setSubscription.type,
        payload: atLimitSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.seats).toBe(newState.subscription?.usedSeats);
    });

    it('handles subscription over seat limit', () => {
      const overLimitSubscription: OrganizationSubscription = {
        ...mockSubscription,
        seats: 5,
        usedSeats: 8,
      };
      const action = {
        type: setSubscription.type,
        payload: overLimitSubscription,
      };
      const newState = subscriptionReducer(initialState, action);

      expect(newState.subscription?.usedSeats).toBeGreaterThan(newState.subscription?.seats as number);
    });

    it('handles billing history with different statuses', () => {
      const stateWithHistory = {
        ...initialState,
        billingHistory: [
          { id: 'inv_1', date: '2024-01-15', amount: 49.99, status: 'paid' as const, description: 'Paid invoice' },
          { id: 'inv_2', date: '2024-02-15', amount: 49.99, status: 'pending' as const, description: 'Pending invoice' },
          { id: 'inv_3', date: '2024-03-15', amount: 49.99, status: 'failed' as const, description: 'Failed invoice' },
        ],
      };

      const result = selectBillingHistory({ subscription: stateWithHistory } as any);
      expect(result).toHaveLength(3);
      expect(result.find(i => i.status === 'paid')).toBeDefined();
      expect(result.find(i => i.status === 'pending')).toBeDefined();
      expect(result.find(i => i.status === 'failed')).toBeDefined();
    });

    it('handles billing history with optional invoiceUrl', () => {
      const stateWithHistory = {
        ...initialState,
        billingHistory: [
          { id: 'inv_1', date: '2024-01-15', amount: 49.99, status: 'paid' as const, description: 'With URL', invoiceUrl: 'https://example.com/inv/1' },
          { id: 'inv_2', date: '2024-02-15', amount: 49.99, status: 'pending' as const, description: 'Without URL' },
        ],
      };

      const result = selectBillingHistory({ subscription: stateWithHistory } as any);
      expect(result[0].invoiceUrl).toBe('https://example.com/inv/1');
      expect(result[1].invoiceUrl).toBeUndefined();
    });
  });

  describe('state immutability', () => {
    it('does not mutate the original state on setSubscription', () => {
      const originalState = { ...initialState };
      const originalSubscription = { ...originalState.subscription };
      subscriptionReducer(originalState, setSubscription({
        ...mockSubscription,
        id: 'new_sub',
      }));
      expect(originalState.subscription).toEqual(originalSubscription);
    });

    it('does not mutate the original state on clearSubscription', () => {
      const originalState = { ...initialState };
      subscriptionReducer(originalState, clearSubscription());
      expect(originalState.subscription).toEqual(mockSubscription);
    });

    it('does not mutate the original state on updateSeats', () => {
      const originalState = { ...initialState };
      const originalSeats = originalState.subscription?.seats;
      subscriptionReducer(originalState, updateSeats(100));
      expect(originalState.subscription?.seats).toBe(originalSeats);
    });

    it('does not mutate the original billing history', () => {
      const originalState = {
        ...initialState,
        billingHistory: [
          { id: 'inv_1', date: '2024-01-15', amount: 49.99, status: 'paid' as const, description: 'Test' },
        ],
      };
      const originalHistory = [...originalState.billingHistory];
      subscriptionReducer(originalState, clearSubscription());
      expect(originalState.billingHistory).toEqual(originalHistory);
    });
  });

  describe('complex scenarios', () => {
    it('handles subscription upgrade flow', () => {
      let state = initialState;

      // Start with free plan
      state = subscriptionReducer(state, setSubscription({
        ...mockSubscription,
        plan: 'free',
        seats: 3,
        usedSeats: 3,
        pricePerSeat: 0,
      }));
      expect(state.subscription?.plan).toBe('free');

      // Upgrade to pro
      state = subscriptionReducer(state, {
        type: changePlan.fulfilled.type,
        payload: {
          ...mockSubscription,
          plan: 'pro',
          seats: 10,
          usedSeats: 3,
          pricePerSeat: 10,
        },
      });
      expect(state.subscription?.plan).toBe('pro');
      expect(state.subscription?.seats).toBe(10);

      // Upgrade to enterprise
      state = subscriptionReducer(state, {
        type: changePlan.fulfilled.type,
        payload: {
          ...mockSubscription,
          plan: 'enterprise',
          seats: 50,
          usedSeats: 3,
          pricePerSeat: 8,
        },
      });
      expect(state.subscription?.plan).toBe('enterprise');
      expect(state.subscription?.seats).toBe(50);
    });

    it('handles seat adjustment flow', () => {
      let state = initialState;

      // Add seats
      state = subscriptionReducer(state, updateSeats(20));
      expect(state.subscription?.seats).toBe(20);

      // Add more seats
      state = subscriptionReducer(state, updateSeats(30));
      expect(state.subscription?.seats).toBe(30);

      // Reduce seats
      state = subscriptionReducer(state, updateSeats(15));
      expect(state.subscription?.seats).toBe(15);
    });

    it('handles error recovery flow', () => {
      let state = initialState;

      // Fetch fails
      state = subscriptionReducer(state, { type: fetchSubscription.pending.type });
      expect(state.isLoading).toBe(true);

      state = subscriptionReducer(state, {
        type: fetchSubscription.rejected.type,
        error: { message: 'Network error' },
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network error');

      // Retry and succeed
      state = subscriptionReducer(state, { type: fetchSubscription.pending.type });
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();

      state = subscriptionReducer(state, {
        type: fetchSubscription.fulfilled.type,
        payload: mockSubscription,
      });
      expect(state.isLoading).toBe(false);
      expect(state.subscription).toEqual(mockSubscription);
    });

    it('handles subscription cancellation flow', () => {
      let state = initialState;

      // Cancel subscription
      state = subscriptionReducer(state, {
        type: updateSubscription.fulfilled.type,
        payload: {
          ...mockSubscription,
          status: 'canceled',
        },
      });
      expect(state.subscription?.status).toBe('canceled');

      // Clear subscription
      state = subscriptionReducer(state, clearSubscription());
      expect(state.subscription).toBeNull();

      // Resubscribe
      state = subscriptionReducer(state, setSubscription({
        ...mockSubscription,
        id: 'sub_new',
        status: 'active',
      }));
      expect(state.subscription?.status).toBe('active');
    });
  });

  describe('integration with configureStore', () => {
    it('works with a real store', async () => {
      const store = configureStore({
        reducer: { subscription: subscriptionReducer },
      });

      // Set subscription
      store.dispatch(setSubscription(mockSubscription));
      expect(store.getState().subscription.subscription).toEqual(mockSubscription);

      // Update seats
      store.dispatch(updateSeats(25));
      expect(store.getState().subscription.subscription?.seats).toBe(25);

      // Clear subscription
      store.dispatch(clearSubscription());
      expect(store.getState().subscription.subscription).toBeNull();
    });

    it('selectors work with store state', () => {
      const store = configureStore({
        reducer: { subscription: subscriptionReducer },
      });

      expect(selectSubscription(store.getState())).toBeDefined();
      expect(selectBillingHistory(store.getState())).toBeDefined();
      expect(selectIsLoading(store.getState())).toBe(false);
      expect(selectError(store.getState())).toBeNull();
    });
  });
});
