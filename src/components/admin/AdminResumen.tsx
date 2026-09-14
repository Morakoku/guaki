'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Activity, BarChart3, Inbox, ShieldAlert } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface Stats {
  ok: boolean;
  fichas?: { total: number; byStatus: Record<string, number>; rejectedStale: number };
  planes?: Record<string, number>;
  mrr?: { cop: number; currency: string };
  inquiries?: { total: number; new: number };
  reviews?: number;
  events7d?: number;
}
interface AuditEntry {
  id: number;
  event_name: string;
  timestamp: string;
  business_id?: string;
  metadata?: Record<string, unknown>;
}

const fmtCop = (n: number) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);

export default function AdminResumen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [log, setLog] = useState<AuditEntry[]>([]);
  const [reviewsPending, setReviewsPending] = useState(0);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, l, r] = await Promise.all([
        fetch('/api/admin/stats', { credentials: 'include', cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/admin/audit-log', { credentials: 'include', cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/admin/reviews?page=1&limit=1', { credentials: 'include', cache: 'no-store' }).then((res) => res.json()),
      ]);
      if (s?.ok) setStats(s); else setError(s?.error || 'stats');
      if (l?.ok) setLog(l.entries || []);
      if (r?.ok && typeof r?.summary?.submitted === 'number') setReviewsPending(r.summary.submitted);
    } catch {
      setError('No se pudo cargar el resumen.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const card = (label: string, value: string, sub: string, alert = false) => (
    <div style={{ background: TOKENS.colors.surfaceElevated, border: `1px solid ${alert ? TOKENS.colors.danger || '#b91c1c' : TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg, padding: '18px 20px', minWidth: 180 }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: TOKENS.colors.textSecondary }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: alert ? '#b91c1c' : TOKENS.colors.textMain, margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>{sub}</div>
    </div>
  );

  if (error && !stats) return <p style={{ color: TOKENS.colors.textSecondary }}>{error}</p>;
  if (!stats) return <p style={{ color: TOKENS.colors.textSecondary }}>Cargando resumen…</p>;

  const f = stats.fichas || { total: 0, byStatus: {}, rejectedStale: 0 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <BarChart3 size={18} color={TOKENS.colors.emeraldDark} />
        <span style={{ fontWeight: 900, fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem' }}>Cola operativa — qué espera hoy</span>
      </div>
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        {card('En auditoría', String(f.byStatus.in_audit || 0), 'fichas esperando decisión', (f.byStatus.in_audit || 0) > 0)}
        {card('Rechazadas >7d', String(f.rejectedStale), 'sin reenviar al panel', f.rejectedStale > 0)}
        {card('Inquiries nuevos', String(stats.inquiries?.new ?? 0), `${stats.inquiries?.total ?? 0} totales`, (stats.inquiries?.new || 0) > 0)}
        {card('Reseñas por moderar', String(reviewsPending), 'esperando decisión', reviewsPending > 0)}
        {card('MRR real (COP/mes)', fmtCop(stats.mrr?.cop || 0), `verificado ${stats.planes?.verificado || 0} · vip ${stats.planes?.vip || 0}`)}
        {card('Publicadas', String(f.byStatus.published || 0), `${f.total} fichas en total`)}
        {card('Eventos 7d', String(stats.events7d ?? 0), 'telemetría real de fichas')}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={16} color={TOKENS.colors.emeraldDark} />
        <strong style={{ fontFamily: 'Outfit, sans-serif' }}>Registro de acciones del admin</strong>
        <span style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>(append-only; antes de toda edición delicada, revísalo)</span>
      </div>
      <div style={{ background: TOKENS.colors.surfaceElevated, border: `1px solid ${TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg, padding: '8px 0', maxHeight: 340, overflowY: 'auto' }}>
        {log.length === 0 ? (
          <div style={{ padding: '18px 20px', color: TOKENS.colors.textSecondary, fontSize: '0.88rem' }}>
            <Inbox size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
            Sin acciones registradas todavía. Cada aprobación, rechazo o cambio de plan quedará aquí con su motivo.
          </div>
        ) : log.map((e) => (
          <div key={e.id} style={{ padding: '9px 20px', borderBottom: `1px solid ${TOKENS.colors.borderLight}`, fontSize: '0.84rem', display: 'flex', gap: '10px', alignItems: 'baseline' }}>
            <span style={{ color: TOKENS.colors.textSecondary, whiteSpace: 'nowrap', fontSize: '0.74rem' }}>{new Date(e.timestamp).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            <span style={{ fontWeight: 800, color: String(e.metadata?.action || '').includes('reject') ? '#b91c1c' : TOKENS.colors.textMain }}>
              <ShieldAlert size={12} style={{ marginRight: 5, verticalAlign: -2 }} />
              {String(e.metadata?.action || 'accion')}
            </span>
            <span style={{ color: TOKENS.colors.textSecondary }}>
              {e.metadata?.target ? `→ ${String(e.metadata.target)}` : ''}
              {e.metadata?.reason ? ` · "${String(e.metadata.reason).slice(0, 80)}"` : ''}
              {e.metadata?.before ? ` (${String(e.metadata.before)} → ${String(e.metadata.after)})` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
