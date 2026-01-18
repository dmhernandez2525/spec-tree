import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAboutPageData } from './useAboutPageData';

// Mock the fetchData module
vi.mock('../../api/fetchData', () => ({
  fetchAboutPageData: vi.fn(),
}));

// Mock the fallback data
vi.mock('../data/fallback-content', () => ({
  fallbackAboutPageData: {
    title: 'Fallback About',
    description: 'Fallback description',
  },
}));

import { fetchAboutPageData } from '../../api/fetchData';
import { fallbackAboutPageData } from '../data/fallback-content';

describe('useAboutPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchAboutPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAboutPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns about sections data when API succeeds', async () => {
    const mockData = {
      title: 'About Us',
      description: 'About our company',
    };

    vi.mocked(fetchAboutPageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useAboutPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchAboutPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useAboutPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(fallbackAboutPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchAboutPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useAboutPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(fallbackAboutPageData);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('calls fetchAboutPageData on mount', async () => {
    vi.mocked(fetchAboutPageData).mockResolvedValue({ data: null });

    renderHook(() => useAboutPageData());

    await waitFor(() => {
      expect(fetchAboutPageData).toHaveBeenCalledTimes(1);
    });
  });

  it('sets loading to false after fetch completes', async () => {
    vi.mocked(fetchAboutPageData).mockResolvedValue({
      data: { title: 'Test' },
    });

    const { result } = renderHook(() => useAboutPageData());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
