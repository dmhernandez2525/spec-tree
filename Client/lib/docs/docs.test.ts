import { describe, it, expect } from 'vitest';
import {
  generateApiDocs,
  generateGettingStarted,
  generateChangelog,
  buildTableOfContents,
  formatDocPage,
  type ApiEndpoint,
  type DocConfig,
  type ChangelogEntry,
  type DocSection,
} from './doc-generator';
import {
  buildSearchIndex,
  searchDocs,
  highlightMatches,
  normalizeSearchTerm,
  type SearchEntry,
} from './search-index';

// ============================================================
// Doc Generator Tests
// ============================================================

describe('generateApiDocs', () => {
  const endpoints: ApiEndpoint[] = [
    {
      method: 'GET',
      path: '/api/projects',
      description: 'Retrieves all projects for the authenticated user.',
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number' },
        { name: 'limit', type: 'number', required: false, description: 'Items per page' },
      ],
      response: '{ "projects": [], "total": 0 }',
    },
    {
      method: 'POST',
      path: '/api/projects',
      description: 'Creates a new project.',
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'Project name' },
      ],
      response: '{ "id": "123", "name": "My Project" }',
    },
  ];

  it('includes endpoint paths in the output', () => {
    const result = generateApiDocs(endpoints);
    expect(result).toContain('/api/projects');
  });

  it('includes the HTTP method for each endpoint', () => {
    const result = generateApiDocs(endpoints);
    expect(result).toContain('GET');
    expect(result).toContain('POST');
  });

  it('includes endpoint descriptions', () => {
    const result = generateApiDocs(endpoints);
    expect(result).toContain('Retrieves all projects');
    expect(result).toContain('Creates a new project');
  });

  it('includes parameter details in a table', () => {
    const result = generateApiDocs(endpoints);
    expect(result).toContain('| page |');
    expect(result).toContain('| name |');
    expect(result).toContain('Yes');
    expect(result).toContain('No');
  });

  it('includes response examples', () => {
    const result = generateApiDocs(endpoints);
    expect(result).toContain('"projects"');
    expect(result).toContain('"id": "123"');
  });

  it('handles empty endpoints array', () => {
    const result = generateApiDocs([]);
    expect(result).toContain('No endpoints documented yet');
  });
});

describe('generateGettingStarted', () => {
  const config: DocConfig = {
    projectName: 'SpecTree',
    version: '1.0.0',
    sections: [
      { id: 'api', title: 'API Reference', content: '', order: 1, subsections: [] },
      { id: 'guide', title: 'User Guide', content: '', order: 2, subsections: [] },
    ],
    lastUpdated: '2025-01-15',
  };

  it('includes the project name in the heading', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('Getting Started with SpecTree');
  });

  it('includes the version number', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('1.0.0');
  });

  it('includes an installation section', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('## Installation');
    expect(result).toContain('npm install');
  });

  it('includes a setup section', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('## Setup');
  });

  it('includes a quick start section', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('## Quick Start');
  });

  it('includes next steps linking to sections', () => {
    const result = generateGettingStarted(config);
    expect(result).toContain('[API Reference](#api)');
    expect(result).toContain('[User Guide](#guide)');
  });
});

describe('generateChangelog', () => {
  const entries: ChangelogEntry[] = [
    {
      version: '1.1.0',
      date: '2025-02-01',
      changes: [
        { type: 'added', description: 'New export feature' },
        { type: 'fixed', description: 'Fixed login bug' },
        { type: 'added', description: 'Dark mode support' },
      ],
    },
    {
      version: '1.0.0',
      date: '2025-01-01',
      changes: [
        { type: 'added', description: 'Initial release' },
      ],
    },
  ];

  it('includes version numbers', () => {
    const result = generateChangelog(entries);
    expect(result).toContain('[1.1.0]');
    expect(result).toContain('[1.0.0]');
  });

  it('includes dates alongside versions', () => {
    const result = generateChangelog(entries);
    expect(result).toContain('2025-02-01');
    expect(result).toContain('2025-01-01');
  });

  it('groups changes by type', () => {
    const result = generateChangelog(entries);
    expect(result).toContain('### Added');
    expect(result).toContain('### Fixed');
  });

  it('lists all change descriptions', () => {
    const result = generateChangelog(entries);
    expect(result).toContain('New export feature');
    expect(result).toContain('Fixed login bug');
    expect(result).toContain('Dark mode support');
    expect(result).toContain('Initial release');
  });

  it('handles empty entries array', () => {
    const result = generateChangelog([]);
    expect(result).toContain('No changes recorded yet');
  });
});

