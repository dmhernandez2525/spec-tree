import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  GDPR_REQUIREMENTS,
  DEFAULT_RETENTION_POLICIES,
  createComplianceCheck,
  runGDPRChecks,
  calculateComplianceScore,
  getOverallStatus,
  generateComplianceReport,
  createRetentionPolicy,
  isDataExpired,
  createDataSubjectRequest,
  completeDataSubjectRequest,
  getExpiredData,
  formatComplianceReport,
  type ComplianceCheck,
  type ComplianceStandard,
  type ComplianceStatus,
  type RetentionPolicy,
  type DataSubjectRequest,
  type ComplianceReport,
} from './compliance';

// ---------------------------------------------------------------------------
// GDPR_REQUIREMENTS
// ---------------------------------------------------------------------------

describe('GDPR_REQUIREMENTS', () => {
  it('should contain exactly 6 items', () => {
    expect(GDPR_REQUIREMENTS).toHaveLength(6);
  });

  it('should include "Right to access personal data"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Right to access personal data');
  });

  it('should include "Right to data portability"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Right to data portability');
  });

  it('should include "Right to erasure"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Right to erasure');
  });

  it('should include "Data breach notification within 72 hours"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Data breach notification within 72 hours');
  });

  it('should include "Privacy impact assessment"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Privacy impact assessment');
  });

  it('should include "Consent management"', () => {
    expect(GDPR_REQUIREMENTS).toContain('Consent management');
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_RETENTION_POLICIES
// ---------------------------------------------------------------------------

describe('DEFAULT_RETENTION_POLICIES', () => {
  it('should contain exactly 4 policies', () => {
    expect(DEFAULT_RETENTION_POLICIES).toHaveLength(4);
  });

  it('should have retentionDays as a number for all policies', () => {
    for (const policy of DEFAULT_RETENTION_POLICIES) {
      expect(typeof policy.retentionDays).toBe('number');
    }
  });

  it('should have deleteAfterExpiry as a boolean for all policies', () => {
    for (const policy of DEFAULT_RETENTION_POLICIES) {
      expect(typeof policy.deleteAfterExpiry).toBe('boolean');
    }
  });

  it('should include a user-data policy with 730 days retention', () => {
    const userPolicy = DEFAULT_RETENTION_POLICIES.find((p) => p.dataType === 'user-data');
    expect(userPolicy).toBeDefined();
    expect(userPolicy!.retentionDays).toBe(730);
  });

  it('should include an audit-logs policy with 365 days retention', () => {
    const auditPolicy = DEFAULT_RETENTION_POLICIES.find((p) => p.dataType === 'audit-logs');
    expect(auditPolicy).toBeDefined();
    expect(auditPolicy!.retentionDays).toBe(365);
  });

  it('should have string ids for all policies', () => {
    for (const policy of DEFAULT_RETENTION_POLICIES) {
      expect(typeof policy.id).toBe('string');
    }
  });
});

// ---------------------------------------------------------------------------
// createComplianceCheck
// ---------------------------------------------------------------------------

describe('createComplianceCheck', () => {
  it('should create a check with the given standard', () => {
    const check = createComplianceCheck('gdpr', 'Consent management', 'compliant', 'All good');
    expect(check.standard).toBe('gdpr');
  });

  it('should create a check with the given requirement', () => {
    const check = createComplianceCheck('soc2', 'Encryption at rest', 'non-compliant');
    expect(check.requirement).toBe('Encryption at rest');
  });

  it('should create a check with the given status', () => {
    const check = createComplianceCheck('hipaa', 'PHI encryption', 'partial', 'In progress');
    expect(check.status).toBe('partial');
  });

  it('should default notes to an empty string', () => {
    const check = createComplianceCheck('iso27001', 'Access control', 'compliant');
    expect(check.notes).toBe('');
  });

  it('should set checkedAt to a recent timestamp', () => {
    const before = Date.now();
    const check = createComplianceCheck('gdpr', 'test', 'compliant');
    const after = Date.now();
    expect(check.checkedAt).toBeGreaterThanOrEqual(before);
    expect(check.checkedAt).toBeLessThanOrEqual(after);
  });

  it('should generate an id starting with "chk"', () => {
    const check = createComplianceCheck('gdpr', 'test', 'compliant');
    expect(check.id).toMatch(/^chk-/);
  });
});

// ---------------------------------------------------------------------------
// runGDPRChecks
// ---------------------------------------------------------------------------

describe('runGDPRChecks', () => {
  it('should return 6 checks (one per GDPR requirement)', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: true,
      hasDataPortability: true,
      hasErasureSupport: true,
      hasBreachNotification: true,
      hasPrivacyAssessment: true,
      hasAccessRequest: true,
    });
    expect(checks).toHaveLength(6);
  });

  it('should mark all as compliant when all flags are true', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: true,
      hasDataPortability: true,
      hasErasureSupport: true,
      hasBreachNotification: true,
      hasPrivacyAssessment: true,
      hasAccessRequest: true,
    });
    expect(checks.every((c) => c.status === 'compliant')).toBe(true);
  });

  it('should mark all as non-compliant when all flags are false', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: false,
      hasDataPortability: false,
      hasErasureSupport: false,
      hasBreachNotification: false,
      hasPrivacyAssessment: false,
      hasAccessRequest: false,
    });
    expect(checks.every((c) => c.status === 'non-compliant')).toBe(true);
  });

  it('should produce a mix of compliant and non-compliant for mixed flags', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: true,
      hasDataPortability: false,
      hasErasureSupport: true,
      hasBreachNotification: false,
      hasPrivacyAssessment: true,
      hasAccessRequest: false,
    });
    const compliant = checks.filter((c) => c.status === 'compliant');
    const nonCompliant = checks.filter((c) => c.status === 'non-compliant');
    expect(compliant).toHaveLength(3);
    expect(nonCompliant).toHaveLength(3);
  });

  it('should set notes to "Requirement satisfied" for compliant items', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: true,
      hasDataPortability: true,
      hasErasureSupport: true,
      hasBreachNotification: true,
      hasPrivacyAssessment: true,
      hasAccessRequest: true,
    });
    expect(checks.every((c) => c.notes === 'Requirement satisfied')).toBe(true);
  });

  it('should set notes to "Requirement not yet implemented" for non-compliant items', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: false,
      hasDataPortability: false,
      hasErasureSupport: false,
      hasBreachNotification: false,
      hasPrivacyAssessment: false,
      hasAccessRequest: false,
    });
    expect(checks.every((c) => c.notes === 'Requirement not yet implemented')).toBe(true);
  });

  it('should set standard to "gdpr" for all returned checks', () => {
    const checks = runGDPRChecks({
      hasConsentManagement: true,
      hasDataPortability: false,
      hasErasureSupport: true,
      hasBreachNotification: false,
      hasPrivacyAssessment: false,
      hasAccessRequest: true,
    });
    expect(checks.every((c) => c.standard === 'gdpr')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateComplianceScore
// ---------------------------------------------------------------------------

describe('calculateComplianceScore', () => {
  it('should return 100 when all checks are compliant', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'compliant'),
    ];
    expect(calculateComplianceScore(checks)).toBe(100);
  });

  it('should return 0 when all checks are non-compliant', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'non-compliant'),
      createComplianceCheck('gdpr', 'B', 'non-compliant'),
    ];
    expect(calculateComplianceScore(checks)).toBe(0);
  });

  it('should count partial checks as 0.5', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'partial'),
      createComplianceCheck('gdpr', 'B', 'partial'),
    ];
    // 0.5 + 0.5 = 1, 1/2 = 0.5, round(50) = 50
    expect(calculateComplianceScore(checks)).toBe(50);
  });

  it('should return 0 for an empty array', () => {
    expect(calculateComplianceScore([])).toBe(0);
  });

  it('should handle mixed statuses correctly', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'partial'),
      createComplianceCheck('gdpr', 'C', 'non-compliant'),
      createComplianceCheck('gdpr', 'D', 'not-applicable'),
    ];
    // 1 + 0.5 + 0 + 0 = 1.5, 1.5/4 = 0.375, round(37.5) = 38
    expect(calculateComplianceScore(checks)).toBe(38);
  });

  it('should treat not-applicable as 0', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'not-applicable'),
    ];
    expect(calculateComplianceScore(checks)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getOverallStatus
// ---------------------------------------------------------------------------

describe('getOverallStatus', () => {
  it('should return "compliant" when all checks are compliant', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'compliant'),
    ];
    expect(getOverallStatus(checks)).toBe('compliant');
  });

  it('should return "non-compliant" when any check is non-compliant', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'non-compliant'),
    ];
    expect(getOverallStatus(checks)).toBe('non-compliant');
  });

  it('should return "partial" when all checks are partial', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'partial'),
      createComplianceCheck('gdpr', 'B', 'partial'),
    ];
    expect(getOverallStatus(checks)).toBe('partial');
  });

  it('should return "not-applicable" for an empty checks array', () => {
    expect(getOverallStatus([])).toBe('not-applicable');
  });

  it('should return "partial" when mix of compliant and partial (no non-compliant)', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'partial'),
    ];
    expect(getOverallStatus(checks)).toBe('partial');
  });

  it('should return "non-compliant" even if other checks are partial or compliant', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'partial'),
      createComplianceCheck('gdpr', 'C', 'non-compliant'),
    ];
    expect(getOverallStatus(checks)).toBe('non-compliant');
  });
});

