/**
 * Redux slice for webhook subscription management, delivery history,
 * and template browsing. Follows the same patterns as rest-api-slice.ts.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  WebhookConfig,
  WebhookDelivery,
  WebhookState,
  WebhookStatus,
} from '@/types/webhook';

const initialState: WebhookState = {
  webhooks: [],
  deliveries: [],
  templates: [],
  isLoading: false,
  error: null,
};

// ---------------------------------------------------------------------------
// Async Thunks
// ---------------------------------------------------------------------------

export const fetchWebhooks = createAsyncThunk(
  'webhooks/fetchWebhooks',
  async () => {
    const response = await fetch('/api/v1/webhooks');
    if (!response.ok) throw new Error('Failed to fetch webhooks');
    const body = await response.json() as { data: WebhookConfig[] };
    return body.data;
  }
);

export const createWebhook = createAsyncThunk(
  'webhooks/createWebhook',
  async (payload: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    customHeaders?: Record<string, string>;
    payloadFields?: string[];
  }) => {
    const response = await fetch('/api/v1/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create webhook');
    return response.json() as Promise<{ secret: string; data: WebhookConfig }>;
  }
);

export const updateWebhook = createAsyncThunk(
  'webhooks/updateWebhook',
  async ({ id, ...updates }: { id: string } & Partial<{
    name: string;
    url: string;
    events: string[];
    status: WebhookStatus;
    customHeaders: Record<string, string>;
    payloadFields: string[];
  }>) => {
    const response = await fetch(`/api/v1/webhooks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update webhook');
    const body = await response.json() as { data: WebhookConfig };
    return body.data;
  }
);

export const deleteWebhook = createAsyncThunk(
  'webhooks/deleteWebhook',
  async (id: string) => {
    const response = await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete webhook');
    return id;
  }
);

export const testWebhook = createAsyncThunk(
  'webhooks/testWebhook',
  async (id: string) => {
    const response = await fetch(`/api/v1/webhooks/${id}/test`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to send test delivery');
    const body = await response.json() as { data: WebhookDelivery };
    return body.data;
  }
);

export const fetchDeliveries = createAsyncThunk(
  'webhooks/fetchDeliveries',
  async (webhookId: string) => {
    const response = await fetch(`/api/v1/webhooks/${webhookId}/deliveries`);
    if (!response.ok) throw new Error('Failed to fetch deliveries');
    const body = await response.json() as { data: WebhookDelivery[] };
    return body.data;
  }
);

export const retryDelivery = createAsyncThunk(
  'webhooks/retryDelivery',
  async ({ webhookId, deliveryId }: { webhookId: string; deliveryId: string }) => {
    const response = await fetch(
      `/api/v1/webhooks/${webhookId}/deliveries/${deliveryId}/retry`,
      { method: 'POST' },
    );
    if (!response.ok) throw new Error('Failed to retry delivery');
    const body = await response.json() as { data: WebhookDelivery };
    return body.data;
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const webhookSlice = createSlice({
  name: 'webhooks',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setWebhookStatus(
      state,
      action: PayloadAction<{ id: string; status: WebhookStatus }>,
    ) {
      const webhook = state.webhooks.find((w) => w.id === action.payload.id);
      if (webhook) {
        webhook.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWebhooks
      .addCase(fetchWebhooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWebhooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.webhooks = action.payload;
      })
      .addCase(fetchWebhooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch webhooks';
      })

      // createWebhook
      .addCase(createWebhook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWebhook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.webhooks.unshift(action.payload.data);
      })
      .addCase(createWebhook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create webhook';
      })

      // updateWebhook
      .addCase(updateWebhook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWebhook.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.webhooks.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.webhooks[index] = action.payload;
        }
      })
      .addCase(updateWebhook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update webhook';
      })

      // deleteWebhook
      .addCase(deleteWebhook.fulfilled, (state, action) => {
        state.webhooks = state.webhooks.filter((w) => w.id !== action.payload);
      })
      .addCase(deleteWebhook.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete webhook';
      })

      // testWebhook
      .addCase(testWebhook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(testWebhook.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveries.unshift(action.payload);
      })
      .addCase(testWebhook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to send test delivery';
      })

      // fetchDeliveries
      .addCase(fetchDeliveries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveries = action.payload;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch deliveries';
      })

      // retryDelivery
      .addCase(retryDelivery.fulfilled, (state, action) => {
        state.deliveries.unshift(action.payload);
      })
      .addCase(retryDelivery.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to retry delivery';
      });
  },
});

export const { clearError, setWebhookStatus } = webhookSlice.actions;
export default webhookSlice.reducer;
