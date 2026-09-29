import { useState, type ChangeEvent, type FormEvent } from 'react';
import { TextField } from '../../components/TextField';
import type { PublicUser } from '../auth/types';
import { validateTopUp, type TopUpErrors, type TopUpForm } from './cardValidation';
import { topUp } from './topUpService';

const EMPTY: TopUpForm = { cardNumber: '', expirationDate: '', cvv: '', cardholderName: '', amount: '' };
const TEST_CARD: TopUpForm = {
  cardNumber: '1234 1234 1234 1234',
  expirationDate: '12/26',
  cvv: '543',
  cardholderName: 'Cliente de Prueba',
  amount: '100',
};

interface Notice {
  type: 'success' | 'error';
  text: string;
}

export function TopUpPanel({ user, onSuccess }: { user: PublicUser; onSuccess: () => void }) {
  const [form, setForm] = useState<TopUpForm>(EMPTY);
  const [errors, setErrors] = useState<TopUpErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bind = (field: keyof TopUpForm) => ({
    name: field,
    value: form[field],
    error: errors[field],
    autoComplete: 'off',
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    const fieldErrors = validateTopUp(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    try {
      const result = await topUp(user, form);
      setNotice({ type: result.ok ? 'success' : 'error', text: result.message });
      if (result.ok) {
        setForm(EMPTY);
        onSuccess();
      }
    } catch {
      setNotice({ type: 'error', text: 'Ocurrió un error inesperado. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="topup-title">
      <h2 id="topup-title">Cargar saldo con SnailPay</h2>
      <p className="hint">
        Simulación: usa solo datos ficticios.{' '}
        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setForm(TEST_CARD);
            setErrors({});
          }}
        >
          Usar tarjeta de prueba
        </button>
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <TextField label="Número de tarjeta" inputMode="numeric" placeholder="1234 1234 1234 1234" {...bind('cardNumber')} />
        <div className="form-row">
          <TextField label="Vencimiento (MM/AA)" placeholder="12/26" {...bind('expirationDate')} />
          <TextField label="CVV" type="password" inputMode="numeric" placeholder="543" {...bind('cvv')} />
        </div>
        <TextField label="Nombre en la tarjeta" {...bind('cardholderName')} />
        <TextField label="Monto (MXN)" inputMode="decimal" placeholder="100.00" {...bind('amount')} />
        {notice && (
          <p
            className={`notice notice-${notice.type}`}
            role={notice.type === 'error' ? 'alert' : 'status'}
          >
            {notice.text}
          </p>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Procesando…' : 'Cargar saldo'}
        </button>
      </form>
    </section>
  );
}