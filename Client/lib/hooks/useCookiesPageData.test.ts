import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCookiesPageData } from './useCookiesPageData';

vi.mock('../../api/fetchData', () => ({
  fetchCookiesPageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackCookiesPageData: {
    title: 'Fallback Cookies',
    content: 'Cookie content',
  },
}));

import { fetchCookiesPageData } from '../../api/fetchData';
import { fallbackCookiesPageData } from '../data/fallback-content';

describe('useCookiesPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchCookiesPageData).mockResolvedValue({ data: null } as any);

    const { result } = renderHook(() => useCookiesPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns cookies sections data when API succeeds', async () => {
    const mockData = {
      title: 'Cookie Policy',
      content: 'Our cookie policy...',
    };

    vi.mocked(fetchCookiesPageData).mockResolvedValue({ data: mockData } as any);

    const { result } = renderHook(() => useCookiesPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cookiesSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchCookiesPageData).mockResolvedValue({ data: null } as any);

    const { result } = renderHook(() => useCookiesPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cookiesSections).toEqual(fallbackCookiesPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchCookiesPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCookiesPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.cookiesSections).toEqual(fallbackCookiesPageData);
    consoleSpy.mockRestore();
  });
});
