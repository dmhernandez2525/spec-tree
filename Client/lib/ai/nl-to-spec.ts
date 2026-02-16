// F11.2 - Natural Language to Spec
// Converts natural language descriptions into structured specification documents.
// Provides entity extraction, type inference, acceptance criteria parsing,
// priority detection, dependency detection, and full spec node generation.

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export interface NLInput {
  text: string;
  context?: string;
  format?: 'epic' | 'feature' | 'story' | 'task';
}

export interface ParsedEntity {
  name: string;
  type: 'actor' | 'system' | 'component' | 'action' | 'constraint';
  confidence: number;
}

export interface SpecNode {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'story' | 'task';
  acceptanceCriteria: string[];
  dependencies: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedEffort?: string;
}

export interface ConversionResult {
  nodes: SpecNode[];
  entities: ParsedEntity[];
  warnings: string[];
  confidence: number;
}

export interface ConversionOptions {
  maxDepth?: number;
  generateIds?: boolean;
  inferPriority?: boolean;
  extractDependencies?: boolean;
}

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

let specCounter = 0;

/**
 * Resets the spec ID counter back to zero. Useful for testing.
 */
export function resetSpecCounter(): void {
  specCounter = 0;
}

// ---------------------------------------------------------------------------
// Entity extraction helpers
// ---------------------------------------------------------------------------

const ACTOR_PATTERNS: RegExp[] = [
  /\bas an?\s+(\w[\w\s]{0,30}?\w)/gi,
  /\bthe user\b/gi,
  /\bthe admin\b/gi,
  /\bthe administrator\b/gi,
  /\bthe manager\b/gi,
  /\bthe customer\b/gi,
  /\bthe developer\b/gi,
  /\bthe operator\b/gi,
];

const SYSTEM_PATTERNS: RegExp[] = [
  /\bthe system\b/gi,
  /\bthe app\b/gi,
  /\bthe application\b/gi,
  /\bthe service\b/gi,
  /\bthe server\b/gi,
  /\bthe api\b/gi,
  /\bthe database\b/gi,
  /\bthe platform\b/gi,
];

const ACTION_PATTERN = /\b(?:should|must|can|will|shall)\s+(\w[\w\s]{0,40}?\w)(?:\.|,|;|\band\b|\bor\b|$)/gi;

const CONSTRAINT_PATTERNS: RegExp[] = [
  /\bmust not\s+(\w[\w\s]{0,50}?\w)(?:\.|,|;|$)/gi,
  /\bcannot\s+(\w[\w\s]{0,50}?\w)(?:\.|,|;|$)/gi,
  /\bat most\s+(\w[\w\s]{0,30}?\w)(?:\.|,|;|$)/gi,
  /\bat least\s+(\w[\w\s]{0,30}?\w)(?:\.|,|;|$)/gi,
  /\bwithin\s+(\w[\w\s]{0,30}?\w)(?:\.|,|;|$)/gi,
  /\bno more than\s+(\w[\w\s]{0,30}?\w)(?:\.|,|;|$)/gi,
  /\bno fewer than\s+(\w[\w\s]{0,30}?\w)(?:\.|,|;|$)/gi,
];

/**
 * Collects all regex matches for a given pattern from the text.
 * Returns an array of matched strings (captured group 1, or the full match
 * if no capture group is present).
 */
function collectMatches(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const regex = new RegExp(pattern.source, pattern.flags);
  let match = regex.exec(text);

  while (match !== null) {
    const value = (match[1] || match[0]).trim();
    if (value.length > 0) {
      results.push(value);
    }
    match = regex.exec(text);
  }

  return results;
}

/**
 * Extracts entities (actors, systems, actions, constraints) from natural
 * language text. Each entity includes a confidence score based on how
 * clearly the pattern matched.
 */
