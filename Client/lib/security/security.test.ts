/**
 * Comprehensive Tests for Security Hardening Utilities
 *
 * Covers all 6 security modules: input-sanitizer, csp-config,
 * rate-limit-client, auth-guard, csrf-protection, and security-headers.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Input Sanitizer
import {
  sanitizeHtml,
  sanitizeMarkdown,
  escapeHtml,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeSqlInput,
  InputSanitizer,
} from './input-sanitizer';

// CSP Config
import {
  DEFAULT_CSP,
  buildCspHeader,
  generateNonce,
  addNonceToPolicy,
  validateCspPolicy,
  mergePolicies,
  type CspPolicy,
} from './csp-config';

// Rate Limit Client
import {
  createClientRateLimiter,
  DEFAULT_LIMITS,
  type RateLimitConfig,
} from './rate-limit-client';

// Auth Guard
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requireAuth,
  requirePermission,
  isTokenExpired,
  RolePermissions,
  AuthError,
  type SessionInfo,
} from './auth-guard';

// CSRF Protection
import {
  generateCsrfToken,
  validateCsrfToken,
  timingSafeEqual,
  createCsrfMiddleware,
  CSRF_HEADER_NAME,
  CSRF_COOKIE_NAME,
} from './csrf-protection';

// Security Headers
import {
  getSecurityHeaders,
  applyHeaders,
  validateHeaders,
  RECOMMENDED_HEADERS,
} from './security-headers';

// ---------------------------------------------------------------------------
// input-sanitizer.ts
// ---------------------------------------------------------------------------
describe('input-sanitizer', () => {
  describe('sanitizeHtml', () => {
    it('strips all HTML tags from input', () => {
      expect(sanitizeHtml('<p>Hello</p>')).toBe('Hello');
      expect(sanitizeHtml('<div><span>Nested</span></div>')).toBe('Nested');
    });

    it('strips script tags completely', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('decodes HTML entities', () => {
      // &amp; decodes to &, &quot; decodes to ", &#x27; decodes to '
      expect(sanitizeHtml('&amp;&quot;&#x27;')).toBe('&"\'');
      // &nbsp; decodes to space
      expect(sanitizeHtml('hello&nbsp;world')).toBe('hello world');
    });

    it('decodes entities then strips resulting tags', () => {
      // &lt;div&gt; decodes to <div> which is then stripped as a tag
      expect(sanitizeHtml('&lt;div&gt;')).toBe('');
    });

    it('preserves plain text without modification', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
      expect(sanitizeHtml('No tags here')).toBe('No tags here');
    });

    it('returns empty string for empty/falsy input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('handles mixed content with tags and entities', () => {
      const input = '<b>Bold</b> &amp; <i>italic</i>';
      const result = sanitizeHtml(input);
      expect(result).toBe('Bold & italic');
    });
  });

  describe('sanitizeMarkdown', () => {
    it('removes script tags and their contents', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeMarkdown(input)).toBe('Hello  World');
    });

    it('removes event handlers from elements', () => {
      const input = '<img src="pic.jpg" onerror="alert(1)">';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain('onerror');
    });

    it('removes javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain('javascript:');
    });

    it('preserves safe markdown content', () => {
      const input = '**bold** and *italic* and [link](https://example.com)';
      expect(sanitizeMarkdown(input)).toBe(input);
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeMarkdown('')).toBe('');
    });

    it('removes vbscript: URLs', () => {
      const input = '<a href="vbscript:MsgBox">click</a>';
      const result = sanitizeMarkdown(input);
      expect(result).not.toContain('vbscript:');
    });
  });

  describe('escapeHtml', () => {
    it('escapes ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes less-than signs', () => {
      expect(escapeHtml('a < b')).toBe('a &lt; b');
    });

    it('escapes greater-than signs', () => {
      expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('escapes double quotes', () => {
      expect(escapeHtml('a "b" c')).toBe('a &quot;b&quot; c');
    });

    it('escapes single quotes', () => {
      expect(escapeHtml("a 'b' c")).toBe('a &#x27;b&#x27; c');
    });

    it('escapes all special characters together', () => {
      expect(escapeHtml('<script>"alert(\'xss\')&"</script>')).toBe(
        '&lt;script&gt;&quot;alert(&#x27;xss&#x27;)&amp;&quot;&lt;/script&gt;',
      );
    });

    it('returns empty string for empty input', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('allows http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('allows mailto URLs', () => {
      expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('blocks javascript: URLs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    });

    it('blocks javascript: with mixed case', () => {
      expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
    });

    it('blocks data: URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    });

    it('blocks vbscript: URLs', () => {
      expect(sanitizeUrl('vbscript:MsgBox')).toBe('');
    });

    it('allows relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    });

    it('allows fragment URLs', () => {
      expect(sanitizeUrl('#section')).toBe('#section');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeUrl('')).toBe('');
    });

    it('blocks ftp: URLs', () => {
      expect(sanitizeUrl('ftp://files.example.com/file.txt')).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('removes path traversal sequences (../)', () => {
      expect(sanitizeFileName('../../../etc/passwd')).toBe('etcpasswd');
    });

    it('removes backslash path traversal (..\\)', () => {
      expect(sanitizeFileName('..\\..\\windows\\system32')).toBe('windowssystem32');
    });

    it('removes null bytes', () => {
      expect(sanitizeFileName('file\0.txt')).toBe('file.txt');
    });

    it('removes control characters', () => {
      expect(sanitizeFileName('file\x01\x02.txt')).toBe('file.txt');
    });

    it('limits file name to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(255);
    });

    it('removes directory separators', () => {
      expect(sanitizeFileName('path/to/file.txt')).toBe('pathtofile.txt');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeFileName('')).toBe('');
    });

    it('handles a normal file name without modification', () => {
      expect(sanitizeFileName('report-2024.pdf')).toBe('report-2024.pdf');
    });
  });

  describe('sanitizeSqlInput', () => {
    it('escapes single quotes by doubling them', () => {
      expect(sanitizeSqlInput("O'Brien")).toBe("O''Brien");
    });

    it('removes SQL comment sequences (--)', () => {
      expect(sanitizeSqlInput('SELECT * FROM users -- drop table')).toBe(
        'SELECT * FROM users  drop table',
      );
    });

    it('removes block comment openers (/*)', () => {
      const result = sanitizeSqlInput('SELECT /* injected */ 1');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('strips trailing semicolons', () => {
      expect(sanitizeSqlInput('value;')).toBe('value');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeSqlInput('')).toBe('');
    });
  });

  describe('InputSanitizer class', () => {
    it('sanitizeObject handles nested objects recursively', () => {
      const input = {
        name: '<b>Test</b>',
        details: {
          description: '<script>xss</script>Safe text',
          count: 42,
        },
      };
      const result = InputSanitizer.sanitizeObject(input);
      expect(result.name).toBe('Test');
      expect(result.details.description).toBe('xssSafe text');
      expect(result.details.count).toBe(42);
    });

    it('sanitizeObject handles arrays', () => {
      const input = ['<b>Bold</b>', '<i>Italic</i>', 'Plain'];
      const result = InputSanitizer.sanitizeObject(input);
      expect(result).toEqual(['Bold', 'Italic', 'Plain']);
    });

    it('sanitizeObject returns null/undefined as-is', () => {
      expect(InputSanitizer.sanitizeObject(null)).toBeNull();
      expect(InputSanitizer.sanitizeObject(undefined)).toBeUndefined();
    });

    it('sanitizeObject preserves non-string primitives', () => {
      expect(InputSanitizer.sanitizeObject(42)).toBe(42);
      expect(InputSanitizer.sanitizeObject(true)).toBe(true);
    });

    it('static methods delegate correctly', () => {
      expect(InputSanitizer.sanitizeHtml('<p>Test</p>')).toBe('Test');
      expect(InputSanitizer.escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(InputSanitizer.sanitizeUrl('javascript:void(0)')).toBe('');
      expect(InputSanitizer.sanitizeFileName('../file.txt')).toBe('file.txt');
      expect(InputSanitizer.sanitizeSqlInput("it's")).toBe("it''s");
    });
  });
});

