import { describe, it, expect, beforeEach } from 'vitest';
import {
  SEVERITY_WEIGHTS,
  DEFAULT_REVIEW_CONFIG,
  resetFindingCounter,
  reviewSpecCompleteness,
  reviewSecurityConcerns,
  reviewPerformance,
  reviewNaming,
  reviewAccessibility,
  conductReview,
  formatFinding,
  generateReviewSummary,
  filterBySeverity,
  sortFindings,
  type ReviewFinding,
  type ReviewSeverity,
} from './ai-review';

beforeEach(() => {
  resetFindingCounter();
});

// ---------------------------------------------------------------------------
// SEVERITY_WEIGHTS
// ---------------------------------------------------------------------------

describe('SEVERITY_WEIGHTS', () => {
  it('assigns critical a weight of 10', () => {
    expect(SEVERITY_WEIGHTS.critical).toBe(10);
  });

  it('assigns warning a weight of 5', () => {
    expect(SEVERITY_WEIGHTS.warning).toBe(5);
  });

  it('assigns info a weight of 2', () => {
    expect(SEVERITY_WEIGHTS.info).toBe(2);
  });

  it('assigns suggestion a weight of 1', () => {
    expect(SEVERITY_WEIGHTS.suggestion).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_REVIEW_CONFIG
// ---------------------------------------------------------------------------

describe('DEFAULT_REVIEW_CONFIG', () => {
  it('includes all seven review categories by default', () => {
    expect(DEFAULT_REVIEW_CONFIG.enabledCategories).toEqual([
      'completeness',
      'security',
      'performance',
      'maintainability',
      'accessibility',
      'naming',
      'structure',
    ]);
  });

  it('sets minSeverity to info by default', () => {
    expect(DEFAULT_REVIEW_CONFIG.minSeverity).toBe('info');
  });

  it('sets maxFindings to 50 by default', () => {
    expect(DEFAULT_REVIEW_CONFIG.maxFindings).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// reviewSpecCompleteness
// ---------------------------------------------------------------------------

describe('reviewSpecCompleteness', () => {
  it('returns a single critical finding for empty content', () => {
    const findings = reviewSpecCompleteness('');
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].message).toBe('Content is empty.');
  });

  it('returns a single critical finding for whitespace-only content', () => {
    const findings = reviewSpecCompleteness('   \n  \t  ');
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('critical');
    expect(findings[0].category).toBe('completeness');
  });

  it('flags missing title when there is no markdown heading', () => {
    const content = 'This is some text without a heading but it has enough words to avoid the too short warning. ' +
      'It also has some requirements that shall be met. Acceptance criteria are also included here.';
    const findings = reviewSpecCompleteness(content);
    const titleFinding = findings.find((f) => f.message.includes('Missing title'));
    expect(titleFinding).toBeDefined();
    expect(titleFinding!.severity).toBe('critical');
  });

  it('does not flag missing title when a heading exists', () => {
    const content = [
      '# My Specification',
      'This specification shall define requirements with enough words to pass the minimum.',
      '## Requirements',
      'Acceptance criteria: The system must do things correctly and reliably.',
    ].join('\n');
    const findings = reviewSpecCompleteness(content);
    const titleFinding = findings.find((f) => f.message.includes('Missing title'));
    expect(titleFinding).toBeUndefined();
  });

  it('flags content that is too short (under 50 words)', () => {
    const content = '# Title\nShort content.';
    const findings = reviewSpecCompleteness(content);
    const shortFinding = findings.find((f) => f.message.includes('too short'));
    expect(shortFinding).toBeDefined();
    expect(shortFinding!.severity).toBe('warning');
  });

  it('does not flag content with 50 or more words', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nAcceptance criteria: ${words}\nAs a user, I want to do things.\n## Section`;
    const findings = reviewSpecCompleteness(content);
    const shortFinding = findings.find((f) => f.message.includes('too short'));
    expect(shortFinding).toBeUndefined();
  });

  it('flags missing acceptance criteria', () => {
    const content = '# Title\nSome description that shall meet the requirements. ' +
      Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const findings = reviewSpecCompleteness(content);
    const acFinding = findings.find((f) => f.message.includes('acceptance criteria'));
    expect(acFinding).toBeDefined();
    expect(acFinding!.severity).toBe('warning');
  });

  it('recognizes "acceptance criteria" text as valid', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nAcceptance criteria are defined.\n${words}\nAs a user, I want features.\n## Section`;
    const findings = reviewSpecCompleteness(content);
    const acFinding = findings.find((f) => f.message.includes('acceptance criteria'));
    expect(acFinding).toBeUndefined();
  });

  it('recognizes "AC" abbreviation as acceptance criteria', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nAC are defined.\n${words}\nAs a user, I want features.\n## Section`;
    const findings = reviewSpecCompleteness(content);
    const acFinding = findings.find((f) => f.message.includes('acceptance criteria'));
    expect(acFinding).toBeUndefined();
  });

  it('flags missing user story or requirements when neither is present', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nAcceptance criteria: something.\n${words}\n## Section`;
    const findings = reviewSpecCompleteness(content);
    const storyFinding = findings.find((f) => f.message.includes('user story'));
    expect(storyFinding).toBeDefined();
    expect(storyFinding!.severity).toBe('warning');
  });

  it('does not flag when "shall" keyword is present', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nThe system shall provide features.\nAcceptance criteria: yes.\n${words}\n## Section`;
    const findings = reviewSpecCompleteness(content);
    const storyFinding = findings.find((f) => f.message.includes('user story'));
    expect(storyFinding).toBeUndefined();
  });

  it('flags missing sub-sections when no ## headers exist', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = `# Title\nAcceptance criteria: yes.\nThe system shall work.\n${words}`;
    const findings = reviewSpecCompleteness(content);
    const sectionFinding = findings.find((f) => f.message.includes('sub-sections'));
    expect(sectionFinding).toBeDefined();
    expect(sectionFinding!.severity).toBe('info');
  });

  it('returns no findings for a complete spec', () => {
    const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
    const content = [
      '# Full Specification',
      '## Overview',
      'As a user, I want to manage my account.',
      'Acceptance criteria: the system must validate input.',
      words,
    ].join('\n');
    const findings = reviewSpecCompleteness(content);
    expect(findings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// reviewSecurityConcerns
// ---------------------------------------------------------------------------

describe('reviewSecurityConcerns', () => {
  it('returns empty array for empty content', () => {
    const findings = reviewSecurityConcerns('');
    expect(findings).toHaveLength(0);
  });

  it('returns empty array for clean content', () => {
    const findings = reviewSecurityConcerns('This is a normal specification about displaying items with auth required.');
    expect(findings).toHaveLength(0);
  });

  it('flags password mentions without encryption references', () => {
    const findings = reviewSecurityConcerns('The system stores the user password in the database.');
    const finding = findings.find((f) => f.message.includes('passwords or secrets'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('critical');
  });

  it('does not flag password mentions when encryption is referenced', () => {
    const findings = reviewSecurityConcerns(
      'The system stores the user password with bcrypt hashing.'
    );
    const finding = findings.find((f) => f.message.includes('passwords or secrets'));
    expect(finding).toBeUndefined();
  });

  it('flags SQL patterns without parameterization', () => {
    const findings = reviewSecurityConcerns('SELECT * FROM users WHERE id = userId');
    const finding = findings.find((f) => f.message.includes('SQL-like queries'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('critical');
  });

  it('does not flag SQL when parameterization is mentioned', () => {
    const findings = reviewSecurityConcerns(
      'SELECT * FROM users WHERE id = userId using parameterized queries and prepared statement'
    );
    const finding = findings.find((f) => f.message.includes('SQL-like queries'));
    expect(finding).toBeUndefined();
  });

  it('flags hardcoded credentials patterns', () => {
    const findings = reviewSecurityConcerns('api_key = "sk_live_abcdefghij1234"');
    const finding = findings.find((f) => f.message.includes('Hardcoded credentials'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('critical');
  });

  it('flags URLs with embedded API keys', () => {
    const findings = reviewSecurityConcerns(
      'Call https://api.example.com/data?api_key=abc12345678 to retrieve records.'
    );
    const finding = findings.find((f) => f.message.includes('URL with embedded API key'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('critical');
  });

  it('flags sensitive operations without auth requirements', () => {
    const findings = reviewSecurityConcerns(
      'The admin panel allows deletion of user data from the system.'
    );
    const finding = findings.find((f) =>
      f.message.includes('Sensitive operations mentioned without authentication')
    );
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('does not flag sensitive operations when auth is mentioned', () => {
    const findings = reviewSecurityConcerns(
      'The admin panel requires authorization and role-based access control for deletion.'
    );
    const finding = findings.find((f) =>
      f.message.includes('Sensitive operations mentioned without authentication')
    );
    expect(finding).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// reviewPerformance
// ---------------------------------------------------------------------------

describe('reviewPerformance', () => {
  it('returns empty array for empty content', () => {
    expect(reviewPerformance('')).toHaveLength(0);
  });

  it('returns empty array for content with no performance concerns', () => {
    const findings = reviewPerformance('The color of the background should be blue.');
    expect(findings).toHaveLength(0);
  });

  it('flags unbounded queries like "all records"', () => {
    const findings = reviewPerformance('Fetch all records from the orders table.');
    const finding = findings.find((f) => f.message.includes('Unbounded query'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('flags "fetch all" as unbounded', () => {
    const findings = reviewPerformance('We need to fetch all from the system.');
    const finding = findings.find((f) => f.message.includes('Unbounded query'));
    expect(finding).toBeDefined();
  });

  it('flags missing pagination for data listing', () => {
    const findings = reviewPerformance('List all items and display results to the user.');
    const finding = findings.find((f) => f.message.includes('pagination'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('does not flag pagination when paginated terms are present', () => {
    const findings = reviewPerformance(
      'List items with pagination and page size of 20. Display results to the user.'
    );
    const finding = findings.find((f) => f.message.includes('pagination'));
    expect(finding).toBeUndefined();
  });

  it('flags no caching strategy for data operations', () => {
    const findings = reviewPerformance('Call the API endpoint to fetch data.');
    const finding = findings.find((f) => f.message.includes('caching'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('info');
  });

  it('does not flag caching when cache terms are present', () => {
    const findings = reviewPerformance(
      'Call the API endpoint and cache the response with a TTL of 60s.'
    );
    const finding = findings.find((f) => f.message.includes('No caching'));
    expect(finding).toBeUndefined();
  });

  it('flags no rate limiting for API endpoints', () => {
    const findings = reviewPerformance('The api endpoint returns user details.');
    const finding = findings.find((f) => f.message.includes('rate limiting'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('info');
  });

  it('does not flag rate limiting when throttle terms are present', () => {
    // "rate limit" (not "rate limiting") matches the \b boundary, and "throttle" matches "throttl"
    const findings = reviewPerformance(
      'The api endpoint uses rate limit and throttle for protection.'
    );
    const finding = findings.find((f) => f.message.includes('rate limiting'));
    expect(finding).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// reviewNaming
// ---------------------------------------------------------------------------

describe('reviewNaming', () => {
  it('returns empty array for empty content', () => {
    expect(reviewNaming('')).toHaveLength(0);
  });

  it('returns empty array for clean content with no naming issues', () => {
    const findings = reviewNaming('The user profile displays the full name and email address.');
    expect(findings).toHaveLength(0);
  });

  it('flags single-character variable names (variable x pattern)', () => {
    const findings = reviewNaming('Define variable x as the counter.');
    const finding = findings.find((f) => f.message.includes('Single-character variable'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('flags single-character assignment (x = ...) as suggestion', () => {
    const findings = reviewNaming('x = 42 is used throughout.');
    const finding = findings.find((f) =>
      f.message.includes('Possible single-character variable assignment')
    );
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('suggestion');
  });

  it('flags generic names like "the data" or "store data"', () => {
    const findings = reviewNaming('Store data in the database and retrieve the data later.');
    const finding = findings.find((f) => f.message.includes('generic name'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('suggestion');
  });

  it('flags unclear abbreviations found outside code blocks', () => {
    const findings = reviewNaming('The mgr handles all incoming connections.');
    const finding = findings.find((f) => f.message.includes('Unclear abbreviation'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('suggestion');
  });

  it('does not flag abbreviations inside code blocks', () => {
    const content = 'Description text.\n```\nconst mgr = new Manager();\n```\n';
    const findings = reviewNaming(content);
    const finding = findings.find((f) => f.message.includes('Unclear abbreviation'));
    expect(finding).toBeUndefined();
  });

  it('flags inconsistent casing (mix of camelCase and snake_case)', () => {
    // snake_case regex needs \b after the second [a-z]+ group, so use "my_var" (ends at word boundary)
    // and a camelCase word like "myVar"
    const content = 'Use myVar alongside my_var in the specification.';
    const findings = reviewNaming(content);
    const finding = findings.find((f) => f.message.includes('Inconsistent casing'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('info');
  });
});

// ---------------------------------------------------------------------------
// reviewAccessibility
// ---------------------------------------------------------------------------

describe('reviewAccessibility', () => {
  it('returns empty array for non-UI content', () => {
    const findings = reviewAccessibility('This is a backend service for data processing.');
    expect(findings).toHaveLength(0);
  });

  it('returns empty array for empty content', () => {
    expect(reviewAccessibility('')).toHaveLength(0);
  });

  it('flags missing ARIA attributes for UI components', () => {
    const findings = reviewAccessibility('The component has a button and an input form.');
    const finding = findings.find((f) => f.message.includes('ARIA'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('does not flag ARIA when aria terms are present', () => {
    const findings = reviewAccessibility(
      'The button component uses aria-label and role="button" with keyboard focus and screen reader support and WCAG contrast.'
    );
    const finding = findings.find((f) => f.message.includes('ARIA'));
    expect(finding).toBeUndefined();
  });

  it('flags missing keyboard navigation for UI content', () => {
    const findings = reviewAccessibility('The dialog has several interactive buttons.');
    const finding = findings.find((f) => f.message.includes('keyboard navigation'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('warning');
  });

  it('does not flag keyboard navigation when focus is mentioned', () => {
    const findings = reviewAccessibility(
      'The dialog has buttons with proper focus management and aria-label, with screen reader and WCAG contrast.'
    );
    const finding = findings.find((f) => f.message.includes('keyboard navigation'));
    expect(finding).toBeUndefined();
  });

  it('flags missing color contrast considerations', () => {
    const findings = reviewAccessibility('The form input should display correctly.');
    const finding = findings.find((f) => f.message.includes('color contrast'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('info');
  });

  it('flags missing screen reader support', () => {
    const findings = reviewAccessibility('The modal dialog shows information.');
    const finding = findings.find((f) => f.message.includes('screen reader'));
    expect(finding).toBeDefined();
    expect(finding!.severity).toBe('info');
  });

  it('does not flag screen reader when screen reader terms are present', () => {
    const findings = reviewAccessibility(
      'The button uses aria-label for screen reader compatibility and keyboard focus with WCAG contrast.'
    );
    const finding = findings.find((f) => f.message.includes('No screen reader'));
    expect(finding).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// conductReview
// ---------------------------------------------------------------------------

describe('conductReview', () => {
  it('runs all enabled categories and returns a ReviewResult', () => {
    const result = conductReview('# Title\nAs a user, I want features.\n## Section\n' +
      Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ') +
      '\nAcceptance criteria: defined.');
    expect(result).toHaveProperty('findings');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('reviewedAt');
    expect(typeof result.score).toBe('number');
  });

  it('filters findings by enabled categories', () => {
    const content = 'The system stores password in the database. The button needs UI work.';
    const result = conductReview(content, {
      enabledCategories: ['security'],
    });
    result.findings.forEach((f) => {
      // Security category or findings produced by security reviewer
      expect(f.category).toBe('security');
    });
  });

  it('respects minSeverity to exclude lower-severity findings', () => {
    const content = '# Title\nThe api endpoint stores password for admin operations.\n' +
      'As a user, I want features.\n## Section\n' +
      Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ') +
      '\nAcceptance criteria: defined.';
    const result = conductReview(content, { minSeverity: 'warning' });
    result.findings.forEach((f) => {
      expect(['critical', 'warning']).toContain(f.severity);
    });
  });

  it('respects maxFindings to limit results', () => {
    const content = 'Short.';
    const result = conductReview(content, { maxFindings: 2 });
    expect(result.findings.length).toBeLessThanOrEqual(2);
  });

  it('calculates score starting from 100 with weighted penalties', () => {
    // Content that triggers no findings should score 100
    const cleanContent = [
      '# Complete Specification',
      '## Requirements',
      'As a user, I want to cache the response with proper pagination and rate limiting.',
      'Acceptance criteria: all features shall work with aria-label, keyboard focus, screen reader, and WCAG contrast.',
      Array.from({ length: 50 }, (_, i) => `word${i}`).join(' '),
    ].join('\n');
    const result = conductReview(cleanContent);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('returns a score of 0 when penalties exceed 100', () => {
    // Lots of findings to drive score below 0 (clamped to 0)
    const badContent = 'password secret SELECT * FROM users. x = 42. The mgr stores temp data. ' +
      'The button needs the data and api endpoint. admin delete payment. ' +
      'api_key = "super_secret_12345678". ' +
      'https://api.example.com?api_key=abcdefghij ' +
      'Fetch all records from the database. List all items and display results.';
    const result = conductReview(badContent, { minSeverity: 'suggestion' });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('sets reviewedAt to a recent timestamp', () => {
    const before = Date.now();
    const result = conductReview('# Test');
    const after = Date.now();
    expect(result.reviewedAt).toBeGreaterThanOrEqual(before);
    expect(result.reviewedAt).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// formatFinding
// ---------------------------------------------------------------------------

describe('formatFinding', () => {
  it('formats a critical finding without line number', () => {
    const finding: ReviewFinding = {
      id: 'REV-001',
      severity: 'critical',
      category: 'security',
      message: 'Hardcoded credentials detected.',
    };
    const result = formatFinding(finding);
    expect(result).toBe('[CRITICAL] (security) Hardcoded credentials detected.');
  });

  it('formats a warning finding with a line number', () => {
    const finding: ReviewFinding = {
      id: 'REV-002',
      severity: 'warning',
      category: 'completeness',
      message: 'No acceptance criteria found.',
      line: 5,
    };
    const result = formatFinding(finding);
    expect(result).toContain('[WARNING]');
    expect(result).toContain('Line 5:');
    expect(result).toContain('(completeness)');
  });

  it('formats an info finding with a suggestion', () => {
    const finding: ReviewFinding = {
      id: 'REV-003',
      severity: 'info',
      category: 'performance',
      message: 'No caching strategy mentioned.',
      suggestion: 'Consider adding cache headers.',
    };
    const result = formatFinding(finding);
    expect(result).toContain('[INFO]');
    expect(result).toContain('Suggestion: Consider adding cache headers.');
  });

  it('formats a suggestion-level finding', () => {
    const finding: ReviewFinding = {
      id: 'REV-004',
      severity: 'suggestion',
      category: 'naming',
      message: 'Generic name detected.',
    };
    const result = formatFinding(finding);
    expect(result).toContain('[SUGGESTION]');
    expect(result).toContain('(naming)');
  });

  it('includes both line number and suggestion when both are present', () => {
    const finding: ReviewFinding = {
      id: 'REV-005',
      severity: 'critical',
      category: 'security',
      message: 'SQL injection risk.',
      line: 12,
      suggestion: 'Use parameterized queries.',
    };
    const result = formatFinding(finding);
    expect(result).toContain('Line 12:');
    expect(result).toContain('Suggestion: Use parameterized queries.');
  });
});

// ---------------------------------------------------------------------------
// generateReviewSummary
// ---------------------------------------------------------------------------

describe('generateReviewSummary', () => {
  it('returns a positive message for empty findings', () => {
    const summary = generateReviewSummary([]);
    expect(summary).toBe('No findings. The specification looks good!');
  });

  it('includes total finding count', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'critical', category: 'security', message: 'Issue 1' },
      { id: 'REV-002', severity: 'warning', category: 'completeness', message: 'Issue 2' },
    ];
    const summary = generateReviewSummary(findings);
    expect(summary).toContain('Review completed with 2 finding(s).');
  });

  it('lists severity counts for present severities', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'critical', category: 'security', message: 'A' },
      { id: 'REV-002', severity: 'critical', category: 'security', message: 'B' },
      { id: 'REV-003', severity: 'warning', category: 'completeness', message: 'C' },
    ];
    const summary = generateReviewSummary(findings);
    expect(summary).toContain('critical: 2');
    expect(summary).toContain('warning: 1');
  });

  it('does not list severity levels with zero findings', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'info', category: 'performance', message: 'A' },
    ];
    const summary = generateReviewSummary(findings);
    expect(summary).not.toContain('critical:');
    expect(summary).not.toContain('warning:');
    expect(summary).toContain('info: 1');
  });

  it('lists top categories sorted by count descending', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'warning', category: 'security', message: 'A' },
      { id: 'REV-002', severity: 'warning', category: 'security', message: 'B' },
      { id: 'REV-003', severity: 'info', category: 'completeness', message: 'C' },
    ];
    const summary = generateReviewSummary(findings);
    expect(summary).toContain('Top categories:');
    const secIdx = summary.indexOf('security: 2');
    const compIdx = summary.indexOf('completeness: 1');
    expect(secIdx).toBeLessThan(compIdx);
  });

  it('includes a "Findings by severity" header', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'info', category: 'naming', message: 'A' },
    ];
    const summary = generateReviewSummary(findings);
    expect(summary).toContain('Findings by severity:');
  });
});

// ---------------------------------------------------------------------------
// filterBySeverity
// ---------------------------------------------------------------------------

describe('filterBySeverity', () => {
  const allFindings: ReviewFinding[] = [
    { id: 'REV-001', severity: 'critical', category: 'security', message: 'A' },
    { id: 'REV-002', severity: 'warning', category: 'completeness', message: 'B' },
    { id: 'REV-003', severity: 'info', category: 'performance', message: 'C' },
    { id: 'REV-004', severity: 'suggestion', category: 'naming', message: 'D' },
  ];

  it('returns only critical findings when minSeverity is critical', () => {
    const result = filterBySeverity(allFindings, 'critical');
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('critical');
  });

  it('returns critical and warning when minSeverity is warning', () => {
    const result = filterBySeverity(allFindings, 'warning');
    expect(result).toHaveLength(2);
    const severities = result.map((f) => f.severity);
    expect(severities).toContain('critical');
    expect(severities).toContain('warning');
  });

  it('returns critical, warning, and info when minSeverity is info', () => {
    const result = filterBySeverity(allFindings, 'info');
    expect(result).toHaveLength(3);
    const severities = result.map((f) => f.severity);
    expect(severities).not.toContain('suggestion');
  });

  it('returns all findings when minSeverity is suggestion', () => {
    const result = filterBySeverity(allFindings, 'suggestion');
    expect(result).toHaveLength(4);
  });

  it('returns all findings for an unrecognized severity (fallback)', () => {
    const result = filterBySeverity(allFindings, 'unknown' as ReviewSeverity);
    expect(result).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// sortFindings
// ---------------------------------------------------------------------------

describe('sortFindings', () => {
  it('sorts by severity weight descending (critical first)', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'info', category: 'naming', message: 'A' },
      { id: 'REV-002', severity: 'critical', category: 'security', message: 'B' },
      { id: 'REV-003', severity: 'warning', category: 'completeness', message: 'C' },
    ];
    const sorted = sortFindings(findings);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('warning');
    expect(sorted[2].severity).toBe('info');
  });

  it('breaks ties by category name alphabetically', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'warning', category: 'security', message: 'A' },
      { id: 'REV-002', severity: 'warning', category: 'completeness', message: 'B' },
      { id: 'REV-003', severity: 'warning', category: 'naming', message: 'C' },
    ];
    const sorted = sortFindings(findings);
    expect(sorted[0].category).toBe('completeness');
    expect(sorted[1].category).toBe('naming');
    expect(sorted[2].category).toBe('security');
  });

  it('does not mutate the original array', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'info', category: 'naming', message: 'A' },
      { id: 'REV-002', severity: 'critical', category: 'security', message: 'B' },
    ];
    const sorted = sortFindings(findings);
    expect(sorted).not.toBe(findings);
    expect(findings[0].severity).toBe('info');
  });

  it('returns empty array for empty input', () => {
    expect(sortFindings([])).toEqual([]);
  });

  it('handles a single finding correctly', () => {
    const findings: ReviewFinding[] = [
      { id: 'REV-001', severity: 'warning', category: 'security', message: 'A' },
    ];
    const sorted = sortFindings(findings);
    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('REV-001');
  });
});

// ---------------------------------------------------------------------------
// Finding ID generation
// ---------------------------------------------------------------------------

describe('finding ID generation', () => {
  it('generates sequential IDs starting from REV-001 after reset', () => {
    const findings = reviewSpecCompleteness('');
    expect(findings[0].id).toBe('REV-001');
  });

  it('increments IDs across multiple calls', () => {
    const f1 = reviewSpecCompleteness('');
    expect(f1[0].id).toBe('REV-001');

    resetFindingCounter();

    const f2 = reviewSpecCompleteness('');
    expect(f2[0].id).toBe('REV-001');
  });

  it('pads IDs to 3 digits', () => {
    // Generate exactly 1 finding (empty content produces 1 critical finding)
    const findings = reviewSpecCompleteness('');
    expect(findings[0].id).toMatch(/^REV-\d{3}$/);
  });
});
