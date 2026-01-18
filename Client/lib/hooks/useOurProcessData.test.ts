import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOurProcessPageData } from './useOurProcessData';

vi.mock('../../api/fetchData', () => ({
  fetchOurProcessPageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackOurProcessPageData: {
    title: 'Fallback Our Process',
    steps: [],
  },
}));

import { fetchOurProcessPageData } from '../../api/fetchData';
import { fallbackOurProcessPageData } from '../data/fallback-content';

describe('useOurProcessPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchOurProcessPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useOurProcessPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns about sections data when API succeeds', async () => {
    const mockData = {
      title: 'Our Process',
      steps: [{ id: 1, title: 'Step 1' }],
    };

    vi.mocked(fetchOurProcessPageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useOurProcessPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchOurProcessPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useOurProcessPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(fallbackOurProcessPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchOurProcessPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useOurProcessPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.aboutSections).toEqual(fallbackOurProcessPageData);
    consoleSpy.mockRestore();
  });
});