export function extractEntities(text: string): ParsedEntity[] {
  if (!text || text.trim().length === 0) return [];

  const entities: ParsedEntity[] = [];
  const seen = new Set<string>();

  // Extract actors
  ACTOR_PATTERNS.forEach((pattern) => {
    const matches = collectMatches(text, pattern);
    matches.forEach((name) => {
      const normalized = name.toLowerCase().trim();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      entities.push({ name: normalized, type: 'actor', confidence: 0.85 });
    });
  });

  // Extract systems
  SYSTEM_PATTERNS.forEach((pattern) => {
    const matches = collectMatches(text, pattern);
    matches.forEach((name) => {
      const normalized = name.toLowerCase().trim();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      entities.push({ name: normalized, type: 'system', confidence: 0.8 });
    });
  });

  // Extract actions
  const actionMatches = collectMatches(text, ACTION_PATTERN);
  actionMatches.forEach((name) => {
    const normalized = name.toLowerCase().trim();
    if (seen.has(normalized)) return;
    seen.add(normalized);
    entities.push({ name: normalized, type: 'action', confidence: 0.75 });
  });

  // Extract constraints
  CONSTRAINT_PATTERNS.forEach((pattern) => {
    const matches = collectMatches(text, pattern);
    matches.forEach((name) => {
      const normalized = name.toLowerCase().trim();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      entities.push({ name: normalized, type: 'constraint', confidence: 0.7 });
    });
  });

  return entities;
}

// ---------------------------------------------------------------------------
// Spec type inference
// ---------------------------------------------------------------------------

/**
 * Infers the specification type from the text content.
 *
 * Rules:
 *  - Contains the word "epic" or is very long (>500 chars) => epic
 *  - Matches "as a ... I want" user story format => story
 *  - Contains technical action words (implement, create, add, build, configure,
 *    set up, write, deploy, migrate) => task
 *  - Otherwise => feature
 */
export function inferSpecType(
  text: string
): 'epic' | 'feature' | 'story' | 'task' {
  if (!text) return 'feature';

  const lower = text.toLowerCase();

  if (/\bepic\b/.test(lower) || text.length > 500) return 'epic';
  if (/\bas an?\b.*\bi want\b/i.test(text)) return 'story';

  const taskKeywords = [
    'implement',
    'create',
    'add',
    'build',
    'configure',
    'set up',
    'write',
    'deploy',
    'migrate',
  ];
  const hasTaskKeyword = taskKeywords.some((kw) => lower.includes(kw));
  if (hasTaskKeyword) return 'task';

  return 'feature';
}

// ---------------------------------------------------------------------------
// Acceptance criteria extraction
// ---------------------------------------------------------------------------

/**
 * Extracts acceptance criteria from text. Looks for:
 *  - "Given ... When ... Then ..." (Gherkin) patterns
 *  - Bullet point items (lines starting with -, *, or numbered lists)
 *  - "should" statements as standalone criteria
 *
 * Returns an array of trimmed criterion strings.
 */
export function extractAcceptanceCriteria(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  const criteria: string[] = [];

  // Gherkin-style: Given/When/Then blocks
  const gherkinPattern =
    /given\s+.+?\s+when\s+.+?\s+then\s+.+?(?=\.|given\s|$)/gi;
  const gherkinMatches = collectMatches(text, gherkinPattern);
  gherkinMatches.forEach((match) => {
    const trimmed = match.trim();
    if (trimmed.length > 0) {
      criteria.push(trimmed);
    }
  });

  // Bullet points and numbered lists
  const lines = text.split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    // Match lines starting with -, *, or a number followed by . or )
    if (/^[-*]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^[-*]\s+/, '').trim();
      if (content.length > 0) {
        criteria.push(content);
      }
    } else if (/^\d+[.)]\s+/.test(trimmed)) {
      const content = trimmed.replace(/^\d+[.)]\s+/, '').trim();
      if (content.length > 0) {
        criteria.push(content);
      }
    }
  });

  // "should" statements (only if we have not already found criteria above)
  if (criteria.length === 0) {
    const shouldPattern = /([^.]*\bshould\b[^.]*)\./gi;
    const shouldMatches = collectMatches(text, shouldPattern);
    shouldMatches.forEach((match) => {
      const trimmed = match.trim();
      if (trimmed.length > 5) {
        criteria.push(trimmed);
      }
    });
  }

  return criteria;
}

// ---------------------------------------------------------------------------
// Priority inference
// ---------------------------------------------------------------------------

const HIGH_PRIORITY_KEYWORDS = [
  'critical',
  'urgent',
  'blocker',
  'asap',
  'immediately',
  'showstopper',
  'p0',
  'p1',
  'breaking',
  'security vulnerability',
];

const LOW_PRIORITY_KEYWORDS = [
  'nice to have',
  'eventually',
  'low priority',
  'when possible',
  'someday',
  'backlog',
  'stretch goal',
  'nice-to-have',
  'p3',
  'p4',
];

