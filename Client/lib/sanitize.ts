/**
 * HTML Sanitization Utilities
 *
 * Uses DOMPurify to sanitize HTML content and prevent XSS attacks.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Safe to use with dangerouslySetInnerHTML after sanitization.
 *
 * @param dirty - The untrusted HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  // Only run DOMPurify on the client side
  if (typeof window === 'undefined') {
    // On server, return empty string to avoid hydration mismatch
    // The client will re-render with sanitized content
    return '';
  }
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's', 'strike',
      'a', 'img',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'figure', 'figcaption',
      'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel',
      'class', 'id', 'style',
      'width', 'height',
      'colspan', 'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize CSS content for safe style injection.
 * Allows CSS custom properties (variables) and standard CSS.
 *
 * @param dirty - The untrusted CSS string to sanitize
 * @returns Sanitized CSS string safe for <style> tag
 */
export function sanitizeCss(dirty: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  // Remove any script or expression injections from CSS
  // CSS cannot contain javascript: URLs or expression() in modern browsers
  // but we sanitize anyway for safety
  return dirty
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/@import/gi, '')
    .replace(/url\s*\(\s*["']?\s*data:/gi, 'url(');
}
