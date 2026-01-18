import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContactPageData } from './useContactPageData';

vi.mock('../../api/fetchData', () => ({
  fetchContactPageData: vi.fn(),
}));

vi.mock('../data/fallback-content', () => ({
  fallbackContactPageData: {
    title: 'Fallback Contact',
    email: 'fallback@example.com',
  },
}));

import { fetchContactPageData } from '../../api/fetchData';
import { fallbackContactPageData } from '../data/fallback-content';

describe('useContactPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchContactPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useContactPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns contact sections data when API succeeds', async () => {
    const mockData = {
      title: 'Contact Us',
      email: 'contact@example.com',
    };

    vi.mocked(fetchContactPageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useContactPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contactSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchContactPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useContactPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contactSections).toEqual(fallbackContactPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchContactPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useContactPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contactSections).toEqual(fallbackContactPageData);
    consoleSpy.mockRestore();
  });

  it('calls fetchContactPageData on mount', async () => {
    vi.mocked(fetchContactPageData).mockResolvedValue({ data: null });

    renderHook(() => useContactPageData());

    await waitFor(() => {
      expect(fetchContactPageData).toHaveBeenCalledTimes(1);
    });
  });
});
