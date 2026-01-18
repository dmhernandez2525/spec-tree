import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authReducer, logIn, logOut, updateOrganizationRole } from './auth-slice';
import type { OrganizationRole } from '@/types/organization';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('auth-slice', () => {
  const initialState = {
    isLoggedIn: false,
    organizationRole: undefined,
    organizationId: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logIn', () => {
    it('sets isLoggedIn to true', () => {
      const newState = authReducer(initialState, logIn({}));

      expect(newState.isLoggedIn).toBe(true);
    });

    it('sets organization role when provided', () => {
      const role: OrganizationRole = 'admin';
      const newState = authReducer(
        initialState,
        logIn({ organizationRole: role })
      );

      expect(newState.isLoggedIn).toBe(true);
      expect(newState.organizationRole).toBe('admin');
    });

    it('sets organization id when provided', () => {
      const newState = authReducer(
        initialState,
        logIn({ organizationId: 'org-123' })
      );

      expect(newState.isLoggedIn).toBe(true);
      expect(newState.organizationId).toBe('org-123');
    });

    it('sets both role and organization id', () => {
      const newState = authReducer(
        initialState,
        logIn({
          organizationRole: 'member' as OrganizationRole,
          organizationId: 'org-456',
        })
      );

      expect(newState.isLoggedIn).toBe(true);
      expect(newState.organizationRole).toBe('member');
      expect(newState.organizationId).toBe('org-456');
    });
  });

  describe('logOut', () => {
    it('sets isLoggedIn to false', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'admin' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(loggedInState, logOut());

      expect(newState.isLoggedIn).toBe(false);
    });

    it('clears organization role', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'admin' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(loggedInState, logOut());

      expect(newState.organizationRole).toBeUndefined();
    });

    it('clears organization id', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'admin' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(loggedInState, logOut());

      expect(newState.organizationId).toBeUndefined();
    });

    it('resets all auth fields on logout', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'admin' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(loggedInState, logOut());

      expect(newState.isLoggedIn).toBe(false);
      expect(newState.organizationRole).toBeUndefined();
      expect(newState.organizationId).toBeUndefined();
    });
  });

  describe('updateOrganizationRole', () => {
    it('updates the organization role', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'member' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(
        loggedInState,
        updateOrganizationRole('admin' as OrganizationRole)
      );

      expect(newState.organizationRole).toBe('admin');
    });

    it('preserves other state when updating role', () => {
      const loggedInState = {
        isLoggedIn: true,
        organizationRole: 'member' as OrganizationRole,
        organizationId: 'org-123',
      };

      const newState = authReducer(
        loggedInState,
        updateOrganizationRole('owner' as OrganizationRole)
      );

      expect(newState.isLoggedIn).toBe(true);
      expect(newState.organizationId).toBe('org-123');
      expect(newState.organizationRole).toBe('owner');
    });
  });
});
