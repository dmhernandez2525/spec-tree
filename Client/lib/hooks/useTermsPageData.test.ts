import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTermsPageData } from './useTermsPageData';

vi.mock('../../api/fetchData', () => ({
  fetchTermsPageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackTermsPageData: {
    title: 'Fallback Terms',
    content: 'Terms content',
  },
}));

import { fetchTermsPageData } from '../../api/fetchData';
import { fallbackTermsPageData } from '../data/fallback-content';

describe('useTermsPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchTermsPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useTermsPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns terms sections data when API succeeds', async () => {
    const mockData = {
      title: 'Terms of Service',
      content: 'Our terms...',
    };

    vi.mocked(fetchTermsPageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useTermsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.termsSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchTermsPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useTermsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.termsSections).toEqual(fallbackTermsPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchTermsPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useTermsPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.termsSections).toEqual(fallbackTermsPageData);
    consoleSpy.mockRestore();
  });
});
