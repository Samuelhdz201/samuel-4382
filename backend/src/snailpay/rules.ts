import type { PaymentRequest, PaymentStatus, StatusDetail } from './types.js';

export const SUCCESS_CARD = {
  number: '1234123412341234',
  expiration: '12/26',
  cvv: '543',
} as const;

export const INSUFFICIENT_FUNDS_CARD = '4000000000000002';

export interface ChargeDecision {
  status: PaymentStatus;
  detail: StatusDetail;
}

/** Decide el resultado de un cobro con datos ya validados en formato. */
export function decideCharge(request: PaymentRequest): ChargeDecision {
  if (request.card_number === INSUFFICIENT_FUNDS_CARD)
    return { status: 'rejected', detail: 'cc_rejected_insufficient_funds' };
  if (request.card_number !== SUCCESS_CARD.number)
    return { status: 'rejected', detail: 'cc_rejected_other_reason' };
  if (request.expiration_date !== SUCCESS_CARD.expiration)
    return { status: 'rejected', detail: 'cc_rejected_bad_filled_date' };
  if (request.cvv !== SUCCESS_CARD.cvv)
    return { status: 'rejected', detail: 'cc_rejected_bad_filled_security_code' };
  return { status: 'approved', detail: 'accredited' };
}