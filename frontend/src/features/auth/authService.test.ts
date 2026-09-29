import { beforeEach, describe, expect, it } from 'vitest';
import { AuthError, getCurrentUser, loginUser, logoutUser, registerUser } from './authService';
import { STORAGE_KEYS } from './storage';

const input = {
  fullName: 'Ana María López',
  email: 'Ana@Example.com',
  password: 'caracol123',
  confirmPassword: 'caracol123',
};

beforeEach(() => localStorage.clear());

describe('registro', () => {
  it('crea el usuario con saldo 0, inicia sesión y no guarda la contraseña en claro', async () => {
    const user = await registerUser(input);
    expect(user.balanceCents).toBe(0);
    expect(user.email).toBe('ana@example.com');
    expect(getCurrentUser()?.id).toBe(user.id);
    expect(localStorage.getItem(STORAGE_KEYS.users)).not.toContain('caracol123');
  });

  it('rechaza correos duplicados sin importar mayúsculas', async () => {
    await registerUser(input);
    await expect(registerUser({ ...input, email: 'ANA@example.com' })).rejects.toMatchObject({
      code: 'EMAIL_TAKEN',
    });
  });

  it('rechaza datos inválidos con errores por campo', async () => {
    const err = await registerUser({ ...input, confirmPassword: 'x' }).catch((e) => e);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.fieldErrors.confirmPassword).toBeDefined();
  });
});

describe('sesión', () => {
  it('cierra sesión y vuelve a iniciar con las credenciales registradas', async () => {
    await registerUser(input);
    logoutUser();
    expect(getCurrentUser()).toBeNull();

    const user = await loginUser('ana@example.com', 'caracol123');
    expect(user.fullName).toBe('Ana María López');
    expect(getCurrentUser()).not.toBeNull();
  });

  it('rechaza contraseña incorrecta y correo inexistente con el mismo error', async () => {
    await registerUser(input);
    logoutUser();
    const wrongPassword = await loginUser('ana@example.com', 'mala12345').catch((e) => e);
    const unknownEmail = await loginUser('nadie@example.com', 'caracol123').catch((e) => e);
    expect(wrongPassword.code).toBe('INVALID_CREDENTIALS');
    expect(unknownEmail.message).toBe(wrongPassword.message);
    expect(getCurrentUser()).toBeNull();
  });

  it('limpia una sesión que apunta a un usuario inexistente', async () => {
    await registerUser(input);
    localStorage.setItem(STORAGE_KEYS.users, '{}');
    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('tolera JSON corrupto en localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.session, '{no-es-json');
    expect(getCurrentUser()).toBeNull();
  });
});