import { formatCents } from '../../lib/money';
import { creditBalance } from '../auth/authService';
import type { PublicUser } from '../auth/types';
import { parseAmountToCents } from './amount';
import { normalizeCardNumber, validateTopUp, type TopUpForm } from './cardValidation';
import { savePayment } from './paymentStorage';
import { chargeCard } from './snailPayClient';
import type { ChargeOutcome, PaymentRequest } from './types';

export type TopUpResult =
  | { ok: true; message: string; balanceCents: number }
  | { ok: false; message: string };

type ChargeFn = (request: PaymentRequest) => Promise<ChargeOutcome>;

const REJECTION_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_funds: 'La tarjeta no tiene fondos suficientes.',
  cc_rejected_bad_filled_date: 'La fecha de vencimiento no es correcta.',
  cc_rejected_bad_filled_security_code: 'El CVV no es correcto.',
  cc_rejected_other_reason: 'La tarjeta fue rechazada. Prueba con otra tarjeta.',
};

const rejectionMessage = (detail: string) =>
  REJECTION_MESSAGES[detail] ?? 'SnailPay no aceptó los datos enviados. Revísalos e intenta de nuevo.';

/** El saldo solo se modifica cuando SnailPay aprueba el cobro; cualquier otro resultado lo deja intacto. */
export async function topUp(
  user: PublicUser,
  form: TopUpForm,
  charge: ChargeFn = chargeCard,
): Promise<TopUpResult> {
  const amountCents = parseAmountToCents(form.amount);
  if (amountCents === null || Object.keys(validateTopUp(form)).length > 0)
    return { ok: false, message: 'Revisa los datos de la tarjeta y el monto.' };

  const outcome = await charge({
    card_number: normalizeCardNumber(form.cardNumber),
    expiration_date: form.expirationDate.trim(),
    cvv: form.cvv.trim(),
    cardholder_name: form.cardholderName.trim(),
    transaction_amount: amountCents / 100,
    payer_id: user.id,
    payer_email: user.email,
  });

  if ('payment' in outcome && outcome.payment) savePayment(user.id, outcome.payment);

  switch (outcome.kind) {
    case 'approved': {
      const balanceCents = creditBalance(user.email, amountCents);
      const code = outcome.payment.authorization_code;
      return {
        ok: true,
        balanceCents,
        message: `Recarga aprobada: se abonaron ${formatCents(amountCents)}.${code ? ` Autorización: ${code}.` : ''}`,
      };
    }
    case 'rejected':
      return { ok: false, message: `${rejectionMessage(outcome.payment.status_detail)} Tu saldo no cambió.` };
    case 'system_error':
      return {
        ok: false,
        message: 'SnailPay no está disponible en este momento. No se aplicó ninguna recarga; intenta más tarde.',
      };
    case 'timeout':
      return {
        ok: false,
        message: 'SnailPay tardó demasiado en responder. No se aplicó ninguna recarga; intenta de nuevo.',
      };
    case 'network_error':
      return {
        ok: false,
        message: 'No pudimos conectar con SnailPay. Revisa tu conexión; tu saldo no cambió.',
      };
  }
}