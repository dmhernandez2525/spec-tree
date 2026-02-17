// F11.4 - AI Review Assistant
// Provides automated review capabilities for specifications and code,
// including completeness checks, security analysis, performance review,
// naming conventions, and accessibility evaluation.

export type ReviewSeverity = 'critical' | 'warning' | 'info' | 'suggestion';

export type ReviewCategory =
  | 'completeness'
  | 'security'
  | 'performance'
  | 'maintainability'
  | 'accessibility'
  | 'naming'
  | 'structure';

export interface ReviewFinding {
  id: string;
  severity: ReviewSeverity;
  category: ReviewCategory;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface ReviewResult {
  findings: ReviewFinding[];
  score: number;
  summary: string;
  reviewedAt: number;
}

export interface ReviewConfig {
  enabledCategories?: ReviewCategory[];
  minSeverity?: ReviewSeverity;
  maxFindings?: number;
}

export const SEVERITY_WEIGHTS: Record<ReviewSeverity, number> = {
  critical: 10,
  warning: 5,
  info: 2,
  suggestion: 1,
};

const ALL_CATEGORIES: ReviewCategory[] = [
  'completeness',
  'security',
  'performance',
  'maintainability',
  'accessibility',
  'naming',
  'structure',
];

export const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  enabledCategories: ALL_CATEGORIES,
  minSeverity: 'info',
  maxFindings: 50,
};

const SEVERITY_HIERARCHY: ReviewSeverity[] = [
  'critical',
  'warning',
  'info',
  'suggestion',
];

let findingCounter = 0;

export function resetFindingCounter(): void {
  findingCounter = 0;
}

function generateFindingId(): string {
  findingCounter += 1;
  return `REV-${String(findingCounter).padStart(3, '0')}`;
}

function createFinding(
  severity: ReviewSeverity,
  category: ReviewCategory,
  message: string,
  suggestion?: string,
  line?: number
): ReviewFinding {
  const finding: ReviewFinding = {
    id: generateFindingId(),
    severity,
    category,
    message,
  };
  if (line !== undefined) {
    finding.line = line;
  }
  if (suggestion !== undefined) {
    finding.suggestion = suggestion;
  }
  return finding;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function findLineNumber(content: string, pattern: RegExp): number | undefined {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1;
    }
  }
  return undefined;
}

/**
 * Checks specification content for completeness issues such as
 * missing titles, acceptance criteria, sub-headers, user stories,
 * and minimum content length.
 */