// ---------------------------------------------------------------------------
// generateComplianceReport
// ---------------------------------------------------------------------------

describe('generateComplianceReport', () => {
  it('should return a report with the correct standards', () => {
    const checks: ComplianceCheck[] = [];
    const report = generateComplianceReport(checks, ['gdpr', 'soc2']);
    expect(report.standards).toEqual(['gdpr', 'soc2']);
  });

  it('should include the provided checks in the report', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
    ];
    const report = generateComplianceReport(checks, ['gdpr']);
    expect(report.checks).toHaveLength(1);
    expect(report.checks[0].requirement).toBe('A');
  });

  it('should compute the correct score', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'non-compliant'),
    ];
    const report = generateComplianceReport(checks, ['gdpr']);
    expect(report.score).toBe(50);
  });

  it('should compute the correct overallStatus', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
      createComplianceCheck('gdpr', 'B', 'non-compliant'),
    ];
    const report = generateComplianceReport(checks, ['gdpr']);
    expect(report.overallStatus).toBe('non-compliant');
  });

  it('should generate recommendations for non-compliant items with REQUIRED label', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'Consent management', 'non-compliant'),
    ];
    const report = generateComplianceReport(checks, ['gdpr']);
    expect(report.recommendations).toHaveLength(1);
    expect(report.recommendations[0]).toBe('[REQUIRED] GDPR: Consent management');
  });

  it('should generate recommendations for partial items with RECOMMENDED label', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('soc2', 'Encryption', 'partial'),
    ];
    const report = generateComplianceReport(checks, ['soc2']);
    expect(report.recommendations).toHaveLength(1);
    expect(report.recommendations[0]).toBe('[RECOMMENDED] SOC2: Encryption');
  });

  it('should not generate recommendations for compliant items', () => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
    ];
    const report = generateComplianceReport(checks, ['gdpr']);
    expect(report.recommendations).toHaveLength(0);
  });

  it('should set generatedAt to a recent timestamp', () => {
    const before = Date.now();
    const report = generateComplianceReport([], ['gdpr']);
    const after = Date.now();
    expect(report.generatedAt).toBeGreaterThanOrEqual(before);
    expect(report.generatedAt).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// createRetentionPolicy
// ---------------------------------------------------------------------------

describe('createRetentionPolicy', () => {
  it('should create a policy with the given dataType', () => {
    const policy = createRetentionPolicy('logs', 90, true, 'Log retention');
    expect(policy.dataType).toBe('logs');
  });

  it('should set the retention days', () => {
    const policy = createRetentionPolicy('logs', 365, false);
    expect(policy.retentionDays).toBe(365);
  });

  it('should set deleteAfterExpiry', () => {
    const policy = createRetentionPolicy('logs', 90, true);
    expect(policy.deleteAfterExpiry).toBe(true);
  });

  it('should default description to an empty string', () => {
    const policy = createRetentionPolicy('logs', 90, true);
    expect(policy.description).toBe('');
  });

  it('should generate an id starting with "ret"', () => {
    const policy = createRetentionPolicy('logs', 90, true);
    expect(policy.id).toMatch(/^ret-/);
  });
});

// ---------------------------------------------------------------------------
// isDataExpired
// ---------------------------------------------------------------------------

describe('isDataExpired', () => {
  const policy: RetentionPolicy = {
    id: 'ret-1',
    dataType: 'logs',
    retentionDays: 30,
    deleteAfterExpiry: true,
    description: '30 day log retention',
  };

  it('should return true for data that is older than the retention period', () => {
    const createdAt = Date.now() - 31 * 86_400_000;
    expect(isDataExpired(createdAt, policy)).toBe(true);
  });

  it('should return false for data within the retention period', () => {
    const createdAt = Date.now() - 10 * 86_400_000;
    expect(isDataExpired(createdAt, policy)).toBe(false);
  });

  it('should return false for data created just now', () => {
    expect(isDataExpired(Date.now(), policy)).toBe(false);
  });

  it('should handle a boundary case: data created exactly at the retention limit', () => {
    // Created exactly 30 days ago; expiry = createdAt + 30*86400000 = now.
    // Date.now() > expiryTimestamp can be false if they're equal (not strictly greater).
    const createdAt = Date.now() - 30 * 86_400_000;
    // At the exact boundary, Date.now() should equal expiryTimestamp, so not expired
    // (the check is strictly greater than)
    expect(isDataExpired(createdAt, policy)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// createDataSubjectRequest
// ---------------------------------------------------------------------------

describe('createDataSubjectRequest', () => {
  it('should create a request with the given type', () => {
    const req = createDataSubjectRequest('access', 'user@demo.example');
    expect(req.type).toBe('access');
  });

  it('should set the subjectEmail', () => {
    const req = createDataSubjectRequest('deletion', 'delete@demo.example');
    expect(req.subjectEmail).toBe('delete@demo.example');
  });

  it('should set status to "pending"', () => {
    const req = createDataSubjectRequest('portability', 'port@demo.example');
    expect(req.status).toBe('pending');
  });

  it('should not have a completedAt timestamp', () => {
    const req = createDataSubjectRequest('rectification', 'rect@demo.example');
    expect(req.completedAt).toBeUndefined();
  });

  it('should generate an id starting with "dsr"', () => {
    const req = createDataSubjectRequest('access', 'a@demo.example');
    expect(req.id).toMatch(/^dsr-/);
  });

  it('should set requestedAt to a recent timestamp', () => {
    const before = Date.now();
    const req = createDataSubjectRequest('access', 'a@demo.example');
    const after = Date.now();
    expect(req.requestedAt).toBeGreaterThanOrEqual(before);
    expect(req.requestedAt).toBeLessThanOrEqual(after);
  });
});

// ---------------------------------------------------------------------------
// completeDataSubjectRequest
// ---------------------------------------------------------------------------

describe('completeDataSubjectRequest', () => {
  it('should set status to "completed"', () => {
    const original = createDataSubjectRequest('access', 'user@demo.example');
    const completed = completeDataSubjectRequest(original);
    expect(completed.status).toBe('completed');
  });

  it('should set completedAt to a recent timestamp', () => {
    const original = createDataSubjectRequest('deletion', 'user@demo.example');
    const before = Date.now();
    const completed = completeDataSubjectRequest(original);
    const after = Date.now();
    expect(completed.completedAt).toBeGreaterThanOrEqual(before);
    expect(completed.completedAt).toBeLessThanOrEqual(after);
  });

  it('should not mutate the original request', () => {
    const original = createDataSubjectRequest('access', 'user@demo.example');
    const originalStatus = original.status;
    completeDataSubjectRequest(original);
    expect(original.status).toBe(originalStatus);
    expect(original.completedAt).toBeUndefined();
  });

  it('should preserve all other fields from the original', () => {
    const original = createDataSubjectRequest('portability', 'port@demo.example');
    const completed = completeDataSubjectRequest(original);
    expect(completed.id).toBe(original.id);
    expect(completed.type).toBe(original.type);
    expect(completed.subjectEmail).toBe(original.subjectEmail);
    expect(completed.requestedAt).toBe(original.requestedAt);
  });
});

// ---------------------------------------------------------------------------
// getExpiredData
// ---------------------------------------------------------------------------

describe('getExpiredData', () => {
  const policies: RetentionPolicy[] = [
    { id: 'ret-1', dataType: 'logs', retentionDays: 30, deleteAfterExpiry: true, description: '' },
    { id: 'ret-2', dataType: 'sessions', retentionDays: 7, deleteAfterExpiry: true, description: '' },
  ];

  it('should return records that have exceeded their retention period', () => {
    const records = [
      { id: 'r1', dataType: 'logs', createdAt: Date.now() - 31 * 86_400_000 },
    ];
    const expired = getExpiredData(records, policies);
    expect(expired).toHaveLength(1);
    expect(expired[0].id).toBe('r1');
  });

  it('should ignore records that are still within their retention period', () => {
    const records = [
      { id: 'r1', dataType: 'logs', createdAt: Date.now() - 10 * 86_400_000 },
    ];
    const expired = getExpiredData(records, policies);
    expect(expired).toHaveLength(0);
  });

  it('should exclude records with no matching policy', () => {
    const records = [
      { id: 'r1', dataType: 'unknown-type', createdAt: Date.now() - 999 * 86_400_000 },
    ];
    const expired = getExpiredData(records, policies);
    expect(expired).toHaveLength(0);
  });

  it('should correctly handle a mix of expired and non-expired records', () => {
    const records = [
      { id: 'r1', dataType: 'logs', createdAt: Date.now() - 31 * 86_400_000 },
      { id: 'r2', dataType: 'logs', createdAt: Date.now() - 5 * 86_400_000 },
      { id: 'r3', dataType: 'sessions', createdAt: Date.now() - 10 * 86_400_000 },
      { id: 'r4', dataType: 'sessions', createdAt: Date.now() - 2 * 86_400_000 },
    ];
    const expired = getExpiredData(records, policies);
    expect(expired).toHaveLength(2);
    expect(expired.map((r) => r.id)).toEqual(expect.arrayContaining(['r1', 'r3']));
  });

  it('should return an empty array when given no records', () => {
    expect(getExpiredData([], policies)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// formatComplianceReport
// ---------------------------------------------------------------------------

describe('formatComplianceReport', () => {
  let report: ComplianceReport;

  beforeEach(() => {
    const checks: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'Consent management', 'compliant', 'All good'),
      createComplianceCheck('gdpr', 'Right to erasure', 'non-compliant', 'Not implemented'),
    ];
    report = generateComplianceReport(checks, ['gdpr']);
  });

  it('should contain the "# Compliance Report" heading', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('# Compliance Report');
  });

  it('should contain the "## Checks" section', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('## Checks');
  });

  it('should contain the "## Recommendations" section when there are recommendations', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('## Recommendations');
  });

  it('should not contain "## Recommendations" when there are no recommendations', () => {
    const allCompliant: ComplianceCheck[] = [
      createComplianceCheck('gdpr', 'A', 'compliant'),
    ];
    const cleanReport = generateComplianceReport(allCompliant, ['gdpr']);
    const output = formatComplianceReport(cleanReport);
    expect(output).not.toContain('## Recommendations');
  });

  it('should contain the standards listed in uppercase', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('GDPR');
  });

  it('should contain the overall status', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain(report.overallStatus);
  });

  it('should contain the score as a percentage', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain(`${report.score}%`);
  });

  it('should contain the markdown table header row', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('| Standard | Requirement | Status | Notes |');
  });

  it('should contain check requirement text in the table', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('Consent management');
    expect(output).toContain('Right to erasure');
  });

  it('should contain the Generated timestamp label', () => {
    const output = formatComplianceReport(report);
    expect(output).toContain('**Generated:**');
  });
});
