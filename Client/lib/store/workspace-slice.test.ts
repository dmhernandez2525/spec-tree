import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/test/mocks/server';
import {
  workspaceReducer,
  clearWorkspaceState,
  setQuota,
  fetchWorkspaces,
  fetchActivities,
  fetchAuditLogs,
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  fetchAPIKeys,
  createAPIKey,
  revokeAPIKey,
  respondToInvite,
} from './workspace-slice';
import type {
  WorkspaceSummary,
  TeamActivity,
  AuditLogEntry,
  SharedTemplate,
  WorkspaceAPIKey,
  QuotaInfo,
} from '@/types/organization';

describe('workspace-slice', () => {
  const mockWorkspace: WorkspaceSummary = {
    id: 'ws-123',
    name: 'Engineering Team',
    role: 'admin',
    avatarUrl: 'https://example.com/avatar.png',
  };

  const mockActivity: TeamActivity = {
    id: 'activity-1',
    type: 'edit',
    actorId: 'user-1',
    actorName: 'John Doe',
    target: 'Epic: User Authentication',
    metadata: { documentId: 'epic-123' },
    happenedAt: '2024-02-15T10:00:00Z',
  };

  const mockAuditLog: AuditLogEntry = {
    id: 'log-1',
    action: 'member_added',
    actorId: 'user-1',
    actorName: 'Admin User',
    targetId: 'user-2',
    targetType: 'member',
    metadata: {},
    happenedAt: '2024-02-15T12:00:00Z',
  };

  const mockTemplate: SharedTemplate = {
    id: 'template-1',
    name: 'User Story Template',
    description: 'Standard template for user stories',
    category: 'user-story',
    template: { fields: [] },
    createdById: 'user-1',
    lastUsedAt: '2024-02-10T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
  };

  const mockAPIKey: WorkspaceAPIKey = {
    id: 'key-1',
    provider: 'openai',
    label: 'Production OpenAI Key',
    maskedKey: 'sk-...xxxx',
    isActive: true,
    createdById: 'user-1',
    lastUsedAt: '2024-02-15T09:00:00Z',
  };

  const mockQuota: QuotaInfo = {
    monthlyLimit: 1000,
    currentUsage: 450,
  };

  const initialState = {
    workspaces: [],
    activities: [],
    auditLogs: [],
    templates: [],
    apiKeys: [],
    quota: null,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with empty arrays and null quota', () => {
      const state = workspaceReducer(undefined, { type: 'UNKNOWN' });
      expect(state).toEqual(initialState);
    });

    it('starts with loading false', () => {
      expect(initialState.isLoading).toBe(false);
    });

    it('starts with null error', () => {
      expect(initialState.error).toBeNull();
    });
  });

  describe('clearWorkspaceState', () => {
    it('resets all workspace data to defaults', () => {
      const populatedState = {
        ...initialState,
        activities: [mockActivity],
        auditLogs: [mockAuditLog],
        templates: [mockTemplate],
        apiKeys: [mockAPIKey],
        quota: mockQuota,
        error: 'Some error',
      };
      const newState = workspaceReducer(populatedState, clearWorkspaceState());

      expect(newState.activities).toEqual([]);
      expect(newState.auditLogs).toEqual([]);
      expect(newState.templates).toEqual([]);
      expect(newState.apiKeys).toEqual([]);
      expect(newState.quota).toBeNull();
      expect(newState.error).toBeNull();
    });

    it('preserves workspaces list', () => {
      const stateWithWorkspaces = {
        ...initialState,
        workspaces: [mockWorkspace],
        activities: [mockActivity],
      };
      const newState = workspaceReducer(stateWithWorkspaces, clearWorkspaceState());

      expect(newState.workspaces).toEqual([mockWorkspace]);
      expect(newState.activities).toEqual([]);
    });
  });

  describe('setQuota', () => {
    it('sets quota info', () => {
      const newState = workspaceReducer(initialState, setQuota(mockQuota));
      expect(newState.quota).toEqual(mockQuota);
    });

    it('replaces existing quota', () => {
      const stateWithQuota = { ...initialState, quota: mockQuota };
      const updatedQuota = { monthlyLimit: 2000, currentUsage: 900 };
      const newState = workspaceReducer(stateWithQuota, setQuota(updatedQuota));

      expect(newState.quota?.monthlyLimit).toBe(2000);
      expect(newState.quota?.currentUsage).toBe(900);
    });
  });

  describe('fetchWorkspaces', () => {
    it('sets loading on pending', () => {
      const action = { type: fetchWorkspaces.pending.type };
      const newState = workspaceReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('loads workspaces on fulfilled', () => {
      const action = {
        type: fetchWorkspaces.fulfilled.type,
        payload: [mockWorkspace],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.workspaces).toEqual([mockWorkspace]);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBeNull();
    });

    it('clears error on fulfilled', () => {
      const stateWithError = { ...initialState, error: 'Previous error', isLoading: true };
      const action = {
        type: fetchWorkspaces.fulfilled.type,
        payload: [mockWorkspace],
      };
      const newState = workspaceReducer(stateWithError, action);

      expect(newState.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const action = {
        type: fetchWorkspaces.rejected.type,
        error: { message: 'Network error' },
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Network error');
    });

    it('uses default error message when none provided', () => {
      const action = {
        type: fetchWorkspaces.rejected.type,
        error: {},
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.error).toBe('Failed to fetch workspaces');
    });

    describe('async thunk execution', () => {
      it('fetches workspaces via API', async () => {
        server.use(
          http.get('/api/organizations/workspaces', () => {
            return HttpResponse.json([mockWorkspace]);
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(fetchWorkspaces('user-123'));
        expect(result.type).toBe('workspace/fetchWorkspaces/fulfilled');
        expect(store.getState().workspace.workspaces).toEqual([mockWorkspace]);
      });

      it('handles API failure', async () => {
        server.use(
          http.get('/api/organizations/workspaces', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(fetchWorkspaces('user-123'));
        expect(result.type).toBe('workspace/fetchWorkspaces/rejected');
      });
    });
  });

  describe('fetchActivities', () => {
    it('loads activities on fulfilled', () => {
      const action = {
        type: fetchActivities.fulfilled.type,
        payload: [mockActivity],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.activities).toEqual([mockActivity]);
    });

    it('replaces existing activities', () => {
      const stateWithActivities = { ...initialState, activities: [mockActivity] };
      const newActivity = { ...mockActivity, id: 'activity-2' };
      const action = {
        type: fetchActivities.fulfilled.type,
        payload: [newActivity],
      };
      const newState = workspaceReducer(stateWithActivities, action);

      expect(newState.activities).toHaveLength(1);
      expect(newState.activities[0].id).toBe('activity-2');
    });

    describe('async thunk execution', () => {
      it('fetches activities with pagination', async () => {
        server.use(
          http.get('/api/organizations/:id/activity', () => {
            return HttpResponse.json({ activities: [mockActivity] });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          fetchActivities({ organizationId: 'org-123', page: 1, pageSize: 20 })
        );
        expect(result.type).toBe('workspace/fetchActivities/fulfilled');
      });

      it('handles API failure', async () => {
        server.use(
          http.get('/api/organizations/:id/activity', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          fetchActivities({ organizationId: 'org-123' })
        );
        expect(result.type).toBe('workspace/fetchActivities/rejected');
      });
    });
  });

  describe('fetchAuditLogs', () => {
    it('loads audit logs on fulfilled', () => {
      const action = {
        type: fetchAuditLogs.fulfilled.type,
        payload: [mockAuditLog],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.auditLogs).toEqual([mockAuditLog]);
    });

    describe('async thunk execution', () => {
      it('fetches audit logs via API', async () => {
        server.use(
          http.get('/api/organizations/:id/audit-logs', () => {
            return HttpResponse.json({ auditLogs: [mockAuditLog] });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          fetchAuditLogs({ organizationId: 'org-123', page: 1 })
        );
        expect(result.type).toBe('workspace/fetchAuditLogs/fulfilled');
      });
    });
  });

  describe('templates', () => {
    it('loads templates on fetchTemplates fulfilled', () => {
      const action = {
        type: fetchTemplates.fulfilled.type,
        payload: [mockTemplate],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.templates).toEqual([mockTemplate]);
    });

    it('prepends new template on createTemplate fulfilled', () => {
      const existingTemplate = { ...mockTemplate, id: 'template-2' };
      const stateWithTemplate = { ...initialState, templates: [existingTemplate] };
      const action = {
        type: createTemplate.fulfilled.type,
        payload: mockTemplate,
      };
      const newState = workspaceReducer(stateWithTemplate, action);

      expect(newState.templates).toHaveLength(2);
      expect(newState.templates[0].id).toBe('template-1');
      expect(newState.templates[1].id).toBe('template-2');
    });

    it('removes template on deleteTemplate fulfilled', () => {
      const stateWithTemplate = { ...initialState, templates: [mockTemplate] };
      const action = {
        type: deleteTemplate.fulfilled.type,
        payload: 'template-1',
      };
      const newState = workspaceReducer(stateWithTemplate, action);

      expect(newState.templates).toHaveLength(0);
    });

    it('only removes matching template', () => {
      const template2 = { ...mockTemplate, id: 'template-2' };
      const stateWithTemplates = { ...initialState, templates: [mockTemplate, template2] };
      const action = {
        type: deleteTemplate.fulfilled.type,
        payload: 'template-1',
      };
      const newState = workspaceReducer(stateWithTemplates, action);

      expect(newState.templates).toHaveLength(1);
      expect(newState.templates[0].id).toBe('template-2');
    });

    describe('async thunk execution', () => {
      it('creates template via API', async () => {
        server.use(
          http.post('/api/organizations/:id/templates', () => {
            return HttpResponse.json(mockTemplate, { status: 201 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          createTemplate({
            organizationId: 'org-123',
            name: 'User Story Template',
            description: 'Standard template',
            category: 'user-story',
            template: { fields: [] },
            createdById: 'user-1',
          })
        );
        expect(result.type).toBe('workspace/createTemplate/fulfilled');
      });

      it('deletes template via API', async () => {
        server.use(
          http.delete('/api/organizations/:id/templates/:templateId', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          deleteTemplate({ organizationId: 'org-123', templateId: 'template-1' })
        );
        expect(result.type).toBe('workspace/deleteTemplate/fulfilled');
      });
    });
  });

  describe('API keys', () => {
    it('loads API keys on fetchAPIKeys fulfilled', () => {
      const action = {
        type: fetchAPIKeys.fulfilled.type,
        payload: [mockAPIKey],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.apiKeys).toEqual([mockAPIKey]);
    });

    it('prepends new API key on createAPIKey fulfilled', () => {
      const existingKey = { ...mockAPIKey, id: 'key-2' };
      const stateWithKey = { ...initialState, apiKeys: [existingKey] };
      const action = {
        type: createAPIKey.fulfilled.type,
        payload: mockAPIKey,
      };
      const newState = workspaceReducer(stateWithKey, action);

      expect(newState.apiKeys).toHaveLength(2);
      expect(newState.apiKeys[0].id).toBe('key-1');
    });

    it('removes API key on revokeAPIKey fulfilled', () => {
      const stateWithKey = { ...initialState, apiKeys: [mockAPIKey] };
      const action = {
        type: revokeAPIKey.fulfilled.type,
        payload: 'key-1',
      };
      const newState = workspaceReducer(stateWithKey, action);

      expect(newState.apiKeys).toHaveLength(0);
    });

    it('only removes matching API key', () => {
      const key2 = { ...mockAPIKey, id: 'key-2' };
      const stateWithKeys = { ...initialState, apiKeys: [mockAPIKey, key2] };
      const action = {
        type: revokeAPIKey.fulfilled.type,
        payload: 'key-1',
      };
      const newState = workspaceReducer(stateWithKeys, action);

      expect(newState.apiKeys).toHaveLength(1);
      expect(newState.apiKeys[0].id).toBe('key-2');
    });

    describe('async thunk execution', () => {
      it('creates API key via API', async () => {
        server.use(
          http.post('/api/organizations/:id/api-keys', () => {
            return HttpResponse.json(mockAPIKey, { status: 201 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          createAPIKey({
            organizationId: 'org-123',
            provider: 'openai',
            label: 'Production Key',
            maskedKey: 'sk-...xxxx',
            encryptedKey: 'encrypted-value',
            createdById: 'user-1',
          })
        );
        expect(result.type).toBe('workspace/createAPIKey/fulfilled');
      });

      it('revokes API key via API', async () => {
        server.use(
          http.delete('/api/organizations/:id/api-keys/:apiKeyId', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          revokeAPIKey({ organizationId: 'org-123', apiKeyId: 'key-1' })
        );
        expect(result.type).toBe('workspace/revokeAPIKey/fulfilled');
      });
    });
  });

  describe('respondToInvite', () => {
    describe('async thunk execution', () => {
      it('accepts invite via API', async () => {
        server.use(
          http.post('/api/organizations/invites/:inviteId/respond', () => {
            return HttpResponse.json({ success: true });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          respondToInvite({ inviteId: 'invite-1', action: 'accept', userId: 'user-1' })
        );
        expect(result.type).toBe('workspace/respondToInvite/fulfilled');
        expect(result.payload).toEqual({ inviteId: 'invite-1', action: 'accept' });
      });

      it('declines invite via API', async () => {
        server.use(
          http.post('/api/organizations/invites/:inviteId/respond', () => {
            return HttpResponse.json({ success: true });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          respondToInvite({ inviteId: 'invite-1', action: 'decline', userId: 'user-1' })
        );
        expect(result.type).toBe('workspace/respondToInvite/fulfilled');
        expect(result.payload).toEqual({ inviteId: 'invite-1', action: 'decline' });
      });

      it('handles API failure', async () => {
        server.use(
          http.post('/api/organizations/invites/:inviteId/respond', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { workspace: workspaceReducer },
        });

        const result = await store.dispatch(
          respondToInvite({ inviteId: 'invite-1', action: 'accept', userId: 'user-1' })
        );
        expect(result.type).toBe('workspace/respondToInvite/rejected');
      });
    });
  });

  describe('state immutability', () => {
    it('does not mutate original state on clearWorkspaceState', () => {
      const originalState = {
        ...initialState,
        activities: [mockActivity],
        templates: [mockTemplate],
      };
      workspaceReducer(originalState, clearWorkspaceState());
      expect(originalState.activities).toHaveLength(1);
      expect(originalState.templates).toHaveLength(1);
    });

    it('does not mutate original state on setQuota', () => {
      const originalState = { ...initialState };
      workspaceReducer(originalState, setQuota(mockQuota));
      expect(originalState.quota).toBeNull();
    });

    it('does not mutate original apiKeys array on revoke', () => {
      const originalState = { ...initialState, apiKeys: [mockAPIKey] };
      const action = { type: revokeAPIKey.fulfilled.type, payload: 'key-1' };
      workspaceReducer(originalState, action);
      expect(originalState.apiKeys).toHaveLength(1);
    });

    it('does not mutate original templates array on delete', () => {
      const originalState = { ...initialState, templates: [mockTemplate] };
      const action = { type: deleteTemplate.fulfilled.type, payload: 'template-1' };
      workspaceReducer(originalState, action);
      expect(originalState.templates).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty workspaces response', () => {
      const action = {
        type: fetchWorkspaces.fulfilled.type,
        payload: [],
      };
      const newState = workspaceReducer(initialState, action);

      expect(newState.workspaces).toEqual([]);
    });

    it('handles revoking non-existent API key', () => {
      const stateWithKey = { ...initialState, apiKeys: [mockAPIKey] };
      const action = {
        type: revokeAPIKey.fulfilled.type,
        payload: 'nonexistent-key',
      };
      const newState = workspaceReducer(stateWithKey, action);

      expect(newState.apiKeys).toHaveLength(1);
    });

    it('handles deleting non-existent template', () => {
      const stateWithTemplate = { ...initialState, templates: [mockTemplate] };
      const action = {
        type: deleteTemplate.fulfilled.type,
        payload: 'nonexistent-template',
      };
      const newState = workspaceReducer(stateWithTemplate, action);

      expect(newState.templates).toHaveLength(1);
    });

    it('handles all AI provider types in API keys', () => {
      const providers = ['openai', 'anthropic', 'gemini'] as const;
      providers.forEach((provider) => {
        const key = { ...mockAPIKey, provider };
        const action = { type: createAPIKey.fulfilled.type, payload: key };
        const newState = workspaceReducer(initialState, action);
        expect(newState.apiKeys[0].provider).toBe(provider);
      });
    });

    it('handles all activity types', () => {
      const types = [
        'edit', 'comment', 'generation', 'invite', 'member_change',
        'permission_change', 'template', 'api_key', 'quota', 'settings',
      ] as const;
      types.forEach((type) => {
        const activity = { ...mockActivity, type };
        const action = { type: fetchActivities.fulfilled.type, payload: [activity] };
        const newState = workspaceReducer(initialState, action);
        expect(newState.activities[0].type).toBe(type);
      });
    });

    it('handles all audit log actions', () => {
      const actions = [
        'permission_change', 'member_added', 'member_removed',
        'invite_sent', 'invite_accepted', 'invite_declined',
        'quota_updated', 'api_key_created', 'api_key_revoked',
        'settings_updated', 'template_created',
      ] as const;
      actions.forEach((auditAction) => {
        const log = { ...mockAuditLog, action: auditAction };
        const action = { type: fetchAuditLogs.fulfilled.type, payload: [log] };
        const newState = workspaceReducer(initialState, action);
        expect(newState.auditLogs[0].action).toBe(auditAction);
      });
    });
  });
});
