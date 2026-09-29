import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './authContext';
import { getCurrentUser, loginUser, logoutUser, registerUser } from './authService';
import type { PublicUser, RegisterInput } from './types';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lectura síncrona inicial: al recargar no hay parpadeo hacia /login.
  const [user, setUser] = useState<PublicUser | null>(() => getCurrentUser());

  const register = useCallback(async (input: RegisterInput) => {
    setUser(await registerUser(input));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await loginUser(email, password));
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => setUser(getCurrentUser()), []);

  const value = useMemo(
    () => ({ user, register, login, logout, refreshUser }),
    [user, register, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}