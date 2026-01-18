import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock modules before imports
const mockReplace = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('../../utils/protectedRoutes', () => ({
  default: ['/dashboard', '/settings', '/profile'],
}));

const mockUseAppSelector = vi.fn();
vi.mock('../hooks/use-store', () => ({
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

import useAuthCheck from './useAuthCheck';

describe('useAuthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReset();
  });

  it('redirects to login when on protected route without token', () => {
    mockUseAppSelector.mockReturnValue(null); // no token

    renderHook(() => useAuthCheck());

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('does not redirect when token exists', () => {
    mockUseAppSelector.mockReturnValue('valid-token');

    renderHook(() => useAuthCheck());

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('returns undefined (no return value)', () => {
    mockUseAppSelector.mockReturnValue('valid-token');

    const { result } = renderHook(() => useAuthCheck());

    expect(result.current).toBeUndefined();
  });
});
