import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './passwordHash';

describe('passwordHash', () => {
  it('verifica la contraseña correcta y rechaza una incorrecta', async () => {
    const stored = await hashPassword('caracol123');
    expect(await verifyPassword('caracol123', stored)).toBe(true);
    expect(await verifyPassword('caracol124', stored)).toBe(false);
  });

  it('no guarda la contraseña en claro y usa una sal distinta cada vez', async () => {
    const a = await hashPassword('caracol123');
    const b = await hashPassword('caracol123');
    expect(a.hash).not.toContain('caracol123');
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
  });
});