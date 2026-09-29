import type { ReactNode } from 'react';

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="brand">Derby de Caracoles</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}