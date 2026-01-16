import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import { OrganizationSubscription } from '@/types/organization';
import {
  generateMockSubscriptionData,
  mockSubscriptionScenarios,
} from '@/lib/data/mocks/subscription-mocks';
import { logger } from '@/lib/logger';

// Mock data
const mockSubscription: OrganizationSubscription = {
  id: 'sub_123',
  organizationId: 'org_123',
  plan: 'pro' as 'free' | 'pro' | 'enterprise',
  seats: 10,
  usedSeats: 8,
  pricePerSeat: 10,
  billingCycle: 'monthly',
  status: 'active',
  currentPeriodEnd: '2024-04-15T00:00:00Z',
};

interface SubscriptionState {
  subscription: OrganizationSubscription | null;
  isLoading: boolean;
  error: string | null;
  billingHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    invoiceUrl?: string;
  }[];
}

const initialState: SubscriptionState = {
  subscription: mockSubscription, // Using mock data
  isLoading: false,
  error: null,
  billingHistory: [
    {
      id: 'inv_123',
      date: '2024-03-15',
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: 'inv_122',
      date: '2024-02-15',
      amount: 49.99,
      status: 'paid',
      description: 'Professional Plan - Monthly',
      invoiceUrl: '#',
    },
    {
      id: 'inv_121',
      date: '2024-01-15',
      amount: 29.99,
      status: 'paid',
      description: 'Starter Plan - Monthly',
      invoiceUrl: '#',
    },
  ],
};

export const fetchSubscriptionData = createAsyncThunk(
  'subscription/fetchData',
  async (scenario: string = 'pro') => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    switch (scenario) {
      case 'new':
        return mockSubscriptionScenarios.newSignup;
      case 'nearingLimit':
        return mockSubscriptionScenarios.nearingLimit;
      case 'recentlyUpgraded':
        return mockSubscriptionScenarios.recentlyUpgraded;
      default:
        return generateMockSubscriptionData(scenario as any);
    }
  }
);

// Async thunks
export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (organizationId: string) => {
    // TODO: Remove this logger.log statement when we are are using organizationId
    logger.log({ organizationId });
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return mockSubscription;
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async (data: Partial<OrganizationSubscription>) => {
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      ...mockSubscription,
      ...data,
    };
  }
);

export const changePlan = createAsyncThunk(
  'subscription/changePlan',
  async ({ planId, seats }: { planId: string; seats: number }) => {
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      ...mockSubscription,
      plan: planId as 'free' | 'pro' | 'enterprise',
      seats,
      currentPeriodEnd: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription: (
      state,
      action: PayloadAction<OrganizationSubscription>
    ) => {
      state.subscription = action.payload;
    },
    clearSubscription: (state) => {
      state.subscription = null;
    },
    updateSeats: (state, action: PayloadAction<number>) => {
      if (state.subscription) {
        state.subscription.seats = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch subscription';
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
      })
      .addCase(changePlan.fulfilled, (state, action) => {
        state.subscription = action.payload;
      });
  },
});

// Selectors
export const selectSubscription = (state: RootState) =>
  state.subscription.subscription;
export const selectBillingHistory = (state: RootState) =>
  state.subscription.billingHistory;
export const selectIsLoading = (state: RootState) =>
  state.subscription.isLoading;
export const selectError = (state: RootState) => state.subscription.error;

export const { setSubscription, clearSubscription, updateSeats } =
  subscriptionSlice.actions;

export default subscriptionSlice.reducer;
