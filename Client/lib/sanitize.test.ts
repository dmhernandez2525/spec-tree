/**
 * Tests for HTML/CSS Sanitization Utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock DOMPurify for testing
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((dirty: string, config: unknown) => {
      // Simple mock that returns the input for basic testing
      // In real scenario, DOMPurify would strip dangerous content
      return dirty;
    }),
  },
}));

describe('sanitize utilities', () => {
  // Store original window
  const originalWindow = global.window;

  beforeEach(() => {
    // Ensure window is defined for client-side tests
    vi.stubGlobal('window', { document: {} });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('sanitizeHtml', () => {
    it('returns empty string on server side (no window)', async () => {
      // Simulate server environment
      vi.stubGlobal('window', undefined);

      // Re-import to get fresh module with server context
      vi.resetModules();
      const { sanitizeHtml } = await import('./sanitize');

      expect(sanitizeHtml('<p>Test</p>')).toBe('');
    });

    it('sanitizes HTML content on client side', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeHtml } = await import('./sanitize');

      const result = sanitizeHtml('<p>Hello World</p>');
      expect(result).toBe('<p>Hello World</p>');
    });

    it('calls DOMPurify with correct configuration', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const DOMPurify = await import('dompurify');
      const { sanitizeHtml } = await import('./sanitize');

      sanitizeHtml('<script>alert("xss")</script>');

      expect(DOMPurify.default.sanitize).toHaveBeenCalledWith(
        '<script>alert("xss")</script>',
        expect.objectContaining({
          USE_PROFILES: { html: true },
          ALLOWED_TAGS: expect.arrayContaining(['p', 'div', 'span', 'a', 'img']),
          ALLOWED_ATTR: expect.arrayContaining(['href', 'src', 'alt', 'class']),
          ALLOW_DATA_ATTR: false,
        })
      );
    });
  });

  describe('sanitizeCss', () => {
    it('returns empty string on server side (no window)', async () => {
      vi.stubGlobal('window', undefined);

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      expect(sanitizeCss('.class { color: red; }')).toBe('');
    });

    it('removes javascript: URLs from CSS', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      const maliciousCss = 'background: url(javascript:alert(1))';
      const result = sanitizeCss(maliciousCss);

      expect(result).not.toContain('javascript:');
    });

    it('removes expression() from CSS', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      const maliciousCss = 'width: expression(alert(1))';
      const result = sanitizeCss(maliciousCss);

      expect(result).not.toContain('expression(');
    });

    it('removes @import statements from CSS', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      const maliciousCss = '@import url("http://evil.com/malicious.css");';
      const result = sanitizeCss(maliciousCss);

      expect(result).not.toContain('@import');
    });

    it('removes data: URLs from CSS', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      const maliciousCss = 'background: url( "data:text/html,<script>alert(1)</script>" )';
      const result = sanitizeCss(maliciousCss);

      expect(result).not.toContain('data:');
    });

    it('preserves valid CSS', async () => {
      vi.stubGlobal('window', { document: {} });

      vi.resetModules();
      const { sanitizeCss } = await import('./sanitize');

      const validCss = '.container { color: blue; font-size: 16px; }';
      const result = sanitizeCss(validCss);

      expect(result).toContain('color: blue');
      expect(result).toContain('font-size: 16px');
    });
  });
});
