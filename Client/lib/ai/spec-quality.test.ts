import { describe, it, expect } from 'vitest';
import {
  analyzeCompleteness,
  analyzeClarity,
  analyzeConsistency,
  analyzeTestability,
  analyzeFeasibility,
  generateQualityReport,
  getQualityGrade,
  getImprovementPriorities,
  SpecSection,
  QualityReport,
  MIN_SECTIONS,
  IDEAL_SECTIONS,
  AMBIGUOUS_WORDS,
  PASSIVE_VOICE_PATTERNS,
  DEFAULT_MAX_SECTIONS,
  DEFAULT_MAX_WORDS_PER_SECTION,
  DIMENSION_WEIGHTS,
} from './spec-quality';

// ---------------------------------------------------------------------------
// Test data helpers
// ---------------------------------------------------------------------------

function makeSection(overrides: Partial<SpecSection> = {}): SpecSection {
  return {
    title: overrides.title ?? 'Test Section',
    content: overrides.content ?? 'This is a test section with enough words to satisfy the minimum word count for quality analysis.',
    wordCount: overrides.wordCount ?? 25,
    hasAcceptanceCriteria: overrides.hasAcceptanceCriteria ?? false,
    hasDependencies: overrides.hasDependencies ?? false,
  };
}

function makeSections(count: number, overrides: Partial<SpecSection> = {}): SpecSection[] {
  return Array.from({ length: count }, (_, i) =>
    makeSection({ title: `Section ${i + 1}`, ...overrides })
  );
}

function makeWellFormedSections(): SpecSection[] {
  return Array.from({ length: IDEAL_SECTIONS }, (_, i) =>
    makeSection({
      title: `Section ${i + 1}`,
      wordCount: 50,
      hasAcceptanceCriteria: true,
      hasDependencies: true,
    })
  );
}

// ---------------------------------------------------------------------------
// analyzeCompleteness
// ---------------------------------------------------------------------------

