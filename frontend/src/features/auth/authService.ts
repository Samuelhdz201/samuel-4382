import { hashPassword, verifyPassword } from './passwordHash';
import { clearSession, readSession, readUsers, writeSession, writeUsers } from './storage';
import type { FieldErrors, PublicUser, RegisterInput, StoredUser } from './types';
import { normalizeEmail, normalizeName, validateRegister } from './validation';

export type AuthErrorCode = 'VALIDATION' | 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS';

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly fieldErrors: FieldErrors<keyof RegisterInput>;

  constructor(
    code: AuthErrorCode,
    message: string,
    fieldErrors: FieldErrors<keyof RegisterInput> = {},
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    balanceCents: user.balanceCents,
    createdAt: user.createdAt,
  };
}

function startSession(user: StoredUser) {
  writeSession({ userId: user.id, email: user.email, startedAt: new Date().toISOString() });
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const fieldErrors = validateRegister(input);
  if (Object.keys(fieldErrors).length > 0)
    throw new AuthError('VALIDATION', 'Revisa los datos del formulario.', fieldErrors);

  const email = normalizeEmail(input.email);
  const users = readUsers();
  if (users[email])
    throw new AuthError('EMAIL_TAKEN', 'Ya existe una cuenta con ese correo.', {
      email: 'Ya existe una cuenta con ese correo.',
    });

  const { hash, salt, iterations } = await hashPassword(input.password);
  const user: StoredUser = {
    id: crypto.randomUUID(),
    fullName: normalizeName(input.fullName),
    email,
    passwordHash: hash,
    salt,
    iterations,
    balanceCents: 0,
    createdAt: new Date().toISOString(),
  };

  writeUsers({ ...users, [email]: user });
  startSession(user);
  return toPublicUser(user);
}

export async function loginUser(emailInput: string, password: string): Promise<PublicUser> {
  const user = readUsers()[normalizeEmail(emailInput)];
  // Mismo mensaje si el correo no existe o la contraseña falla: no revela qué correos hay.
  const valid =
    !!user &&
    (await verifyPassword(password, {
      hash: user.passwordHash,
      salt: user.salt,
      iterations: user.iterations,
    }));
  if (!user || !valid) throw new AuthError('INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');

  startSession(user);
  return toPublicUser(user);
}

export function logoutUser(): void {
  clearSession();
}

/** Restaura la sesión al recargar; si apunta a un usuario inexistente, la limpia. */
export function getCurrentUser(): PublicUser | null {
  const session = readSession();
  if (!session) return null;
  const user = readUsers()[session.email];
  if (!user || user.id !== session.userId) {
    clearSession();
    return null;
  }
  return toPublicUser(user);
}