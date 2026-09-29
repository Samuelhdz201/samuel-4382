import type { ChargeOutcome, PaymentRequest, PaymentResponse } from './types';

export const SNAILPAY_URL = '/snailpay/v1/payments';
export const DEFAULT_TIMEOUT_MS = 8000;

const STATUSES = ['approved', 'rejected', 'error'];

function isPaymentResponse(value: unknown): value is PaymentResponse {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.status === 'string' &&
    STATUSES.includes(v.status) &&
    typeof v.status_detail === 'string'
  );
}

export async function chargeCard(
  request: PaymentRequest,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ChargeOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(SNAILPAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    const body: unknown = await res.json().catch(() => null);
    if (controller.signal.aborted) return { kind: 'timeout' };
    const payment = isPaymentResponse(body) ? body : null;

    // Solo es "aprobado" si el código HTTP y el cuerpo coinciden: evita falsos cobros exitosos.
    if (res.status === 201 && payment?.status === 'approved') return { kind: 'approved', payment };
    if (payment?.status === 'rejected' && res.status >= 400 && res.status < 500)
      return { kind: 'rejected', payment };
    return { kind: 'system_error', payment };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return { kind: 'timeout' };
    return { kind: 'network_error' };
  } finally {
    clearTimeout(timer);
  }
}