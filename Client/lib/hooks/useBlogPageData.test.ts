import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBlogPageData } from './useBlogPageData';

// Mock the fetchData module
vi.mock('../../api/fetchData', () => ({
  fetchBlogPageData: vi.fn(),
}));

// Mock the fallback data
vi.mock('../data/fallback-content', () => ({
  fallbackBlogPageData: {
    title: 'Fallback Blog',
    posts: [],
  },
}));

import { fetchBlogPageData } from '../../api/fetchData';
import { fallbackBlogPageData } from '../data/fallback-content';

describe('useBlogPageData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading true initially', () => {
    vi.mocked(fetchBlogPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useBlogPageData());

    expect(result.current.loading).toBe(true);
  });

  it('returns blog sections data when API succeeds', async () => {
    const mockData = {
      title: 'Blog',
      posts: [{ id: 1, title: 'Post 1' }],
    };

    vi.mocked(fetchBlogPageData).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useBlogPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blogSections).toEqual(mockData);
  });

  it('uses fallback data when API returns null', async () => {
    vi.mocked(fetchBlogPageData).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useBlogPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blogSections).toEqual(fallbackBlogPageData);
  });

  it('uses fallback data when API throws error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fetchBlogPageData).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useBlogPageData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.blogSections).toEqual(fallbackBlogPageData);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('calls fetchBlogPageData on mount', async () => {
    vi.mocked(fetchBlogPageData).mockResolvedValue({ data: null });

    renderHook(() => useBlogPageData());

    await waitFor(() => {
      expect(fetchBlogPageData).toHaveBeenCalledTimes(1);
    });
  });
});
