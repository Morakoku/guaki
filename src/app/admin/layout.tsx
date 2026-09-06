import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-obsidian-deep)' }}>
      <aside className="card-glass" style={{ width: '260px', borderRadius: '0', borderRight: 'var(--glass-border)' }}>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--color-cobalt-secondary)', marginBottom: '32px' }}>
          GUAKI <span style={{ fontSize: '0.8rem', color: 'var(--color-crimson-risk)' }}>ADMIN OS</span>
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <a href="/admin/dashboard" style={{ color: 'var(--color-pure-snow)', fontWeight: '600' }}>👑 Command Center</a>
          <a href="/admin/finance" style={{ color: 'var(--color-slate-muted)' }}>💳 MRR & Billing</a>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        {children}
      </main>
    </div>
  );
}
