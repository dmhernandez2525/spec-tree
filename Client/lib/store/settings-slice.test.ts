import { describe, it, expect, vi, beforeEach } from 'vitest';
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
        error: 'Some error',
      };

      const newState = settingsReducer(stateWithError, clearSettingsError());

      expect(newState.aiSettings).toEqual(mockAISettings);
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
  });
});
