import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './index';

export interface AISettings {
  useOwnKeys?: boolean;
  defaultProvider?: string;
  defaultModel?: string;
  apiKeys?: Record<string, string>;
  settings?: {
    temperature?: number;
    maxTokens?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}

export interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'pending';
  configuration?: Record<string, string>;
  connectedAt?: string;
}

export interface SSOConfig {
  provider?: 'azure' | 'google' | 'okta' | 'custom';
  enabled?: boolean;
  enforceSSO?: boolean;
  allowEmailLogin?: boolean;
  config?: {
    entityId?: string;
    ssoUrl?: string;
    certificateData?: string;
  };
  domainRestrictions?: string[];
}

interface SettingsState {
  aiSettings: AISettings | null;
  integrations: Integration[];
  ssoConfig: SSOConfig | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  aiSettings: null,
  integrations: [],
  ssoConfig: null,
  isLoading: false,
  error: null,
};

export const fetchAISettings = createAsyncThunk(
  'settings/fetchAISettings',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch(`/api/organizations/${organizationId}/settings/ai`);
    if (!response.ok) {
      throw new Error('Failed to fetch AI settings');
    }
    return response.json();
  }
);

export const updateAISettings = createAsyncThunk(
  'settings/updateAISettings',
  async (data: Partial<AISettings>, { getState }) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch(`/api/organizations/${organizationId}/settings/ai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update AI settings');
    }

    return response.json();
  }
);

export const connectIntegration = createAsyncThunk(
  'settings/connectIntegration',
  async (
    { integrationId, configuration }: { integrationId: string; configuration?: Record<string, string> },
    { getState }
  ) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch(
      `/api/organizations/${organizationId}/integrations/${integrationId}/connect`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to connect integration');
    }

    return response.json();
  }
);

export const disconnectIntegration = createAsyncThunk(
  'settings/disconnectIntegration',
  async (integrationId: string, { getState }) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch(
      `/api/organizations/${organizationId}/integrations/${integrationId}/disconnect`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to disconnect integration');
    }

    return integrationId;
  }
);

export const updateSSOConfig = createAsyncThunk(
  'settings/updateSSOConfig',
  async (data: Partial<SSOConfig>, { getState }) => {
    const state = getState() as RootState;
    const organizationId = state.organization.currentOrganization?.id;

    if (!organizationId) {
      throw new Error('No organization selected');
    }

    const response = await fetch(`/api/organizations/${organizationId}/settings/sso`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update SSO configuration');
    }

    return response.json();
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAISettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAISettings.fulfilled, (state, action) => {
        state.aiSettings = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAISettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch AI settings';
      })
      .addCase(updateAISettings.fulfilled, (state, action) => {
        state.aiSettings = action.payload;
      })
      .addCase(connectIntegration.fulfilled, (state, action) => {
        const index = state.integrations.findIndex((i) => i.id === action.payload.id);
        if (index >= 0) {
          state.integrations[index] = action.payload;
        } else {
          state.integrations.push(action.payload);
        }
      })
      .addCase(disconnectIntegration.fulfilled, (state, action) => {
        const integration = state.integrations.find((i) => i.id === action.payload);
        if (integration) {
          integration.status = 'disconnected';
          integration.connectedAt = undefined;
        }
      })
      .addCase(updateSSOConfig.fulfilled, (state, action) => {
        state.ssoConfig = action.payload;
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
