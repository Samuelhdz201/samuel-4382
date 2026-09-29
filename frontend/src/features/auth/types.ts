export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  salt: string;
  iterations: number;
  balanceCents: number;
  createdAt: string;
}

/** Usuario sin datos de credenciales: es lo único que ve la interfaz. */
export type PublicUser = Omit<StoredUser, 'passwordHash' | 'salt' | 'iterations'>;

export interface Session {
  userId: string;
  email: string;
  startedAt: string;
}