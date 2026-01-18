import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  organizationReducer,
  setCurrentOrganization,
  updateSubscription,
  fetchOrganizationData,
  sendInvite,
  cancelInvite,
  updateOrganization,
  updateMemberRole,
  removeMember,
} from './organization-slice';
import type { OrganizationMember, OrganizationInvite } from '@/types/organization';

describe('organization-slice', () => {
  const mockOrganization = {
    id: 'org-123',
    name: 'Test Organization',
    size: '10-50',
    industry: 'Technology',
  };

  const mockMember: OrganizationMember = {
    id: 'member-1',
    userId: 'user-1',
    organizationId: 'org-123',
    role: 'member',
    name: 'Test User',
    email: 'test@example.com',
    joinedAt: '2024-01-01T00:00:00Z',
  };

  const mockInvite: OrganizationInvite = {
    id: 'invite-1',
    email: 'invite@example.com',
    role: 'member',
    status: 'pending',
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-08T00:00:00Z',
  };

  const initialState = {
    currentOrganization: null,
    members: [],
    invites: [],
    subscription: null,
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setCurrentOrganization', () => {
    it('sets current organization', () => {
      const newState = organizationReducer(
        initialState,
        setCurrentOrganization(mockOrganization)
      );

      expect(newState.currentOrganization).toEqual(mockOrganization);
    });

    it('can set organization to null', () => {
      const stateWithOrg = { ...initialState, currentOrganization: mockOrganization };
      const newState = organizationReducer(stateWithOrg, setCurrentOrganization(null));

      expect(newState.currentOrganization).toBeNull();
    });
  });

  describe('updateSubscription', () => {
    it('updates subscription', () => {
      const subscription = { plan: 'pro', seats: 10 };
      const newState = organizationReducer(
        initialState,
        updateSubscription(subscription)
      );

      expect(newState.subscription).toEqual(subscription);
    });
  });

  describe('fetchOrganizationData async thunk', () => {
    it('sets loading state on pending', () => {
      const action = { type: fetchOrganizationData.pending.type };
      const newState = organizationReducer(initialState, action);

      expect(newState.isLoading).toBe(true);
    });

    it('sets organization data on fulfilled', () => {
      const payload = {
        organization: mockOrganization,
        members: [mockMember],
        invites: [mockInvite],
        subscription: { plan: 'pro' },
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.currentOrganization).toEqual(mockOrganization);
      expect(newState.members).toEqual([mockMember]);
      expect(newState.invites).toEqual([mockInvite]);
      expect(newState.error).toBeNull();
    });

    it('sets error on rejected', () => {
      const action = {
        type: fetchOrganizationData.rejected.type,
        error: { message: 'Failed to fetch' },
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe('Failed to fetch');
    });

    it('uses default error message when none provided', () => {
      const action = {
        type: fetchOrganizationData.rejected.type,
        error: {},
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.error).toBe('Failed to fetch organization data');
    });
  });

  describe('sendInvite async thunk', () => {
    it('adds invite on fulfilled', () => {
      const action = {
        type: sendInvite.fulfilled.type,
        payload: mockInvite,
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.invites).toContainEqual(mockInvite);
    });

    it('appends to existing invites', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [{ ...mockInvite, id: 'existing-invite' }],
      };
      const action = {
        type: sendInvite.fulfilled.type,
        payload: mockInvite,
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(2);
    });
  });

  describe('cancelInvite async thunk', () => {
    it('removes invite on fulfilled', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: cancelInvite.fulfilled.type,
        payload: 'invite-1',
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(0);
    });

    it('only removes matching invite', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite, { ...mockInvite, id: 'invite-2' }],
      };
      const action = {
        type: cancelInvite.fulfilled.type,
        payload: 'invite-1',
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
      expect(newState.invites[0].id).toBe('invite-2');
    });
  });

  describe('updateOrganization async thunk', () => {
    it('updates organization on fulfilled', () => {
      const stateWithOrg = { ...initialState, currentOrganization: mockOrganization };
      const updatedOrg = { ...mockOrganization, name: 'Updated Name' };
      const action = {
        type: updateOrganization.fulfilled.type,
        payload: updatedOrg,
      };
      const newState = organizationReducer(stateWithOrg, action);

      expect(newState.currentOrganization?.name).toBe('Updated Name');
    });
  });

  describe('updateMemberRole async thunk', () => {
    it('updates member role on fulfilled', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: updateMemberRole.fulfilled.type,
        payload: { memberId: 'member-1', newRole: 'admin' },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('admin');
    });

    it('does nothing if member not found', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: updateMemberRole.fulfilled.type,
        payload: { memberId: 'nonexistent', newRole: 'admin' },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('member');
    });
  });

  describe('removeMember async thunk', () => {
    it('removes member on fulfilled', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: removeMember.fulfilled.type,
        payload: 'member-1',
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(0);
    });

    it('only removes matching member', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember, { ...mockMember, id: 'member-2' }],
      };
      const action = {
        type: removeMember.fulfilled.type,
        payload: 'member-1',
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(1);
      expect(newState.members[0].id).toBe('member-2');
    });
  });
});
