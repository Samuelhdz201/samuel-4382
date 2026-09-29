import { describe, expect, it } from 'vitest';
import { validateLogin, validateRegister } from './validation';

const valid = {
  fullName: 'Ana María López',
  email: 'ana@example.com',
  password: 'caracol123',
  confirmPassword: 'caracol123',
};

describe('validateRegister', () => {
  it('acepta datos válidos', () => {
    expect(validateRegister(valid)).toEqual({});
  });

  it('exige nombre y apellido', () => {
    expect(validateRegister({ ...valid, fullName: 'Ana' }).fullName).toBeDefined();
    expect(validateRegister({ ...valid, fullName: '' }).fullName).toBeDefined();
  });

  it('rechaza correos mal formados', () => {
    for (const email of ['', 'ana', 'ana@', 'ana@example', 'a na@example.com'])
      expect(validateRegister({ ...valid, email }).email).toBeDefined();
  });

  it('rechaza contraseñas cortas o sin letra y número', () => {
    for (const password of ['abc12', 'solosletras', '12345678'])
      expect(
        validateRegister({ ...valid, password, confirmPassword: password }).password,
      ).toBeDefined();
  });

  it('exige que la confirmación coincida', () => {
    expect(validateRegister({ ...valid, confirmPassword: 'otra12345' }).confirmPassword).toBeDefined();
  });
});

describe('validateLogin', () => {
  it('pide correo y contraseña', () => {
    expect(validateLogin('', '')).toEqual({
      email: expect.any(String),
      password: expect.any(String),
    });
    expect(validateLogin('a@b.co', 'x')).toEqual({});
  });
});