// ---------------------------------------------------------------------------
// csp-config.ts
// ---------------------------------------------------------------------------
describe('csp-config', () => {
  describe('DEFAULT_CSP', () => {
    it('has self as default-src', () => {
      expect(DEFAULT_CSP['default-src']).toContain("'self'");
    });

    it('blocks framing with frame-src none', () => {
      expect(DEFAULT_CSP['frame-src']).toContain("'none'");
    });

    it('blocks object embedding with object-src none', () => {
      expect(DEFAULT_CSP['object-src']).toContain("'none'");
    });
  });

  describe('buildCspHeader', () => {
    it('produces a valid CSP header string', () => {
      const header = buildCspHeader(DEFAULT_CSP);
      expect(header).toContain("default-src 'self'");
      expect(header).toContain("script-src 'self'");
      expect(header).toContain('; ');
    });

    it('separates directives with semicolons', () => {
      const policy: CspPolicy = {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'"],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'none'"],
      };
      const header = buildCspHeader(policy);
      const parts = header.split('; ');
      expect(parts.length).toBeGreaterThan(1);
    });

    it('joins multiple sources with spaces', () => {
      const policy: CspPolicy = {
        ...DEFAULT_CSP,
        'style-src': ["'self'", 'https://cdn.example.com'],
      };
      const header = buildCspHeader(policy);
      expect(header).toContain("style-src 'self' https://cdn.example.com");
    });
  });

  describe('generateNonce', () => {
    it('returns a non-empty string', () => {
      const nonce = generateNonce();
      expect(nonce).toBeTruthy();
      expect(typeof nonce).toBe('string');
    });

    it('generates different values on successive calls', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      expect(nonce1).not.toBe(nonce2);
    });

    it('does not contain padding characters (=, +, /)', () => {
      const nonce = generateNonce();
      expect(nonce).not.toContain('=');
      expect(nonce).not.toContain('+');
      expect(nonce).not.toContain('/');
    });
  });

  describe('addNonceToPolicy', () => {
    it('adds nonce to script-src directive', () => {
      const nonce = 'abc123';
      const updated = addNonceToPolicy(DEFAULT_CSP, nonce);
      expect(updated['script-src']).toContain("'nonce-abc123'");
    });

    it('preserves existing script-src values', () => {
      const nonce = 'test';
      const updated = addNonceToPolicy(DEFAULT_CSP, nonce);
      expect(updated['script-src']).toContain("'self'");
    });

    it('does not mutate the original policy', () => {
      const original = { ...DEFAULT_CSP };
      addNonceToPolicy(DEFAULT_CSP, 'test');
      expect(DEFAULT_CSP['script-src']).toEqual(original['script-src']);
    });
  });

  describe('validateCspPolicy', () => {
    it('warns on unsafe-inline', () => {
      const policy: CspPolicy = {
        ...DEFAULT_CSP,
        'script-src': ["'self'", "'unsafe-inline'"],
      };
      const warnings = validateCspPolicy(policy);
      expect(warnings.some((w) => w.message.includes('unsafe-inline'))).toBe(true);
    });

    it('errors on unsafe-eval', () => {
      const policy: CspPolicy = {
        ...DEFAULT_CSP,
        'script-src': ["'self'", "'unsafe-eval'"],
      };
      const warnings = validateCspPolicy(policy);
      const evalWarning = warnings.find((w) => w.message.includes('unsafe-eval'));
      expect(evalWarning).toBeDefined();
      expect(evalWarning!.severity).toBe('error');
    });

    it('errors on wildcard sources', () => {
      const policy: CspPolicy = {
        ...DEFAULT_CSP,
        'img-src': ['*'],
      };
      const warnings = validateCspPolicy(policy);
      expect(warnings.some((w) => w.message.includes('Wildcard'))).toBe(true);
    });

    it('warns on missing critical directives', () => {
      const policy: CspPolicy = {
        ...DEFAULT_CSP,
        'default-src': [],
      };
      const warnings = validateCspPolicy(policy);
      expect(warnings.some((w) => w.directive === 'default-src')).toBe(true);
    });

    it('returns no warnings for the default strict policy', () => {
      const warnings = validateCspPolicy(DEFAULT_CSP);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('mergePolicies', () => {
    it('combines directives from multiple policies', () => {
      const policyA = { 'script-src': ["'self'"] } as Partial<CspPolicy>;
      const policyB = { 'script-src': ['https://cdn.example.com'] } as Partial<CspPolicy>;
      const merged = mergePolicies(policyA, policyB);
      expect(merged['script-src']).toContain("'self'");
      expect(merged['script-src']).toContain('https://cdn.example.com');
    });

    it('deduplicates sources', () => {
      const policyA = { 'script-src': ["'self'"] } as Partial<CspPolicy>;
      const policyB = { 'script-src': ["'self'", 'https://cdn.example.com'] } as Partial<CspPolicy>;
      const merged = mergePolicies(policyA, policyB);
      const selfCount = merged['script-src'].filter((s) => s === "'self'").length;
      expect(selfCount).toBe(1);
    });

    it('handles merging three or more policies', () => {
      const a = { 'img-src': ['https://a.com'] } as Partial<CspPolicy>;
      const b = { 'img-src': ['https://b.com'] } as Partial<CspPolicy>;
      const c = { 'img-src': ['https://c.com'] } as Partial<CspPolicy>;
      const merged = mergePolicies(a, b, c);
      expect(merged['img-src']).toHaveLength(3);
    });
  });
});

// ---------------------------------------------------------------------------
// rate-limit-client.ts
// ---------------------------------------------------------------------------
describe('rate-limit-client', () => {
  const testConfig: RateLimitConfig = {
    maxRequests: 3,
    windowMs: 1000,
    backoffMs: 500,
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('canMakeRequest', () => {
    it('returns true when under the limit', () => {
      const limiter = createClientRateLimiter(testConfig);
      expect(limiter.canMakeRequest()).toBe(true);
    });

    it('returns false when the limit is reached', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);
    });

    it('returns true again after the backoff period', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);

      // Advance past backoff
      vi.advanceTimersByTime(501);
      expect(limiter.canMakeRequest()).toBe(true);
    });
  });

  describe('recordRequest', () => {
    it('increments the request counter', () => {
      const limiter = createClientRateLimiter(testConfig);
      const state = limiter.recordRequest();
      expect(state.requestCount).toBe(1);
    });

    it('sets throttled state when limit is reached', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      const state = limiter.recordRequest();
      expect(state.isThrottled).toBe(true);
      expect(state.retryAfter).not.toBeNull();
    });
  });

  describe('getState', () => {
    it('returns the current state without side effects', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      const state = limiter.getState();
      expect(state.requestCount).toBe(1);
      expect(state.isThrottled).toBe(false);
    });
  });

  describe('reset', () => {
    it('clears all counters and state', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.canMakeRequest()).toBe(false);

      limiter.reset();
      expect(limiter.canMakeRequest()).toBe(true);
      expect(limiter.getState().requestCount).toBe(0);
    });
  });

  describe('getRetryAfterMs', () => {
    it('returns 0 when not throttled', () => {
      const limiter = createClientRateLimiter(testConfig);
      expect(limiter.getRetryAfterMs()).toBe(0);
    });

    it('returns positive value when throttled', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();
      limiter.recordRequest();
      expect(limiter.getRetryAfterMs()).toBeGreaterThan(0);
    });
  });

  describe('window reset', () => {
    it('resets counters when the time window expires', () => {
      const limiter = createClientRateLimiter(testConfig);
      limiter.recordRequest();
      limiter.recordRequest();

      // Advance past the window
      vi.advanceTimersByTime(1001);

      const state = limiter.getState();
      expect(state.requestCount).toBe(0);
    });
  });

  describe('DEFAULT_LIMITS', () => {
    it('has api, ai, and export configurations', () => {
      expect(DEFAULT_LIMITS.api).toBeDefined();
      expect(DEFAULT_LIMITS.ai).toBeDefined();
      expect(DEFAULT_LIMITS.export).toBeDefined();
    });

    it('api allows 60 requests per minute', () => {
      expect(DEFAULT_LIMITS.api.maxRequests).toBe(60);
      expect(DEFAULT_LIMITS.api.windowMs).toBe(60_000);
    });

    it('ai allows 10 requests per minute', () => {
      expect(DEFAULT_LIMITS.ai.maxRequests).toBe(10);
      expect(DEFAULT_LIMITS.ai.windowMs).toBe(60_000);
    });

    it('export allows 5 requests per minute', () => {
      expect(DEFAULT_LIMITS.export.maxRequests).toBe(5);
      expect(DEFAULT_LIMITS.export.windowMs).toBe(60_000);
    });
  });
});

