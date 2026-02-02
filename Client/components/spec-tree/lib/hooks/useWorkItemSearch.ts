/**
 * Work Item Search Hook
 *
 * F1.1.20 - Search and filter
 *
 * Provides search and filter functionality for work items.
 */

import { useState, useMemo, useCallback } from 'react';

/**
 * Work item types
 */
export type SearchableWorkItemType = 'epic' | 'feature' | 'userStory' | 'task';

/**
 * Search result item
 */
export interface SearchResultItem {
  /** Unique identifier */
  id: string;
  /** Type of work item */
  type: SearchableWorkItemType;
  /** Title of the item */
  title: string;
  /** Description or details */
  description?: string;
  /** Fields that matched the search */
  matchedFields: string[];
  /** Relevance score (higher is more relevant) */
  score: number;
  /** Parent path for context */
  parentPath: string[];
  /** Original work item data */
  data: Record<string, unknown>;
}

/**
 * Filter options
 */
export interface SearchFilters {
  /** Work item types to include */
  types: SearchableWorkItemType[];
  /** Minimum search query length */
  minQueryLength?: number;
  /** Maximum results to return */
  maxResults?: number;
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Search in specific fields only */
  searchFields?: string[];
}

/**
 * Work item data for indexing
 */
export interface WorkItemIndex {
  epics: Array<{
    id: string;
    title: string;
    description?: string;
    goal?: string;
    notes?: string;
    featureIds: string[];
    [key: string]: unknown;
  }>;
  features: Record<string, {
    id: string;
    title: string;
    description?: string;
    details?: string;
    notes?: string;
    userStoryIds?: string[];
    parentEpicId?: string;
    [key: string]: unknown;
  }>;
  userStories: Record<string, {
    id: string;
    title: string;
    role?: string;
    action?: string;
    goal?: string;
    notes?: string;
    taskIds?: string[];
    parentFeatureId?: string;
    [key: string]: unknown;
  }>;
  tasks: Record<string, {
    id: string;
    title: string;
    details?: string;
    notes?: string;
    parentUserStoryId?: string;
    [key: string]: unknown;
  }>;
}

/**
 * Default search filters
 */
export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  types: ['epic', 'feature', 'userStory', 'task'],
  minQueryLength: 2,
  maxResults: 50,
  caseSensitive: false,
};

/**
 * Fields to search in by type
 */
const SEARCHABLE_FIELDS: Record<SearchableWorkItemType, string[]> = {
  epic: ['title', 'description', 'goal', 'notes'],
  feature: ['title', 'description', 'details', 'notes'],
  userStory: ['title', 'role', 'action', 'goal', 'notes'],
  task: ['title', 'details', 'notes'],
};

/**
 * Calculate match score based on field importance and match position
 */
function calculateScore(
  matchedFields: string[],
  fieldWeights: Record<string, number> = {}
): number {
  const defaultWeights: Record<string, number> = {
    title: 10,
    description: 5,
    details: 4,
    goal: 4,
    role: 3,
    action: 3,
    notes: 2,
  };

  const weights = { ...defaultWeights, ...fieldWeights };

  return matchedFields.reduce((score, field) => {
    return score + (weights[field] || 1);
  }, 0);
}

/**
 * Check if text contains query
 */
function textMatches(
  text: string | undefined | null,
  query: string,
  caseSensitive: boolean
): boolean {
  if (!text) return false;
  if (caseSensitive) {
    return text.includes(query);
  }
  return text.toLowerCase().includes(query.toLowerCase());
}

/**
 * Get parent path for a work item
 */
function getParentPath(
  itemId: string,
  type: SearchableWorkItemType,
  index: WorkItemIndex
): string[] {
  const path: string[] = [];

  if (type === 'task') {
    const task = index.tasks[itemId];
    if (task?.parentUserStoryId) {
      const story = index.userStories[task.parentUserStoryId];
      if (story) {
        path.unshift(story.title);
        if (story.parentFeatureId) {
          const feature = index.features[story.parentFeatureId];
          if (feature) {
            path.unshift(feature.title);
            if (feature.parentEpicId) {
              const epic = index.epics.find((e) => e.id === feature.parentEpicId);
              if (epic) path.unshift(epic.title);
            }
          }
        }
      }
    }
  } else if (type === 'userStory') {
    const story = index.userStories[itemId];
    if (story?.parentFeatureId) {
      const feature = index.features[story.parentFeatureId];
      if (feature) {
        path.unshift(feature.title);
        if (feature.parentEpicId) {
          const epic = index.epics.find((e) => e.id === feature.parentEpicId);
          if (epic) path.unshift(epic.title);
        }
      }
    }
  } else if (type === 'feature') {
    const feature = index.features[itemId];
    if (feature?.parentEpicId) {
      const epic = index.epics.find((e) => e.id === feature.parentEpicId);
      if (epic) path.unshift(epic.title);
    }
  }

  return path;
}

/**
 * Search work items
 */
