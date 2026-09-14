'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface AdminEvent {
  id: string;
  action: string;
  target: string | null;
  targetId: string | null;
  from: string | null;
  to: string | null;
  reason: string | null;
  origen: string | null;
  actorId: string | null;
  timestamp: string;
}

const ACTION_LABEL: Record<string, string> = {
  inquiry_status: 'Contacto → estado',
  review_approved: 'Reseña aprobada',
  review_rejected: 'Reseña rechazada',
  audit_approved: 'Ficha aprobada',
  audit_published: 'Ficha publicada',
  audit_rejected: 'Ficha rechazada',
};

export default function AdminActivity() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await fetch('/api/admin/activity', { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      if (d?.ok) setEvents(d.events || []);
      else setMsg(d?.error || 'No se pudo cargar la auditoría.');
    } catch {
      setMsg('No se pudo cargar la auditoría. Revisa tu conexión.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return events;
    return events.filter((e) => `${e.action} ${e.target} ${e.reason} ${e.origen} ${e.from} ${e.to}`.toLowerCase().includes(t));
  }, [events, q]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <History size={18} color={TOKENS.colors.emeraldDark} />
        <strong style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem' }}>Auditoría de acciones admin ({events.length})</strong>
        <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Search size={14} color={TOKENS.colors.textSecondary} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar acción, objetivo o motivo" aria-label="Buscar en auditoría"
            style={{ padding: '8px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.white, fontSize: '0.85rem', minWidth: 260 }} />
        </label>
      </div>

      {msg ? <div style={{ fontSize: '0.84rem', color: TOKENS.colors.emeraldDark, fontWeight: 700 }}>{msg}</div> : null}

      <div style={{ overflowX: 'auto', border: `1px solid ${TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: TOKENS.colors.surfaceElevated, textAlign: 'left' }}>
              {['Fecha', 'Acción', 'Objetivo', 'Cambio', 'Motivo'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontWeight: 800, color: TOKENS.colors.textSecondary, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}` }}>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary, whiteSpace: 'nowrap' }}>
                  {e.timestamp ? new Date(e.timestamp).toLocaleString('es-CO') : '—'}
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700 }}>{ACTION_LABEL[e.action] || e.action}</td>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textMain }}>{e.target || '—'}</td>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary }}>
                  {e.from || e.to ? `${e.from || '—'} → ${e.to || '—'}` : '—'}
                </td>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary, maxWidth: 320 }}>{e.reason || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '18px 14px', color: TOKENS.colors.textSecondary }}>Sin acciones registradas.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '0.76rem', color: TOKENS.colors.textMuted }}>
        Registro append-only de las decisiones del panel (aprobaciones, rechazos, cambios de estado de contactos).
      </div>
    </div>
  );
}
