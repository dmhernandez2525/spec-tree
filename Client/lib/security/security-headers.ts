/**
 * Security Header Configuration
 *
 * Provides recommended HTTP security headers for the SpecTree application.
 * These headers protect against common web vulnerabilities including
 * clickjacking, MIME type sniffing, and protocol downgrade attacks.
 */

export type SecurityHeaders = Record<string, string>;

/**
 * List of all recommended security header names.
 */
export const RECOMMENDED_HEADERS = [
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
] as const;

/**
 * Get all recommended security headers with their values.
 *
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking by blocking framing
 * - X-XSS-Protection: Set to 0 (the legacy filter is deprecated and
 *   can introduce additional vulnerabilities when enabled)
 * - Referrer-Policy: Controls referrer information leakage
 * - Permissions-Policy: Disables access to sensitive browser features
 * - Strict-Transport-Security: Enforces HTTPS with a 1-year max-age
 */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '0',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };
}

export interface HeaderTarget {
  headers: {
    set: (name: string, value: string) => void;
  };
}

/**
 * Apply a set of security headers to a Response-like object.
 * The target must have a headers object with a set() method.
 */
export function applyHeaders(target: HeaderTarget, headers: SecurityHeaders): void {
  for (const [name, value] of Object.entries(headers)) {
    target.headers.set(name, value);
  }
}

export interface HeaderWarning {
  header: string;
  message: string;
}

/**
 * Validate a set of headers against the recommended security headers.
 * Returns warnings for any recommended headers that are missing.
 */
export function validateHeaders(headers: SecurityHeaders): HeaderWarning[] {
  const warnings: HeaderWarning[] = [];

  for (const requiredHeader of RECOMMENDED_HEADERS) {
    if (!headers[requiredHeader]) {
      warnings.push({
        header: requiredHeader,
        message: `Missing recommended security header: ${requiredHeader}`,
      });
    }
  }

  return warnings;
}
