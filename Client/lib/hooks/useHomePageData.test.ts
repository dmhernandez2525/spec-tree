import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHomePageData } from './useHomePageData';

vi.mock('../../api/fetchData', () => ({
  fetchHomePageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackHomePageData: {
    title: 'Fallback Home',
    hero: { title: 'Fallback Hero' },
  },
}));

import { fetchHomePageData } from '../../api/fetchData';
import { fallbackHomePageData } from '../data/fallback-content';

describe('useHomePageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchHomePageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useHomePageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns home sections data when API succeeds', async () => {
    const mockData = {
      title: 'Home Page',
      hero: { title: 'Welcome' },
    };

    vi.mocked(fetchHomePageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useHomePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.homeSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchHomePageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useHomePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.homeSections).toEqual(fallbackHomePageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchHomePageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useHomePageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.homeSections).toEqual(fallbackHomePageData);
    consoleSpy.mockRestore();
  });

  it('calls fetchHomePageData on mount', async () => {
    vi.mocked(fetchHomePageData).mockResolvedValue({ data: null });

    renderHook(() => useHomePageData());

    await waitFor(() => {
      expect(fetchHomePageData).toHaveBeenCalledTimes(1);
    });
  });
});
