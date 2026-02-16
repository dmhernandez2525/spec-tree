/**
 * Documentation search functionality for SpecTree.
 * Provides an inverted index-based search with ranking and highlighting.
 */

export interface SearchEntry {
  id: string;
  title: string;
  content: string;
  path: string;
  category: string;
  keywords: string[];
}

export interface SearchResult {
  entry: SearchEntry;
  score: number;
  matches: string[];
}

export interface SearchIndex {
  entries: Map<string, SearchEntry>;
  invertedIndex: Map<string, Set<string>>;
}

/**
 * Normalizes a search term by lowercasing, removing punctuation, and trimming whitespace.
 */
export function normalizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Builds an inverted index from an array of search entries.
 * Maps each word found in titles, content, and keywords back to the entry IDs
 * that contain it.
 */
export function buildSearchIndex(entries: SearchEntry[]): SearchIndex {
  const entryMap = new Map<string, SearchEntry>();
  const invertedIndex = new Map<string, Set<string>>();

  function addToIndex(word: string, entryId: string): void {
    const normalized = normalizeSearchTerm(word);
    if (!normalized) return;

    if (!invertedIndex.has(normalized)) {
      invertedIndex.set(normalized, new Set());
    }
    invertedIndex.get(normalized)!.add(entryId);
  }

  for (const entry of entries) {
    entryMap.set(entry.id, entry);

    const titleWords = entry.title.split(/\s+/);
    for (const word of titleWords) {
      addToIndex(word, entry.id);
    }

    const contentWords = entry.content.split(/\s+/);
    for (const word of contentWords) {
      addToIndex(word, entry.id);
    }

    for (const keyword of entry.keywords) {
      addToIndex(keyword, entry.id);
    }
  }

  return { entries: entryMap, invertedIndex };
}

/**
 * Searches the index for a query string and returns ranked results.
 *
 * Scoring:
 *  - Exact title match: 10 points
 *  - Keyword match: 5 points
 *  - Content match: 1 point
 */
export function searchDocs(
  index: SearchIndex,
  query: string,
  limit: number = 10,
): SearchResult[] {
  const normalizedQuery = normalizeSearchTerm(query);
  if (!normalizedQuery) return [];

  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  const scoreMap = new Map<string, { score: number; matches: Set<string> }>();

  for (const term of queryTerms) {
    index.entries.forEach((entry) => {
      const normalizedTitle = normalizeSearchTerm(entry.title);
      const normalizedContent = normalizeSearchTerm(entry.content);
      const normalizedKeywords = entry.keywords.map(normalizeSearchTerm);

      let matched = false;

      if (normalizedTitle.includes(term)) {
        const existing = scoreMap.get(entry.id) || { score: 0, matches: new Set<string>() };
        existing.score += 10;
        existing.matches.add(term);
        scoreMap.set(entry.id, existing);
        matched = true;
      }

      if (normalizedKeywords.some((kw) => kw.includes(term))) {
        const existing = scoreMap.get(entry.id) || { score: 0, matches: new Set<string>() };
        existing.score += 5;
        if (!matched) existing.matches.add(term);
        scoreMap.set(entry.id, existing);
        matched = true;
      }

      if (normalizedContent.includes(term)) {
        const existing = scoreMap.get(entry.id) || { score: 0, matches: new Set<string>() };
        existing.score += 1;
        if (!matched) existing.matches.add(term);
        scoreMap.set(entry.id, existing);
      }
    });
  }

  const results: SearchResult[] = [];
  scoreMap.forEach((data, entryId) => {
    const entry = index.entries.get(entryId);
    if (entry) {
      results.push({
        entry,
        score: data.score,
        matches: Array.from(data.matches),
      });
    }
  });

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Wraps matching terms in **bold** markdown markers within the given text.
 */
export function highlightMatches(text: string, query: string): string {
  const terms = query.split(/\s+/).filter(Boolean);
  let result = text;

  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(regex, '**$1**');
  }

  return result;
}
