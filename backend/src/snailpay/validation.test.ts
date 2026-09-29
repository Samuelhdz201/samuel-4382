import { describe, expect, it } from 'vitest';
import { validatePaymentRequest } from './validation.js';

const valid = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana López',
  transaction_amount: 100,
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
};

describe('validatePaymentRequest', () => {
  it('acepta una petición válida', () => {
    expect(validatePaymentRequest(valid)).toEqual({ ok: true, data: valid });
  });

  it('rechaza cuerpos que no son objetos', () => {
    for (const body of [null, undefined, 'texto', 42, []])
      expect(validatePaymentRequest(body)).toEqual({ ok: false, detail: 'invalid_request' });
  });

  it('detecta el campo inválido', () => {
    const cases = [
      [{ ...valid, card_number: '1234' }, 'invalid_card_number'],
      [{ ...valid, expiration_date: '13/26' }, 'invalid_expiration_date'],
      [{ ...valid, cvv: 'abc' }, 'invalid_cvv'],
      [{ ...valid, cardholder_name: '   ' }, 'invalid_cardholder_name'],
      [{ ...valid, payer_email: 'no-es-correo' }, 'invalid_payer'],
    ] as const;
    for (const [body, detail] of cases)
      expect(validatePaymentRequest(body)).toEqual({ ok: false, detail });
  });

  it('valida el monto: positivo, con máximo 2 decimales y dentro del tope', () => {
    for (const transaction_amount of [0, -5, 10.123, 2_000_000, NaN, '100'])
      expect(validatePaymentRequest({ ...valid, transaction_amount })).toEqual({
        ok: false,
        detail: 'invalid_amount',
      });
    expect(validatePaymentRequest({ ...valid, transaction_amount: 10.1 }).ok).toBe(true);
  });
});