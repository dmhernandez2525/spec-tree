/**
 * Input Sanitization Utilities
 *
 * Provides defense-in-depth sanitization against XSS, injection attacks,
 * and malicious input. These utilities complement server-side validation
 * and should not be relied upon as the sole layer of protection.
 */

/**
 * Strip all HTML tags from input and decode HTML entities.
 * Returns clean plain text with no HTML markup.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Decode HTML entities first
  let decoded = input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&nbsp;/g, ' ');

  // Strip all HTML tags
  decoded = decoded.replace(/<[^>]*>/g, '');

  return decoded.trim();
}

/**
 * Allow safe markdown content but strip dangerous patterns.
 * Removes script tags, event handlers (onclick, onerror, etc.),
 * and javascript: URLs while preserving safe formatting markup.
 */
export function sanitizeMarkdown(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // Remove script tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<script\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<\/script>/gi, '');

  // Remove event handlers (on* attributes)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Remove javascript: URLs (including obfuscated variants)
  sanitized = sanitized.replace(/javascript\s*:/gi, '');

  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript\s*:/gi, '');

  // Remove data: URLs in href/src attributes
  sanitized = sanitized.replace(/(href|src)\s*=\s*(['"])\s*data:/gi, '$1=$2');

  return sanitized;
}

/**
 * Escape special HTML characters to their entity equivalents.
 * Use this when inserting user content into HTML context.
 */
export function escapeHtml(input: string): string {
  if (!input) return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'mailto:'];

/**
 * Validate and sanitize a URL. Only http:, https:, and mailto: schemes
 * are permitted. Returns an empty string for dangerous schemes such as
 * javascript:, data:, and vbscript:.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';

  const trimmed = url.trim();

  // Remove null bytes and control characters
  const cleaned = trimmed.replace(/[\x00-\x1f\x7f]/g, '');

  // Check for dangerous schemes (case insensitive, whitespace tolerant)
  const normalizedForCheck = cleaned.replace(/\s/g, '').toLowerCase();

  if (
    normalizedForCheck.startsWith('javascript:') ||
    normalizedForCheck.startsWith('data:') ||
    normalizedForCheck.startsWith('vbscript:')
  ) {
    return '';
  }

  // For absolute URLs, validate the scheme
  try {
    const parsed = new URL(cleaned);
    if (!ALLOWED_URL_SCHEMES.includes(parsed.protocol)) {
      return '';
    }
    return cleaned;
  } catch {
    // Relative URLs and fragments are acceptable
    if (cleaned.startsWith('/') || cleaned.startsWith('#') || cleaned.startsWith('?')) {
      return cleaned;
    }

    // Reject anything else that we cannot parse
    return '';
  }
}

/**
 * Sanitize a file name to prevent path traversal, null byte injection,
 * and control character attacks. Limits output to 255 characters.
 */
export function sanitizeFileName(name: string): string {
  if (!name) return '';

  let sanitized = name;

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters (0x00-0x1F, 0x7F)
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');

  // Remove path traversal sequences
  sanitized = sanitized.replace(/\.\.\//g, '');
  sanitized = sanitized.replace(/\.\.\\/g, '');
  sanitized = sanitized.replace(/\.\./g, '');

  // Remove leading/trailing dots and spaces (Windows safety)
  sanitized = sanitized.replace(/^[\s.]+/, '').replace(/[\s.]+$/, '');

  // Remove directory separators
  sanitized = sanitized.replace(/[/\\]/g, '');

  // Limit to 255 characters
  if (sanitized.length > 255) {
    sanitized = sanitized.slice(0, 255);
  }

  return sanitized;
}

/**
 * Escape SQL special characters as a defense-in-depth measure.
 * This is NOT a replacement for parameterized queries, which should
 * always be the primary defense against SQL injection.
 */
export function sanitizeSqlInput(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // Escape single quotes by doubling them
  sanitized = sanitized.replace(/'/g, "''");

  // Remove SQL comment sequences
  sanitized = sanitized.replace(/--/g, '');
  sanitized = sanitized.replace(/\/\*/g, '');
  sanitized = sanitized.replace(/\*\//g, '');

  // Strip semicolons at word boundaries (statement terminators)
  sanitized = sanitized.replace(/;\s*$/g, '');
  sanitized = sanitized.replace(/^\s*;/g, '');
  sanitized = sanitized.replace(/;\s*(?=\s)/g, '');

  return sanitized;
}

/**
 * Static class providing centralized input sanitization.
 * Wraps all standalone sanitization functions and adds
 * recursive object sanitization.
 */
export class InputSanitizer {
  static sanitizeHtml(input: string): string {
    return sanitizeHtml(input);
  }

  static sanitizeMarkdown(input: string): string {
    return sanitizeMarkdown(input);
  }

  static escapeHtml(input: string): string {
    return escapeHtml(input);
  }

  static sanitizeUrl(url: string): string {
    return sanitizeUrl(url);
  }

  static sanitizeFileName(name: string): string {
    return sanitizeFileName(name);
  }

  static sanitizeSqlInput(input: string): string {
    return sanitizeSqlInput(input);
  }

  /**
   * Recursively sanitize all string values in an object.
   * Applies sanitizeHtml to every string property at any depth.
   * Non-string values are left unchanged.
   */
  static sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return sanitizeHtml(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => InputSanitizer.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        sanitized[key] = InputSanitizer.sanitizeObject(value);
      }
      return sanitized as T;
    }

    return obj;
  }
}
