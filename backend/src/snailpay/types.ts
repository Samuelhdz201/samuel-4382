export type PaymentStatus = 'approved' | 'rejected' | 'error';

export type StatusDetail =
  | 'accredited'
  | 'invalid_request'
  | 'invalid_card_number'
  | 'invalid_expiration_date'
  | 'invalid_cvv'
  | 'invalid_cardholder_name'
  | 'invalid_amount'
  | 'invalid_payer'
  | 'cc_rejected_insufficient_funds'
  | 'cc_rejected_bad_filled_date'
  | 'cc_rejected_bad_filled_security_code'
  | 'cc_rejected_other_reason'
  | 'system_unavailable';

export interface PaymentRequest {
  card_number: string;
  expiration_date: string;
  cvv: string;
  cardholder_name: string;
  transaction_amount: number;
  payer_id: string;
  payer_email: string;
}

/** Misma forma para éxito, error de transacción y error del sistema. */
export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  status_detail: StatusDetail;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
}