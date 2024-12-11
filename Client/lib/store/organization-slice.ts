import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { OrganizationState, OrganizationRole } from '@/types/organization';
import { RootState } from './index';

const initialState: OrganizationState = {
  currentOrganization: null,
  members: [],
  invites: [],
  subscription: null,
  isLoading: false,
  error: null,
};

export const fetchOrganizationData = createAsyncThunk(
  'organization/fetchData',
  async (organizationId: string) => {
    const response = await fetch(`/api/organizations/${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch organization data');
    }
    return response.json();
  }
);

export const sendInvite = createAsyncThunk(
  'organization/sendInvite',
  async (
    {
      email,
      role,
      message,
    }: {
      email: string;
      role: OrganizationRole;
      message?: string;
    },
    { getState }
  ) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch('/api/organizations/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        role,
        message,
        organizationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invite');
    }

    return response.json();
  }
);

export const cancelInvite = createAsyncThunk(
  'organization/cancelInvite',
  async (inviteId: string) => {
    const response = await fetch(`/api/organizations/invites/${inviteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel invite');
    }

    return inviteId;
  }
);

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    updateSubscription: (state, action) => {
      state.subscription = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizationData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrganizationData.fulfilled, (state, action) => {
        state.currentOrganization = action.payload.organization;
        state.members = action.payload.members;
        state.invites = action.payload.invites;
        state.subscription = action.payload.subscription;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchOrganizationData.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message || 'Failed to fetch organization data';
      })
      .addCase(sendInvite.fulfilled, (state, action) => {
        state.invites.push(action.payload);
      })
      .addCase(cancelInvite.fulfilled, (state, action) => {
        state.invites = state.invites.filter(
          (invite) => invite.id !== action.payload
        );
      });
  },
});

export const { setCurrentOrganization, updateSubscription } =
  organizationSlice.actions;
export const organizationReducer = organizationSlice.reducer;