describe('buildTableOfContents', () => {
  const sections: DocSection[] = [
    {
      id: 'intro',
      title: 'Introduction',
      content: '',
      order: 1,
      subsections: [
        { id: 'overview', title: 'Overview', content: '', order: 1, subsections: [] },
        { id: 'goals', title: 'Goals', content: '', order: 2, subsections: [] },
      ],
    },
    {
      id: 'api',
      title: 'API',
      content: '',
      order: 2,
      subsections: [],
    },
  ];

  it('creates links for top-level sections', () => {
    const result = buildTableOfContents(sections);
    expect(result).toContain('[Introduction](#intro)');
    expect(result).toContain('[API](#api)');
  });

  it('includes subsections with indentation', () => {
    const result = buildTableOfContents(sections);
    expect(result).toContain('  - [Overview](#overview)');
    expect(result).toContain('  - [Goals](#goals)');
  });

  it('respects section ordering', () => {
    const result = buildTableOfContents(sections);
    const introIndex = result.indexOf('Introduction');
    const apiIndex = result.indexOf('[API]');
    expect(introIndex).toBeLessThan(apiIndex);
  });

  it('handles sections with no subsections', () => {
    const flat: DocSection[] = [
      { id: 'a', title: 'Section A', content: '', order: 1, subsections: [] },
    ];
    const result = buildTableOfContents(flat);
    expect(result).toContain('[Section A](#a)');
  });
});

describe('formatDocPage', () => {
  it('includes the title as a heading', () => {
    const result = formatDocPage('Getting Started', 'Some content');
    expect(result).toContain('# Getting Started');
  });

  it('includes the content body', () => {
    const result = formatDocPage('Title', 'Here is the body content');
    expect(result).toContain('Here is the body content');
  });

  it('includes last updated when metadata is provided', () => {
    const result = formatDocPage('Title', 'Content', { lastUpdated: '2025-03-01' });
    expect(result).toContain('Last updated: 2025-03-01');
  });

  it('includes navigation hints at the bottom', () => {
    const result = formatDocPage('Title', 'Content');
    expect(result).toContain('[Home](/)');
    expect(result).toContain('[API Reference](/docs/api)');
  });

  it('includes frontmatter metadata', () => {
    const result = formatDocPage('Title', 'Content', {
      author: 'Team',
      category: 'Guide',
    });
    expect(result).toContain('author: Team');
    expect(result).toContain('category: Guide');
  });
});

// ============================================================
// Search Index Tests
// ============================================================

describe('normalizeSearchTerm', () => {
  it('lowercases the input', () => {
    expect(normalizeSearchTerm('Hello')).toBe('hello');
  });

  it('removes punctuation', () => {
    expect(normalizeSearchTerm('hello!')).toBe('hello');
    expect(normalizeSearchTerm('test.')).toBe('test');
  });

  it('trims whitespace', () => {
    expect(normalizeSearchTerm('  hello  ')).toBe('hello');
  });
});

