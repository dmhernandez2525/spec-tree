import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppSearch } from './useAppSearch';
import * as appUtils from '../utils/app-utils';

// Mock app-utils
vi.mock('../utils/app-utils', () => ({
  addRecentSearch: vi.fn(),
  getRecentSearches: vi.fn(() => []),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useAppSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty search filters', () => {
    const { result } = renderHook(() => useAppSearch([]));

    expect(result.current.searchFilters).toEqual({
      searchQuery: '',
    });
  });

  it('initializes recent searches from getRecentSearches', () => {
    vi.mocked(appUtils.getRecentSearches).mockReturnValue(['search1', 'search2']);

    const { result } = renderHook(() => useAppSearch([]));

    expect(result.current.recentSearches).toEqual(['search1', 'search2']);
  });

  it('handleSearch updates search query', () => {
    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.handleSearch('test query');
    });

    expect(result.current.searchFilters.searchQuery).toBe('test query');
  });

  it('handleSearch adds to recent searches when query is not empty', () => {
    vi.mocked(appUtils.getRecentSearches).mockReturnValue(['test query']);

    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.handleSearch('test query');
    });

    expect(appUtils.addRecentSearch).toHaveBeenCalledWith('test query');
    expect(appUtils.getRecentSearches).toHaveBeenCalled();
  });

  it('handleSearch trims whitespace from query', () => {
    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.handleSearch('  trimmed query  ');
    });

    expect(appUtils.addRecentSearch).toHaveBeenCalledWith('trimmed query');
  });

  it('handleSearch does not add empty query to recent searches', () => {
    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.handleSearch('   ');
    });

    expect(appUtils.addRecentSearch).not.toHaveBeenCalled();
  });

  it('clearRecentSearches clears recent searches state', () => {
    vi.mocked(appUtils.getRecentSearches).mockReturnValue(['search1', 'search2']);

    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.clearRecentSearches();
    });

    // After clearing, recent searches should be empty
    expect(result.current.recentSearches).toEqual([]);
  });

  it('setSearchFilters updates filters', () => {
    const { result } = renderHook(() => useAppSearch([]));

    act(() => {
      result.current.setSearchFilters({ searchQuery: 'new query' });
    });

    expect(result.current.searchFilters.searchQuery).toBe('new query');
  });

  it('returns stable callback references', () => {
    const { result, rerender } = renderHook(() => useAppSearch([]));

    const initialHandleSearch = result.current.handleSearch;
    const initialClearRecentSearches = result.current.clearRecentSearches;

    rerender();

    expect(result.current.handleSearch).toBe(initialHandleSearch);
    expect(result.current.clearRecentSearches).toBe(initialClearRecentSearches);
  });
});
