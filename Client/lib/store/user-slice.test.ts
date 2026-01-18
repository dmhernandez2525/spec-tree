import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userReducer, setUser, setToken, clearUser } from './user-slice';
import type { UserAttributes } from '@/types/user';

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

// Mock fetch
global.fetch = vi.fn();

// Mock the API
vi.mock('@/api/fetchData', () => ({
  refreshUser: vi.fn(),
  updateUserInfo: vi.fn(),
  getUserRole: vi.fn(),
}));

describe('user-slice', () => {
  const mockUser: UserAttributes = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    provider: 'local',
    confirmed: true,
    blocked: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const initialState = {
    user: null,
    token: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setUser', () => {
    it('sets user data', () => {
      const newState = userReducer(initialState, setUser(mockUser));

      expect(newState.user).toEqual(mockUser);
    });

    it('can set user to null', () => {
      const stateWithUser = { user: mockUser, token: 'token123' };
      const newState = userReducer(stateWithUser, setUser(null));

      expect(newState.user).toBeNull();
    });
  });

  describe('setToken', () => {
    it('sets token', () => {
      const newState = userReducer(initialState, setToken('jwt-token-123'));

      expect(newState.token).toBe('jwt-token-123');
    });

    it('can set token to null', () => {
      const stateWithToken = { user: null, token: 'existing-token' };
      const newState = userReducer(stateWithToken, setToken(null));

      expect(newState.token).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('clears user to null', () => {
      const stateWithUser = { user: mockUser, token: 'token123' };
      const newState = userReducer(stateWithUser, clearUser());

      expect(newState.user).toBeNull();
    });

    it('clears token to null', () => {
      const stateWithUser = { user: mockUser, token: 'token123' };
      const newState = userReducer(stateWithUser, clearUser());

      expect(newState.token).toBeNull();
    });

    it('clears both user and token in one action', () => {
      const stateWithUser = { user: mockUser, token: 'token123' };
      const newState = userReducer(stateWithUser, clearUser());

      expect(newState.user).toBeNull();
      expect(newState.token).toBeNull();
    });
  });

  describe('initial state', () => {
    it('starts with null user', () => {
      expect(initialState.user).toBeNull();
    });

    it('starts with null token', () => {
      expect(initialState.token).toBeNull();
    });
  });

  describe('state immutability', () => {
    it('does not mutate original state when setting user', () => {
      const originalState = { ...initialState };
      userReducer(initialState, setUser(mockUser));

      expect(initialState).toEqual(originalState);
    });

    it('does not mutate original state when clearing user', () => {
      const stateWithUser = { user: mockUser, token: 'token' };
      const originalState = { ...stateWithUser };
      userReducer(stateWithUser, clearUser());

      expect(stateWithUser).toEqual(originalState);
    });
  });
});
