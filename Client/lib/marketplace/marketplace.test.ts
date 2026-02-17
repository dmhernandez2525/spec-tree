import { describe, it, expect } from 'vitest';
import {
  filterPrompts,
  searchPrompts,
  ratePrompt,
  formatPromptForUse,
  validatePromptTemplate,
  getPopularTags,
  PromptTemplate,
  MarketplaceFilter,
} from './prompt-store';

// Helper to create test prompt templates
function createTemplate(overrides: Partial<PromptTemplate> = {}): PromptTemplate {
  return {
    id: 'test-1',
    title: 'Test Prompt',
    description: 'A test prompt template',
    category: 'specification',
    prompt: 'Generate a specification for {{project}}',
    author: 'test-author',
    rating: 4.0,
    usageCount: 100,
    tags: ['testing', 'spec'],
    version: '1.0.0',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    ...overrides,
  };
}

const samplePrompts: PromptTemplate[] = [
  createTemplate({
    id: '1',
    title: 'Spec Generator',
    category: 'specification',
    rating: 4.5,
    usageCount: 500,
    tags: ['spec', 'generator'],
    createdAt: '2024-01-10T00:00:00Z',
  }),
  createTemplate({
    id: '2',
    title: 'Code Review Helper',
    category: 'review',
    rating: 3.8,
    usageCount: 200,
    tags: ['review', 'quality'],
    createdAt: '2024-02-15T00:00:00Z',
  }),
  createTemplate({
    id: '3',
    title: 'Export Formatter',
    category: 'export',
    rating: 4.2,
    usageCount: 350,
    tags: ['export', 'format'],
    createdAt: '2024-03-01T00:00:00Z',
  }),
  createTemplate({
    id: '4',
    title: 'Generation Assistant',
    category: 'generation',
    rating: 4.9,
    usageCount: 800,
    tags: ['generation', 'ai', 'spec'],
    createdAt: '2024-01-20T00:00:00Z',
  }),
  createTemplate({
    id: '5',
    title: 'Quick Spec Template',
    category: 'specification',
    rating: 2.5,
    usageCount: 50,
    tags: ['spec', 'quick'],
    createdAt: '2024-04-01T00:00:00Z',
  }),
];

describe('filterPrompts', () => {
  it('filters by category', () => {
    const filter: MarketplaceFilter = {
      category: 'specification',
      sortBy: 'popular',
    };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(2);
    result.forEach((p) => {
      expect(p.category).toBe('specification');
    });
  });

  it('filters by minRating', () => {
    const filter: MarketplaceFilter = { minRating: 4.0, sortBy: 'rating' };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(3);
    result.forEach((p) => {
      expect(p.rating).toBeGreaterThanOrEqual(4.0);
    });
  });

  it('filters by tags', () => {
    const filter: MarketplaceFilter = {
      tags: ['spec'],
      sortBy: 'popular',
    };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(3);
  });

  it('sorts by popular (usageCount descending)', () => {
    const filter: MarketplaceFilter = { sortBy: 'popular' };
    const result = filterPrompts(samplePrompts, filter);

    expect(result[0].id).toBe('4'); // 800 uses
    expect(result[1].id).toBe('1'); // 500 uses
    expect(result[2].id).toBe('3'); // 350 uses
  });

  it('sorts by recent (createdAt descending)', () => {
    const filter: MarketplaceFilter = { sortBy: 'recent' };
    const result = filterPrompts(samplePrompts, filter);

    expect(result[0].id).toBe('5'); // April
    expect(result[1].id).toBe('3'); // March
    expect(result[2].id).toBe('2'); // February
  });

  it('sorts by rating (descending)', () => {
    const filter: MarketplaceFilter = { sortBy: 'rating' };
    const result = filterPrompts(samplePrompts, filter);

    expect(result[0].id).toBe('4'); // 4.9
    expect(result[1].id).toBe('1'); // 4.5
    expect(result[2].id).toBe('3'); // 4.2
  });

  it('applies multiple filters together', () => {
    const filter: MarketplaceFilter = {
      category: 'specification',
      minRating: 4.0,
      sortBy: 'rating',
    };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array when no prompts match', () => {
    const filter: MarketplaceFilter = {
      category: 'export',
      minRating: 5.0,
      sortBy: 'popular',
    };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(0);
  });

  it('returns all prompts when no filters are applied', () => {
    const filter: MarketplaceFilter = { sortBy: 'popular' };
    const result = filterPrompts(samplePrompts, filter);

    expect(result).toHaveLength(samplePrompts.length);
  });
});

