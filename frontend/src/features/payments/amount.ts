export const MAX_TOP_UP_CENTS = 1_000_000 * 100;

const AMOUNT_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

/** "150", "150.5" o "150.50" → centavos enteros. Devuelve null si no es un monto válido. */
export function parseAmountToCents(input: string): number | null {
  const text = input.trim();
  if (!AMOUNT_PATTERN.test(text)) return null;
  const [pesos, decimals = ''] = text.split('.');
  const cents = Number(pesos) * 100 + Number(decimals.padEnd(2, '0'));
  return cents > 0 && cents <= MAX_TOP_UP_CENTS ? cents : null;
}
