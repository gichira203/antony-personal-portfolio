import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

/** Store passwords as `scrypt$<salt>$<hash>`. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

/**
 * Verify a password against a stored value. Accepts legacy plaintext rows
 * (from the original seed) so existing accounts can log in and be upgraded.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  if (!stored.startsWith("scrypt$")) {
    const given = Buffer.from(password);
    const expected = Buffer.from(stored);
    return (
      given.length === expected.length && timingSafeEqual(given, expected)
    );
  }

  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;

  const computed = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return (
    computed.length === expected.length && timingSafeEqual(computed, expected)
  );
}