// ---------------------------------------------------------------------------
// auth-guard.ts
// ---------------------------------------------------------------------------
describe('auth-guard', () => {
  const futureTimestamp = Date.now() + 3_600_000; // 1 hour from now
  const pastTimestamp = Date.now() - 3_600_000; // 1 hour ago

  const validSession: SessionInfo = {
    userId: 'user-1',
    role: 'editor',
    expiresAt: futureTimestamp,
    permissions: ['read', 'write', 'export'],
  };

  const adminSession: SessionInfo = {
    userId: 'admin-1',
    role: 'admin',
    expiresAt: futureTimestamp,
    permissions: ['read', 'write', 'admin', 'delete', 'export', 'manage-users'],
  };

  const expiredSession: SessionInfo = {
    userId: 'user-2',
    role: 'editor',
    expiresAt: pastTimestamp,
    permissions: ['read', 'write', 'export'],
  };

  describe('RolePermissions', () => {
    it('defines viewer with read-only access', () => {
      expect(RolePermissions.viewer).toEqual(['read']);
    });

    it('defines editor with read, write, and export access', () => {
      expect(RolePermissions.editor).toEqual(['read', 'write', 'export']);
    });

    it('defines admin with all permissions', () => {
      expect(RolePermissions.admin).toContain('read');
      expect(RolePermissions.admin).toContain('write');
      expect(RolePermissions.admin).toContain('admin');
      expect(RolePermissions.admin).toContain('delete');
      expect(RolePermissions.admin).toContain('export');
      expect(RolePermissions.admin).toContain('manage-users');
    });
  });

  describe('hasPermission', () => {
    it('returns true when viewer checks read', () => {
      expect(hasPermission('viewer', 'read')).toBe(true);
    });

    it('returns false when viewer checks write', () => {
      expect(hasPermission('viewer', 'write')).toBe(false);
    });

    it('returns true when admin checks any permission', () => {
      expect(hasPermission('admin', 'delete')).toBe(true);
      expect(hasPermission('admin', 'manage-users')).toBe(true);
    });

    it('returns false for an unknown role', () => {
      expect(hasPermission('guest', 'read')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('returns true if the role has at least one of the permissions', () => {
      expect(hasAnyPermission('viewer', ['read', 'write'])).toBe(true);
    });

    it('returns false if the role has none of the permissions', () => {
      expect(hasAnyPermission('viewer', ['write', 'delete'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true when admin has all permissions', () => {
      expect(hasAllPermissions('admin', ['read', 'write', 'delete'])).toBe(true);
    });

    it('returns false when viewer lacks some permissions', () => {
      expect(hasAllPermissions('viewer', ['read', 'write'])).toBe(false);
    });

    it('returns true for an empty permissions array', () => {
      expect(hasAllPermissions('viewer', [])).toBe(true);
    });
  });

  describe('requireAuth', () => {
    it('returns the session when valid', () => {
      const result = requireAuth(validSession);
      expect(result).toBe(validSession);
    });

    it('throws AuthError on null session', () => {
      expect(() => requireAuth(null)).toThrow(AuthError);
      expect(() => requireAuth(null)).toThrow('Authentication required');
    });

    it('throws AuthError on undefined session', () => {
      expect(() => requireAuth(undefined)).toThrow(AuthError);
    });

    it('throws AuthError when session is expired', () => {
      expect(() => requireAuth(expiredSession)).toThrow('Session has expired');
    });

    it('sets the correct error code for null session', () => {
      try {
        requireAuth(null);
      } catch (err) {
        expect((err as AuthError).code).toBe('UNAUTHENTICATED');
      }
    });

    it('sets the correct error code for expired session', () => {
      try {
        requireAuth(expiredSession);
      } catch (err) {
        expect((err as AuthError).code).toBe('SESSION_EXPIRED');
      }
    });
  });

  describe('requirePermission', () => {
    it('returns session when permission is present', () => {
      const result = requirePermission(adminSession, 'delete');
      expect(result).toBe(adminSession);
    });

    it('throws when session user lacks the permission', () => {
      expect(() => requirePermission(validSession, 'admin')).toThrow(AuthError);
    });

    it('throws UNAUTHORIZED error code for missing permission', () => {
      try {
        requirePermission(validSession, 'admin');
      } catch (err) {
        expect((err as AuthError).code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('isTokenExpired', () => {
    it('returns true for a timestamp in the past', () => {
      expect(isTokenExpired(pastTimestamp)).toBe(true);
    });

    it('returns false for a timestamp in the future', () => {
      expect(isTokenExpired(futureTimestamp)).toBe(false);
    });

    it('returns true when expiresAt equals current time', () => {
      // Date.now() >= expiresAt means expired
      expect(isTokenExpired(Date.now())).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// csrf-protection.ts
// ---------------------------------------------------------------------------
describe('csrf-protection', () => {
  describe('constants', () => {
    it('defines the CSRF header name', () => {
      expect(CSRF_HEADER_NAME).toBe('x-csrf-token');
    });

    it('defines the CSRF cookie name', () => {
      expect(CSRF_COOKIE_NAME).toBe('csrf-token');
    });
  });

  describe('generateCsrfToken', () => {
    it('returns a non-empty string', () => {
      const token = generateCsrfToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('generates unique tokens on successive calls', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('validateCsrfToken', () => {
    it('returns true for matching tokens', () => {
      const token = 'abc123-def456';
      expect(validateCsrfToken(token, token)).toBe(true);
    });

    it('returns false for different tokens', () => {
      expect(validateCsrfToken('token-a', 'token-b')).toBe(false);
    });

    it('returns false when token is empty', () => {
      expect(validateCsrfToken('', 'stored-token')).toBe(false);
    });

    it('returns false when stored token is empty', () => {
      expect(validateCsrfToken('token', '')).toBe(false);
    });
  });

  describe('timingSafeEqual', () => {
    it('returns true for equal strings', () => {
      expect(timingSafeEqual('hello', 'hello')).toBe(true);
    });

    it('returns false for different strings of same length', () => {
      expect(timingSafeEqual('hello', 'world')).toBe(false);
    });

    it('returns false for strings of different length', () => {
      expect(timingSafeEqual('short', 'longer-string')).toBe(false);
    });

    it('returns true for empty strings', () => {
      expect(timingSafeEqual('', '')).toBe(true);
    });

    it('handles single-character strings', () => {
      expect(timingSafeEqual('a', 'a')).toBe(true);
      expect(timingSafeEqual('a', 'b')).toBe(false);
    });
  });

  describe('createCsrfMiddleware', () => {
    it('generates tokens via generateToken()', () => {
      const middleware = createCsrfMiddleware();
      const token = middleware.generateToken();
      expect(token).toBeTruthy();
    });

    it('validates a valid request', () => {
      const middleware = createCsrfMiddleware();
      const token = middleware.generateToken();

      const valid = middleware.validateRequest(
        { [CSRF_HEADER_NAME]: token },
        { [CSRF_COOKIE_NAME]: token },
      );
      expect(valid).toBe(true);
    });

    it('rejects a request with mismatched tokens', () => {
      const middleware = createCsrfMiddleware();

      const valid = middleware.validateRequest(
        { [CSRF_HEADER_NAME]: 'header-token' },
        { [CSRF_COOKIE_NAME]: 'cookie-token' },
      );
      expect(valid).toBe(false);
    });

    it('rejects a request with missing header token', () => {
      const middleware = createCsrfMiddleware();

      const valid = middleware.validateRequest(
        {},
        { [CSRF_COOKIE_NAME]: 'cookie-token' },
      );
      expect(valid).toBe(false);
    });

    it('rejects a request with missing cookie token', () => {
      const middleware = createCsrfMiddleware();

      const valid = middleware.validateRequest(
        { [CSRF_HEADER_NAME]: 'header-token' },
        {},
      );
      expect(valid).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// security-headers.ts
// ---------------------------------------------------------------------------
describe('security-headers', () => {
  describe('getSecurityHeaders', () => {
    it('includes X-Content-Type-Options', () => {
      const headers = getSecurityHeaders();
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('includes X-Frame-Options', () => {
      const headers = getSecurityHeaders();
      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('includes X-XSS-Protection set to 0', () => {
      const headers = getSecurityHeaders();
      expect(headers['X-XSS-Protection']).toBe('0');
    });

    it('includes Referrer-Policy', () => {
      const headers = getSecurityHeaders();
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    it('includes Permissions-Policy', () => {
      const headers = getSecurityHeaders();
      expect(headers['Permissions-Policy']).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('includes Strict-Transport-Security', () => {
      const headers = getSecurityHeaders();
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains',
      );
    });

    it('includes all recommended headers', () => {
      const headers = getSecurityHeaders();
      for (const name of RECOMMENDED_HEADERS) {
        expect(headers[name]).toBeDefined();
      }
    });
  });

  describe('applyHeaders', () => {
    it('sets all headers on the target object', () => {
      const setFn = vi.fn();
      const target = { headers: { set: setFn } };
      const headers = getSecurityHeaders();

      applyHeaders(target, headers);

      expect(setFn).toHaveBeenCalledTimes(Object.keys(headers).length);
      expect(setFn).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(setFn).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });
  });

  describe('validateHeaders', () => {
    it('returns no warnings when all headers are present', () => {
      const headers = getSecurityHeaders();
      const warnings = validateHeaders(headers);
      expect(warnings).toHaveLength(0);
    });

    it('warns about missing headers', () => {
      const incomplete = { 'X-Content-Type-Options': 'nosniff' };
      const warnings = validateHeaders(incomplete);
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('identifies specific missing headers', () => {
      const warnings = validateHeaders({});
      const missingNames = warnings.map((w) => w.header);
      expect(missingNames).toContain('X-Frame-Options');
      expect(missingNames).toContain('Strict-Transport-Security');
    });

    it('returns a warning for each missing recommended header', () => {
      const warnings = validateHeaders({});
      expect(warnings).toHaveLength(RECOMMENDED_HEADERS.length);
    });

    it('warning messages include the header name', () => {
      const warnings = validateHeaders({});
      for (const warning of warnings) {
        expect(warning.message).toContain(warning.header);
      }
    });
  });
});
