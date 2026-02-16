/**
 * Compliance & Audit (F12.2)
 *
 * Provides compliance checking against common standards (GDPR, HIPAA,
 * SOC2, ISO 27001), data retention policy management, GDPR data subject
 * request handling, and compliance report generation.
 */

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type ComplianceStandard = 'gdpr' | 'hipaa' | 'soc2' | 'iso27001';

export type ComplianceStatus =
  | 'compliant'
  | 'non-compliant'
  | 'partial'
  | 'not-applicable';

export interface ComplianceCheck {
  id: string;
  standard: ComplianceStandard;
  requirement: string;
  status: ComplianceStatus;
  notes: string;
  checkedAt: number;
}

export interface RetentionPolicy {
  id: string;
  dataType: string;
  retentionDays: number;
  deleteAfterExpiry: boolean;
  description: string;
}

export interface DataSubjectRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  subjectEmail: string;
  requestedAt: number;
  completedAt?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
}

export interface ComplianceReport {
  generatedAt: number;
  standards: ComplianceStandard[];
  checks: ComplianceCheck[];
  overallStatus: ComplianceStatus;
  score: number;
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const GDPR_REQUIREMENTS: string[] = [
  'Right to access personal data',
  'Right to data portability',
  'Right to erasure',
  'Data breach notification within 72 hours',
  'Privacy impact assessment',
  'Consent management',
];

export const DEFAULT_RETENTION_POLICIES: RetentionPolicy[] = [
  {
    id: 'retention-user-data',
    dataType: 'user-data',
    retentionDays: 730,
    deleteAfterExpiry: false,
    description: 'User account and profile data retained for two years after deletion',
  },
  {
    id: 'retention-audit-logs',
    dataType: 'audit-logs',
    retentionDays: 365,
    deleteAfterExpiry: true,
    description: 'Audit log entries retained for one year then automatically purged',
  },
  {
    id: 'retention-session-data',
    dataType: 'session-data',
    retentionDays: 30,
    deleteAfterExpiry: true,
    description: 'Session tokens and temporary auth data retained for 30 days',
  },
  {
    id: 'retention-analytics',
    dataType: 'analytics',
    retentionDays: 90,
    deleteAfterExpiry: true,
    description: 'Usage analytics and telemetry data retained for 90 days',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;

function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

const MS_PER_DAY = 86_400_000;

// ---------------------------------------------------------------------------
// Functions
// ---------------------------------------------------------------------------

/**
 * Create a single compliance check record.
 */
export function createComplianceCheck(
  standard: ComplianceStandard,
  requirement: string,
  status: ComplianceStatus,
  notes: string = '',
): ComplianceCheck {
  return {
    id: generateId('chk'),
    standard,
    requirement,
    status,
    notes,
    checkedAt: Date.now(),
  };
}

/**
 * Run a full GDPR compliance check against the provided configuration.
 *
 * Each boolean flag maps to one of the GDPR_REQUIREMENTS entries.
 * A true value marks the requirement as compliant; false marks it
 * as non-compliant.
 */
export function runGDPRChecks(config: {
  hasConsentManagement: boolean;
  hasDataPortability: boolean;
  hasErasureSupport: boolean;
  hasBreachNotification: boolean;
  hasPrivacyAssessment: boolean;
  hasAccessRequest: boolean;
}): ComplianceCheck[] {
  const flagMap: [string, boolean][] = [
    ['Right to access personal data', config.hasAccessRequest],
    ['Right to data portability', config.hasDataPortability],
    ['Right to erasure', config.hasErasureSupport],
    ['Data breach notification within 72 hours', config.hasBreachNotification],
    ['Privacy impact assessment', config.hasPrivacyAssessment],
    ['Consent management', config.hasConsentManagement],
  ];

  return flagMap.map(([requirement, met]) =>
    createComplianceCheck(
      'gdpr',
      requirement,
      met ? 'compliant' : 'non-compliant',
      met ? 'Requirement satisfied' : 'Requirement not yet implemented',
    ),
  );
}

/**
 * Calculate a compliance score as a percentage (0 to 100).
 *
 * Compliant checks count as 1, partial checks count as 0.5, and
 * non-compliant or not-applicable checks count as 0.
 */
export function calculateComplianceScore(checks: ComplianceCheck[]): number {
  if (checks.length === 0) return 0;

  const total = checks.reduce((sum, check) => {
    if (check.status === 'compliant') return sum + 1;
    if (check.status === 'partial') return sum + 0.5;
    return sum;
  }, 0);

  return Math.round((total / checks.length) * 100);
}

/**
 * Derive an overall compliance status from a set of checks.
 *
 * - All compliant => 'compliant'
 * - Any non-compliant => 'non-compliant'
 * - Otherwise => 'partial'
 */
export function getOverallStatus(checks: ComplianceCheck[]): ComplianceStatus {
  if (checks.length === 0) return 'not-applicable';

  const allCompliant = checks.every((c) => c.status === 'compliant');
  if (allCompliant) return 'compliant';

  const anyNonCompliant = checks.some((c) => c.status === 'non-compliant');
  if (anyNonCompliant) return 'non-compliant';

  return 'partial';
}

/**
 * Generate a full compliance report including score, overall status,
 * and actionable recommendations for each non-compliant item.
 */
export function generateComplianceReport(
  checks: ComplianceCheck[],
  standards: ComplianceStandard[],
): ComplianceReport {
  const score = calculateComplianceScore(checks);
  const overallStatus = getOverallStatus(checks);

  const recommendations: string[] = checks
    .filter((c) => c.status === 'non-compliant' || c.status === 'partial')
    .map((c) => {
      const label = c.status === 'non-compliant' ? 'REQUIRED' : 'RECOMMENDED';
      return `[${label}] ${c.standard.toUpperCase()}: ${c.requirement}`;
    });

  return {
    generatedAt: Date.now(),
    standards,
    checks,
    overallStatus,
    score,
    recommendations,
  };
}

/**
 * Create a data retention policy.
 */
export function createRetentionPolicy(
  dataType: string,
  retentionDays: number,
  deleteAfterExpiry: boolean,
  description: string = '',
): RetentionPolicy {
  return {
    id: generateId('ret'),
    dataType,
    retentionDays,
    deleteAfterExpiry,
    description,
  };
}

/**
 * Determine whether a record has exceeded its retention period.
 */
export function isDataExpired(
  createdAt: number,
  policy: RetentionPolicy,
): boolean {
  const expiryTimestamp = createdAt + policy.retentionDays * MS_PER_DAY;
  return Date.now() > expiryTimestamp;
}

/**
 * Create a GDPR data subject request (access, deletion, portability,
 * or rectification) with an initial status of "pending".
 */
export function createDataSubjectRequest(
  type: DataSubjectRequest['type'],
  subjectEmail: string,
): DataSubjectRequest {
  return {
    id: generateId('dsr'),
    type,
    subjectEmail,
    requestedAt: Date.now(),
    status: 'pending',
  };
}

/**
 * Mark a data subject request as completed and record the completion
 * timestamp. Returns a new object; the original is not mutated.
 */
export function completeDataSubjectRequest(
  request: DataSubjectRequest,
): DataSubjectRequest {
  return {
    ...request,
    status: 'completed',
    completedAt: Date.now(),
  };
}

/**
 * Identify records that have exceeded their matching retention policy.
 *
 * Each record is compared against the policy whose dataType matches. Records
 * without a matching policy are excluded from the result.
 */
export function getExpiredData(
  records: { id: string; dataType: string; createdAt: number }[],
  policies: RetentionPolicy[],
): { id: string; dataType: string; createdAt: number }[] {
  return records.filter((record) => {
    const policy = policies.find((p) => p.dataType === record.dataType);
    if (!policy) return false;
    return isDataExpired(record.createdAt, policy);
  });
}

/**
 * Format a compliance report as a Markdown string suitable for
 * display, export, or inclusion in documentation.
 */
export function formatComplianceReport(report: ComplianceReport): string {
  const lines: string[] = [];

  lines.push('# Compliance Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date(report.generatedAt).toISOString()}`);
  lines.push(`**Standards:** ${report.standards.map((s) => s.toUpperCase()).join(', ')}`);
  lines.push(`**Overall Status:** ${report.overallStatus}`);
  lines.push(`**Score:** ${report.score}%`);
  lines.push('');

  lines.push('## Checks');
  lines.push('');
  lines.push('| Standard | Requirement | Status | Notes |');
  lines.push('|----------|-------------|--------|-------|');
  report.checks.forEach((check) => {
    lines.push(
      `| ${check.standard.toUpperCase()} | ${check.requirement} | ${check.status} | ${check.notes} |`,
    );
  });
  lines.push('');

  if (report.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    report.recommendations.forEach((rec) => {
      lines.push(`- ${rec}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
