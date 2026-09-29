import { describe, expect, it } from 'vitest';
import { decideCharge } from './rules.js';
import type { PaymentRequest } from './types.js';

const valid: PaymentRequest = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Ana López',
  transaction_amount: 100,
  payer_id: 'user-1',
  payer_email: 'ana@example.com',
};

describe('decideCharge', () => {
  it('aprueba con la tarjeta de éxito', () => {
    expect(decideCharge(valid)).toEqual({ status: 'approved', detail: 'accredited' });
  });

  it('rechaza por fondos insuficientes con la tarjeta de prueba', () => {
    expect(decideCharge({ ...valid, card_number: '4000000000000002' })).toEqual({
      status: 'rejected',
      detail: 'cc_rejected_insufficient_funds',
    });
  });

  it('rechaza cualquier otra tarjeta', () => {
    expect(decideCharge({ ...valid, card_number: '1111222233334444' }).detail).toBe(
      'cc_rejected_other_reason',
    );
  });

  it('rechaza vencimiento o CVV distintos en la tarjeta de éxito', () => {
    expect(decideCharge({ ...valid, expiration_date: '01/27' }).detail).toBe(
      'cc_rejected_bad_filled_date',
    );
    expect(decideCharge({ ...valid, cvv: '999' }).detail).toBe(
      'cc_rejected_bad_filled_security_code',
    );
  });
});