export function reviewSpecCompleteness(content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  if (!content || content.trim().length === 0) {
    findings.push(
      createFinding(
        'critical',
        'completeness',
        'Content is empty.',
        'Add specification content with a title, description, and requirements.'
      )
    );
    return findings;
  }

  // Check for missing title (no # header)
  const hasTitle = /^#\s+.+/m.test(content);
  if (!hasTitle) {
    findings.push(
      createFinding(
        'critical',
        'completeness',
        'Missing title: no top-level heading found.',
        'Add a title using a markdown heading (e.g., "# My Specification").'
      )
    );
  }

  // Check for acceptance criteria
  const hasAcceptanceCriteria =
    /acceptance\s+criteria/i.test(content) ||
    /\bAC\b/.test(content) ||
    /given\s+.+when\s+.+then/i.test(content);
  if (!hasAcceptanceCriteria) {
    findings.push(
      createFinding(
        'warning',
        'completeness',
        'No acceptance criteria found.',
        'Add acceptance criteria to define clear pass/fail conditions for the specification.'
      )
    );
  }

  // Check for too short content
  const wordCount = countWords(content);
  if (wordCount < 50) {
    findings.push(
      createFinding(
        'warning',
        'completeness',
        `Content is too short (${wordCount} words). Specifications should have at least 50 words.`,
        'Expand the specification with more details about requirements, scope, and constraints.'
      )
    );
  }

  // Check for user story or requirements
  const hasUserStory =
    /as\s+a\s+.+i\s+want/i.test(content) ||
    /user\s+stor/i.test(content);
  const hasRequirements =
    /requirement/i.test(content) ||
    /shall\s+/i.test(content) ||
    /must\s+/i.test(content);
  if (!hasUserStory && !hasRequirements) {
    findings.push(
      createFinding(
        'warning',
        'completeness',
        'No clear user story or requirements found.',
        'Add user stories (e.g., "As a user, I want...") or explicit requirements.'
      )
    );
  }

  // Check for missing sub-headers (sections)
  const subHeaders = content.match(/^#{2,}\s+.+/gm);
  if (!subHeaders || subHeaders.length === 0) {
    findings.push(
      createFinding(
        'info',
        'completeness',
        'No sub-sections found. The specification lacks structural organization.',
        'Break the specification into sections using sub-headings (e.g., "## Requirements", "## Scope").'
      )
    );
  }

  return findings;
}

/**
 * Scans content for security-related concerns including hardcoded
 * credentials, unparameterized queries, exposed API keys, and
 * missing authentication considerations.
 */
export function reviewSecurityConcerns(content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  if (!content || content.trim().length === 0) {
    return findings;
  }

  // Check for passwords/secrets without encryption
  const passwordPattern = /\b(password|secret|private.?key)\b/i;
  const encryptionPattern = /\b(encrypt|hash|bcrypt|argon|scrypt|salt)\b/i;
  if (passwordPattern.test(content) && !encryptionPattern.test(content)) {
    const line = findLineNumber(content, passwordPattern);
    findings.push(
      createFinding(
        'critical',
        'security',
        'Mentions passwords or secrets without referencing encryption or hashing.',
        'Specify encryption or hashing requirements (e.g., bcrypt, argon2) for sensitive data.',
        line
      )
    );
  }

  // Check for SQL-like queries without parameterization
  const sqlPattern = /\b(SELECT|INSERT|UPDATE|DELETE)\b.*\b(FROM|INTO|SET)\b/i;
  const paramPattern = /\b(parameterize|prepared\s+statement|bind\s+variable|\$\d|\?\s)/i;
  if (sqlPattern.test(content) && !paramPattern.test(content)) {
    const line = findLineNumber(content, sqlPattern);
    findings.push(
      createFinding(
        'critical',
        'security',
        'SQL-like queries detected without mention of parameterization.',
        'Use parameterized queries or prepared statements to prevent SQL injection.',
        line
      )
    );
  }

  // Check for URLs with API keys
  const urlApiKeyPattern = /https?:\/\/[^\s]*[?&](api[_-]?key|token|secret)=[^\s&]+/i;
  if (urlApiKeyPattern.test(content)) {
    const line = findLineNumber(content, urlApiKeyPattern);
    findings.push(
      createFinding(
        'critical',
        'security',
        'URL with embedded API key or token detected.',
        'Move API keys to environment variables or a secure vault. Never embed them in URLs.',
        line
      )
    );
  }

  // Check for hardcoded credentials patterns
  const hardcodedCredsPattern =
    /\b(api[_-]?key|token|secret|password)\s*[:=]\s*["'][^"']{8,}["']/i;
  if (hardcodedCredsPattern.test(content)) {
    const line = findLineNumber(content, hardcodedCredsPattern);
    findings.push(
      createFinding(
        'critical',
        'security',
        'Hardcoded credentials pattern detected.',
        'Use environment variables or a secrets manager instead of hardcoding credentials.',
        line
      )
    );
  }

  // Check for missing auth/authorization for sensitive operations
  const sensitiveOpsPattern =
    /\b(admin|delete|payment|billing|user\s+data|personal\s+information)\b/i;
  const authPattern =
    /\b(auth|authorization|authenticate|permission|role|rbac|access\s+control)\b/i;
  if (sensitiveOpsPattern.test(content) && !authPattern.test(content)) {
    findings.push(
      createFinding(
        'warning',
        'security',
        'Sensitive operations mentioned without authentication or authorization requirements.',
        'Define authentication and authorization requirements for sensitive operations.'
      )
    );
  }

  return findings;
}

/**
 * Reviews content for potential performance issues such as
 * unbounded queries, missing pagination, lack of caching,
 * synchronous large-data operations, and missing rate limiting.
 */
export function reviewPerformance(content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  if (!content || content.trim().length === 0) {
    return findings;
  }

  // Check for unbounded queries
  const unboundedPattern =
    /\b(all\s+records|entire\s+database|every\s+row|fetch\s+all|select\s+\*)\b/i;
  if (unboundedPattern.test(content)) {
    const line = findLineNumber(content, unboundedPattern);
    findings.push(
      createFinding(
        'warning',
        'performance',
        'Unbounded query detected (e.g., "all records", "entire database").',
        'Add limits, pagination, or filtering to avoid loading unbounded datasets.',
        line
      )
    );
  }

  // Check for missing pagination
  const listPattern = /\b(list|display|show|retrieve|fetch)\b.*\b(items|records|results|users|entries)\b/i;
  const paginationPattern = /\b(pagina|page\s+size|limit|offset|cursor|infinite\s+scroll)\b/i;
  if (listPattern.test(content) && !paginationPattern.test(content)) {
    findings.push(
      createFinding(
        'warning',
        'performance',
        'Data listing mentioned without pagination strategy.',
        'Add pagination requirements (e.g., page size, cursor-based, or infinite scroll).'
      )
    );
  }

  // Check for no caching strategy
  const dataFetchPattern = /\b(api|endpoint|fetch|request|query|database)\b/i;
  const cachingPattern = /\b(cache|caching|memoize|redis|cdn|ttl|stale|invalidat)\b/i;
  if (dataFetchPattern.test(content) && !cachingPattern.test(content)) {
    findings.push(
      createFinding(
        'info',
        'performance',
        'No caching strategy mentioned for data operations.',
        'Consider specifying caching requirements (e.g., TTL, cache invalidation, CDN).'
      )
    );
  }

  // Check for synchronous operations on large datasets
  const syncLargePattern =
    /\b(synchronous|blocking|wait\s+for)\b.*\b(large|bulk|batch|massive|million)\b/i;
  const syncLargePatternAlt =
    /\b(large|bulk|batch|massive|million)\b.*\b(synchronous|blocking|wait\s+for)\b/i;
  if (syncLargePattern.test(content) || syncLargePatternAlt.test(content)) {
    const line =
      findLineNumber(content, syncLargePattern) ||
      findLineNumber(content, syncLargePatternAlt);
    findings.push(
      createFinding(
        'warning',
        'performance',
        'Synchronous processing of large datasets detected.',
        'Use asynchronous processing, background jobs, or streaming for large datasets.',
        line
      )
    );
  }

  // Check for no rate limiting
  const apiPattern = /\b(api|endpoint|route|service)\b/i;
  const rateLimitPattern = /\b(rate\s+limit|throttl|quota|backoff|retry\s+after)\b/i;
  if (apiPattern.test(content) && !rateLimitPattern.test(content)) {
    findings.push(
      createFinding(
        'info',
        'performance',
        'No rate limiting strategy mentioned for API or service endpoints.',
        'Add rate limiting requirements to protect against abuse and ensure fair usage.'
      )
    );
  }

  return findings;
}

/**
 * Reviews content for naming convention issues, including
 * single-character variable references, unclear abbreviations,
 * inconsistent casing, and overly generic names.
 */
export function reviewNaming(content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  if (!content || content.trim().length === 0) {
    return findings;
  }

  // Check for single-character variable references
  // Look for patterns like "variable x" or "param i" or assignment-like "x ="
  const singleCharVarPattern = /\b(variable|param|let|const|var)\s+[a-z]\b/i;
  const singleCharAssignPattern = /\b[a-z]\s*=\s*[^=]/;
  if (singleCharVarPattern.test(content)) {
    const line = findLineNumber(content, singleCharVarPattern);
    findings.push(
      createFinding(
        'warning',
        'naming',
        'Single-character variable name referenced.',
        'Use descriptive variable names that convey purpose (e.g., "index" instead of "i").',
        line
      )
    );
  } else if (singleCharAssignPattern.test(content)) {
    // Only flag this at suggestion level since it could be a false positive
    const line = findLineNumber(content, singleCharAssignPattern);
    findings.push(
      createFinding(
        'suggestion',
        'naming',
        'Possible single-character variable assignment detected.',
        'Consider using descriptive names for better readability.',
        line
      )
    );
  }

  // Check for unclear abbreviations
  const abbreviationPattern = /\b(mgr|impl|util|misc|tmp|ret|val|arr|obj|fn|cb|ctx|cfg|env|srv|req|res|msg|btn|lbl|txt|num|str|int|fmt|proc|exec|cmd|sys|usr|grp|pkg|dir|lib|src|dst|buf|len|idx|cnt|ptr|ref|elem|attr|init|prev|curr|calc|max|min|avg|sum|cnt|del|ins|upd|sel|chk)\b/;
  const codeBlockPattern = /```[\s\S]*?```/g;
  const contentWithoutCode = content.replace(codeBlockPattern, '');

  // Only check non-code content for abbreviation issues
  const abbrevMatches = contentWithoutCode.match(abbreviationPattern);
  if (abbrevMatches) {
    findings.push(
      createFinding(
        'suggestion',
        'naming',
        `Unclear abbreviation found: "${abbrevMatches[0]}".`,
        'Prefer full, descriptive names in specifications (e.g., "manager" instead of "mgr").'
      )
    );
  }

  // Check for inconsistent casing styles
  const camelCasePattern = /\b[a-z]+[A-Z][a-zA-Z]*\b/g;
  const snakeCasePattern = /\b[a-z]+_[a-z]+\b/g;
  const kebabCasePattern = /\b[a-z]+-[a-z]+\b/g;

  const hasCamelCase = camelCasePattern.test(contentWithoutCode);
  const hasSnakeCase = snakeCasePattern.test(contentWithoutCode);
  const hasKebabCase = kebabCasePattern.test(contentWithoutCode);

  const casingStyles = [hasCamelCase, hasSnakeCase, hasKebabCase].filter(
    Boolean
  ).length;
  if (casingStyles > 1) {
    findings.push(
      createFinding(
        'info',
        'naming',
        'Inconsistent casing styles detected (mix of camelCase, snake_case, or kebab-case).',
        'Establish and follow a consistent naming convention throughout the specification.'
      )
    );
  }

  // Check for overly generic names
  const genericNames = ['data', 'info', 'temp', 'stuff', 'thing', 'item', 'object', 'value'];
  const genericPattern = new RegExp(
    `\\b(${genericNames.join('|')})\\b`,
    'i'
  );
  // Only flag if these appear as standalone entity names (not part of compound names)
  const genericInContext =
    /\b(the\s+data|store\s+data|pass\s+data|return\s+data|send\s+info|get\s+info|temp\s+file|temp\s+variable|some\s+stuff)\b/i;
  if (genericInContext.test(contentWithoutCode)) {
    const line = findLineNumber(content, genericInContext);
    findings.push(
      createFinding(
        'suggestion',
        'naming',
        'Overly generic name used (e.g., "data", "info", "temp", "stuff").',
        'Use specific, descriptive names that clarify what the entity represents.',
        line
      )
    );
  } else if (genericPattern.test(contentWithoutCode)) {
    // Only at suggestion level for less certain matches
    findings.push(
      createFinding(
        'suggestion',
        'naming',
        'Potentially generic naming detected. Ensure entity names are specific and descriptive.',
        'Replace generic names like "data" or "info" with domain-specific terminology.'
      )
    );
  }

  return findings;
}

/**
 * Reviews content for accessibility-related concerns such as
 * missing ARIA references, keyboard navigation, color contrast,
 * and screen reader support.
 */
export function reviewAccessibility(content: string): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  if (!content || content.trim().length === 0) {
    return findings;
  }

  // Only check accessibility if UI-related content is present
  const uiPattern =
    /\b(ui|interface|component|button|form|input|dialog|modal|menu|dropdown|tab|panel|widget|page|screen|view|layout)\b/i;
  if (!uiPattern.test(content)) {
    return findings;
  }

  // Check for ARIA mentions
  const ariaPattern = /\b(aria|role=|aria-label|aria-describedby|aria-live|wai-aria)\b/i;
  if (!ariaPattern.test(content)) {
    findings.push(
      createFinding(
        'warning',
        'accessibility',
        'UI components mentioned without ARIA attribute requirements.',
        'Specify ARIA roles and labels for interactive components (e.g., aria-label, role).'
      )
    );
  }

  // Check for keyboard navigation
  const keyboardPattern =
    /\b(keyboard|key\s+event|tab\s+order|focus|tab\s+index|keydown|keyup|keypress|hotkey|shortcut)\b/i;
  if (!keyboardPattern.test(content)) {
    findings.push(
      createFinding(
        'warning',
        'accessibility',
        'No keyboard navigation requirements specified for UI components.',
        'Define keyboard interaction patterns (e.g., tab order, focus management, keyboard shortcuts).'
      )
    );
  }

  // Check for color contrast
  const contrastPattern =
    /\b(contrast|color\s+ratio|wcag|a11y|color\s+blind|colour\s+blind|high\s+contrast)\b/i;
  if (!contrastPattern.test(content)) {
    findings.push(
      createFinding(
        'info',
        'accessibility',
        'No color contrast considerations mentioned.',
        'Include color contrast requirements (WCAG AA: 4.5:1 for text, 3:1 for large text).'
      )
    );
  }

  // Check for screen reader support
  const screenReaderPattern =
    /\b(screen\s+reader|voiceover|nvda|jaws|talkback|assistive\s+technology|alt\s+text|alternative\s+text)\b/i;
  if (!screenReaderPattern.test(content)) {
    findings.push(
      createFinding(
        'info',
        'accessibility',
        'No screen reader support mentioned.',
        'Specify screen reader requirements (e.g., alt text for images, meaningful link text, live regions).'
      )
    );
  }

  return findings;
}

