import { parseAmountToCents } from './amount';

export interface TopUpForm {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
  amount: string;
}

export type TopUpErrors = Partial<Record<keyof TopUpForm, string>>;

const EXPIRATION_PATTERN = /^(0[1-9]|1[0-2])\/\d{2}$/;

export const normalizeCardNumber = (value: string) => value.replace(/[\s-]/g, '');

export function validateTopUp(form: TopUpForm): TopUpErrors {
  const errors: TopUpErrors = {};

  if (!/^\d{16}$/.test(normalizeCardNumber(form.cardNumber)))
    errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';

  // Solo se valida el formato: no se compara con la fecha actual, para que 12/26 no expire con el tiempo.
  if (!EXPIRATION_PATTERN.test(form.expirationDate.trim()))
    errors.expirationDate = 'Usa el formato MM/AA, por ejemplo 12/26.';

  if (!/^\d{3,4}$/.test(form.cvv.trim())) errors.cvv = 'El CVV debe tener 3 o 4 dígitos.';

  const name = form.cardholderName.trim();
  if (!name) errors.cardholderName = 'Escribe el nombre que aparece en la tarjeta.';
  else if (name.length > 100) errors.cardholderName = 'El nombre es demasiado largo.';

  if (parseAmountToCents(form.amount) === null)
    errors.amount = 'Escribe un monto mayor a 0, con máximo 2 decimales (tope: $1,000,000).';

  return errors;
}