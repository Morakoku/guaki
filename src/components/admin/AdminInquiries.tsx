'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox, MessageCircle, Search } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'Nuevo', color: '#1d4ed8', bg: '#dbeafe' },
  contacted: { label: 'Contactado', color: '#b45309', bg: '#fef3c7' },
  quoted: { label: 'Cotizado', color: '#6d28d9', bg: '#ede9fe' },
  scheduled: { label: 'Agendado', color: '#15803d', bg: '#dcfce7' },
  closed: { label: 'Cerrado', color: '#475569', bg: '#e2e8f0' },
};
const STATUS_ORDER = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;

interface AdminInquiry {
  id: string;
  businessName: string;
  businessCity: string;
  businessWhatsapp: string;
  clientName: string;
  clientContact: string;
  email: string | null;
  message: string;
  serviceRequested: string | null;
  scheduledDate: string | null;
  status: string;
  createdAt: string;
}

type Summary = Record<string, number>;

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [status, setStatus] = useState<'all' | (typeof STATUS_ORDER)[number]>('all');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const seqRef = useRef(0);

  const load = useCallback(async (nextStatus: string, nextQ: string, nextPage: number) => {
    const seq = ++seqRef.current;
    try {
      const params = new URLSearchParams();
      if (nextStatus !== 'all') params.set('status', nextStatus);
      if (nextQ.trim()) params.set('q', nextQ.trim());
      if (nextPage > 1) params.set('page', String(nextPage));
      const d = await fetch(`/api/admin/inquiries?${params.toString()}`, { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      if (seq !== seqRef.current) return;
      if (d?.ok) {
        setInquiries(d.inquiries || []);
        setSummary(d.summary || {});
        setHasMore(Boolean(d.hasMore));
      }
    } catch {
      if (seq === seqRef.current) setMsg('No se pudieron cargar los contactos. Revisa tu conexión.');
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Cambio de filtro o búsqueda vuelve a la primera página.
  useEffect(() => { setPage(1); }, [status, debouncedQ]);

  useEffect(() => { load(status, debouncedQ, page); }, [load, status, debouncedQ, page]);

  const changeStatus = async (inquiry: AdminInquiry, nextStatus: string) => {
    setBusy(inquiry.id);
    try {
      const r = await fetch(`/api/admin/inquiries/${encodeURIComponent(inquiry.id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const d = await r.json();
      if (!r.ok || d.error) setMsg(d.message || d.error || 'No se pudo actualizar el estado.');
      else setMsg(`Contacto de ${inquiry.clientName} → ${STATUS_META[nextStatus]?.label || nextStatus}.`);
      await load(status, debouncedQ, page);
    } catch {
      setMsg('Error de red.');
    } finally {
      setBusy('');
    }
  };

  const pill = (key: string) => {
    const meta = STATUS_META[key] || { label: key, color: TOKENS.colors.textSecondary, bg: TOKENS.colors.surfaceElevated };
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: TOKENS.radii.pill, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>
        {meta.label}
      </span>
    );
  };

  const waLink = (contact: string) => {
    const digits = String(contact || '').replace(/[^0-9]/g, '');
    return digits.length >= 7 ? `https://wa.me/${digits}` : null;
  };

  const tabs = useMemo(
    () => [
      { id: 'all' as const, label: 'Todos', count: summary.total || 0 },
      ...STATUS_ORDER.map((s) => ({ id: s, label: STATUS_META[s].label, count: summary[s] || 0 })),
    ],
    [summary],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Inbox size={18} color={TOKENS.colors.emeraldDark} />
        <strong style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem' }}>
          Bandeja de contactos {summary.new ? `· ${summary.new} sin atender` : ''}
        </strong>
        <a
          href={`/api/admin/inquiries/export${status !== 'all' ? `?status=${status}` : ''}`}
          download
          aria-label="Exportar contactos a CSV"
          style={{ padding: '6px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated, color: TOKENS.colors.textMain, fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          ⬇ Exportar CSV
        </a>
        <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Search size={14} color={TOKENS.colors.textSecondary} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar nombre, contacto o mensaje" aria-label="Buscar contactos"
            style={{ padding: '8px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.white, fontSize: '0.85rem', minWidth: 240 }} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setStatus(t.id)}
            style={{ padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
              border: `1px solid ${status === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
              background: status === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
              color: status === t.id ? TOKENS.colors.white : TOKENS.colors.textMain }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {msg ? <div style={{ fontSize: '0.84rem', color: TOKENS.colors.emeraldDark, fontWeight: 700 }}>{msg}</div> : null}

      <div style={{ overflowX: 'auto', border: `1px solid ${TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: TOKENS.colors.surfaceElevated, textAlign: 'left' }}>
              {['Negocio', 'Cliente', 'Mensaje', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontWeight: 800, color: TOKENS.colors.textSecondary, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inquiries.map((it) => {
              const wa = waLink(it.clientContact);
              return (
                <tr key={it.id} style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}` }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700 }}>{it.businessName || '—'}</div>
                    <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>{it.businessCity}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700 }}>{it.clientName}</div>
                    <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>
                      {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" style={{ color: TOKENS.colors.emeraldDark, fontWeight: 700, textDecoration: 'none' }}>💬 {it.clientContact}</a> : it.clientContact}
                      {it.email ? ` · ${it.email}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 320 }}>
                    {it.serviceRequested ? <div style={{ fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.emeraldDark }}>{it.serviceRequested}</div> : null}
                    <div style={{ color: TOKENS.colors.textSecondary, lineHeight: 1.45 }}>{it.message.length > 160 ? `${it.message.slice(0, 160)}…` : it.message}</div>
                  </td>
                  <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary, whiteSpace: 'nowrap' }}>
                    {it.createdAt ? new Date(it.createdAt).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>{pill(it.status)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <select value={it.status} disabled={busy === it.id} onChange={(e) => changeStatus(it, e.target.value)} aria-label={`Estado del contacto de ${it.clientName}`}
                      style={{ padding: '6px 10px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, fontSize: '0.78rem', fontWeight: 700, background: TOKENS.colors.white, cursor: 'pointer' }}>
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {inquiries.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '18px 14px', color: TOKENS.colors.textSecondary }}>Sin contactos que coincidan.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800,
            cursor: page <= 1 ? 'not-allowed' : 'pointer', border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated,
            color: page <= 1 ? TOKENS.colors.textMuted : TOKENS.colors.textMain }}>
          <ChevronLeft size={14} /> Anterior
        </button>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>Página {page}</span>
        <button type="button" aria-label="Página siguiente" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800,
            cursor: !hasMore ? 'not-allowed' : 'pointer', border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated,
            color: !hasMore ? TOKENS.colors.textMuted : TOKENS.colors.textMain }}>
          Siguiente <ChevronRight size={14} />
        </button>
      </div>

      <div style={{ fontSize: '0.76rem', color: TOKENS.colors.textMuted, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <MessageCircle size={12} /> Los contactos llegan directo a WhatsApp del negocio; aquí solo se registra el seguimiento.
      </div>
    </div>
  );
}
