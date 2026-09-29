import type { PaymentRequest, StatusDetail } from './types.js';

export type ValidationResult =
  | { ok: true; data: PaymentRequest }
  | { ok: false; detail: StatusDetail };

export const MAX_AMOUNT = 1_000_000;

const CARD_PATTERN = /^\d{16}$/;
const EXPIRATION_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;
const CVV_PATTERN = /^\d{3,4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasMaxTwoDecimals = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;

export function validatePaymentRequest(body: unknown): ValidationResult {
  if (!isRecord(body)) return { ok: false, detail: 'invalid_request' };

  const { card_number, expiration_date, cvv, cardholder_name, transaction_amount, payer_id, payer_email } =
    body;

  if (
    typeof payer_id !== 'string' ||
    payer_id.trim() === '' ||
    payer_id.length > 100 ||
    typeof payer_email !== 'string' ||
    !EMAIL_PATTERN.test(payer_email)
  )
    return { ok: false, detail: 'invalid_payer' };

  if (typeof card_number !== 'string' || !CARD_PATTERN.test(card_number))
    return { ok: false, detail: 'invalid_card_number' };

  if (typeof expiration_date !== 'string' || !EXPIRATION_PATTERN.test(expiration_date))
    return { ok: false, detail: 'invalid_expiration_date' };

  if (typeof cvv !== 'string' || !CVV_PATTERN.test(cvv)) return { ok: false, detail: 'invalid_cvv' };

  if (typeof cardholder_name !== 'string' || cardholder_name.trim() === '' || cardholder_name.length > 100)
    return { ok: false, detail: 'invalid_cardholder_name' };

  if (
    typeof transaction_amount !== 'number' ||
    !Number.isFinite(transaction_amount) ||
    transaction_amount <= 0 ||
    transaction_amount > MAX_AMOUNT ||
    !hasMaxTwoDecimals(transaction_amount)
  )
    return { ok: false, detail: 'invalid_amount' };

  return {
    ok: true,
    data: {
      card_number,
      expiration_date,
      cvv,
      cardholder_name: cardholder_name.trim(),
      transaction_amount,
      payer_id,
      payer_email,
    },
  };
}