/**
 * Runs all review functions against the provided content, filters
 * results based on the config (enabled categories, minimum severity,
 * maximum findings), computes a weighted score, and generates a summary.
 */
export function conductReview(
  content: string,
  config?: ReviewConfig
): ReviewResult {
  const resolvedConfig: Required<ReviewConfig> = {
    enabledCategories:
      config?.enabledCategories || DEFAULT_REVIEW_CONFIG.enabledCategories!,
    minSeverity:
      config?.minSeverity || DEFAULT_REVIEW_CONFIG.minSeverity!,
    maxFindings:
      config?.maxFindings ?? DEFAULT_REVIEW_CONFIG.maxFindings!,
  };

  const categoryReviewers: Record<string, (content: string) => ReviewFinding[]> = {
    completeness: reviewSpecCompleteness,
    security: reviewSecurityConcerns,
    performance: reviewPerformance,
    naming: reviewNaming,
    accessibility: reviewAccessibility,
  };

  let allFindings: ReviewFinding[] = [];

  resolvedConfig.enabledCategories.forEach((category) => {
    const reviewer = categoryReviewers[category];
    if (reviewer) {
      const categoryFindings = reviewer(content);
      allFindings = allFindings.concat(categoryFindings);
    }
  });

  // Filter by minimum severity
  allFindings = filterBySeverity(allFindings, resolvedConfig.minSeverity);

  // Sort findings by severity and category
  allFindings = sortFindings(allFindings);

  // Limit to maxFindings
  if (allFindings.length > resolvedConfig.maxFindings) {
    allFindings = allFindings.slice(0, resolvedConfig.maxFindings);
  }

  // Calculate score: start at 100, subtract weighted penalties
  const totalPenalty = allFindings.reduce(
    (sum, finding) => sum + SEVERITY_WEIGHTS[finding.severity],
    0
  );
  const score = Math.max(0, 100 - totalPenalty);

  const summary = generateReviewSummary(allFindings);

  return {
    findings: allFindings,
    score,
    summary,
    reviewedAt: Date.now(),
  };
}

