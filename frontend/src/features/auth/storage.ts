import type { Session, StoredUser } from './types';

export const STORAGE_KEYS = {
  users: 'snail.users',
  session: 'snail.session',
} as const;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // JSON corrupto o storage bloqueado: se trata como si no hubiera datos.
    return fallback;
  }
}

/** Usuarios indexados por correo normalizado. */
export const readUsers = () => readJson<Record<string, StoredUser>>(STORAGE_KEYS.users, {});
export const writeUsers = (users: Record<string, StoredUser>) =>
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));

export const readSession = () => readJson<Session | null>(STORAGE_KEYS.session, null);
export const writeSession = (session: Session) =>
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
export const clearSession = () => localStorage.removeItem(STORAGE_KEYS.session);