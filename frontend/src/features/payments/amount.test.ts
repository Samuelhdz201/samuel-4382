import { describe, expect, it } from 'vitest';
import { parseAmountToCents } from './amount';

describe('parseAmountToCents', () => {
  it('convierte pesos a centavos enteros', () => {
    expect(parseAmountToCents('150')).toBe(15000);
    expect(parseAmountToCents('150.5')).toBe(15050);
    expect(parseAmountToCents('0.05')).toBe(5);
    expect(parseAmountToCents(' 10.10 ')).toBe(1010);
  });

  it('rechaza montos inválidos', () => {
    for (const input of ['', '0', '0.00', '-5', '10.123', '1,50', 'abc', '1000000.01'])
      expect(parseAmountToCents(input)).toBeNull();
  });

  it('acepta el tope exacto', () => {
    expect(parseAmountToCents('1000000')).toBe(100_000_000);
  });
});