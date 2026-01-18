import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrivacyPageData } from './usePrivacyPageData';

vi.mock('../../api/fetchData', () => ({
  fetchPrivacyPageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackPrivacyPageData: {
    title: 'Fallback Privacy',
    content: 'Privacy content',
  },
}));

import { fetchPrivacyPageData } from '../../api/fetchData';
import { fallbackPrivacyPageData } from '../data/fallback-content';

describe('usePrivacyPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchPrivacyPageData).mockResolvedValue({ data: null } as any);

    const { result } = renderHook(() => usePrivacyPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns privacy sections data when API succeeds', async () => {
    const mockData = {
      title: 'Privacy Policy',
      content: 'Our privacy policy...',
    };

    vi.mocked(fetchPrivacyPageData).mockResolvedValue({ data: mockData } as any);

    const { result } = renderHook(() => usePrivacyPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.privacySections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchPrivacyPageData).mockResolvedValue({ data: null } as any);

    const { result } = renderHook(() => usePrivacyPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.privacySections).toEqual(fallbackPrivacyPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchPrivacyPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => usePrivacyPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.privacySections).toEqual(fallbackPrivacyPageData);
    consoleSpy.mockRestore();
  });
});
