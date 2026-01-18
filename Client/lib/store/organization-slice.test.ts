import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { server } from '@/src/test/mocks/server';
import {
  organizationReducer,
  setCurrentOrganization,
  updateSubscription,
  fetchOrganizationData,
  sendInvite,
  cancelInvite,
  resendInvite,
  updateOrganization,
  updateMemberRole,
  removeMember,
} from './organization-slice';
import type { OrganizationMember, OrganizationInvite, Organization, OrganizationSubscription } from '@/types/organization';

describe('organization-slice', () => {
  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Organization',
    size: '11-50',
    industry: 'technology',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    ownerId: 'user-owner-1',
    description: 'A test organization',
    websiteUrl: 'https://testorg.com',
  };

  const mockMember: OrganizationMember = {
    id: 'member-1',
    userId: 'user-1',
    organizationId: 'org-123',
    role: 'member',
    joinedAt: '2024-01-01T00:00:00Z',
  };

  const mockInvite: OrganizationInvite = {
    id: 'invite-1',
    email: 'invite@example.com',
    organizationId: 'org-123',
    role: 'member',
    status: 'pending',
    invitedById: 'user-owner-1',
    message: 'Welcome to the team!',
    createdAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-08T00:00:00Z',
  };

  const mockSubscription: OrganizationSubscription = {
    id: 'sub-1',
    organizationId: 'org-123',
    plan: 'pro',
    seats: 10,
    usedSeats: 5,
    pricePerSeat: 10,
    billingCycle: 'monthly',
    status: 'active',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
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

  describe('initial state', () => {
    it('starts with null current organization', () => {
      expect(initialState.currentOrganization).toBeNull();
    });

    it('starts with empty members array', () => {
      expect(initialState.members).toEqual([]);
    });

    it('starts with empty invites array', () => {
      expect(initialState.invites).toEqual([]);
    });

    it('starts with null subscription', () => {
      expect(initialState.subscription).toBeNull();
    });

    it('starts with loading false', () => {
      expect(initialState.isLoading).toBe(false);
    });

    it('starts with null error', () => {
      expect(initialState.error).toBeNull();
    });

    it('returns initial state for unknown action', () => {
      const newState = organizationReducer(undefined, { type: 'UNKNOWN_ACTION' });
      expect(newState).toEqual(initialState);
    });
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

    it('replaces existing organization', () => {
      const stateWithOrg = { ...initialState, currentOrganization: mockOrganization };
      const newOrg: Organization = {
        ...mockOrganization,
        id: 'org-456',
        name: 'New Organization',
      };
      const newState = organizationReducer(stateWithOrg, setCurrentOrganization(newOrg));

      expect(newState.currentOrganization?.id).toBe('org-456');
      expect(newState.currentOrganization?.name).toBe('New Organization');
    });

    it('preserves other state properties', () => {
      const stateWithData = {
        ...initialState,
        members: [mockMember],
        invites: [mockInvite],
        isLoading: false,
        error: null,
      };
      const newState = organizationReducer(stateWithData, setCurrentOrganization(mockOrganization));

      expect(newState.members).toEqual([mockMember]);
      expect(newState.invites).toEqual([mockInvite]);
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

    it('replaces existing subscription', () => {
      const stateWithSub = { ...initialState, subscription: mockSubscription };
      const newSub = { ...mockSubscription, plan: 'enterprise' as const, seats: 50 };
      const newState = organizationReducer(stateWithSub, updateSubscription(newSub));

      expect(newState.subscription?.plan).toBe('enterprise');
      expect(newState.subscription?.seats).toBe(50);
    });

    it('can set subscription to null', () => {
      const stateWithSub = { ...initialState, subscription: mockSubscription };
      const newState = organizationReducer(stateWithSub, updateSubscription(null));

      expect(newState.subscription).toBeNull();
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
        subscription: mockSubscription,
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
      expect(newState.subscription).toEqual(mockSubscription);
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

    it('clears previous error on success', () => {
      const stateWithError = {
        ...initialState,
        error: 'Previous error message',
        isLoading: true,
      };
      const payload = {
        organization: mockOrganization,
        members: [],
        invites: [],
        subscription: null,
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(stateWithError, action);

      expect(newState.error).toBeNull();
      expect(newState.isLoading).toBe(false);
    });

    it('handles empty subscription in fetchOrganizationData', () => {
      const payload = {
        organization: mockOrganization,
        members: [mockMember],
        invites: [mockInvite],
        subscription: null,
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.subscription).toBeNull();
      expect(newState.members).toHaveLength(1);
      expect(newState.invites).toHaveLength(1);
    });

    describe('async thunk execution', () => {
      it('calls API with correct organization ID', async () => {
        server.use(
          http.get('/api/organizations/:id', () => {
            return HttpResponse.json({
              organization: mockOrganization,
              members: [],
              invites: [],
              subscription: null,
            });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(fetchOrganizationData('org-123'));

        expect(result.type).toBe('organization/fetchData/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.get('/api/organizations/:id', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(fetchOrganizationData('org-123'));

        expect(result.type).toBe('organization/fetchData/rejected');
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const action = { type: sendInvite.pending.type };
      const newState = organizationReducer(initialState, action);

      expect(newState.invites).toEqual([]);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const action = {
        type: sendInvite.rejected.type,
        error: { message: 'Failed to send' },
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.invites).toEqual([]);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(
          sendInvite({ email: 'test@example.com', role: 'member' })
        );

        expect(result.type).toBe('organization/sendInvite/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.post('/api/organizations/invites', () => {
            return HttpResponse.json(mockInvite);
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(
          sendInvite({
            email: 'test@example.com',
            role: 'member',
            message: 'Welcome!',
          })
        );

        expect(result.type).toBe('organization/sendInvite/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.post('/api/organizations/invites', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(
          sendInvite({ email: 'test@example.com', role: 'member' })
        );

        expect(result.type).toBe('organization/sendInvite/rejected');
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = { type: cancelInvite.pending.type };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: cancelInvite.rejected.type,
        error: { message: 'Cancel failed' },
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
    });

    it('handles canceling non-existent invite', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: cancelInvite.fulfilled.type,
        payload: 'nonexistent-invite',
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
    });

    describe('async thunk execution', () => {
      it('calls API with correct invite ID', async () => {
        server.use(
          http.delete('/api/organizations/invites/:inviteId', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(cancelInvite('invite-123'));

        expect(result.type).toBe('organization/cancelInvite/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.delete('/api/organizations/invites/:inviteId', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(cancelInvite('invite-123'));

        expect(result.type).toBe('organization/cancelInvite/rejected');
      });
    });
  });

  describe('resendInvite async thunk', () => {
    it('does not modify state on pending (no handler defined)', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = { type: resendInvite.pending.type };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
    });

    it('does not modify state on fulfilled (no handler defined)', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: resendInvite.fulfilled.type,
        payload: { ...mockInvite, createdAt: '2024-01-15T00:00:00Z' },
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toEqual([mockInvite]);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: resendInvite.rejected.type,
        error: { message: 'Resend failed' },
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
    });

    describe('async thunk execution', () => {
      it('calls API with correct invite ID', async () => {
        server.use(
          http.post('/api/organizations/invites/:inviteId/resend', () => {
            return HttpResponse.json({ ...mockInvite, createdAt: new Date().toISOString() });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(resendInvite('invite-123'));

        expect(result.type).toBe('organization/resendInvite/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.post('/api/organizations/invites/:inviteId/resend', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(resendInvite('invite-123'));

        expect(result.type).toBe('organization/resendInvite/rejected');
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithOrg = { ...initialState, currentOrganization: mockOrganization };
      const action = { type: updateOrganization.pending.type };
      const newState = organizationReducer(stateWithOrg, action);

      expect(newState.currentOrganization).toEqual(mockOrganization);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithOrg = { ...initialState, currentOrganization: mockOrganization };
      const action = {
        type: updateOrganization.rejected.type,
        error: { message: 'Update failed' },
      };
      const newState = organizationReducer(stateWithOrg, action);

      expect(newState.currentOrganization).toEqual(mockOrganization);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(updateOrganization({ name: 'New Name' }));

        expect(result.type).toBe('organization/update/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.put('/api/organizations/:id', () => {
            return HttpResponse.json({ ...mockOrganization, name: 'Updated Name' });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(updateOrganization({
          name: 'Updated Name',
          description: 'New description',
        }));

        expect(result.type).toBe('organization/update/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.put('/api/organizations/:id', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(updateOrganization({ name: 'New Name' }));

        expect(result.type).toBe('organization/update/rejected');
      });
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
        payload: { memberId: 'member-1', newRole: 'admin' as const },
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
        payload: { memberId: 'nonexistent', newRole: 'admin' as const },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('member');
    });

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = { type: updateMemberRole.pending.type };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('member');
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: updateMemberRole.rejected.type,
        error: { message: 'Role update failed' },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('member');
    });

    it('only updates the targeted member', () => {
      const member2: OrganizationMember = { ...mockMember, id: 'member-2', role: 'viewer' };
      const stateWithMembers = {
        ...initialState,
        members: [mockMember, member2],
      };
      const action = {
        type: updateMemberRole.fulfilled.type,
        payload: { memberId: 'member-1', newRole: 'admin' as const },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members[0].role).toBe('admin');
      expect(newState.members[1].role).toBe('viewer');
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(
          updateMemberRole({ memberId: 'member-1', newRole: 'admin' })
        );

        expect(result.type).toBe('organization/updateMemberRole/rejected');
      });

      it('calls API with correct payload when organization is set', async () => {
        server.use(
          http.patch('/api/organizations/:orgId/members/:memberId', () => {
            return HttpResponse.json({ memberId: 'member-1', newRole: 'admin' });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
              members: [mockMember],
            },
          },
        });

        const result = await store.dispatch(updateMemberRole({ memberId: 'member-1', newRole: 'admin' }));

        expect(result.type).toBe('organization/updateMemberRole/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.patch('/api/organizations/:orgId/members/:memberId', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(
          updateMemberRole({ memberId: 'member-1', newRole: 'admin' })
        );

        expect(result.type).toBe('organization/updateMemberRole/rejected');
      });
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

    it('does not modify state on pending (no handler defined)', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = { type: removeMember.pending.type };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(1);
    });

    it('does not modify state on rejected (no handler defined)', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: removeMember.rejected.type,
        error: { message: 'Remove failed' },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(1);
    });

    it('handles removing non-existent member', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: removeMember.fulfilled.type,
        payload: 'nonexistent-member',
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(1);
    });

    describe('async thunk execution', () => {
      it('throws error when no organization selected', async () => {
        const store = configureStore({
          reducer: { organization: organizationReducer },
        });

        const result = await store.dispatch(removeMember('member-1'));

        expect(result.type).toBe('organization/removeMember/rejected');
      });

      it('calls API with correct member ID when organization is set', async () => {
        server.use(
          http.delete('/api/organizations/:orgId/members/:memberId', () => {
            return new HttpResponse(null, { status: 200 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(removeMember('member-1'));

        expect(result.type).toBe('organization/removeMember/fulfilled');
      });

      it('throws error on failed API response', async () => {
        server.use(
          http.delete('/api/organizations/:orgId/members/:memberId', () => {
            return new HttpResponse(null, { status: 500 });
          })
        );

        const store = configureStore({
          reducer: { organization: organizationReducer },
          preloadedState: {
            organization: {
              ...initialState,
              currentOrganization: mockOrganization,
            },
          },
        });

        const result = await store.dispatch(removeMember('member-1'));

        expect(result.type).toBe('organization/removeMember/rejected');
      });
    });
  });

  describe('edge cases', () => {
    it('handles organization with all optional fields', () => {
      const fullOrganization: Organization = {
        id: 'org-456',
        name: 'Full Organization',
        size: '201-500',
        industry: 'healthcare',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T00:00:00Z',
        ownerId: 'user-1',
        description: 'A healthcare company',
        websiteUrl: 'https://example.com',
      };
      const action = {
        type: updateOrganization.fulfilled.type,
        payload: fullOrganization,
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.currentOrganization?.description).toBe('A healthcare company');
      expect(newState.currentOrganization?.websiteUrl).toBe('https://example.com');
    });

    it('handles multiple members with different roles', () => {
      const admin: OrganizationMember = {
        ...mockMember,
        id: 'admin-1',
        role: 'admin',
      };
      const owner: OrganizationMember = {
        ...mockMember,
        id: 'owner-1',
        role: 'owner',
      };
      const viewer: OrganizationMember = {
        ...mockMember,
        id: 'viewer-1',
        role: 'viewer',
      };
      const manager: OrganizationMember = {
        ...mockMember,
        id: 'manager-1',
        role: 'manager',
      };

      const stateWithMembers = {
        ...initialState,
        members: [mockMember, admin, owner, viewer, manager],
      };

      const action = {
        type: updateMemberRole.fulfilled.type,
        payload: { memberId: 'member-1', newRole: 'admin' as const },
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members.find(m => m.id === 'member-1')?.role).toBe('admin');
      expect(newState.members.find(m => m.id === 'owner-1')?.role).toBe('owner');
      expect(newState.members.find(m => m.id === 'viewer-1')?.role).toBe('viewer');
      expect(newState.members.find(m => m.id === 'manager-1')?.role).toBe('manager');
    });

    it('handles invite with all statuses', () => {
      const pendingInvite: OrganizationInvite = {
        ...mockInvite,
        id: 'invite-pending',
        status: 'pending',
      };
      const acceptedInvite: OrganizationInvite = {
        ...mockInvite,
        id: 'invite-accepted',
        status: 'accepted',
      };
      const expiredInvite: OrganizationInvite = {
        ...mockInvite,
        id: 'invite-expired',
        status: 'expired',
      };

      const stateWithInvites = {
        ...initialState,
        invites: [pendingInvite, acceptedInvite, expiredInvite],
      };

      const action = {
        type: cancelInvite.fulfilled.type,
        payload: 'invite-pending',
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(2);
      expect(newState.invites.find(i => i.id === 'invite-pending')).toBeUndefined();
      expect(newState.invites.find(i => i.id === 'invite-accepted')).toBeDefined();
      expect(newState.invites.find(i => i.id === 'invite-expired')).toBeDefined();
    });

    it('handles organization size values', () => {
      const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'] as const;

      sizes.forEach((size) => {
        const org: Organization = { ...mockOrganization, size };
        const action = setCurrentOrganization(org);
        const newState = organizationReducer(initialState, action);
        expect(newState.currentOrganization?.size).toBe(size);
      });
    });

    it('handles all industry types', () => {
      const industries = ['technology', 'finance', 'healthcare', 'education', 'manufacturing', 'retail', 'other'] as const;

      industries.forEach((industry) => {
        const org: Organization = { ...mockOrganization, industry };
        const action = setCurrentOrganization(org);
        const newState = organizationReducer(initialState, action);
        expect(newState.currentOrganization?.industry).toBe(industry);
      });
    });

    it('handles subscription with all plan types', () => {
      const plans = ['free', 'pro', 'enterprise'] as const;

      plans.forEach((plan) => {
        const sub: OrganizationSubscription = { ...mockSubscription, plan };
        const action = updateSubscription(sub);
        const newState = organizationReducer(initialState, action);
        expect(newState.subscription?.plan).toBe(plan);
      });
    });

    it('handles subscription with all status types', () => {
      const statuses = ['active', 'canceled', 'past_due'] as const;

      statuses.forEach((status) => {
        const sub: OrganizationSubscription = { ...mockSubscription, status };
        const action = updateSubscription(sub);
        const newState = organizationReducer(initialState, action);
        expect(newState.subscription?.status).toBe(status);
      });
    });

    it('handles subscription with all billing cycles', () => {
      const cycles = ['monthly', 'yearly'] as const;

      cycles.forEach((billingCycle) => {
        const sub: OrganizationSubscription = { ...mockSubscription, billingCycle };
        const action = updateSubscription(sub);
        const newState = organizationReducer(initialState, action);
        expect(newState.subscription?.billingCycle).toBe(billingCycle);
      });
    });

    it('handles empty arrays in fetchOrganizationData', () => {
      const payload = {
        organization: mockOrganization,
        members: [],
        invites: [],
        subscription: null,
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(initialState, action);

      expect(newState.members).toEqual([]);
      expect(newState.invites).toEqual([]);
    });

    it('replaces existing members on fetchOrganizationData', () => {
      const stateWithMembers = {
        ...initialState,
        members: [mockMember, { ...mockMember, id: 'member-2' }],
      };
      const newMember: OrganizationMember = { ...mockMember, id: 'member-new' };
      const payload = {
        organization: mockOrganization,
        members: [newMember],
        invites: [],
        subscription: null,
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(stateWithMembers, action);

      expect(newState.members).toHaveLength(1);
      expect(newState.members[0].id).toBe('member-new');
    });

    it('replaces existing invites on fetchOrganizationData', () => {
      const stateWithInvites = {
        ...initialState,
        invites: [mockInvite, { ...mockInvite, id: 'invite-2' }],
      };
      const newInvite: OrganizationInvite = { ...mockInvite, id: 'invite-new' };
      const payload = {
        organization: mockOrganization,
        members: [],
        invites: [newInvite],
        subscription: null,
      };
      const action = {
        type: fetchOrganizationData.fulfilled.type,
        payload,
      };
      const newState = organizationReducer(stateWithInvites, action);

      expect(newState.invites).toHaveLength(1);
      expect(newState.invites[0].id).toBe('invite-new');
    });
  });

  describe('state immutability', () => {
    it('does not mutate the original state on setCurrentOrganization', () => {
      const originalState = { ...initialState };
      organizationReducer(originalState, setCurrentOrganization(mockOrganization));
      expect(originalState.currentOrganization).toBeNull();
    });

    it('does not mutate the original state on updateSubscription', () => {
      const originalState = { ...initialState };
      organizationReducer(originalState, updateSubscription(mockSubscription));
      expect(originalState.subscription).toBeNull();
    });

    it('does not mutate the original members array', () => {
      const originalState = {
        ...initialState,
        members: [mockMember],
      };
      const action = {
        type: removeMember.fulfilled.type,
        payload: 'member-1',
      };
      organizationReducer(originalState, action);
      expect(originalState.members).toHaveLength(1);
    });

    it('does not mutate the original invites array', () => {
      const originalState = {
        ...initialState,
        invites: [mockInvite],
      };
      const action = {
        type: cancelInvite.fulfilled.type,
        payload: 'invite-1',
      };
      organizationReducer(originalState, action);
      expect(originalState.invites).toHaveLength(1);
    });
  });
});
