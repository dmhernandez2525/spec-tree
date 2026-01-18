import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResources } from './use-resources';
import type { Resource } from '@/types/resources';

describe('useResources', () => {
  const mockResources: Resource[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      description: 'Learn the basics',
      category: 'guides',
      url: 'https://example.com/guide',
    },
    {
      id: '2',
      title: 'API Documentation',
      description: 'API reference',
      category: 'documentation',
      url: 'https://example.com/api',
    },
    {
      id: '3',
      title: 'Video Tutorial',
      description: 'Watch and learn',
      category: 'tutorials',
      url: 'https://example.com/video',
    },
    {
      id: '4',
      title: 'Advanced Guide',
      description: 'Advanced topics',
      category: 'guides',
      url: 'https://example.com/advanced',
    },
  ] as Resource[];

  describe('initialization', () => {
    it('initializes with provided resources', () => {
      const { result } = renderHook(() => useResources(mockResources));

      expect(result.current.resources).toHaveLength(4);
    });

    it('initializes with empty search query', () => {
      const { result } = renderHook(() => useResources(mockResources));

      expect(result.current.searchQuery).toBe('');
    });

    it('initializes with "all" category selected', () => {
      const { result } = renderHook(() => useResources(mockResources));

      expect(result.current.selectedCategory).toBe('all');
    });
  });

  describe('search filtering', () => {
    it('filters resources by search query', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('guide');
      });

      expect(result.current.resources).toHaveLength(2);
      expect(result.current.resources[0].title).toContain('Guide');
    });

    it('search is case-insensitive', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('GUIDE');
      });

      expect(result.current.resources).toHaveLength(2);
    });

    it('returns empty array when no matches', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('nonexistent');
      });

      expect(result.current.resources).toHaveLength(0);
    });

    it('returns all resources for empty search', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(result.current.resources).toHaveLength(4);
    });
  });

  describe('category filtering', () => {
    it('filters resources by category', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSelectedCategory('guides');
      });

      expect(result.current.resources).toHaveLength(2);
      expect(result.current.resources.every((r) => r.category === 'guides')).toBe(true);
    });

    it('shows all resources for "all" category', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSelectedCategory('documentation');
      });

      expect(result.current.resources).toHaveLength(1);

      act(() => {
        result.current.setSelectedCategory('all');
      });

      expect(result.current.resources).toHaveLength(4);
    });
  });

  describe('combined filtering', () => {
    it('filters by both search and category', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('guide');
        result.current.setSelectedCategory('guides');
      });

      expect(result.current.resources).toHaveLength(2);
    });

    it('returns empty when search and category have no intersection', () => {
      const { result } = renderHook(() => useResources(mockResources));

      act(() => {
        result.current.setSearchQuery('Video');
        result.current.setSelectedCategory('guides');
      });

      expect(result.current.resources).toHaveLength(0);
    });
  });

  describe('filterResources function', () => {
    it('can filter directly without state updates', () => {
      const { result } = renderHook(() => useResources(mockResources));

      const filtered = result.current.filterResources('API', 'documentation');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('API Documentation');
    });
  });

  describe('empty initial resources', () => {
    it('handles empty initial resources', () => {
      const { result } = renderHook(() => useResources([]));

      expect(result.current.resources).toHaveLength(0);
    });
  });
});
