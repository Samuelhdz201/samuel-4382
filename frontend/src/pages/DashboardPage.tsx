import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { TopUpPanel } from '../features/payments/TopUpPanel';
import { formatCents } from '../lib/money';

export function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  if (!user) return null; // ProtectedRoute ya lo cubre; esto solo satisface el tipado.

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="brand">Derby de Caracoles</p>
          <h1>Hola, {user.fullName}</h1>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          Cerrar sesión
        </button>
      </header>
      <div className="dashboard-grid">
        <section className="balance-card" aria-label="Saldo actual">
          <p className="balance-label">Saldo actual</p>
          <p className="balance-value">{formatCents(user.balanceCents)}</p>
        </section>
        <TopUpPanel user={user} onSuccess={refreshUser} />
      </div>
    </main>
  );
}