/**
 * Formats a single finding into a human-readable string with severity,
 * category, message, and optional suggestion.
 */
export function formatFinding(finding: ReviewFinding): string {
  const severity = finding.severity.toUpperCase();
  const parts = [`[${severity}] (${finding.category}) ${finding.message}`];

  if (finding.line !== undefined) {
    parts[0] = `[${severity}] (${finding.category}) Line ${finding.line}: ${finding.message}`;
  }

  if (finding.suggestion) {
    parts.push(`Suggestion: ${finding.suggestion}`);
  }

  return parts.join(' ');
}

/**
 * Produces a multi-line summary showing total finding count,
 * counts per severity level, and the top affected categories.
 */
export function generateReviewSummary(findings: ReviewFinding[]): string {
  if (findings.length === 0) {
    return 'No findings. The specification looks good!';
  }

  const lines: string[] = [];
  lines.push(`Review completed with ${findings.length} finding(s).`);
  lines.push('');

  // Count findings per severity
  const severityCounts: Record<string, number> = {};
  findings.forEach((f) => {
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1;
  });

  lines.push('Findings by severity:');
  SEVERITY_HIERARCHY.forEach((severity) => {
    const count = severityCounts[severity] || 0;
    if (count > 0) {
      lines.push(`  ${severity}: ${count}`);
    }
  });

  // Count findings per category
  const categoryCounts: Record<string, number> = {};
  findings.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  // Sort categories by count descending
  const sortedCategories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );

  lines.push('');
  lines.push('Top categories:');
  sortedCategories.forEach(([category, count]) => {
    lines.push(`  ${category}: ${count}`);
  });

  return lines.join('\n');
}

/**
 * Filters findings to include only those at or above the specified
 * minimum severity level, based on the hierarchy:
 * critical > warning > info > suggestion.
 */
export function filterBySeverity(
  findings: ReviewFinding[],
  minSeverity: ReviewSeverity
): ReviewFinding[] {
  const minIndex = SEVERITY_HIERARCHY.indexOf(minSeverity);
  if (minIndex === -1) return findings;

  return findings.filter((finding) => {
    const findingIndex = SEVERITY_HIERARCHY.indexOf(finding.severity);
    return findingIndex <= minIndex;
  });
}

/**
 * Sorts findings by severity weight (descending), with ties broken
 * by category name (alphabetically ascending).
 */
export function sortFindings(findings: ReviewFinding[]): ReviewFinding[] {
  return [...findings].sort((a, b) => {
    const weightDiff = SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity];
    if (weightDiff !== 0) return weightDiff;
    return a.category.localeCompare(b.category);
  });
}
