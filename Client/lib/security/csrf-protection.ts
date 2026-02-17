/**
 * CSRF Token Management
 *
 * Provides cross-site request forgery protection through token
 * generation, validation, and middleware helpers. Uses timing-safe
 * comparison to prevent timing attacks on token validation.
 */

export const CSRF_HEADER_NAME = 'x-csrf-token';
export const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a CSRF token using crypto.randomUUID when available,
 * with a fallback for environments where it is not supported.
 */
export function generateCsrfToken(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: build a token from crypto.getRandomValues
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const segments: string[] = [];
  for (let i = 0; i < 4; i++) {
    const val = (bytes[i * 4] << 24) | (bytes[i * 4 + 1] << 16) |
                (bytes[i * 4 + 2] << 8) | bytes[i * 4 + 3];
    segments.push((val >>> 0).toString(16).padStart(8, '0'));
  }
  return segments.join('-');
}

/**
 * Perform a timing-safe comparison of two strings.
 * Returns true only if both strings are identical in value and length.
 * The comparison always examines every character to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform a dummy comparison to keep timing consistent
    let result = 1;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i % b.length);
    }
    // Always return false for different lengths, but the loop above
    // prevents the caller from determining the length difference via timing
    return result === 0;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Validate a CSRF token against the stored/expected token.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return timingSafeEqual(token, storedToken);
}

export interface CsrfMiddleware {
  /** Generate a new CSRF token */
  generateToken: () => string;
  /** Validate a request by checking the token in headers against the cookie */
  validateRequest: (
    headers: Record<string, string | undefined>,
    cookies: Record<string, string | undefined>,
  ) => boolean;
}

/**
 * Create a CSRF middleware object that encapsulates token generation
 * and request validation.
 */
export function createCsrfMiddleware(): CsrfMiddleware {
  return {
    generateToken(): string {
      return generateCsrfToken();
    },

    validateRequest(
      headers: Record<string, string | undefined>,
      cookies: Record<string, string | undefined>,
    ): boolean {
      const headerToken = headers[CSRF_HEADER_NAME];
      const cookieToken = cookies[CSRF_COOKIE_NAME];

      if (!headerToken || !cookieToken) {
        return false;
      }

      return validateCsrfToken(headerToken, cookieToken);
    },
  };
}