describe('buildSearchIndex', () => {
  const entries: SearchEntry[] = [
    {
      id: '1',
      title: 'Getting Started',
      content: 'Install the package and configure settings.',
      path: '/docs/getting-started',
      category: 'guide',
      keywords: ['install', 'setup', 'quickstart'],
    },
    {
      id: '2',
      title: 'API Reference',
      content: 'Detailed reference for all API endpoints.',
      path: '/docs/api',
      category: 'reference',
      keywords: ['api', 'endpoints', 'rest'],
    },
  ];

  it('indexes all entries by ID', () => {
    const index = buildSearchIndex(entries);
    expect(index.entries.size).toBe(2);
    expect(index.entries.has('1')).toBe(true);
    expect(index.entries.has('2')).toBe(true);
  });

  it('creates an inverted index with words', () => {
    const index = buildSearchIndex(entries);
    expect(index.invertedIndex.has('install')).toBe(true);
    expect(index.invertedIndex.has('api')).toBe(true);
  });

  it('handles empty input', () => {
    const index = buildSearchIndex([]);
    expect(index.entries.size).toBe(0);
    expect(index.invertedIndex.size).toBe(0);
  });

  it('indexes keywords', () => {
    const index = buildSearchIndex(entries);
    expect(index.invertedIndex.has('quickstart')).toBe(true);
    expect(index.invertedIndex.has('rest')).toBe(true);
  });
});

describe('searchDocs', () => {
  const entries: SearchEntry[] = [
    {
      id: '1',
      title: 'Authentication Guide',
      content: 'Learn how to authenticate with the API using tokens.',
      path: '/docs/auth',
      category: 'guide',
      keywords: ['auth', 'token', 'security'],
    },
    {
      id: '2',
      title: 'REST API',
      content: 'Complete reference for the REST API endpoints.',
      path: '/docs/api',
      category: 'reference',
      keywords: ['api', 'rest', 'endpoints'],
    },
    {
      id: '3',
      title: 'Deployment',
      content: 'Deploy your application to production.',
      path: '/docs/deploy',
      category: 'guide',
      keywords: ['deploy', 'production', 'hosting'],
    },
  ];

  const index = buildSearchIndex(entries);

  it('finds exact title matches', () => {
    const results = searchDocs(index, 'Authentication');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe('1');
  });

  it('ranks title matches higher than content matches', () => {
    const results = searchDocs(index, 'API');
    // Entry 2 has "API" in the title, entry 1 only in content
    const entry2Result = results.find((r) => r.entry.id === '2');
    const entry1Result = results.find((r) => r.entry.id === '1');
    if (entry2Result && entry1Result) {
      expect(entry2Result.score).toBeGreaterThan(entry1Result.score);
    }
  });

  it('respects the limit parameter', () => {
    const results = searchDocs(index, 'the', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('returns empty for empty query', () => {
    const results = searchDocs(index, '');
    expect(results).toHaveLength(0);
  });

  it('returns empty for query with no matches', () => {
    const results = searchDocs(index, 'xyznonexistent');
    expect(results).toHaveLength(0);
  });

  it('matches keywords', () => {
    const results = searchDocs(index, 'security');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].entry.id).toBe('1');
  });

  it('defaults to limit of 10', () => {
    const manyEntries: SearchEntry[] = Array.from({ length: 20 }, (_, i) => ({
      id: `entry-${i}`,
      title: `Common Title ${i}`,
      content: 'Shared common content here.',
      path: `/docs/entry-${i}`,
      category: 'guide',
      keywords: ['common'],
    }));
    const bigIndex = buildSearchIndex(manyEntries);
    const results = searchDocs(bigIndex, 'common');
    expect(results.length).toBeLessThanOrEqual(10);
  });
});

describe('highlightMatches', () => {
  it('wraps matching text in bold markers', () => {
    const result = highlightMatches('Welcome to the API documentation', 'API');
    expect(result).toContain('**API**');
  });

  it('handles case insensitive matching', () => {
    const result = highlightMatches('The quick brown fox', 'quick');
    expect(result).toContain('**quick**');
  });

  it('handles multiple terms', () => {
    const result = highlightMatches('API authentication guide', 'API guide');
    expect(result).toContain('**API**');
    expect(result).toContain('**guide**');
  });

  it('returns original text when no matches found', () => {
    const result = highlightMatches('Hello world', 'xyz');
    expect(result).toBe('Hello world');
  });

  it('handles special regex characters in query', () => {
    const result = highlightMatches('Price is $100.00', '$100');
    expect(result).toContain('**$100**');
  });
});
