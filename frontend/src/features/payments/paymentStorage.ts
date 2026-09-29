import type { PaymentResponse } from './types';

export const PAYMENTS_KEY = 'snail.payments';
const MAX_PER_USER = 20;

type PaymentsByUser = Record<string, PaymentResponse[]>;

function readAll(): PaymentsByUser {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed !== null ? (parsed as PaymentsByUser) : {};
  } catch {
    return {};
  }
}

export const readPayments = (userId: string): PaymentResponse[] => readAll()[userId] ?? [];

/** Guarda la respuesta de SnailPay (incluye tarjeta y CVV ficticios, como pide el enunciado). */
export function savePayment(userId: string, payment: PaymentResponse): void {
  const all = readAll();
  all[userId] = [payment, ...(all[userId] ?? [])].slice(0, MAX_PER_USER);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(all));
}