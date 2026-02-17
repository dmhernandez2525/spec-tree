import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import webhookReducer, {
  clearError,
  setWebhookStatus,
  fetchWebhooks,
} from './webhook-slice';
import type { WebhookConfig, WebhookState } from '@/types/webhook';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStore(preloadedState?: Partial<WebhookState>) {
  return configureStore({
    reducer: { webhooks: webhookReducer },
    preloadedState: preloadedState
      ? { webhooks: { ...defaultState(), ...preloadedState } }
      : undefined,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

function defaultState(): WebhookState {
  return {
    webhooks: [],
    deliveries: [],
    templates: [],
    isLoading: false,
    error: null,
  };
}

function makeFakeWebhook(overrides: Partial<WebhookConfig> = {}): WebhookConfig {
  return {
    id: 'whk_1',
    name: 'Test Webhook',
    url: 'https://example.com/hook',
    secret: 'whsec_abc123',
    events: ['spec.created'],
    status: 'active',
    customHeaders: {},
    payloadFields: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    failureCount: 0,
    lastDeliveryAt: null,
    lastDeliveryStatus: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('webhook-slice', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  it('has empty arrays and no error in the initial state', () => {
    const store = createStore();
    const state = store.getState().webhooks;

    expect(state.webhooks).toEqual([]);
    expect(state.deliveries).toEqual([]);
    expect(state.templates).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // -----------------------------------------------------------------------
  // Synchronous reducers
  // -----------------------------------------------------------------------

  describe('clearError', () => {
    it('sets error to null', () => {
      const store = createStore({ error: 'Something went wrong' });
      store.dispatch(clearError());

      expect(store.getState().webhooks.error).toBeNull();
    });
  });

  describe('setWebhookStatus', () => {
    it('updates the status of the matching webhook', () => {
      const webhook = makeFakeWebhook({ id: 'whk_42', status: 'active' });
      const store = createStore({ webhooks: [webhook] });

      store.dispatch(setWebhookStatus({ id: 'whk_42', status: 'paused' }));

      expect(store.getState().webhooks.webhooks[0].status).toBe('paused');
    });

    it('does nothing when the webhook ID is not found', () => {
      const webhook = makeFakeWebhook({ id: 'whk_42', status: 'active' });
      const store = createStore({ webhooks: [webhook] });

      store.dispatch(setWebhookStatus({ id: 'whk_999', status: 'disabled' }));

      expect(store.getState().webhooks.webhooks[0].status).toBe('active');
    });
  });

  // -----------------------------------------------------------------------
  // fetchWebhooks async thunk
  // -----------------------------------------------------------------------

  describe('fetchWebhooks', () => {
    it('sets isLoading to true while pending', () => {
      // Provide a fetch that never resolves so we can inspect the pending state
      global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

      const store = createStore();
      store.dispatch(fetchWebhooks());

      expect(store.getState().webhooks.isLoading).toBe(true);
      expect(store.getState().webhooks.error).toBeNull();
    });

    it('sets webhooks and clears loading on fulfillment', async () => {
      const webhooks = [makeFakeWebhook({ id: 'whk_a' }), makeFakeWebhook({ id: 'whk_b' })];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: webhooks }),
      });

      const store = createStore();
      await store.dispatch(fetchWebhooks());

      const state = store.getState().webhooks;
      expect(state.isLoading).toBe(false);
      expect(state.webhooks).toHaveLength(2);
      expect(state.webhooks[0].id).toBe('whk_a');
      expect(state.webhooks[1].id).toBe('whk_b');
    });

    it('sets error on rejection', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });

      const store = createStore();
      await store.dispatch(fetchWebhooks());

      const state = store.getState().webhooks;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to fetch webhooks');
    });
  });
});