describe('searchPrompts', () => {
  it('finds prompts by title match', () => {
    const result = searchPrompts(samplePrompts, 'Spec Generator');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('finds prompts by description match', () => {
    const result = searchPrompts(samplePrompts, 'test prompt');

    expect(result.length).toBeGreaterThan(0);
  });

  it('finds prompts by tag match', () => {
    const result = searchPrompts(samplePrompts, 'quality');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('performs case insensitive search', () => {
    const result = searchPrompts(samplePrompts, 'SPEC GENERATOR');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array when no match is found', () => {
    const result = searchPrompts(samplePrompts, 'nonexistent-xyz-query');

    expect(result).toHaveLength(0);
  });

  it('returns all prompts for empty query', () => {
    const result = searchPrompts(samplePrompts, '');

    expect(result).toHaveLength(samplePrompts.length);
  });

  it('matches partial strings', () => {
    const result = searchPrompts(samplePrompts, 'Review');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('ratePrompt', () => {
  it('calculates weighted average correctly', () => {
    const result = ratePrompt(4.0, 10, 5.0);

    expect(result.rating).toBeCloseTo(4.09, 1);
    expect(result.count).toBe(11);
  });

  it('handles first rating (count of 0)', () => {
    const result = ratePrompt(0, 0, 4.5);

    expect(result.rating).toBe(4.5);
    expect(result.count).toBe(1);
  });

  it('calculates correctly with large count', () => {
    const result = ratePrompt(4.5, 1000, 1.0);

    expect(result.rating).toBeCloseTo(4.5, 0);
    expect(result.count).toBe(1001);
  });

  it('returns a rating with at most 2 decimal places', () => {
    const result = ratePrompt(3.333, 3, 4.0);
    const decimals = result.rating.toString().split('.')[1];

    expect(!decimals || decimals.length <= 2).toBe(true);
  });
});

describe('formatPromptForUse', () => {
  it('replaces single variable', () => {
    const template = createTemplate({
      prompt: 'Generate a spec for {{project}}',
    });
    const result = formatPromptForUse(template, { project: 'SpecTree' });

    expect(result).toBe('Generate a spec for SpecTree');
  });

  it('replaces multiple variables', () => {
    const template = createTemplate({
      prompt: 'Build {{feature}} for {{project}} using {{language}}',
    });
    const result = formatPromptForUse(template, {
      feature: 'auth',
      project: 'SpecTree',
      language: 'TypeScript',
    });

    expect(result).toBe('Build auth for SpecTree using TypeScript');
  });

  it('leaves unmatched placeholders intact', () => {
    const template = createTemplate({
      prompt: 'Generate {{feature}} for {{project}}',
    });
    const result = formatPromptForUse(template, { feature: 'login' });

    expect(result).toBe('Generate login for {{project}}');
  });

  it('handles prompt with no placeholders', () => {
    const template = createTemplate({
      prompt: 'A simple prompt with no variables',
    });
    const result = formatPromptForUse(template, { project: 'SpecTree' });

    expect(result).toBe('A simple prompt with no variables');
  });

  it('handles empty variables object', () => {
    const template = createTemplate({
      prompt: 'Hello {{name}}',
    });
    const result = formatPromptForUse(template, {});

    expect(result).toBe('Hello {{name}}');
  });
});

describe('validatePromptTemplate', () => {
  it('passes a valid template with no errors', () => {
    const template = createTemplate();
    const errors = validatePromptTemplate(template);

    expect(errors).toHaveLength(0);
  });

  it('catches missing title', () => {
    const template = createTemplate({ title: '' });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Title is required');
  });

  it('catches missing description', () => {
    const template = createTemplate({ description: '' });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Description is required');
  });

  it('catches empty prompt', () => {
    const template = createTemplate({ prompt: '' });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Prompt content is required');
  });

  it('catches missing author', () => {
    const template = createTemplate({ author: '' });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Author is required');
  });

  it('catches missing version', () => {
    const template = createTemplate({ version: '' });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Version is required');
  });

  it('catches invalid rating above 5', () => {
    const template = createTemplate({ rating: 6 });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Rating must be between 0 and 5');
  });

  it('catches invalid rating below 0', () => {
    const template = createTemplate({ rating: -1 });
    const errors = validatePromptTemplate(template);

    expect(errors).toContain('Rating must be between 0 and 5');
  });

  it('catches missing category', () => {
    const errors = validatePromptTemplate({
      title: 'test',
      description: 'test',
      prompt: 'test',
      author: 'test',
      version: '1.0.0',
    });

    expect(errors).toContain('Category is required');
  });

  it('reports multiple errors at once', () => {
    const errors = validatePromptTemplate({});

    expect(errors.length).toBeGreaterThanOrEqual(4);
  });
});

describe('getPopularTags', () => {
  it('returns tags sorted by frequency', () => {
    const result = getPopularTags(samplePrompts);

    // 'spec' appears in prompts 1, 4, 5 = 3 times
    expect(result[0].tag).toBe('spec');
    expect(result[0].count).toBe(3);
  });

  it('respects limit parameter', () => {
    const result = getPopularTags(samplePrompts, 3);

    expect(result).toHaveLength(3);
  });

  it('returns all tags when limit is not provided', () => {
    const result = getPopularTags(samplePrompts);

    // All unique tags: spec, generator, review, quality, export, format, generation, ai, quick
    expect(result.length).toBe(9);
  });

  it('handles empty prompts array', () => {
    const result = getPopularTags([]);

    expect(result).toHaveLength(0);
  });

  it('handles prompts with no tags', () => {
    const prompts = [createTemplate({ tags: [] })];
    const result = getPopularTags(prompts);

    expect(result).toHaveLength(0);
  });

  it('normalizes tag case', () => {
    const prompts = [
      createTemplate({ tags: ['Spec', 'SPEC', 'spec'] }),
    ];
    const result = getPopularTags(prompts);

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('spec');
    expect(result[0].count).toBe(3);
  });

  it('returns limit of 1 correctly', () => {
    const result = getPopularTags(samplePrompts, 1);

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('spec');
  });
});
