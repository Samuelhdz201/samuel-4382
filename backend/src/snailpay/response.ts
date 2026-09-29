import { randomInt, randomUUID } from 'node:crypto';
import type { PaymentResponse, PaymentStatus, StatusDetail } from './types.js';

const asString = (value: unknown) => (typeof value === 'string' ? value : null);
const asNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/**
 * Arma la respuesta con la misma forma para éxito, rechazo y error del sistema.
 * Los datos del pagador y de la tarjeta se devuelven tal cual llegaron (si son texto),
 * porque el servicio simulado solo usa datos ficticios.
 */
export function buildResponse(
  body: unknown,
  status: PaymentStatus,
  detail: StatusDetail,
): PaymentResponse {
  const input = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  return {
    id: randomUUID(),
    status,
    status_detail: detail,
    transaction_amount: asNumber(input.transaction_amount),
    date_created: new Date().toISOString(),
    authorization_code: status === 'approved' ? `AUTH${randomInt(100000, 1000000)}` : null,
    reference: `SP-${randomUUID().slice(0, 8).toUpperCase()}`,
    payer_id: asString(input.payer_id),
    payer_email: asString(input.payer_email),
    card_number: asString(input.card_number),
    cvv: asString(input.cvv),
  };
}