// F10.1 - AI Prompt Marketplace
// Provides prompt template management, filtering, search, and rating capabilities
// for the SpecTree prompt marketplace.

export type PromptCategory = 'specification' | 'generation' | 'review' | 'export';

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: PromptCategory;
  prompt: string;
  author: string;
  rating: number;
  usageCount: number;
  tags: string[];
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilter {
  category?: PromptCategory;
  search?: string;
  minRating?: number;
  tags?: string[];
  sortBy: 'popular' | 'recent' | 'rating';
}

/**
 * Filters and sorts an array of PromptTemplates based on the given MarketplaceFilter.
 * Applies category, minRating, tags, and search filters, then sorts by the specified criteria.
 */
export function filterPrompts(
  prompts: PromptTemplate[],
  filter: MarketplaceFilter
): PromptTemplate[] {
  let result = [...prompts];

  if (filter.category) {
    result = result.filter((p) => p.category === filter.category);
  }

  if (filter.minRating !== undefined) {
    result = result.filter((p) => p.rating >= filter.minRating!);
  }

  if (filter.tags && filter.tags.length > 0) {
    const filterTags = filter.tags.map((t) => t.toLowerCase());
    result = result.filter((p) =>
      filterTags.some((ft) => p.tags.map((t) => t.toLowerCase()).includes(ft))
    );
  }

  if (filter.search) {
    result = searchPrompts(result, filter.search);
  }

  const sortHandlers: Record<
    MarketplaceFilter['sortBy'],
    (a: PromptTemplate, b: PromptTemplate) => number
  > = {
    popular: (a, b) => b.usageCount - a.usageCount,
    recent: (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    rating: (a, b) => b.rating - a.rating,
  };

  result.sort(sortHandlers[filter.sortBy]);

  return result;
}

/**
 * Searches prompts by matching a query string against title, description, and tags.
 * Case insensitive matching.
 */
export function searchPrompts(
  prompts: PromptTemplate[],
  query: string
): PromptTemplate[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [...prompts];

  return prompts.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(lowerQuery);
    const descMatch = p.description.toLowerCase().includes(lowerQuery);
    const tagMatch = p.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    return titleMatch || descMatch || tagMatch;
  });
}

/**
 * Calculates a new weighted average rating given the current rating,
 * the number of ratings so far, and the new rating value.
 */
export function ratePrompt(
  currentRating: number,
  currentCount: number,
  newRating: number
): { rating: number; count: number } {
  if (currentCount <= 0) {
    return { rating: newRating, count: 1 };
  }

  const totalRating = currentRating * currentCount + newRating;
  const newCount = currentCount + 1;
  const newAverage = totalRating / newCount;

  return {
    rating: Math.round(newAverage * 100) / 100,
    count: newCount,
  };
}

/**
 * Replaces {{variable}} placeholders in a prompt string with the provided variable values.
 * If a variable is not found in the map, the placeholder is left as-is.
 */
export function formatPromptForUse(
  template: PromptTemplate,
  variables: Record<string, string>
): string {
  let result = template.prompt;

  Object.keys(variables).forEach((key) => {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(variables[key]);
  });

  return result;
}

/**
 * Validates a PromptTemplate for required fields and correct value ranges.
 * Returns an array of error messages (empty if the template is valid).
 */
export function validatePromptTemplate(
  template: Partial<PromptTemplate>
): string[] {
  const errors: string[] = [];

  if (!template.title || template.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!template.description || template.description.trim() === '') {
    errors.push('Description is required');
  }

  if (!template.prompt || template.prompt.trim() === '') {
    errors.push('Prompt content is required');
  }

  if (!template.category) {
    errors.push('Category is required');
  } else {
    const validCategories: PromptCategory[] = [
      'specification',
      'generation',
      'review',
      'export',
    ];
    if (!validCategories.includes(template.category)) {
      errors.push('Invalid category');
    }
  }

  if (!template.author || template.author.trim() === '') {
    errors.push('Author is required');
  }

  if (template.rating !== undefined && (template.rating < 0 || template.rating > 5)) {
    errors.push('Rating must be between 0 and 5');
  }

  if (!template.version || template.version.trim() === '') {
    errors.push('Version is required');
  }

  return errors;
}

/**
 * Returns the most popular tags from a collection of prompts, sorted by frequency.
 * Optionally limited to a maximum number of results.
 */
export function getPopularTags(
  prompts: PromptTemplate[],
  limit?: number
): { tag: string; count: number }[] {
  const tagCounts = new Map<string, number>();

  prompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => {
      const lower = tag.toLowerCase();
      tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
    });
  });

  const sorted = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  if (limit !== undefined && limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}
