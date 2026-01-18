import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { userReducer, setUser, setToken, clearUser, loginUser, refreshUser, updateUserProfile } from './user-slice';
import type { UserAttributes } from '@/types/user';
import * as fetchDataModule from '@/api/fetchData';

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
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock process.env
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    NEXT_PUBLIC_STRAPI_API_URL: 'http://localhost:1337',
  },
});

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
    mockFetch.mockReset();
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

  describe('loginUser', () => {
    it('returns false when response has no jwt', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await loginUser(store.dispatch, {
        identifier: 'test@example.com',
        password: 'wrong-password',
      });

      expect(result).toBe(false);
    });

    it('returns false when data is null', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(null),
      });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await loginUser(store.dispatch, {
        identifier: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBe(false);
    });

    it('returns false when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await loginUser(store.dispatch, {
        identifier: 'test@example.com',
        password: 'password123',
      });

      expect(result).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('successfully refreshes user when token exists', async () => {
      localStorageMock.getItem.mockReturnValueOnce('existing-token');
      vi.mocked(fetchDataModule.refreshUser).mockResolvedValueOnce(mockUser);
      vi.mocked(fetchDataModule.getUserRole).mockResolvedValueOnce({ role: 'user' });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await refreshUser(store.dispatch);

      expect(result).toEqual(mockUser);
      expect(store.getState().user.user).toEqual(mockUser);
    });

    it('returns false when refreshUser API returns null', async () => {
      localStorageMock.getItem.mockReturnValueOnce('existing-token');
      vi.mocked(fetchDataModule.refreshUser).mockResolvedValueOnce(null as unknown as UserAttributes);
      vi.mocked(fetchDataModule.getUserRole).mockResolvedValueOnce({ role: 'user' });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await refreshUser(store.dispatch);

      expect(result).toBe(false);
    });

    it('returns false when an error occurs', async () => {
      localStorageMock.getItem.mockReturnValueOnce('existing-token');
      vi.mocked(fetchDataModule.refreshUser).mockRejectedValueOnce(new Error('API error'));

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await refreshUser(store.dispatch);

      expect(result).toBe(false);
    });
  });

  describe('updateUserProfile thunk', () => {
    it('handles fulfilled state', () => {
      const action = {
        type: updateUserProfile.fulfilled.type,
        payload: mockUser,
      };

      const newState = userReducer(initialState, action);

      // Fulfilled handler is a no-op, so state should be unchanged
      expect(newState).toEqual(initialState);
    });

    it('handles rejected state', () => {
      const action = {
        type: updateUserProfile.rejected.type,
        error: { message: 'Update failed' },
      };

      const newState = userReducer(initialState, action);

      // Rejected handler is a no-op, so state should be unchanged
      expect(newState).toEqual(initialState);
    });

    it('calls updateUserInfo and refreshUser on dispatch', async () => {
      vi.mocked(fetchDataModule.updateUserInfo).mockResolvedValueOnce(undefined as unknown as ReturnType<typeof fetchDataModule.updateUserInfo>);
      localStorageMock.getItem.mockReturnValueOnce('existing-token');
      vi.mocked(fetchDataModule.refreshUser).mockResolvedValueOnce(mockUser);
      vi.mocked(fetchDataModule.getUserRole).mockResolvedValueOnce({ role: 'user' });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      await store.dispatch(
        updateUserProfile({
          userId: 1,
          newUserData: { username: 'newusername' },
          posUserId: null,
        })
      );

      expect(fetchDataModule.updateUserInfo).toHaveBeenCalledWith({
        userId: '1',
        data: { username: 'newusername' },
      });
    });

    it('updates state with refreshed user data after profile update', async () => {
      const updatedUser = { ...mockUser, username: 'updateduser' };
      vi.mocked(fetchDataModule.updateUserInfo).mockResolvedValueOnce(undefined as unknown as ReturnType<typeof fetchDataModule.updateUserInfo>);
      localStorageMock.getItem.mockReturnValueOnce('existing-token');
      vi.mocked(fetchDataModule.refreshUser).mockResolvedValueOnce(updatedUser);
      vi.mocked(fetchDataModule.getUserRole).mockResolvedValueOnce({ role: 'user' });

      const store = configureStore({
        reducer: { user: userReducer },
      });

      const result = await store.dispatch(
        updateUserProfile({
          userId: 1,
          newUserData: { username: 'updateduser' },
          posUserId: null,
        })
      );

      expect(result.payload).toEqual(updatedUser);
      expect(store.getState().user.user).toEqual(updatedUser);
    });
  });
});