export function searchWorkItems(
  query: string,
  index: WorkItemIndex,
  filters: SearchFilters = DEFAULT_SEARCH_FILTERS
): SearchResultItem[] {
  const {
    types,
    minQueryLength = 2,
    maxResults = 50,
    caseSensitive = false,
    searchFields,
  } = filters;

  if (query.length < minQueryLength) {
    return [];
  }

  const results: SearchResultItem[] = [];

  // Search epics
  if (types.includes('epic')) {
    for (const epic of index.epics) {
      const fields = searchFields || SEARCHABLE_FIELDS.epic;
      const matchedFields: string[] = [];

      for (const field of fields) {
        const value = epic[field];
        if (typeof value === 'string' && textMatches(value, query, caseSensitive)) {
          matchedFields.push(field);
        }
      }

      if (matchedFields.length > 0) {
        results.push({
          id: epic.id,
          type: 'epic',
          title: epic.title,
          description: epic.description,
          matchedFields,
          score: calculateScore(matchedFields),
          parentPath: [],
          data: epic,
        });
      }
    }
  }

  // Search features
  if (types.includes('feature')) {
    for (const feature of Object.values(index.features)) {
      const fields = searchFields || SEARCHABLE_FIELDS.feature;
      const matchedFields: string[] = [];

      for (const field of fields) {
        const value = feature[field];
        if (typeof value === 'string' && textMatches(value, query, caseSensitive)) {
          matchedFields.push(field);
        }
      }

      if (matchedFields.length > 0) {
        results.push({
          id: feature.id,
          type: 'feature',
          title: feature.title,
          description: feature.description,
          matchedFields,
          score: calculateScore(matchedFields),
          parentPath: getParentPath(feature.id, 'feature', index),
          data: feature,
        });
      }
    }
  }

  // Search user stories
  if (types.includes('userStory')) {
    for (const story of Object.values(index.userStories)) {
      const fields = searchFields || SEARCHABLE_FIELDS.userStory;
      const matchedFields: string[] = [];

      for (const field of fields) {
        const value = story[field];
        if (typeof value === 'string' && textMatches(value, query, caseSensitive)) {
          matchedFields.push(field);
        }
      }

      if (matchedFields.length > 0) {
        results.push({
          id: story.id,
          type: 'userStory',
          title: story.title,
          description: story.goal,
          matchedFields,
          score: calculateScore(matchedFields),
          parentPath: getParentPath(story.id, 'userStory', index),
          data: story,
        });
      }
    }
  }

  // Search tasks
  if (types.includes('task')) {
    for (const task of Object.values(index.tasks)) {
      const fields = searchFields || SEARCHABLE_FIELDS.task;
      const matchedFields: string[] = [];

      for (const field of fields) {
        const value = task[field];
        if (typeof value === 'string' && textMatches(value, query, caseSensitive)) {
          matchedFields.push(field);
        }
      }

      if (matchedFields.length > 0) {
        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          description: task.details,
          matchedFields,
          score: calculateScore(matchedFields),
          parentPath: getParentPath(task.id, 'task', index),
          data: task,
        });
      }
    }
  }

  // Sort by score (descending) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Options for useWorkItemSearch hook
 */
export interface UseWorkItemSearchOptions {
  /** Work item index */
  index: WorkItemIndex;
  /** Initial filters */
  initialFilters?: Partial<SearchFilters>;
  /** Debounce delay in ms */
  debounceMs?: number;
}

/**
 * Return type for useWorkItemSearch hook
 */
export interface UseWorkItemSearchReturn {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Current filters */
  filters: SearchFilters;
  /** Update filters */
  setFilters: (filters: Partial<SearchFilters>) => void;
  /** Search results */
  results: SearchResultItem[];
  /** Whether search is active (has query) */
  isSearching: boolean;
  /** Clear search and reset */
  clear: () => void;
  /** Toggle a type filter */
  toggleType: (type: SearchableWorkItemType) => void;
  /** Set all type filters */
  setTypes: (types: SearchableWorkItemType[]) => void;
}

/**
 * Hook for searching work items
 */
export function useWorkItemSearch(
  options: UseWorkItemSearchOptions
): UseWorkItemSearchReturn {
  const { index, initialFilters } = options;

  const [query, setQuery] = useState('');
  const [filters, setFiltersState] = useState<SearchFilters>({
    ...DEFAULT_SEARCH_FILTERS,
    ...initialFilters,
  });

  const results = useMemo(
    () => searchWorkItems(query, index, filters),
    [query, index, filters]
  );

  const isSearching = query.length >= (filters.minQueryLength || 2);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  const toggleType = useCallback((type: SearchableWorkItemType) => {
    setFiltersState((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types };
    });
  }, []);

  const setTypes = useCallback((types: SearchableWorkItemType[]) => {
    setFiltersState((prev) => ({ ...prev, types }));
  }, []);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isSearching,
    clear,
    toggleType,
    setTypes,
  };
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(
  text: string,
  query: string,
  caseSensitive: boolean = false
): { text: string; isHighlight: boolean }[] {
  if (!query || !text) {
    return [{ text, isHighlight: false }];
  }

  const searchQuery = caseSensitive ? query : query.toLowerCase();
  const searchText = caseSensitive ? text : text.toLowerCase();

  const parts: { text: string; isHighlight: boolean }[] = [];
  let lastIndex = 0;

  let index = searchText.indexOf(searchQuery);
  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, index),
        isHighlight: false,
      });
    }

    // Add matched text
    parts.push({
      text: text.substring(index, index + query.length),
      isHighlight: true,
    });

    lastIndex = index + query.length;
    index = searchText.indexOf(searchQuery, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isHighlight: false,
    });
  }

  return parts.length > 0 ? parts : [{ text, isHighlight: false }];
}

export default useWorkItemSearch;
