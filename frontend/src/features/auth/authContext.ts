import { createContext } from 'react';
import type { PublicUser, RegisterInput } from './types';

export interface AuthContextValue {
  user: PublicUser | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Vuelve a leer al usuario de LocalStorage (por ejemplo, tras cambiar su saldo). */
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);