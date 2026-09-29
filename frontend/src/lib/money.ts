const formatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Los montos viven en centavos (enteros) para evitar errores de punto flotante. */
export const formatCents = (cents: number) => formatter.format(cents / 100);