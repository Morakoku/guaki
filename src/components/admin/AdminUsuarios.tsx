'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Search, UserCheck, Users } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface AdminUser {
  id: string;
  email: string | null;
  role: string;
  name: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  fichas: number;
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState('');
  const [confirmBan, setConfirmBan] = useState<AdminUser | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await fetch('/api/admin/users', { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      if (d?.ok) setUsers(d.users || []);
    } catch {
      /* silencioso */
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => `${u.email} ${u.name} ${u.role}`.toLowerCase().includes(term));
  }, [users, q]);

  const doAction = async (user: AdminUser, action: 'ban' | 'unban') => {
    setBusy(user.id);
    try {
      const r = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action }),
      });
      const d = await r.json();
      if (!r.ok || d.error) setMsg(d.error || 'No se pudo completar la acción.');
      else setMsg(action === 'ban' ? 'Usuario suspendido (puede reactivarse).' : 'Usuario reactivado.');
      await load();
    } catch {
      setMsg('Error de red.');
    } finally {
      setBusy('');
      setConfirmBan(null);
      setConfirmText('');
    }
  };

  const chip = (label: string, on: boolean) => (
    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: TOKENS.radii.pill, background: on ? '#fef3c7' : TOKENS.colors.surfaceElevated, color: on ? '#b45309' : TOKENS.colors.textSecondary, border: `1px solid ${TOKENS.colors.borderLight}` }}>{label}</span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Users size={18} color={TOKENS.colors.emeraldDark} />
        <strong style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem' }}>Usuarios ({users.length})</strong>
        <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Search size={14} color={TOKENS.colors.textSecondary} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar email o nombre" aria-label="Buscar usuarios"
            style={{ padding: '8px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.white, fontSize: '0.85rem' }} />
        </label>
      </div>
      {msg ? <div style={{ fontSize: '0.84rem', color: TOKENS.colors.emeraldDark, fontWeight: 700 }}>{msg}</div> : null}
      <div style={{ overflowX: 'auto', border: `1px solid ${TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: TOKENS.colors.surfaceElevated, textAlign: 'left' }}>
              {['Usuario', 'Rol', 'Fichas', 'Último acceso', 'Estado', ''].map((h, i) => (
                <th key={i} style={{ padding: '10px 14px', fontWeight: 800, color: TOKENS.colors.textSecondary, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}` }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700 }}>{u.email || '(sin email)'}</div>
                  <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>{u.name || '—'}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>{chip(u.role, u.role === 'admin')}</td>
                <td style={{ padding: '10px 14px' }}>{u.fichas}</td>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('es-CO') : 'nunca'}</td>
                <td style={{ padding: '10px 14px' }}>{u.banned_until ? chip('suspendido', true) : chip('activo', false)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                  {u.banned_until ? (
                    <button type="button" onClick={() => doAction(u, 'unban')} disabled={busy === u.id}
                      style={{ border: `1px solid ${TOKENS.colors.emeraldDark}`, background: 'transparent', color: TOKENS.colors.emeraldDark, borderRadius: TOKENS.radii.pill, padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}>
                      <UserCheck size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Reactivar
                    </button>
                  ) : (
                    <button type="button" onClick={() => { setConfirmBan(u); setConfirmText(''); }} disabled={busy === u.id || u.role === 'admin'}
                      title={u.role === 'admin' ? 'No puedes suspenderte a ti mismo' : ''}
                      style={{ border: '1px solid #b91c1c', background: 'transparent', color: '#b91c1c', borderRadius: TOKENS.radii.pill, padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800, cursor: u.role === 'admin' ? 'not-allowed' : 'pointer', opacity: u.role === 'admin' ? 0.4 : 1 }}>
                      <Ban size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Suspender
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '18px 14px', color: TOKENS.colors.textSecondary }}>Sin usuarios que coincidan con la búsqueda.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {confirmBan ? (
        <div role="dialog" aria-modal="true" aria-label="Confirmar suspensión"
          style={{ position: 'fixed', inset: 0, background: 'rgba(16,36,28,0.55)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }}>
          <div style={{ background: TOKENS.colors.white, borderRadius: TOKENS.radii.xl, padding: '26px 28px', maxWidth: 430, width: '100%', boxShadow: TOKENS.shadows.card }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '10px' }}>Suspender a {confirmBan.email}</h3>
            <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, marginBottom: '14px' }}>
              No podrá iniciar sesión ni editar sus {confirmBan.fichas} ficha(s); el contenido publicado permanece visible. reversible en cualquier momento con «Reactivar».
            </p>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
              Escribe SUSPENDER para confirmar
            </label>
            <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label="Escribir SUSPENDER para confirmar"
              style={{ width: '100%', padding: '10px 12px', borderRadius: TOKENS.radii.md, border: `1px solid ${TOKENS.colors.borderLight}`, fontSize: '0.9rem', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setConfirmBan(null)} style={{ padding: '9px 16px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: 'transparent', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
                Conservar activo
              </button>
              <button type="button" disabled={confirmText.trim().toUpperCase() !== 'SUSPENDER' || busy === confirmBan.id} onClick={() => doAction(confirmBan, 'ban')}
                style={{ padding: '9px 16px', borderRadius: TOKENS.radii.pill, border: 'none', background: confirmText.trim().toUpperCase() === 'SUSPENDER' ? '#b91c1c' : TOKENS.colors.borderLight, color: confirmText.trim().toUpperCase() === 'SUSPENDER' ? '#fff' : TOKENS.colors.textSecondary, fontWeight: 800, fontSize: '0.82rem', cursor: confirmText.trim().toUpperCase() === 'SUSPENDER' ? 'pointer' : 'not-allowed' }}>
                Suspender usuario
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
