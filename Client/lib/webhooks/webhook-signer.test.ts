import { describe, it, expect } from 'vitest';
import {
  signPayload,
  verifySignature,
  generateWebhookSecret,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
} from './webhook-signer';

describe('webhook-signer', () => {
  const testSecret = 'whsec_test_secret_key_12345';
  const testPayload = JSON.stringify({ event: 'spec.created', data: { id: '1' } });

  // -----------------------------------------------------------------------
  // signPayload
  // -----------------------------------------------------------------------

  describe('signPayload', () => {
    it('returns a hex string', async () => {
      const signature = await signPayload(testPayload, testSecret);

      expect(signature).toMatch(/^[0-9a-f]+$/);
      // HMAC-SHA256 always produces 64 hex characters (32 bytes)
      expect(signature).toHaveLength(64);
    });

    it('produces consistent signatures for the same input', async () => {
      const sig1 = await signPayload(testPayload, testSecret);
      const sig2 = await signPayload(testPayload, testSecret);

      expect(sig1).toBe(sig2);
    });

    it('produces different signatures for different secrets', async () => {
      const sigA = await signPayload(testPayload, 'secret_alpha');
      const sigB = await signPayload(testPayload, 'secret_beta');

      expect(sigA).not.toBe(sigB);
    });
  });

  // -----------------------------------------------------------------------
  // verifySignature
  // -----------------------------------------------------------------------

  describe('verifySignature', () => {
    it('returns true for a valid signature', async () => {
      const signature = await signPayload(testPayload, testSecret);
      const isValid = await verifySignature(testPayload, testSecret, signature);

      expect(isValid).toBe(true);
    });

    it('returns false for an invalid signature', async () => {
      const badSignature = 'a'.repeat(64);
      const isValid = await verifySignature(testPayload, testSecret, badSignature);

      expect(isValid).toBe(false);
    });

    it('returns false when the payload has been tampered with', async () => {
      const signature = await signPayload(testPayload, testSecret);
      const tamperedPayload = JSON.stringify({ event: 'spec.deleted', data: { id: '1' } });
      const isValid = await verifySignature(tamperedPayload, testSecret, signature);

      expect(isValid).toBe(false);
    });

    it('returns false for a malformed hex string', async () => {
      const isValid = await verifySignature(testPayload, testSecret, 'not-hex');

      expect(isValid).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // generateWebhookSecret
  // -----------------------------------------------------------------------

  describe('generateWebhookSecret', () => {
    it('starts with the whsec_ prefix', () => {
      const secret = generateWebhookSecret();

      expect(secret).toMatch(/^whsec_/);
    });

    it('contains 32 hex characters after the prefix', () => {
      const secret = generateWebhookSecret();
      const hexPart = secret.replace('whsec_', '');

      expect(hexPart).toMatch(/^[0-9a-f]{32}$/);
    });

    it('generates unique secrets on each call', () => {
      const secrets = new Set(Array.from({ length: 20 }, () => generateWebhookSecret()));

      expect(secrets.size).toBe(20);
    });
  });

  // -----------------------------------------------------------------------
  // Constants
  // -----------------------------------------------------------------------

  describe('constants', () => {
    it('defines SIGNATURE_HEADER', () => {
      expect(SIGNATURE_HEADER).toBe('X-Webhook-Signature');
    });

    it('defines TIMESTAMP_HEADER', () => {
      expect(TIMESTAMP_HEADER).toBe('X-Webhook-Timestamp');
    });
  });
});
