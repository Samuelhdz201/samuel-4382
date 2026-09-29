import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, registerUser } from '../auth/authService';
import type { PublicUser } from '../auth/types';
import { readPayments } from './paymentStorage';
import { topUp } from './topUpService';
import type { ChargeOutcome, PaymentRequest, PaymentResponse } from './types';

const form = {
  cardNumber: '1234 1234 1234 1234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Ana López',
  amount: '100',
};

const payment = (overrides: Partial<PaymentResponse> = {}): PaymentResponse => ({
  id: 'p1',
  status: 'approved',
  status_detail: 'accredited',
  transaction_amount: 100,
  date_created: '2026-09-29T12:00:00.000Z',
  authorization_code: 'AUTH123456',
  reference: 'SP-ABCD1234',
  payer_id: 'u1',
  payer_email: 'ana@example.com',
  card_number: '1234123412341234',
  cvv: '543',
  ...overrides,
});

const chargeReturning = (outcome: ChargeOutcome) =>
  vi.fn(async (request: PaymentRequest) => {
    void request;
    return outcome;
  });

let user: PublicUser;

beforeEach(async () => {
  localStorage.clear();
  user = await registerUser({
    fullName: 'Ana María López',
    email: 'ana@example.com',
    password: 'caracol123',
    confirmPassword: 'caracol123',
  });
});

describe('topUp', () => {
  it('suma el monto al saldo, lo persiste y manda los datos correctos a SnailPay', async () => {
    const charge = chargeReturning({ kind: 'approved', payment: payment() });
    const result = await topUp(user, form, charge);

    expect(result).toMatchObject({ ok: true, balanceCents: 10000 });
    expect(getCurrentUser()?.balanceCents).toBe(10000);
    expect(charge).toHaveBeenCalledWith(
      expect.objectContaining({
        card_number: '1234123412341234',
        transaction_amount: 100,
        payer_id: user.id,
        payer_email: 'ana@example.com',
      }),
    );
  });

  it('guarda la respuesta con tarjeta y CVV en LocalStorage', async () => {
    await topUp(user, form, chargeReturning({ kind: 'approved', payment: payment() }));
    expect(readPayments(user.id)[0]).toMatchObject({ card_number: '1234123412341234', cvv: '543' });
  });

  it('acumula varias recargas aprobadas', async () => {
    const charge = chargeReturning({ kind: 'approved', payment: payment() });
    await topUp(user, form, charge);
    await topUp(user, { ...form, amount: '50.50' }, charge);
    expect(getCurrentUser()?.balanceCents).toBe(15050);
  });

  const failures: ChargeOutcome[] = [
    {
      kind: 'rejected',
      payment: payment({
        status: 'rejected',
        status_detail: 'cc_rejected_insufficient_funds',
        authorization_code: null,
      }),
    },
    { kind: 'system_error', payment: null },
    { kind: 'timeout' },
    { kind: 'network_error' },
  ];

  it.each(failures)('no modifica el saldo ante $kind', async (outcome) => {
    const result = await topUp(user, form, chargeReturning(outcome));
    expect(result.ok).toBe(false);
    expect(getCurrentUser()?.balanceCents).toBe(0);
  });

  it('explica el rechazo por fondos insuficientes', async () => {
    const result = await topUp(user, form, chargeReturning(failures[0]));
    expect(result.message).toContain('fondos');
  });

  it('no llama a SnailPay si el formulario es inválido', async () => {
    const charge = chargeReturning({ kind: 'approved', payment: payment() });
    const result = await topUp(user, { ...form, cvv: '1' }, charge);
    expect(result.ok).toBe(false);
    expect(charge).not.toHaveBeenCalled();
  });
});