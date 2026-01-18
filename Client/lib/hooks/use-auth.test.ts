import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock modules before imports
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockUseAppSelector = vi.fn();
vi.mock('./use-store', () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

import { useAuth } from './use-auth';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReset();
  });

  it('returns isLoggedIn and user from state', () => {
    mockUseAppSelector
      .mockReturnValueOnce(true) // isLoggedIn
      .mockReturnValueOnce({ id: '1', name: 'Test User' }); // user

    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(true);
    expect(result.current.user).toEqual({ id: '1', name: 'Test User' });
  });

  it('redirects to login when not logged in and no user', () => {
    mockUseAppSelector
      .mockReturnValueOnce(false) // isLoggedIn
      .mockReturnValueOnce(null); // user

    renderHook(() => useAuth());

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when logged in', () => {
    mockUseAppSelector
      .mockReturnValueOnce(true) // isLoggedIn
      .mockReturnValueOnce({ id: '1' }); // user

    renderHook(() => useAuth());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when user exists even if not logged in', () => {
    mockUseAppSelector
      .mockReturnValueOnce(false) // isLoggedIn
      .mockReturnValueOnce({ id: '1' }); // user exists

    renderHook(() => useAuth());

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not redirect when logged in even if no user', () => {
    mockUseAppSelector
      .mockReturnValueOnce(true) // isLoggedIn
      .mockReturnValueOnce(null); // no user

    renderHook(() => useAuth());

    expect(mockPush).not.toHaveBeenCalled();
  });
});
