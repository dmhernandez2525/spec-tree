/**
 * HMAC-SHA256 webhook signing and verification utilities.
 * Uses the Web Crypto API (SubtleCrypto) for browser and edge-runtime compatibility.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Header name carrying the HMAC-SHA256 signature */
export const SIGNATURE_HEADER = 'X-Webhook-Signature';

/** Header name carrying the Unix-millisecond timestamp of signing */
export const TIMESTAMP_HEADER = 'X-Webhook-Timestamp';

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Import a raw secret string as a CryptoKey suitable for HMAC-SHA256 operations.
 */
async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/**
 * Convert an ArrayBuffer to a lowercase hex string.
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const hexParts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hexParts.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return hexParts.join('');
}

/**
 * Convert a hex string to a Uint8Array.
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute an HMAC-SHA256 signature for the given payload.
 *
 * @param payload - The raw request body string to sign.
 * @param secret  - The webhook secret used as the HMAC key.
 * @returns A hex-encoded HMAC-SHA256 signature.
 */
export async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return bufferToHex(signature);
}

/**
 * Verify an HMAC-SHA256 signature using timing-safe comparison.
 *
 * The function recomputes the expected signature and then uses
 * `crypto.subtle.verify` so the comparison is constant-time,
 * preventing timing side-channel attacks.
 *
 * @param payload   - The raw request body string.
 * @param secret    - The webhook secret used as the HMAC key.
 * @param signature - The hex-encoded signature to verify.
 * @returns `true` if the signature is valid, `false` otherwise.
 */
export async function verifySignature(
  payload: string,
  secret: string,
  signature: string,
): Promise<boolean> {
  try {
    const key = await importKey(secret);
    const encoder = new TextEncoder();
    const signatureBytes = hexToBuffer(signature);
    return crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as ArrayBuffer,
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically random webhook secret.
 *
 * The secret is prefixed with `whsec_` followed by 32 random hex characters
 * (16 random bytes), giving 128 bits of entropy.
 *
 * @returns A string in the format `whsec_<32 hex chars>`.
 */
export function generateWebhookSecret(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = bufferToHex(randomBytes.buffer as ArrayBuffer);
  return `whsec_${hex}`;
}
