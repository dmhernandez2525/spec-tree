/**
 * Tests for useWorkItemSearch hook
 *
 * F1.1.20 - Search and filter
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useWorkItemSearch,
  searchWorkItems,
  highlightMatch,
  WorkItemIndex,
  DEFAULT_SEARCH_FILTERS,
} from './useWorkItemSearch';

// Sample test data
const testIndex: WorkItemIndex = {
  epics: [
    {
      id: 'epic-1',
      title: 'User Authentication',
      description: 'Implement user authentication system',
      goal: 'Secure user access',
      notes: 'High priority',
      featureIds: ['feature-1'],
    },
    {
      id: 'epic-2',
      title: 'Dashboard',
      description: 'Create analytics dashboard',
      goal: 'Data visualization',
      notes: '',
      featureIds: ['feature-2'],
    },
  ],
  features: {
    'feature-1': {
      id: 'feature-1',
      title: 'Login Form',
      description: 'Create login form with validation',
      details: 'Include email and password fields',
      notes: '',
      userStoryIds: ['story-1'],
      parentEpicId: 'epic-1',
    },
    'feature-2': {
      id: 'feature-2',
      title: 'Charts',
      description: 'Display data in charts',
      details: 'Support bar, line, and pie charts',
      notes: '',
      userStoryIds: ['story-2'],
      parentEpicId: 'epic-2',
    },
  },
  userStories: {
    'story-1': {
      id: 'story-1',
      title: 'User can login',
      role: 'user',
      action: 'enter credentials',
      goal: 'access my account',
      notes: 'Must support SSO',
      taskIds: ['task-1'],
      parentFeatureId: 'feature-1',
    },
    'story-2': {
      id: 'story-2',
      title: 'View sales chart',
      role: 'analyst',
      action: 'view charts',
      goal: 'analyze sales data',
      notes: '',
      taskIds: ['task-2'],
      parentFeatureId: 'feature-2',
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Implement login API',
      details: 'Create REST endpoint for authentication',
      notes: '',
      parentUserStoryId: 'story-1',
    },
    'task-2': {
      id: 'task-2',
      title: 'Create chart component',
      details: 'Build reusable chart component',
      notes: 'Use D3.js or Chart.js',
      parentUserStoryId: 'story-2',
    },
  },
};

describe('searchWorkItems', () => {
  it('returns empty array for short queries', () => {
    const results = searchWorkItems('a', testIndex);
    expect(results).toEqual([]);
  });

  it('finds epics by title', () => {
    const results = searchWorkItems('Authentication', testIndex);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.id === 'epic-1')).toBe(true);
  });

  it('finds features by description', () => {
    const results = searchWorkItems('validation', testIndex);
    expect(results.some((r) => r.id === 'feature-1')).toBe(true);
  });

  it('finds user stories by role', () => {
    const results = searchWorkItems('analyst', testIndex);
    expect(results.some((r) => r.id === 'story-2')).toBe(true);
  });

  it('finds tasks by title', () => {
    const results = searchWorkItems('API', testIndex);
    expect(results.some((r) => r.id === 'task-1')).toBe(true);
  });

  it('filters by type', () => {
    const results = searchWorkItems('chart', testIndex, {
      ...DEFAULT_SEARCH_FILTERS,
      types: ['epic'],
    });
    // Should not find features or tasks with "chart"
    expect(results.every((r) => r.type === 'epic')).toBe(true);
  });

  it('is case insensitive by default', () => {
    const lower = searchWorkItems('login', testIndex);
    const upper = searchWorkItems('LOGIN', testIndex);
    expect(lower.length).toBe(upper.length);
  });

  it('respects case sensitivity option', () => {
    // "SSO" only appears in uppercase in story-1 notes
    // Searching for "sso" (lowercase) case-sensitively should find nothing
    const insensitive = searchWorkItems('sso', testIndex, {
      ...DEFAULT_SEARCH_FILTERS,
      caseSensitive: false,
    });
    const sensitive = searchWorkItems('sso', testIndex, {
      ...DEFAULT_SEARCH_FILTERS,
      caseSensitive: true,
    });
    // Case-insensitive should find "SSO" but case-sensitive with lowercase won't
    expect(insensitive.length).toBe(1);
    expect(sensitive.length).toBe(0);
  });

  it('limits results', () => {
    const results = searchWorkItems('a', testIndex, {
      ...DEFAULT_SEARCH_FILTERS,
      minQueryLength: 1,
      maxResults: 2,
    });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('includes parent path', () => {
    const results = searchWorkItems('API', testIndex);
    const taskResult = results.find((r) => r.id === 'task-1');
    expect(taskResult?.parentPath).toContain('User Authentication');
    expect(taskResult?.parentPath).toContain('Login Form');
    expect(taskResult?.parentPath).toContain('User can login');
  });

  it('sorts by score (title matches first)', () => {
    // "login" appears in epic title and in various fields
    const results = searchWorkItems('login', testIndex);
    // Items with title matches should score higher
    const titleMatch = results.find((r) => r.matchedFields.includes('title'));
    expect(titleMatch).toBeDefined();
    expect(results[0].matchedFields).toContain('title');
  });
});

describe('useWorkItemSearch', () => {
  it('starts with empty query and results', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it('updates query and finds results', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    act(() => {
      result.current.setQuery('Authentication');
    });

    expect(result.current.query).toBe('Authentication');
    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.isSearching).toBe(true);
  });

  it('clears search', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    act(() => {
      result.current.setQuery('login');
    });
    expect(result.current.results.length).toBeGreaterThan(0);

    act(() => {
      result.current.clear();
    });
    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual([]);
  });

  it('toggles type filter', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    // Initially all types enabled
    expect(result.current.filters.types).toContain('epic');

    act(() => {
      result.current.toggleType('epic');
    });

    expect(result.current.filters.types).not.toContain('epic');

    act(() => {
      result.current.toggleType('epic');
    });

    expect(result.current.filters.types).toContain('epic');
  });

  it('sets type filters', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    act(() => {
      result.current.setTypes(['task']);
    });

    expect(result.current.filters.types).toEqual(['task']);
  });

  it('uses initial filters', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({
        index: testIndex,
        initialFilters: { types: ['epic', 'feature'] },
      })
    );

    expect(result.current.filters.types).toEqual(['epic', 'feature']);
  });

  it('updates filters with setFilters', () => {
    const { result } = renderHook(() =>
      useWorkItemSearch({ index: testIndex })
    );

    act(() => {
      result.current.setFilters({ caseSensitive: true });
    });

    expect(result.current.filters.caseSensitive).toBe(true);
  });
});

describe('highlightMatch', () => {
  it('returns single non-highlight part when no match', () => {
    const result = highlightMatch('Hello World', 'xyz');
    expect(result).toEqual([{ text: 'Hello World', isHighlight: false }]);
  });

  it('highlights matching text', () => {
    const result = highlightMatch('Hello World', 'World');
    expect(result).toEqual([
      { text: 'Hello ', isHighlight: false },
      { text: 'World', isHighlight: true },
    ]);
  });

  it('highlights multiple matches', () => {
    const result = highlightMatch('the cat and the dog', 'the');
    expect(result).toEqual([
      { text: 'the', isHighlight: true },
      { text: ' cat and ', isHighlight: false },
      { text: 'the', isHighlight: true },
      { text: ' dog', isHighlight: false },
    ]);
  });

  it('handles case insensitive matching', () => {
    const result = highlightMatch('Hello WORLD', 'world', false);
    expect(result.some((p) => p.isHighlight && p.text === 'WORLD')).toBe(true);
  });

  it('handles case sensitive matching', () => {
    const result = highlightMatch('Hello WORLD', 'world', true);
    // Should not find any highlights since case doesn't match
    expect(result.every((p) => !p.isHighlight)).toBe(true);
  });

  it('handles empty query', () => {
    const result = highlightMatch('Hello', '');
    expect(result).toEqual([{ text: 'Hello', isHighlight: false }]);
  });

  it('handles empty text', () => {
    const result = highlightMatch('', 'query');
    expect(result).toEqual([{ text: '', isHighlight: false }]);
  });

  it('highlights at start of string', () => {
    const result = highlightMatch('Hello World', 'Hello');
    expect(result[0]).toEqual({ text: 'Hello', isHighlight: true });
  });

  it('highlights at end of string', () => {
    const result = highlightMatch('Hello World', 'World');
    expect(result[result.length - 1]).toEqual({ text: 'World', isHighlight: true });
  });
});
