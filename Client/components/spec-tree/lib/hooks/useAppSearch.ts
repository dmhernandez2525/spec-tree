import { useState, useCallback, useEffect } from 'react';
import { AppExtended, SearchFilters } from '@/types/app';
import { addRecentSearch, getRecentSearches } from '../utils/app-utils';

// _initialApps reserved for client-side filtering enhancement
export const useAppSearch = (_initialApps: AppExtended[]) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchQuery: '',
  });

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      addRecentSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
    setSearchFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  }, []);

  return {
    searchFilters,
    setSearchFilters,
    recentSearches,
    handleSearch,
    clearRecentSearches,
  };
};