/**
 * Infers a priority level from the text based on keyword matching.
 *
 * Returns "high" if any high-priority keywords are found, "low" if any
 * low-priority keywords are found, and "medium" as the default.
 */
export function inferPriority(text: string): 'high' | 'medium' | 'low' {
  if (!text) return 'medium';

  const lower = text.toLowerCase();

  const isHigh = HIGH_PRIORITY_KEYWORDS.some((kw) => lower.includes(kw));
  if (isHigh) return 'high';

  const isLow = LOW_PRIORITY_KEYWORDS.some((kw) => lower.includes(kw));
  if (isLow) return 'low';

  return 'medium';
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generates a specification ID with an incrementing counter.
 * Format: "{prefix}-001", "{prefix}-002", etc.
 * The default prefix is "SPEC".
 */
export function generateSpecId(prefix?: string): string {
  specCounter += 1;
  const tag = prefix || 'SPEC';
  const padded = String(specCounter).padStart(3, '0');
  return `${tag}-${padded}`;
}

// ---------------------------------------------------------------------------
// Section splitting
// ---------------------------------------------------------------------------

/**
 * Splits text into logical sections by detecting:
 *  - Double newline separators
 *  - Markdown headers (lines starting with #)
 *  - Numbered section headings (e.g. "1. ", "2. ")
 *
 * Returns an array of non-empty section strings.
 */
export function splitIntoSections(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  // First, try splitting on markdown headers
  const headerSections = text.split(/(?=^#{1,6}\s+)/m);
  if (headerSections.length > 1) {
    return headerSections
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Try splitting on double newlines
  const doubleNewlineSections = text.split(/\n\s*\n/);
  if (doubleNewlineSections.length > 1) {
    return doubleNewlineSections
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Try splitting on numbered section patterns (e.g. "1. Section Title")
  const numberedSections = text.split(/(?=^\d+\.\s+)/m);
  if (numberedSections.length > 1) {
    return numberedSections
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // No clear sections found; return the whole text as a single section
  return [text.trim()];
}

// ---------------------------------------------------------------------------
// Dependency detection
// ---------------------------------------------------------------------------

const DEPENDENCY_PATTERNS: RegExp[] = [
  /\bdepends on\s+(.+?)(?:\.|,|;|$)/gi,
  /\brequires\s+(.+?)(?:\.|,|;|$)/gi,
  /\bafter\s+(.+?)(?:\s+is\s+|\s+has\s+|\.|,|;|$)/gi,
  /\bblocked by\s+(.+?)(?:\.|,|;|$)/gi,
  /\bprerequisite:\s*(.+?)(?:\.|,|;|$)/gi,
  /\bneeds\s+(.+?)\s+first/gi,
];

/**
 * Detects dependency references within natural language text.
 * Looks for phrases like "depends on", "requires", "after",
 * "blocked by", "prerequisite:", and "needs ... first".
 *
 * Returns an array of dependency description strings.
 */
export function detectDependencies(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  const dependencies: string[] = [];
  const seen = new Set<string>();

  DEPENDENCY_PATTERNS.forEach((pattern) => {
    const matches = collectMatches(text, pattern);
    matches.forEach((dep) => {
      const normalized = dep.trim().toLowerCase();
      if (normalized.length === 0) return;
      if (seen.has(normalized)) return;
      seen.add(normalized);
      dependencies.push(dep.trim());
    });
  });

  return dependencies;
}

// ---------------------------------------------------------------------------
// Title extraction helper
// ---------------------------------------------------------------------------

/**
 * Derives a concise title from the section text. Uses the first line if it
 * looks like a heading; otherwise takes the first sentence, truncating if
 * it exceeds 80 characters.
 */
function deriveTitle(text: string): string {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return 'Untitled';

  const firstLine = lines[0].trim();

  // If it starts with a markdown header, strip the hashes
  if (/^#{1,6}\s+/.test(firstLine)) {
    return firstLine.replace(/^#{1,6}\s+/, '').trim();
  }

  // Take the first sentence
  const sentenceMatch = firstLine.match(/^([^.!?]+)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : firstLine;

  if (sentence.length <= 80) return sentence;
  return sentence.substring(0, 77) + '...';
}

// ---------------------------------------------------------------------------
// Confidence computation
// ---------------------------------------------------------------------------

/**
 * Computes an overall confidence score (0 to 1) for the conversion based
 * on how many entities were extracted and how many criteria were found.
 */
function computeConfidence(
  entities: ParsedEntity[],
  criteria: string[],
  textLength: number
): number {
  if (textLength === 0) return 0;

  let score = 0.3; // base confidence

  // Entity presence boosts confidence
  if (entities.length > 0) score += 0.2;
  if (entities.length >= 3) score += 0.1;
  if (entities.length >= 5) score += 0.05;

  // Acceptance criteria boost
  if (criteria.length > 0) score += 0.15;
  if (criteria.length >= 3) score += 0.1;

  // Longer text generally means more context
  if (textLength > 100) score += 0.05;
  if (textLength > 300) score += 0.05;

  return Math.min(score, 1);
}

// ---------------------------------------------------------------------------
// Warning generation
// ---------------------------------------------------------------------------

/**
 * Generates warnings for potentially ambiguous or incomplete text.
 */
function generateWarnings(
  text: string,
  entities: ParsedEntity[],
  criteria: string[]
): string[] {
  const warnings: string[] = [];

  if (text.trim().length < 20) {
    warnings.push(
      'Input text is very short. Consider providing more detail for accurate conversion.'
    );
  }

  const hasVerbs = entities.some((e) => e.type === 'action');
  if (!hasVerbs) {
    warnings.push(
      'No action verbs detected. The specification may lack behavioral requirements.'
    );
  }

  const hasActors = entities.some((e) => e.type === 'actor');
  if (!hasActors) {
    warnings.push(
      'No actors found. Consider specifying who will use or interact with this feature.'
    );
  }

  if (criteria.length === 0) {
    warnings.push(
      'No acceptance criteria could be extracted. Consider adding bullet points or "should" statements.'
    );
  }

  // Check for vague language
  const vagueTerms = ['somehow', 'maybe', 'probably', 'various', 'etc', 'stuff', 'things'];
  const lower = text.toLowerCase();
  const foundVague = vagueTerms.filter((term) => lower.includes(term));
  if (foundVague.length > 0) {
    warnings.push(
      `Vague language detected: "${foundVague.join('", "')}". Consider using more precise terms.`
    );
  }

  return warnings;
}

// ---------------------------------------------------------------------------
// Main conversion function
// ---------------------------------------------------------------------------

/**
 * Converts a natural language input into a structured specification result.
 *
 * Parses the input text, extracts entities, infers the spec type (or uses
 * the explicitly provided format), generates spec nodes for each section,
 * extracts acceptance criteria and dependencies, and computes an overall
 * confidence score. Warnings are added for ambiguous or incomplete text.
 */
export function convertToSpec(
  input: NLInput,
  options?: ConversionOptions
): ConversionResult {
  if (!input || !input.text || input.text.trim().length === 0) {
    return { nodes: [], entities: [], warnings: ['Empty input provided.'], confidence: 0 };
  }

  const opts: Required<ConversionOptions> = {
    maxDepth: options?.maxDepth ?? 3,
    generateIds: options?.generateIds !== false,
    inferPriority: options?.inferPriority !== false,
    extractDependencies: options?.extractDependencies !== false,
  };

  const fullText = input.context
    ? `${input.text}\n\n${input.context}`
    : input.text;

  // Extract entities from the full text
  const entities = extractEntities(fullText);

  // Split the input text into sections (do not include context in sections)
  const sections = splitIntoSections(input.text);

  // Build a spec node for each section
  const nodes: SpecNode[] = [];
  const allCriteria: string[] = [];

  sections.forEach((section) => {
    const sectionType = input.format || inferSpecType(section);
    const criteria = extractAcceptanceCriteria(section);
    allCriteria.push(...criteria);

    const deps = opts.extractDependencies ? detectDependencies(section) : [];
    const priority = opts.inferPriority ? inferPriority(section) : 'medium';
    const id = opts.generateIds ? generateSpecId() : '';

    const node: SpecNode = {
      id,
      title: deriveTitle(section),
      description: section.trim(),
      type: sectionType,
      acceptanceCriteria: criteria,
      dependencies: deps,
      priority,
    };

    nodes.push(node);
  });

  // Compute warnings and confidence
  const warnings = generateWarnings(fullText, entities, allCriteria);
  const confidence = computeConfidence(entities, allCriteria, fullText.length);

  return { nodes, entities, warnings, confidence };
}
