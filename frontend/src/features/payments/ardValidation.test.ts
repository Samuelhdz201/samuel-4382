import { describe, expect, it } from 'vitest';
import { validateTopUp } from './cardValidation';

const valid = {
  cardNumber: '1234 1234 1234 1234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Ana López',
  amount: '100',
};

describe('validateTopUp', () => {
  it('acepta la tarjeta de éxito, con o sin espacios', () => {
    expect(validateTopUp(valid)).toEqual({});
    expect(validateTopUp({ ...valid, cardNumber: '1234123412341234' })).toEqual({});
  });

  it('no rechaza vencimientos por la fecha actual, solo por formato', () => {
    expect(validateTopUp({ ...valid, expirationDate: '01/20' })).toEqual({});
    expect(validateTopUp({ ...valid, expirationDate: '13/26' }).expirationDate).toBeDefined();
    expect(validateTopUp({ ...valid, expirationDate: '1226' }).expirationDate).toBeDefined();
  });

  it('detecta cada campo inválido', () => {
    expect(validateTopUp({ ...valid, cardNumber: '1234' }).cardNumber).toBeDefined();
    expect(validateTopUp({ ...valid, cvv: '12' }).cvv).toBeDefined();
    expect(validateTopUp({ ...valid, cardholderName: '  ' }).cardholderName).toBeDefined();
    expect(validateTopUp({ ...valid, amount: '0' }).amount).toBeDefined();
  });
});