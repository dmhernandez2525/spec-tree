import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/test/mocks/server';
import {
  settingsReducer,
  clearSettingsError,
  fetchAISettings,
  updateAISettings,
  connectIntegration,
  disconnectIntegration,
  updateSSOConfig,
} from './settings-slice';
import type { AISettings, Integration, SSOConfig } from './settings-slice';
import { organizationReducer } from './organization-slice';

describe('settings-slice', () => {
  const mockAISettings: AISettings = {
    useOwnKeys: true,
    defaultProvider: 'openai',
    defaultModel: 'gpt-4o',
    apiKeys: { openai: 'sk-test' },
    settings: {
      temperature: 0.7,
      maxTokens: 4000,
    },
  };

  const mockIntegration: Integration = {
    id: 'jira-1',
    name: 'Jira',
    status: 'connected',
    configuration: { apiKey: 'test-key' },
    connectedAt: '2024-01-01T00:00:00Z',
  };

  const mockSSOConfig: SSOConfig = {
    provider: 'azure',
    enabled: true,
    enforceSSO: false,
    allowEmailLogin: true,
    config: {
      entityId: 'entity-123',
      ssoUrl: 'https://sso.example.com',
    },
    domainRestrictions: ['example.com'],
  };

  const mockOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    size: '11-50' as const,
    industry: 'technology' as const,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    ownerId: 'user-owner-1',
  };

  const initialState = {
    aiSettings: null,
    integrations: [],
    ssoConfig: null,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with null AI settings', () => {
      expect(initialState.aiSettings).toBeNull();
    });

    it('starts with empty integrations array', () => {
      expect(initialState.integrations).toEqual([]);
    });

    it('starts with null SSO config', () => {
      expect(initialState.ssoConfig).toBeNull();
    });

    it('starts with loading false', () => {
      expect(initialState.isLoading).toBe(false);
    });

    it('starts with null error', () => {
      expect(initialState.error).toBeNull();
    });

    it('returns initial state for unknown action', () => {
      const newState = settingsReducer(undefined, { type: 'UNKNOWN_ACTION' });
      expect(newState).toEqual(initialState);
    });
  });

  describe('clearSettingsError', () => {
    it('clears error to null', () => {
      const stateWithError = {
        ...initialState,
        error: 'Some error occurred',
      };

      const newState = settingsReducer(stateWithError, clearSettingsError());

      expect(newState.error).toBeNull();
    });

    it('preserves other state when clearing error', () => {
      const stateWithError = {
        ...initialState,
        aiSettings: mockAISettings,
        integrations: [mockIntegration],
        ssoConfig: mockSSOConfig,
        error: 'Some error',
      };

      const newState = settingsReducer(stateWithError, clearSettingsError());

      expect(newState.aiSettings).toEqual(mockAISettings);
      expect(newState.integrations).toEqual([mockIntegration]);
      expect(newState.ssoConfig).toEqual(mockSSOConfig);
      expect(newState.error).toBeNull();
    });

    it('does nothing when error is already null', () => {
      const newState = settingsReducer(initialState, clearSettingsError());

      expect(newState.error).toBeNull();
      expect(newState).toEqual(initialState);
    });
  });

  describe('fetchAISettings async thunk', () => {
    it('sets loading state on pending', () => {
      const action = { type: fetchAISettings.pending.type };
      const newState = settingsReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('sets AI settings on fulfilled', () => {
      const action = {
        type: fetchAISettings.fulfilled.type,
        payload: mockAISettings,
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.aiSettings).toEqual(mockAISettings);
      expect(newState.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const action = {
        type: fetchAISettings.rejected.type,
        error: { message: 'Network error' },
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Network error');
    });

    it('uses default error message when none provided', () => {
      const action = {
        type: fetchAISettings.rejected.type,
        error: {},
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.error).toBe('Failed to fetch AI settings');
    });

    it('clears error when fetch succeeds after failure', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error',
        isLoading: false,
      };
      const action = {
        type: fetchAISettings.fulfilled.type,
        payload: mockAISettings,
      };
      const newState = settingsReducer(stateWithError, action);
      expect(newState.error).toBeNull();
    });

    it('preserves other state on pending', () => {
      const stateWithData = {
        ...initialState,
        integrations: [mockIntegration],
        ssoConfig: mockSSOConfig,
      };
      const action = { type: fetchAISettings.pending.type };
      const newState = settingsReducer(stateWithData, action);

      expect(newState.integrations).toEqual([mockIntegration]);
      expect(newState.ssoConfig).toEqual(mockSSOConfig);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
        });

        const result = await store.dispatch(fetchAISettings());

        expect(result.type).toBe('settings/fetchAISettings/rejected');
      });

      it('calls API with correct organization ID', async () => {
        server.use(
          http.get('/api/organizations/:orgId/settings/ai', () => {
            return HttpResponse.json(mockAISettings);
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(fetchAISettings());

        expect(result.type).toBe('settings/fetchAISettings/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.get('/api/organizations/:orgId/settings/ai', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(fetchAISettings());

        expect(result.type).toBe('settings/fetchAISettings/rejected');
      });
    });
  });

  describe('updateAISettings async thunk', () => {
    it('updates AI settings on fulfilled', () => {
      const updatedSettings = { ...mockAISettings, defaultModel: 'gpt-4-turbo' };
      const action = {
        type: updateAISettings.fulfilled.type,
        payload: updatedSettings,
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.aiSettings).toEqual(updatedSettings);
    });

    it('replaces existing AI settings', () => {
      const stateWithSettings = {
        ...initialState,
        aiSettings: mockAISettings,
      };
      const updatedSettings = { ...mockAISettings, defaultModel: 'gpt-4-turbo', useOwnKeys: false };
      const action = {
        type: updateAISettings.fulfilled.type,
        payload: updatedSettings,
      };
      const newState = settingsReducer(stateWithSettings, action);

      expect(newState.aiSettings?.defaultModel).toBe('gpt-4-turbo');
      expect(newState.aiSettings?.useOwnKeys).toBe(false);
    });

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithSettings = {
        ...initialState,
        aiSettings: mockAISettings,
      };
      const action = { type: updateAISettings.pending.type };
      const newState = settingsReducer(stateWithSettings, action);
      expect(newState.aiSettings).toEqual(mockAISettings);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithSettings = {
        ...initialState,
        aiSettings: mockAISettings,
      };
      const action = {
        type: updateAISettings.rejected.type,
        error: { message: 'Update failed' },
      };
      const newState = settingsReducer(stateWithSettings, action);
      expect(newState.aiSettings).toEqual(mockAISettings);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
        });

        const result = await store.dispatch(updateAISettings({ defaultModel: 'gpt-4' }));

        expect(result.type).toBe('settings/updateAISettings/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.put('/api/organizations/:orgId/settings/ai', () => {
            return HttpResponse.json({ ...mockAISettings, defaultModel: 'gpt-4' });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(updateAISettings({ defaultModel: 'gpt-4', temperature: 0.5 }));

        expect(result.type).toBe('settings/updateAISettings/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.put('/api/organizations/:orgId/settings/ai', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(updateAISettings({ defaultModel: 'gpt-4' }));

        expect(result.type).toBe('settings/updateAISettings/rejected');
      });
    });
  });

  describe('connectIntegration async thunk', () => {
    it('adds new integration on fulfilled', () => {
      const action = {
        type: connectIntegration.fulfilled.type,
        payload: mockIntegration,
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.integrations).toContainEqual(mockIntegration);
    });

    it('updates existing integration on fulfilled', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [{ ...mockIntegration, status: 'pending' as const }],
      };
      const updatedIntegration = { ...mockIntegration, status: 'connected' as const };
      const action = {
        type: connectIntegration.fulfilled.type,
        payload: updatedIntegration,
      };
      const newState = settingsReducer(stateWithIntegration, action);

      expect(newState.integrations).toHaveLength(1);
      expect(newState.integrations[0].status).toBe('connected');
    });

    it('adds second integration without affecting existing ones', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const newIntegration: Integration = {
        id: 'github-1',
        name: 'GitHub',
        status: 'connected',
        connectedAt: '2024-01-02T00:00:00Z',
      };
      const action = {
        type: connectIntegration.fulfilled.type,
        payload: newIntegration,
      };
      const newState = settingsReducer(stateWithIntegration, action);

      expect(newState.integrations).toHaveLength(2);
      expect(newState.integrations.find(i => i.id === 'jira-1')).toBeDefined();
      expect(newState.integrations.find(i => i.id === 'github-1')).toBeDefined();
    });

    it('does not modify state on pending (no handler defined)', () => {
      const action = { type: connectIntegration.pending.type };
      const newState = settingsReducer(initialState, action);
      expect(newState.integrations).toEqual([]);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const action = {
        type: connectIntegration.rejected.type,
        error: { message: 'Connection failed' },
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.integrations).toEqual([]);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
        });

        const result = await store.dispatch(
          connectIntegration({ integrationId: 'jira-1', configuration: { apiKey: 'test' } })
        );

        expect(result.type).toBe('settings/connectIntegration/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.post('/api/organizations/:orgId/integrations/:intId/connect', () => {
            return HttpResponse.json(mockIntegration);
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(
          connectIntegration({
            integrationId: 'jira-1',
            configuration: { apiKey: 'test-key', domain: 'company.atlassian.net' },
          })
        );

        expect(result.type).toBe('settings/connectIntegration/fulfilled');
      });

      it('calls API without configuration when not provided', async () => {
        server.use(
          http.post('/api/organizations/:orgId/integrations/:intId/connect', () => {
            return HttpResponse.json(mockIntegration);
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(connectIntegration({ integrationId: 'github-1' }));

        expect(result.type).toBe('settings/connectIntegration/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.post('/api/organizations/:orgId/integrations/:intId/connect', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(connectIntegration({ integrationId: 'jira-1' }));

        expect(result.type).toBe('settings/connectIntegration/rejected');
      });
    });
  });

  describe('disconnectIntegration async thunk', () => {
    it('sets integration status to disconnected on fulfilled', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const action = {
        type: disconnectIntegration.fulfilled.type,
        payload: 'jira-1',
      };
      const newState = settingsReducer(stateWithIntegration, action);

      expect(newState.integrations[0].status).toBe('disconnected');
      expect(newState.integrations[0].connectedAt).toBeUndefined();
    });

    it('does nothing if integration not found', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const action = {
        type: disconnectIntegration.fulfilled.type,
        payload: 'nonexistent',
      };
      const newState = settingsReducer(stateWithIntegration, action);

      expect(newState.integrations[0].status).toBe('connected');
    });

    it('preserves other integration properties on disconnect', () => {
      const integration: Integration = {
        id: 'jira-1',
        name: 'Jira',
        status: 'connected',
        configuration: { apiKey: 'secret-key', domain: 'company.atlassian.net' },
        connectedAt: '2024-01-01T00:00:00Z',
      };
      const stateWithIntegration = {
        ...initialState,
        integrations: [integration],
      };
      const action = {
        type: disconnectIntegration.fulfilled.type,
        payload: 'jira-1',
      };
      const newState = settingsReducer(stateWithIntegration, action);
      expect(newState.integrations[0].name).toBe('Jira');
      expect(newState.integrations[0].configuration).toEqual({
        apiKey: 'secret-key',
        domain: 'company.atlassian.net',
      });
    });

    it('only disconnects the targeted integration', () => {
      const integration2: Integration = {
        id: 'github-1',
        name: 'GitHub',
        status: 'connected',
        connectedAt: '2024-01-02T00:00:00Z',
      };
      const stateWithIntegrations = {
        ...initialState,
        integrations: [mockIntegration, integration2],
      };
      const action = {
        type: disconnectIntegration.fulfilled.type,
        payload: 'jira-1',
      };
      const newState = settingsReducer(stateWithIntegrations, action);

      expect(newState.integrations[0].status).toBe('disconnected');
      expect(newState.integrations[1].status).toBe('connected');
    });

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const action = { type: disconnectIntegration.pending.type };
      const newState = settingsReducer(stateWithIntegration, action);
      expect(newState.integrations[0].status).toBe('connected');
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithIntegration = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const action = {
        type: disconnectIntegration.rejected.type,
        error: { message: 'Disconnect failed' },
      };
      const newState = settingsReducer(stateWithIntegration, action);
      expect(newState.integrations[0].status).toBe('connected');
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
        });

        const result = await store.dispatch(disconnectIntegration('jira-1'));

        expect(result.type).toBe('settings/disconnectIntegration/rejected');
      });

      it('calls API with correct integration ID', async () => {
        server.use(
          http.post('/api/organizations/:orgId/integrations/:intId/disconnect', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: { ...initialState, integrations: [mockIntegration] },
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(disconnectIntegration('jira-1'));

        expect(result.type).toBe('settings/disconnectIntegration/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.post('/api/organizations/:orgId/integrations/:intId/disconnect', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: { ...initialState, integrations: [mockIntegration] },
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(disconnectIntegration('jira-1'));

        expect(result.type).toBe('settings/disconnectIntegration/rejected');
      });
    });
  });

  describe('updateSSOConfig async thunk', () => {
    it('updates SSO config on fulfilled', () => {
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: mockSSOConfig,
      };
      const newState = settingsReducer(initialState, action);

      expect(newState.ssoConfig).toEqual(mockSSOConfig);
    });

    it('replaces existing SSO config', () => {
      const stateWithSSO = {
        ...initialState,
        ssoConfig: { provider: 'google' as const, enabled: false },
      };
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: mockSSOConfig,
      };
      const newState = settingsReducer(stateWithSSO, action);

      expect(newState.ssoConfig?.provider).toBe('azure');
      expect(newState.ssoConfig?.enabled).toBe(true);
    });

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithSSO = {
        ...initialState,
        ssoConfig: mockSSOConfig,
      };
      const action = { type: updateSSOConfig.pending.type };
      const newState = settingsReducer(stateWithSSO, action);
      expect(newState.ssoConfig).toEqual(mockSSOConfig);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithSSO = {
        ...initialState,
        ssoConfig: mockSSOConfig,
      };
      const action = {
        type: updateSSOConfig.rejected.type,
        error: { message: 'SSO update failed' },
      };
      const newState = settingsReducer(stateWithSSO, action);
      expect(newState.ssoConfig).toEqual(mockSSOConfig);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
        });

        const result = await store.dispatch(updateSSOConfig({ enabled: true }));

        expect(result.type).toBe('settings/updateSSOConfig/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.put('/api/organizations/:orgId/settings/sso', () => {
            return HttpResponse.json(mockSSOConfig);
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(updateSSOConfig({
          provider: 'azure',
          enabled: true,
          enforceSSO: true,
        }));

        expect(result.type).toBe('settings/updateSSOConfig/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.put('/api/organizations/:orgId/settings/sso', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: {
            settings: settingsReducer,
            organization: organizationReducer,
          },
          preloadedState: {
            settings: initialState,
            organization: {
              currentOrganization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
              isLoading: false,
              error: null,
            },
          },
        });

        const result = await store.dispatch(updateSSOConfig({ enabled: true }));

        expect(result.type).toBe('settings/updateSSOConfig/rejected');
      });
    });
  });

  describe('edge cases', () => {
    it('handles AI settings with all optional fields', () => {
      const fullSettings: AISettings = {
        useOwnKeys: true,
        defaultProvider: 'anthropic',
        defaultModel: 'claude-3',
        apiKeys: { openai: 'sk-test', anthropic: 'ant-test' },
        settings: {
          temperature: 0.5,
          maxTokens: 8000,
          frequencyPenalty: 0.2,
          presencePenalty: 0.1,
        },
      };
      const action = {
        type: fetchAISettings.fulfilled.type,
        payload: fullSettings,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.aiSettings?.settings?.frequencyPenalty).toBe(0.2);
      expect(newState.aiSettings?.settings?.presencePenalty).toBe(0.1);
    });

    it('handles AI settings with minimal fields', () => {
      const minimalSettings: AISettings = {
        useOwnKeys: false,
      };
      const action = {
        type: fetchAISettings.fulfilled.type,
        payload: minimalSettings,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.aiSettings?.useOwnKeys).toBe(false);
      expect(newState.aiSettings?.defaultProvider).toBeUndefined();
    });

    it('handles SSO config with all optional fields', () => {
      const fullSSO: SSOConfig = {
        provider: 'okta',
        enabled: true,
        enforceSSO: true,
        allowEmailLogin: false,
        config: {
          entityId: 'entity-456',
          ssoUrl: 'https://sso.okta.com',
          certificateData: 'cert-data-here',
        },
        domainRestrictions: ['example.com', 'test.com'],
      };
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: fullSSO,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.ssoConfig?.enforceSSO).toBe(true);
      expect(newState.ssoConfig?.config?.certificateData).toBe('cert-data-here');
    });

    it('handles SSO config with custom provider', () => {
      const customSSO: SSOConfig = {
        provider: 'custom',
        enabled: true,
        config: {
          entityId: 'custom-entity',
          ssoUrl: 'https://custom.sso.com',
        },
      };
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: customSSO,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.ssoConfig?.provider).toBe('custom');
    });

    it('handles all SSO provider types', () => {
      const providers = ['azure', 'google', 'okta', 'custom'] as const;

      providers.forEach((provider) => {
        const sso: SSOConfig = { provider, enabled: true };
        const action = {
          type: updateSSOConfig.fulfilled.type,
          payload: sso,
        };
        const newState = settingsReducer(initialState, action);
        expect(newState.ssoConfig?.provider).toBe(provider);
      });
    });

    it('handles multiple integrations', () => {
      const integration1: Integration = {
        id: 'jira-1',
        name: 'Jira',
        status: 'connected',
        connectedAt: '2024-01-01T00:00:00Z',
      };
      const integration2: Integration = {
        id: 'github-1',
        name: 'GitHub',
        status: 'connected',
        connectedAt: '2024-01-02T00:00:00Z',
      };
      const integration3: Integration = {
        id: 'slack-1',
        name: 'Slack',
        status: 'pending',
      };

      let state = settingsReducer(initialState, {
        type: connectIntegration.fulfilled.type,
        payload: integration1,
      });
      state = settingsReducer(state, {
        type: connectIntegration.fulfilled.type,
        payload: integration2,
      });
      state = settingsReducer(state, {
        type: connectIntegration.fulfilled.type,
        payload: integration3,
      });

      expect(state.integrations).toHaveLength(3);
      expect(state.integrations.find(i => i.id === 'jira-1')).toBeDefined();
      expect(state.integrations.find(i => i.id === 'github-1')).toBeDefined();
      expect(state.integrations.find(i => i.id === 'slack-1')).toBeDefined();
    });

    it('handles all integration statuses', () => {
      const statuses = ['connected', 'disconnected', 'pending'] as const;

      statuses.forEach((status) => {
        const integration: Integration = {
          id: `int-${status}`,
          name: 'Test',
          status,
        };
        const action = {
          type: connectIntegration.fulfilled.type,
          payload: integration,
        };
        const newState = settingsReducer(initialState, action);
        expect(newState.integrations[0].status).toBe(status);
      });
    });

    it('handles integration with empty configuration', () => {
      const integration: Integration = {
        id: 'test-1',
        name: 'Test',
        status: 'connected',
        configuration: {},
      };
      const action = {
        type: connectIntegration.fulfilled.type,
        payload: integration,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.integrations[0].configuration).toEqual({});
    });

    it('handles SSO with empty domain restrictions', () => {
      const sso: SSOConfig = {
        provider: 'azure',
        enabled: true,
        domainRestrictions: [],
      };
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: sso,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.ssoConfig?.domainRestrictions).toEqual([]);
    });

    it('handles SSO with multiple domain restrictions', () => {
      const sso: SSOConfig = {
        provider: 'azure',
        enabled: true,
        domainRestrictions: ['example.com', 'test.com', 'company.org'],
      };
      const action = {
        type: updateSSOConfig.fulfilled.type,
        payload: sso,
      };
      const newState = settingsReducer(initialState, action);
      expect(newState.ssoConfig?.domainRestrictions).toHaveLength(3);
    });
  });

  describe('state immutability', () => {
    it('does not mutate the original state on fetchAISettings fulfilled', () => {
      const originalState = { ...initialState };
      settingsReducer(originalState, {
        type: fetchAISettings.fulfilled.type,
        payload: mockAISettings,
      });
      expect(originalState.aiSettings).toBeNull();
    });

    it('does not mutate the original state on updateSSOConfig fulfilled', () => {
      const originalState = { ...initialState };
      settingsReducer(originalState, {
        type: updateSSOConfig.fulfilled.type,
        payload: mockSSOConfig,
      });
      expect(originalState.ssoConfig).toBeNull();
    });

    it('does not mutate the original integrations array on connect', () => {
      const originalState = {
        ...initialState,
        integrations: [mockIntegration],
      };
      const originalIntegrations = [...originalState.integrations];

      settingsReducer(originalState, {
        type: connectIntegration.fulfilled.type,
        payload: { id: 'new-1', name: 'New', status: 'connected' as const },
      });

      expect(originalState.integrations).toEqual(originalIntegrations);
    });

    it('does not mutate the original integration on disconnect', () => {
      const originalState = {
        ...initialState,
        integrations: [{ ...mockIntegration }],
      };
      const originalStatus = originalState.integrations[0].status;

      settingsReducer(originalState, {
        type: disconnectIntegration.fulfilled.type,
        payload: 'jira-1',
      });

      expect(originalState.integrations[0].status).toBe(originalStatus);
    });

    it('does not mutate the original state on clearSettingsError', () => {
      const originalState = {
        ...initialState,
        error: 'Some error',
      };
      settingsReducer(originalState, clearSettingsError());
      expect(originalState.error).toBe('Some error');
    });
  });

  describe('complex scenarios', () => {
    it('handles rapid state transitions', () => {
      let state = initialState;

      // Fetch AI settings
      state = settingsReducer(state, { type: fetchAISettings.pending.type });
      expect(state.isLoading).toBe(true);

      state = settingsReducer(state, {
        type: fetchAISettings.fulfilled.type,
        payload: mockAISettings,
      });
      expect(state.isLoading).toBe(false);
      expect(state.aiSettings).toEqual(mockAISettings);

      // Connect integration
      state = settingsReducer(state, {
        type: connectIntegration.fulfilled.type,
        payload: mockIntegration,
      });
      expect(state.integrations).toHaveLength(1);

      // Update SSO
      state = settingsReducer(state, {
        type: updateSSOConfig.fulfilled.type,
        payload: mockSSOConfig,
      });
      expect(state.ssoConfig).toEqual(mockSSOConfig);

      // Disconnect integration
      state = settingsReducer(state, {
        type: disconnectIntegration.fulfilled.type,
        payload: 'jira-1',
      });
      expect(state.integrations[0].status).toBe('disconnected');

      // All other state should be preserved
      expect(state.aiSettings).toEqual(mockAISettings);
      expect(state.ssoConfig).toEqual(mockSSOConfig);
    });

    it('handles error recovery flow', () => {
      let state = initialState;

      // Fail to fetch
      state = settingsReducer(state, { type: fetchAISettings.pending.type });
      state = settingsReducer(state, {
        type: fetchAISettings.rejected.type,
        error: { message: 'Network error' },
      });
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);

      // Clear error
      state = settingsReducer(state, clearSettingsError());
      expect(state.error).toBeNull();

      // Retry and succeed
      state = settingsReducer(state, { type: fetchAISettings.pending.type });
      state = settingsReducer(state, {
        type: fetchAISettings.fulfilled.type,
        payload: mockAISettings,
      });
      expect(state.error).toBeNull();
      expect(state.aiSettings).toEqual(mockAISettings);
    });
  });
});
