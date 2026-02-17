/**
 * Content Security Policy Configuration
 *
 * Provides CSP header generation, nonce management, and policy
 * validation for the SpecTree application. CSP is a critical
 * defense against XSS and data injection attacks.
 */

export type CspDirective =
  | 'default-src'
  | 'script-src'
  | 'style-src'
  | 'img-src'
  | 'font-src'
  | 'connect-src'
  | 'frame-src'
  | 'object-src'
  | 'base-uri'
  | 'form-action'
  | 'frame-ancestors';

export type CspPolicy = Record<CspDirective, string[]>;

/**
 * Default strict CSP for SpecTree.
 * Uses 'self' for most directives, with specific CDN allowances
 * for fonts and styles.
 */
export const DEFAULT_CSP: CspPolicy = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
};

/**
 * Convert a CspPolicy object to a CSP header string.
 * Each directive is separated by a semicolon.
 */
export function buildCspHeader(policy: CspPolicy): string {
  const directives: string[] = [];

  for (const [directive, sources] of Object.entries(policy)) {
    if (sources.length > 0) {
      directives.push(`${directive} ${sources.join(' ')}`);
    }
  }

  return directives.join('; ');
}

/**
 * Generate a cryptographically random base64 nonce for inline scripts.
 * Uses crypto.randomUUID when available, falling back to Math.random.
 */
export function generateNonce(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const uuid = crypto.randomUUID();
      return btoa(uuid).replace(/[=+/]/g, '');
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: generate random bytes via crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode.apply(null, Array.from(bytes))).replace(/[=+/]/g, '');
}

/**
 * Add a nonce value to the script-src directive of a CSP policy.
 * Returns a new policy object (does not mutate the original).
 */
export function addNonceToPolicy(policy: CspPolicy, nonce: string): CspPolicy {
  const newPolicy = { ...policy };
  newPolicy['script-src'] = [...(policy['script-src'] || []), `'nonce-${nonce}'`];
  return newPolicy;
}

export interface CspWarning {
  directive: CspDirective;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Validate a CSP policy for common security weaknesses.
 * Checks for unsafe-inline, unsafe-eval, wildcard sources,
 * and missing critical directives.
 */
export function validateCspPolicy(policy: CspPolicy): CspWarning[] {
  const warnings: CspWarning[] = [];

  for (const [directive, sources] of Object.entries(policy) as [CspDirective, string[]][]) {
    // Check for unsafe-inline
    if (sources.includes("'unsafe-inline'")) {
      warnings.push({
        directive,
        message: `'unsafe-inline' in ${directive} weakens XSS protection`,
        severity: 'warning',
      });
    }

    // Check for unsafe-eval
    if (sources.includes("'unsafe-eval'")) {
      warnings.push({
        directive,
        message: `'unsafe-eval' in ${directive} allows dynamic code execution`,
        severity: 'error',
      });
    }

    // Check for wildcard sources
    if (sources.includes('*')) {
      warnings.push({
        directive,
        message: `Wildcard (*) in ${directive} allows loading from any origin`,
        severity: 'error',
      });
    }
  }

  // Check for missing critical directives
  const criticalDirectives: CspDirective[] = ['default-src', 'script-src', 'object-src'];
  for (const directive of criticalDirectives) {
    if (!policy[directive] || policy[directive].length === 0) {
      warnings.push({
        directive,
        message: `Missing ${directive} directive; the policy may be incomplete`,
        severity: 'warning',
      });
    }
  }

  return warnings;
}

/**
 * Merge multiple CSP policies together. Sources for each directive
 * are concatenated and deduplicated. Later policies add to earlier ones.
 */
export function mergePolicies(...policies: Partial<CspPolicy>[]): CspPolicy {
  const merged: CspPolicy = {
    'default-src': [],
    'script-src': [],
    'style-src': [],
    'img-src': [],
    'font-src': [],
    'connect-src': [],
    'frame-src': [],
    'object-src': [],
    'base-uri': [],
    'form-action': [],
    'frame-ancestors': [],
  };

  for (const policy of policies) {
    for (const [directive, sources] of Object.entries(policy) as [CspDirective, string[]][]) {
      if (sources && merged[directive]) {
        const combined = new Set([...merged[directive], ...sources]);
        merged[directive] = Array.from(combined);
      }
    }
  }

  return merged;
}
