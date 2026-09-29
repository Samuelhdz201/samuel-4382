import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { TextField } from '../components/TextField';
import { AuthError } from '../features/auth/authService';
import type { FieldErrors, RegisterInput } from '../features/auth/types';
import { useAuth } from '../features/auth/useAuth';

const EMPTY_FORM: RegisterInput = { fullName: '', email: '', password: '', confirmPassword: '' };

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<keyof RegisterInput>>({});
  const [submitting, setSubmitting] = useState(false);

  const bind = (field: keyof RegisterInput) => ({
    name: field,
    value: form[field],
    error: errors[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof AuthError) setErrors(err.fieldErrors);
      else setErrors({ email: 'No se pudo completar el registro. Intenta de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Crear cuenta">
      <form onSubmit={handleSubmit} noValidate>
        <TextField label="Nombre completo" autoComplete="name" {...bind('fullName')} />
        <TextField label="Correo electrónico" type="email" autoComplete="email" {...bind('email')} />
        <TextField label="Contraseña" type="password" autoComplete="new-password" {...bind('password')} />
        <TextField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          {...bind('confirmPassword')}
        />
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}