import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  TeamActivity,
  AuditLogEntry,
  SharedTemplate,
  WorkspaceAPIKey,
  QuotaInfo,
  WorkspaceSummary,
} from '@/types/organization';
import { logger } from '@/lib/logger';

interface WorkspaceState {
  workspaces: WorkspaceSummary[];
  activities: TeamActivity[];
  auditLogs: AuditLogEntry[];
  templates: SharedTemplate[];
  apiKeys: WorkspaceAPIKey[];
  quota: QuotaInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activities: [],
  auditLogs: [],
  templates: [],
  apiKeys: [],
  quota: null,
  isLoading: false,
  error: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async (userId: string) => {
    const response = await fetch(`/api/organizations/workspaces?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch workspaces');
    }
    return response.json() as Promise<WorkspaceSummary[]>;
  }
);

export const fetchActivities = createAsyncThunk(
  'workspace/fetchActivities',
  async ({
    organizationId,
    page,
    pageSize,
  }: {
    organizationId: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('pageSize', String(pageSize));
    const query = params.toString();
    const url = `/api/organizations/${organizationId}/activity${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    const data = await response.json();
    return data.activities as TeamActivity[];
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'workspace/fetchAuditLogs',
  async ({
    organizationId,
    page,
    pageSize,
  }: {
    organizationId: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (pageSize) params.set('pageSize', String(pageSize));
    const query = params.toString();
    const url = `/api/organizations/${organizationId}/audit-logs${query ? `?${query}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    const data = await response.json();
    return data.auditLogs as AuditLogEntry[];
  }
);

export const fetchTemplates = createAsyncThunk(
  'workspace/fetchTemplates',
  async (organizationId: string) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/templates`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json() as Promise<SharedTemplate[]>;
  }
);

export const createTemplate = createAsyncThunk(
  'workspace/createTemplate',
  async ({
    organizationId,
    name,
    description,
    category,
    template,
    createdById,
  }: {
    organizationId: string;
    name: string;
    description: string;
    category: string;
    template: Record<string, unknown>;
    createdById: string;
  }) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/templates`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, category, template, createdById }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to create template');
    }
    return response.json() as Promise<SharedTemplate>;
  }
);

export const deleteTemplate = createAsyncThunk(
  'workspace/deleteTemplate',
  async ({
    organizationId,
    templateId,
  }: {
    organizationId: string;
    templateId: string;
  }) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/templates/${templateId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
    return templateId;
  }
);

export const fetchAPIKeys = createAsyncThunk(
  'workspace/fetchAPIKeys',
  async (organizationId: string) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/api-keys`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch API keys');
    }
    return response.json() as Promise<WorkspaceAPIKey[]>;
  }
);

export const createAPIKey = createAsyncThunk(
  'workspace/createAPIKey',
  async ({
    organizationId,
    provider,
    label,
    maskedKey,
    encryptedKey,
    createdById,
  }: {
    organizationId: string;
    provider: string;
    label: string;
    maskedKey: string;
    encryptedKey: string;
    createdById: string;
  }) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/api-keys`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          label,
          maskedKey,
          encryptedKey,
          createdById,
        }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to create API key');
    }
    return response.json() as Promise<WorkspaceAPIKey>;
  }
);

export const revokeAPIKey = createAsyncThunk(
  'workspace/revokeAPIKey',
  async ({
    organizationId,
    apiKeyId,
  }: {
    organizationId: string;
    apiKeyId: string;
  }) => {
    const response = await fetch(
      `/api/organizations/${organizationId}/api-keys/${apiKeyId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error('Failed to revoke API key');
    }
    return apiKeyId;
  }
);

export const respondToInvite = createAsyncThunk(
  'workspace/respondToInvite',
  async ({
    inviteId,
    action,
    userId,
  }: {
    inviteId: string;
    action: 'accept' | 'decline';
    userId: string;
  }) => {
    const response = await fetch(
      `/api/organizations/invites/${inviteId}/respond?userId=${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to ${action} invite`);
    }
    return { inviteId, action };
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearWorkspaceState: (state) => {
      state.activities = [];
      state.auditLogs = [];
      state.templates = [];
      state.apiKeys = [];
      state.quota = null;
      state.error = null;
    },
    setQuota: (state, action: { payload: QuotaInfo }) => {
      state.quota = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.workspaces = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch workspaces';
        logger.error('workspace-slice', 'fetchWorkspaces failed', {
          error: action.error.message,
        });
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.unshift(action.payload);
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(
          (t) => t.id !== action.payload
        );
      })
      .addCase(fetchAPIKeys.fulfilled, (state, action) => {
        state.apiKeys = action.payload;
      })
      .addCase(createAPIKey.fulfilled, (state, action) => {
        state.apiKeys.unshift(action.payload);
      })
      .addCase(revokeAPIKey.fulfilled, (state, action) => {
        state.apiKeys = state.apiKeys.filter((k) => k.id !== action.payload);
      });
  },
});

export const { clearWorkspaceState, setQuota } = workspaceSlice.actions;
export const workspaceReducer = workspaceSlice.reducer;
