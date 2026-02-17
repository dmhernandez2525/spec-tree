import { describe, it, expect } from 'vitest';
import { validateCorsOrigin } from './api-auth';

describe('api-auth', () => {
  describe('validateCorsOrigin', () => {
    it('allows any origin when no restrictions', () => {
      expect(validateCorsOrigin('https://example.com', [])).toBe(true);
    });

    it('allows exact match', () => {
      expect(validateCorsOrigin('https://example.com', ['https://example.com'])).toBe(true);
    });

    it('rejects non-matching origin', () => {
      expect(validateCorsOrigin('https://evil.com', ['https://example.com'])).toBe(false);
    });

    it('allows wildcard', () => {
      expect(validateCorsOrigin('https://anything.com', ['*'])).toBe(true);
    });

    it('allows subdomain wildcard', () => {
      expect(validateCorsOrigin('https://app.example.com', ['*.example.com'])).toBe(true);
    });

    it('rejects when origin is null and restrictions exist', () => {
      expect(validateCorsOrigin(null, ['https://example.com'])).toBe(false);
    });

    it('allows null origin when no restrictions', () => {
      expect(validateCorsOrigin(null, [])).toBe(true);
    });
  });
});
