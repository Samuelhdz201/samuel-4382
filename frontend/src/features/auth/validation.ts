import type { FieldErrors, RegisterInput } from './types.ts';  

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FULL_NAME_PATTERN = /^[\p{L}][\p{L}'’.-]*(\s+[\p{L}][\p{L}'’.-]*)+$/u;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ');

export function validateRegister(input: RegisterInput): FieldErrors<keyof RegisterInput> {
  const errors: FieldErrors<keyof RegisterInput> = {};
  const fullName = normalizeName(input.fullName);

  if (!fullName) errors.fullName = 'Escribe tu nombre completo.';
  else if (!FULL_NAME_PATTERN.test(fullName) || fullName.length > 100)
    errors.fullName = 'Incluye nombre y apellido, solo con letras.';

  if (!input.email.trim()) errors.email = 'Escribe tu correo electrónico.';
  else if (!EMAIL_PATTERN.test(input.email.trim())) errors.email = 'El correo no es válido.';

  if (!input.password) errors.password = 'Escribe una contraseña.';
  else if (input.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres.';
  else if (input.password.length > 128) errors.password = 'Debe tener máximo 128 caracteres.';
  else if (!/[A-Za-z]/.test(input.password) || !/\d/.test(input.password))
    errors.password = 'Debe incluir al menos una letra y un número.';

  if (!input.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña.';
  else if (input.confirmPassword !== input.password)
    errors.confirmPassword = 'Las contraseñas no coinciden.';

  return errors;
}

export function validateLogin(email: string, password: string): FieldErrors<'email' | 'password'> {
  const errors: FieldErrors<'email' | 'password'> = {};
  if (!email.trim()) errors.email = 'Escribe tu correo electrónico.';
  if (!password) errors.password = 'Escribe tu contraseña.';
  return errors;
}