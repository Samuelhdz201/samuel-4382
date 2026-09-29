export type PaymentStatus = 'approved' | 'rejected' | 'error';

export interface PaymentRequest {
  card_number: string;
  expiration_date: string;
  cvv: string;
  cardholder_name: string;
  transaction_amount: number;
  payer_id: string;
  payer_email: string;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  status_detail: string;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
}

/** Resultado de un intento de cobro, ya clasificado para que la interfaz decida qué mostrar. */
export type ChargeOutcome =
  | { kind: 'approved'; payment: PaymentResponse }
  | { kind: 'rejected'; payment: PaymentResponse }
  | { kind: 'system_error'; payment: PaymentResponse | null }
  | { kind: 'timeout' }
  | { kind: 'network_error' };