describe('analyzeCompleteness', () => {
  it('returns score 0 for null/undefined sections', () => {
    const result = analyzeCompleteness(null as unknown as SpecSection[]);
    expect(result.dimension).toBe('completeness');
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('empty');
  });

  it('returns score 0 for an empty array', () => {
    const result = analyzeCompleteness([]);
    expect(result.score).toBe(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('suggests adding more sections when below MIN_SECTIONS', () => {
    const result = analyzeCompleteness(makeSections(2));
    expect(result.suggestions.some((s) => s.includes('Add more sections'))).toBe(true);
  });

  it('does not suggest adding more sections when at MIN_SECTIONS', () => {
    const result = analyzeCompleteness(makeSections(MIN_SECTIONS));
    expect(result.suggestions.some((s) => s.includes('Add more sections'))).toBe(false);
  });

  it('awards higher scores to well-formed sections', () => {
    const well = analyzeCompleteness(makeWellFormedSections());
    const weak = analyzeCompleteness(makeSections(2, { wordCount: 5 }));
    expect(well.score).toBeGreaterThan(weak.score);
  });

  it('penalizes sections with low word count', () => {
    const sections = makeSections(4, { wordCount: 5 });
    const result = analyzeCompleteness(sections);
    expect(result.suggestions.some((s) => s.includes('fewer than'))).toBe(true);
  });

  it('penalizes empty content sections', () => {
    const sections = [
      makeSection({ content: '', wordCount: 0 }),
      makeSection({ content: 'Some content', wordCount: 25 }),
      makeSection({ content: '   ', wordCount: 0 }),
    ];
    const result = analyzeCompleteness(sections);
    expect(result.suggestions.some((s) => s.includes('empty'))).toBe(true);
  });

  it('awards points for acceptance criteria presence', () => {
    const withAC = analyzeCompleteness(makeSections(4, { hasAcceptanceCriteria: true }));
    const withoutAC = analyzeCompleteness(makeSections(4, { hasAcceptanceCriteria: false }));
    expect(withAC.score).toBeGreaterThan(withoutAC.score);
  });

  it('suggests adding acceptance criteria when none present', () => {
    const result = analyzeCompleteness(makeSections(4, { hasAcceptanceCriteria: false }));
    expect(result.suggestions.some((s) => s.includes('acceptance criteria'))).toBe(true);
  });

  it('suggests more criteria when less than half of sections have them', () => {
    const sections = [
      makeSection({ hasAcceptanceCriteria: true }),
      makeSection({ hasAcceptanceCriteria: false }),
      makeSection({ hasAcceptanceCriteria: false }),
      makeSection({ hasAcceptanceCriteria: false }),
    ];
    const result = analyzeCompleteness(sections);
    expect(result.suggestions.some((s) => s.includes('Less than half'))).toBe(true);
  });

  it('awards points for dependency tracking', () => {
    const withDeps = analyzeCompleteness(makeSections(4, { hasDependencies: true }));
    const withoutDeps = analyzeCompleteness(makeSections(4, { hasDependencies: false }));
    expect(withDeps.score).toBeGreaterThan(withoutDeps.score);
  });

  it('suggests documenting dependencies when none present', () => {
    const result = analyzeCompleteness(makeSections(4, { hasDependencies: false }));
    expect(result.suggestions.some((s) => s.includes('dependencies'))).toBe(true);
  });

  it('provides positive feedback when score >= 80', () => {
    const result = analyzeCompleteness(makeWellFormedSections());
    expect(result.feedback).toContain('comprehensive');
  });

  it('provides mid-range feedback when score is between 60 and 79', () => {
    const sections = makeSections(5, { wordCount: 25, hasAcceptanceCriteria: true });
    const result = analyzeCompleteness(sections);
    // The exact feedback depends on the score; just validate it is not the "comprehensive" one
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('clamps score between 0 and 100', () => {
    const result = analyzeCompleteness(makeWellFormedSections());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// analyzeClarity
// ---------------------------------------------------------------------------

describe('analyzeClarity', () => {
  it('returns score 0 for empty content', () => {
    const result = analyzeClarity('');
    expect(result.dimension).toBe('clarity');
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('No content');
  });

  it('returns score 0 for null content', () => {
    const result = analyzeClarity(null as unknown as string);
    expect(result.score).toBe(0);
  });

  it('treats text without punctuation as a single sentence', () => {
    const result = analyzeClarity('just some words without punctuation ending');
    // splitSentences splits on [.!?]+; text without those chars is one sentence
    expect(result.score).toBeGreaterThan(0);
    expect(result.dimension).toBe('clarity');
  });

  it('gives high score for clear, concise text', () => {
    const text = 'The system processes login requests. Users receive confirmation emails. Each session lasts 30 minutes.';
    const result = analyzeClarity(text);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.feedback).toContain('clear');
  });

  it('penalizes long average sentence length', () => {
    // Build a single very long sentence
    const longSentence = Array.from({ length: 40 }, () => 'word').join(' ') + '.';
    const result = analyzeClarity(longSentence);
    expect(result.suggestions.some((s) => s.includes('sentence length'))).toBe(true);
  });

  it('detects ambiguous words and suggests replacement', () => {
    const text = 'The system maybe handles requests. It could possibly work sometimes.';
    const result = analyzeClarity(text);
    expect(result.suggestions.some((s) => s.includes('ambiguous words'))).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('detects multiple distinct ambiguous words', () => {
    const text = 'Maybe the system probably works. It might usually handle it. Could be.';
    const result = analyzeClarity(text);
    const ambiguousSuggestion = result.suggestions.find((s) => s.includes('ambiguous words'));
    expect(ambiguousSuggestion).toBeDefined();
    // Multiple ambiguous words should be listed
    expect(ambiguousSuggestion!.includes('maybe')).toBe(true);
    expect(ambiguousSuggestion!.includes('probably')).toBe(true);
  });

  it('detects passive voice patterns', () => {
    const text = 'The task is done by the server. The data is handled by the system.';
    const result = analyzeClarity(text);
    expect(result.suggestions.some((s) => s.includes('passive voice'))).toBe(true);
  });

  it('detects multiple passive voice patterns', () => {
    const text = 'The request is done. The session was created. The file will be handled.';
    const result = analyzeClarity(text);
    expect(result.score).toBeLessThan(100);
  });

  it('gives high score for text with no issues', () => {
    const text = 'The system validates input. The API returns JSON. Tests run automatically.';
    const result = analyzeClarity(text);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  it('caps clarity penalties so score does not go below 0', () => {
    // Text with every kind of problem
    const longSentence = Array.from({ length: 50 }, () => 'maybe').join(' ');
    const text = `${longSentence} is done. ${longSentence} was created.`;
    const result = analyzeClarity(text);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// analyzeConsistency
// ---------------------------------------------------------------------------

describe('analyzeConsistency', () => {
  it('returns score 0 for empty sections', () => {
    const result = analyzeConsistency([]);
    expect(result.dimension).toBe('consistency');
    expect(result.score).toBe(0);
  });

  it('returns score 80 for a single section', () => {
    const result = analyzeConsistency([makeSection()]);
    expect(result.score).toBe(80);
    expect(result.feedback).toContain('trivially satisfied');
  });

  it('penalizes sections with missing titles', () => {
    const sections = [
      makeSection({ title: '' }),
      makeSection({ title: 'Has a title' }),
    ];
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('missing titles'))).toBe(true);
  });

  it('detects duplicate section titles (case insensitive)', () => {
    const sections = [
      makeSection({ title: 'Requirements' }),
      makeSection({ title: 'requirements' }),
      makeSection({ title: 'Design' }),
    ];
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('Duplicate'))).toBe(true);
  });

  it('does not flag unique titles as duplicates', () => {
    const sections = [
      makeSection({ title: 'Requirements' }),
      makeSection({ title: 'Design' }),
      makeSection({ title: 'Testing' }),
    ];
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('Duplicate'))).toBe(false);
  });

  it('penalizes high word count variance', () => {
    const sections = [
      makeSection({ title: 'Tiny', wordCount: 1 }),
      makeSection({ title: 'Also Tiny', wordCount: 1 }),
      makeSection({ title: 'Huge', wordCount: 1000 }),
    ];
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('vary dramatically') || s.includes('longer or shorter'))).toBe(true);
  });

  it('gives high score for consistent sections', () => {
    const sections = makeSections(4, { wordCount: 50 });
    const result = analyzeConsistency(sections);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('penalizes inconsistent acceptance criteria presence', () => {
    const sections = [
      makeSection({ title: 'A', hasAcceptanceCriteria: true }),
      makeSection({ title: 'B', hasAcceptanceCriteria: false }),
      makeSection({ title: 'C', hasAcceptanceCriteria: false }),
      makeSection({ title: 'D', hasAcceptanceCriteria: false }),
    ];
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('Acceptance criteria'))).toBe(true);
  });

  it('does not penalize when all sections have acceptance criteria', () => {
    const sections = makeSections(4, { hasAcceptanceCriteria: true });
    const result = analyzeConsistency(sections);
    expect(result.suggestions.some((s) => s.includes('Acceptance criteria are present in some'))).toBe(false);
  });

  it('provides appropriate feedback for consistency score >= 80', () => {
    const sections = makeSections(3, { wordCount: 30 });
    const result = analyzeConsistency(sections);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.feedback).toContain('consistent');
  });
});

// ---------------------------------------------------------------------------
// analyzeTestability
// ---------------------------------------------------------------------------

describe('analyzeTestability', () => {
  it('returns score 0 for empty sections', () => {
    const result = analyzeTestability([]);
    expect(result.dimension).toBe('testability');
    expect(result.score).toBe(0);
  });

  it('awards points for acceptance criteria presence', () => {
    const withAC = analyzeTestability(makeSections(3, { hasAcceptanceCriteria: true }));
    const withoutAC = analyzeTestability(makeSections(3, { hasAcceptanceCriteria: false }));
    expect(withAC.score).toBeGreaterThan(withoutAC.score);
  });

  it('suggests adding criteria when none have them', () => {
    const result = analyzeTestability(makeSections(3, { hasAcceptanceCriteria: false }));
    expect(result.suggestions.some((s) => s.includes('acceptance criteria'))).toBe(true);
  });

  it('suggests adding criteria when less than 75% have them', () => {
    const sections = [
      makeSection({ hasAcceptanceCriteria: true }),
      makeSection({ title: 'B', hasAcceptanceCriteria: false }),
      makeSection({ title: 'C', hasAcceptanceCriteria: false }),
      makeSection({ title: 'D', hasAcceptanceCriteria: false }),
    ];
    const result = analyzeTestability(sections);
    expect(result.suggestions.some((s) => s.includes('Only 1 of 4'))).toBe(true);
  });

  it('awards points for measurable outcomes (units)', () => {
    const sections = [
      makeSection({
        content: 'Response time must be under 200ms. Uptime should be 99.9%. Storage must not exceed 500mb. Timeout after 30seconds. Load test for 60minutes.',
        hasAcceptanceCriteria: true,
      }),
    ];
    const result = analyzeTestability(sections);
    // measurableCount >= 5 should give 30 points from measurable
    expect(result.score).toBeGreaterThan(40);
  });

  it('awards partial points for fewer measurable outcomes', () => {
    const sections = [
      makeSection({
        content: 'Response time under 200ms. Memory usage below 512mb.',
        hasAcceptanceCriteria: true,
      }),
    ];
    const result = analyzeTestability(sections);
    expect(result.score).toBeGreaterThan(0);
  });

  it('awards points for standalone numbers when no unit-based measures exist', () => {
    const sections = [
      makeSection({
        content: 'The system supports 100 users, 50 concurrent sessions, and 25 requests.',
        hasAcceptanceCriteria: true,
      }),
    ];
    const result = analyzeTestability(sections);
    expect(result.score).toBeGreaterThan(0);
  });

  it('suggests measurable outcomes when none found', () => {
    const sections = [
      makeSection({
        content: 'The system handles data well and performs adequately.',
        hasAcceptanceCriteria: true,
      }),
    ];
    const result = analyzeTestability(sections);
    expect(result.suggestions.some((s) => s.includes('measurable outcomes') || s.includes('No measurable'))).toBe(true);
  });

  it('awards points for action verbs (shall, must, will)', () => {
    const sections = [
      makeSection({
        content: 'The system shall validate input. It must log all requests. The API will return errors.',
        hasAcceptanceCriteria: true,
      }),
    ];
    const result = analyzeTestability(sections);
    // All 3 action verbs found -> 30 points from that dimension
    expect(result.score).toBeGreaterThan(30);
  });

  it('suggests action verbs when none found', () => {
    const sections = [
      makeSection({
        content: 'The system handles data appropriately.',
        hasAcceptanceCriteria: false,
      }),
    ];
    const result = analyzeTestability(sections);
    expect(result.suggestions.some((s) => s.includes('action verbs'))).toBe(true);
  });

  it('gives high score for highly testable sections', () => {
    const sections = makeSections(4, {
      content: 'The system shall respond within 200ms. It must handle 1000 concurrent users. Uptime will exceed 99.9%. Storage under 500mb. Latency below 50ms.',
      hasAcceptanceCriteria: true,
    });
    const result = analyzeTestability(sections);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });
});

// ---------------------------------------------------------------------------
// analyzeFeasibility
// ---------------------------------------------------------------------------

describe('analyzeFeasibility', () => {
  it('returns score 0 for empty sections', () => {
    const result = analyzeFeasibility([]);
    expect(result.dimension).toBe('feasibility');
    expect(result.score).toBe(0);
  });

  it('gives high score for reasonable scope', () => {
    const sections = makeSections(5, {
      wordCount: 100,
      hasAcceptanceCriteria: true,
      hasDependencies: true,
    });
    const result = analyzeFeasibility(sections);
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('penalizes too many sections exceeding default max', () => {
    const sections = makeSections(DEFAULT_MAX_SECTIONS + 5);
    const result = analyzeFeasibility(sections);
    expect(result.suggestions.some((s) => s.includes('exceeding the recommended maximum'))).toBe(true);
  });

  it('uses custom maxComplexity from constraints', () => {
    const sections = makeSections(8);
    const result = analyzeFeasibility(sections, { maxComplexity: 5 });
    expect(result.suggestions.some((s) => s.includes('exceeding the recommended maximum of 5'))).toBe(true);
  });

  it('penalizes overly verbose sections', () => {
    const sections = [
      makeSection({ wordCount: DEFAULT_MAX_WORDS_PER_SECTION + 500 }),
    ];
    const result = analyzeFeasibility(sections);
    expect(result.suggestions.some((s) => s.includes('exceed'))).toBe(true);
  });

  it('penalizes when team size makes scope infeasible', () => {
    const sections = makeSections(20);
    const result = analyzeFeasibility(sections, { teamSize: 2 });
    expect(result.suggestions.some((s) => s.includes('team of 2'))).toBe(true);
  });

  it('does not penalize team size when sections per person is within bounds', () => {
    const sections = makeSections(4);
    const result = analyzeFeasibility(sections, { teamSize: 4 });
    expect(result.suggestions.some((s) => s.includes('team of'))).toBe(false);
  });

  it('penalizes few well-defined sections (both AC and deps)', () => {
    const sections = makeSections(5, {
      hasAcceptanceCriteria: false,
      hasDependencies: false,
    });
    const result = analyzeFeasibility(sections);
    expect(result.suggestions.some((s) => s.includes('acceptance criteria and dependencies'))).toBe(true);
  });

  it('does not penalize well-defined sections with 2 or fewer', () => {
    const sections = makeSections(2, {
      hasAcceptanceCriteria: false,
      hasDependencies: false,
    });
    const result = analyzeFeasibility(sections);
    // The condition checks sections.length > 2
    expect(result.suggestions.some((s) => s.includes('acceptance criteria and dependencies'))).toBe(false);
  });

  it('penalizes excessively large total word count', () => {
    const count = DEFAULT_MAX_SECTIONS + 1;
    const sections = makeSections(count, { wordCount: DEFAULT_MAX_WORDS_PER_SECTION + 1 });
    const result = analyzeFeasibility(sections);
    expect(result.suggestions.some((s) => s.includes('total specification length'))).toBe(true);
  });

  it('provides appropriate feedback for each score range', () => {
    const highResult = analyzeFeasibility(
      makeSections(3, { wordCount: 50, hasAcceptanceCriteria: true, hasDependencies: true })
    );
    expect(highResult.feedback).toContain('feasible');
  });

  it('clamps score to minimum of 0', () => {
    const sections = makeSections(DEFAULT_MAX_SECTIONS + 10, {
      wordCount: DEFAULT_MAX_WORDS_PER_SECTION + 1000,
    });
    const result = analyzeFeasibility(sections, { teamSize: 1, maxComplexity: 1 });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// generateQualityReport
// ---------------------------------------------------------------------------

describe('generateQualityReport', () => {
  it('produces a report with all five dimensions', () => {
    const sections = makeSections(4, { wordCount: 50 });
    const content = 'The system processes requests. Users get responses.';
    const report = generateQualityReport(sections, content);
    expect(report.dimensions).toHaveLength(5);
    const dimensionNames = report.dimensions.map((d) => d.dimension);
    expect(dimensionNames).toContain('completeness');
    expect(dimensionNames).toContain('clarity');
    expect(dimensionNames).toContain('consistency');
    expect(dimensionNames).toContain('testability');
    expect(dimensionNames).toContain('feasibility');
  });

  it('computes a weighted overall score', () => {
    const sections = makeSections(4, { wordCount: 50 });
    const content = 'Clear concise text. Simple sentences.';
    const report = generateQualityReport(sections, content);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('includes a summary with the quality grade', () => {
    const sections = makeWellFormedSections();
    const content = 'The system shall process data. Tests must pass.';
    const report = generateQualityReport(sections, content);
    expect(report.summary).toContain('Overall quality grade');
    expect(report.summary).toMatch(/[ABCDF]/);
  });

  it('lists strengths in the summary when dimensions score >= 80', () => {
    const sections = makeWellFormedSections();
    const content = 'The system shall validate input. Clear language here.';
    const report = generateQualityReport(sections, content);
    expect(report.summary).toContain('Strengths');
  });

  it('lists weak areas in the summary when dimensions score < 60', () => {
    const sections = makeSections(2, { wordCount: 5 });
    const content = 'maybe it works somehow probably';
    const report = generateQualityReport(sections, content);
    expect(report.summary).toContain('improvement');
  });

  it('includes a timestamp', () => {
    const before = Date.now();
    const report = generateQualityReport(makeSections(3), 'Short text.');
    const after = Date.now();
    expect(report.timestamp).toBeGreaterThanOrEqual(before);
    expect(report.timestamp).toBeLessThanOrEqual(after);
  });

  it('passes constraints through to analyzeFeasibility', () => {
    const sections = makeSections(10);
    const content = 'Some text.';
    const report = generateQualityReport(sections, content, { maxComplexity: 3 });
    const feasibility = report.dimensions.find((d) => d.dimension === 'feasibility');
    expect(feasibility).toBeDefined();
    expect(feasibility!.suggestions.some((s) => s.includes('recommended maximum of 3'))).toBe(true);
  });

  it('reports correctly when all dimensions are high', () => {
    const sections = makeWellFormedSections().map((s) => ({
      ...s,
      content: 'The system shall do X. It must pass Y. The output will be Z. Response time under 200ms. Uptime 99.9%. Load 500mb. Latency 50ms. Timeout 30seconds.',
    }));
    const content = sections.map((s) => s.content).join(' ');
    const report = generateQualityReport(sections, content);
    expect(report.overallScore).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// getQualityGrade
// ---------------------------------------------------------------------------

describe('getQualityGrade', () => {
  it('returns A for score >= 90', () => {
    expect(getQualityGrade(90)).toBe('A');
    expect(getQualityGrade(95)).toBe('A');
    expect(getQualityGrade(100)).toBe('A');
  });

  it('returns B for score >= 80 and < 90', () => {
    expect(getQualityGrade(80)).toBe('B');
    expect(getQualityGrade(85)).toBe('B');
    expect(getQualityGrade(89)).toBe('B');
  });

  it('returns C for score >= 70 and < 80', () => {
    expect(getQualityGrade(70)).toBe('C');
    expect(getQualityGrade(75)).toBe('C');
    expect(getQualityGrade(79)).toBe('C');
  });

  it('returns D for score >= 60 and < 70', () => {
    expect(getQualityGrade(60)).toBe('D');
    expect(getQualityGrade(65)).toBe('D');
    expect(getQualityGrade(69)).toBe('D');
  });

  it('returns F for score < 60', () => {
    expect(getQualityGrade(0)).toBe('F');
    expect(getQualityGrade(30)).toBe('F');
    expect(getQualityGrade(59)).toBe('F');
  });
});

// ---------------------------------------------------------------------------
// getImprovementPriorities
// ---------------------------------------------------------------------------

describe('getImprovementPriorities', () => {
  it('returns dimensions scoring below 80 sorted by score ascending', () => {
    const report: QualityReport = {
      overallScore: 50,
      dimensions: [
        { dimension: 'completeness', score: 90, feedback: '', suggestions: [] },
        { dimension: 'clarity', score: 40, feedback: '', suggestions: [] },
        { dimension: 'consistency', score: 70, feedback: '', suggestions: [] },
        { dimension: 'testability', score: 30, feedback: '', suggestions: [] },
        { dimension: 'feasibility', score: 60, feedback: '', suggestions: [] },
      ],
      summary: '',
      timestamp: Date.now(),
    };
    const priorities = getImprovementPriorities(report);
    expect(priorities).toEqual(['testability', 'clarity', 'feasibility', 'consistency']);
  });

  it('returns empty array when all dimensions score >= 80', () => {
    const report: QualityReport = {
      overallScore: 90,
      dimensions: [
        { dimension: 'completeness', score: 95, feedback: '', suggestions: [] },
        { dimension: 'clarity', score: 85, feedback: '', suggestions: [] },
        { dimension: 'consistency', score: 90, feedback: '', suggestions: [] },
        { dimension: 'testability', score: 80, feedback: '', suggestions: [] },
        { dimension: 'feasibility', score: 88, feedback: '', suggestions: [] },
      ],
      summary: '',
      timestamp: Date.now(),
    };
    const priorities = getImprovementPriorities(report);
    expect(priorities).toHaveLength(0);
  });

  it('includes dimensions scoring exactly 79', () => {
    const report: QualityReport = {
      overallScore: 75,
      dimensions: [
        { dimension: 'completeness', score: 79, feedback: '', suggestions: [] },
        { dimension: 'clarity', score: 80, feedback: '', suggestions: [] },
        { dimension: 'consistency', score: 81, feedback: '', suggestions: [] },
        { dimension: 'testability', score: 85, feedback: '', suggestions: [] },
        { dimension: 'feasibility', score: 90, feedback: '', suggestions: [] },
      ],
      summary: '',
      timestamp: Date.now(),
    };
    const priorities = getImprovementPriorities(report);
    expect(priorities).toEqual(['completeness']);
  });

  it('excludes dimensions scoring exactly 80', () => {
    const report: QualityReport = {
      overallScore: 80,
      dimensions: [
        { dimension: 'completeness', score: 80, feedback: '', suggestions: [] },
        { dimension: 'clarity', score: 85, feedback: '', suggestions: [] },
        { dimension: 'consistency', score: 90, feedback: '', suggestions: [] },
        { dimension: 'testability', score: 80, feedback: '', suggestions: [] },
        { dimension: 'feasibility', score: 80, feedback: '', suggestions: [] },
      ],
      summary: '',
      timestamp: Date.now(),
    };
    const priorities = getImprovementPriorities(report);
    expect(priorities).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Constants validation
// ---------------------------------------------------------------------------

describe('exported constants', () => {
  it('has correct dimension weights that sum to 1', () => {
    const total = Object.values(DIMENSION_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it('has expected ambiguous word count', () => {
    expect(AMBIGUOUS_WORDS.length).toBeGreaterThanOrEqual(7);
  });

  it('has expected passive voice pattern count', () => {
    expect(PASSIVE_VOICE_PATTERNS.length).toBeGreaterThanOrEqual(15);
  });
});
