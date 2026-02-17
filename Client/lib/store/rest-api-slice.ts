/**
 * Redux slice for REST API key management and usage analytics.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { PublicApiKey, ApiUsageStats, RestApiState } from '@/types/rest-api';

const initialState: RestApiState = {
  keys: [],
  usage: null,
  usageHistory: [],
  isLoading: false,
  error: null,
};

export const fetchApiKeys = createAsyncThunk(
  'restApi/fetchApiKeys',
  async () => {
    const response = await fetch('/api/v1/keys');
    if (!response.ok) throw new Error('Failed to fetch API keys');
    const body = await response.json() as { data: PublicApiKey[] };
    return body.data;
  }
);

export const createApiKey = createAsyncThunk(
  'restApi/createApiKey',
  async (payload: { name: string; tier?: string; corsOrigins?: string[] }) => {
    const response = await fetch('/api/v1/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create API key');
    return response.json() as Promise<{ key: string; data: PublicApiKey }>;
  }
);

export const revokeApiKey = createAsyncThunk(
  'restApi/revokeApiKey',
  async (keyId: string) => {
    const response = await fetch(`/api/v1/keys/${keyId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to revoke API key');
    return keyId;
  }
);

const restApiSlice = createSlice({
  name: 'restApi',
  initialState,
  reducers: {
    setUsageStats(state, action: PayloadAction<ApiUsageStats>) {
      state.usage = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.keys = action.payload;
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch API keys';
      })
      .addCase(createApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.keys.unshift(action.payload.data);
      })
      .addCase(createApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create API key';
      })
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        state.keys = state.keys.filter((k) => k.id !== action.payload);
      })
      .addCase(revokeApiKey.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to revoke API key';
      });
  },
});

export const { setUsageStats, clearError } = restApiSlice.actions;
export default restApiSlice.reducer;
