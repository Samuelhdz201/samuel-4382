// PBKDF2-SHA256 con sal aleatoria por usuario, usando Web Crypto (sin dependencias).
// Es una simulación local: en un sistema real el hash se haría en el servidor.

export const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

export interface PasswordHash {
  hash: string;
  salt: string;
  iterations: number;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function equalStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hashPassword(
  password: string,
  salt?: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<PasswordHash> {
  const saltBytes = salt ? fromBase64(salt) : crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations },
    key,
    HASH_BITS,
  );
  return { hash: toBase64(new Uint8Array(bits)), salt: toBase64(saltBytes), iterations };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const { hash } = await hashPassword(password, stored.salt, stored.iterations);
  return equalStrings(hash, stored.hash);
}