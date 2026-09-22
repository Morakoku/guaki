'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Search, Star, X } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: 'Pendiente', color: '#b45309', bg: '#fef3c7' },
  approved: { label: 'Aprobada', color: '#15803d', bg: '#dcfce7' },
  rejected: { label: 'Rechazada', color: '#b91c1c', bg: '#fee2e2' },
};
const STATE_ORDER = ['submitted', 'approved', 'rejected'] as const;

interface AdminReview {
  id: string;
  businessName: string;
  businessCity: string;
  authorName: string;
  rating: number;
  comment: string;
  verifiedTransaction: boolean;
  reply: string | null;
  status: string;
  createdAt: string;
}

type Summary = Record<string, number>;

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [summary, setSummary] = useState<Summary>({});
  const [state, setState] = useState<(typeof STATE_ORDER)[number]>('submitted');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [acting, setActing] = useState<{ review: AdminReview; kind: 'approve' | 'reject' } | null>(null);
  const [draft, setDraft] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const seqRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const openTriggerRef = useRef<HTMLButtonElement | null>(null);

  const load = useCallback(async (nextState: string, nextQ: string, nextPage: number) => {
    const seq = ++seqRef.current;
    try {
      const params = new URLSearchParams({ status: nextState });
      if (nextQ.trim()) params.set('q', nextQ.trim());
      if (nextPage > 1) params.set('page', String(nextPage));
      const d = await fetch(`/api/admin/reviews?${params.toString()}`, { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      if (seq !== seqRef.current) return;
      if (d?.ok) {
        setReviews(d.reviews || []);
        setSummary(d.summary || {});
        setHasMore(Boolean(d.hasMore));
      }
    } catch {
      if (seq === seqRef.current) setMsg('No se pudieron cargar las reseñas. Revisa tu conexión.');
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // Cambio de filtro o búsqueda vuelve a la primera página.
  useEffect(() => { setPage(1); }, [state, debouncedQ]);

  useEffect(() => { load(state, debouncedQ, page); }, [load, state, debouncedQ, page]);

  const closeModal = useCallback(() => {
    setActing(null);
    setDraft('');
    openTriggerRef.current?.focus();
  }, []);

  // Foco inicial en el primer campo (textarea) al abrir el diálogo.
  useEffect(() => {
    if (acting) draftRef.current?.focus();
  }, [acting]);

  const handleDialogKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const node = dialogRef.current;
    if (!node) return;
    const focusables = Array.from(
      node.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (focusables.length === 0) {
      e.preventDefault();
      node.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [closeModal]);

  const submit = async () => {
    if (!acting) return;
    const { review, kind } = acting;
    if (kind === 'reject' && draft.trim().length < 10) {
      setMsg('El motivo del rechazo debe tener al menos 10 caracteres.');
      return;
    }
    setBusy(review.id);
    try {
      const r = await fetch(`/api/admin/reviews/${encodeURIComponent(review.id)}/decision`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'approve' ? { decision: 'approved', reply: draft.trim() || undefined } : { decision: 'rejected', reason: draft.trim() }),
      });
      const d = await r.json();
      if (!r.ok || d.error) setMsg(d.message || d.error || 'No se pudo registrar la decisión.');
      else {
        setMsg(kind === 'approve' ? `Reseña de ${review.authorName} aprobada y publicada.` : `Reseña de ${review.authorName} rechazada.`);
        closeModal();
      }
      await load(state, debouncedQ, page);
    } catch {
      setMsg('Error de red.');
    } finally {
      setBusy('');
    }
  };

  const pill = (key: string) => {
    const meta = STATE_META[key] || { label: key, color: TOKENS.colors.textSecondary, bg: TOKENS.colors.surfaceElevated };
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: TOKENS.radii.pill, background: meta.bg, color: meta.color, whiteSpace: 'nowrap' }}>
        {meta.label}
      </span>
    );
  };

  const stars = (rating: number) => {
    const full = Math.round(rating);
    return <span style={{ color: '#f59e0b', fontWeight: 800, letterSpacing: 1 }}>{'★'.repeat(full)}{'☆'.repeat(Math.max(0, 5 - full))} <span style={{ color: TOKENS.colors.textSecondary, fontWeight: 700 }}>{rating}</span></span>;
  };

  const tabs = useMemo(() => STATE_ORDER.map((s) => ({ id: s, label: STATE_META[s].label, count: summary[s] || 0 })), [summary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Star size={18} color={TOKENS.colors.emeraldDark} />
        <strong style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem' }}>
          Moderación de reseñas {summary.submitted ? `· ${summary.submitted} por revisar` : ''}
        </strong>
        <a
          href={`/api/admin/reviews/export?status=${state}`}
          download
          aria-label="Exportar reseñas a CSV"
          style={{ padding: '6px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated, color: TOKENS.colors.textMain, fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: TOKENS.shadows.btnConvex }}
        >
          ⬇ Exportar CSV
        </a>
        <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <Search size={14} color={TOKENS.colors.textSecondary} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar autor o comentario" aria-label="Buscar reseñas"
            style={{ padding: '8px 12px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.white, fontSize: '0.85rem', minWidth: 240 }} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setState(t.id)}
            style={{ padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
              border: `1px solid ${state === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
              background: state === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
              color: state === t.id ? TOKENS.colors.white : TOKENS.colors.textMain }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {msg ? <div style={{ fontSize: '0.84rem', color: TOKENS.colors.emeraldDark, fontWeight: 700 }}>{msg}</div> : null}

      <div style={{ overflowX: 'auto', border: `1px solid ${TOKENS.colors.borderLight}`, borderRadius: TOKENS.radii.lg }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: TOKENS.colors.surfaceElevated, textAlign: 'left' }}>
              {['Negocio', 'Autor', 'Calificación', 'Comentario', 'Fecha', 'Estado', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontWeight: 800, color: TOKENS.colors.textSecondary, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reviews.map((rv) => (
              <tr key={rv.id} style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}` }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700 }}>{rv.businessName || '—'}</div>
                  <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>{rv.businessCity}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700 }}>{rv.authorName}</div>
                  {rv.verifiedTransaction ? <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 800 }}>✓ verificada</div> : null}
                </td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{stars(rv.rating)}</td>
                <td style={{ padding: '10px 14px', maxWidth: 340 }}>
                  <div style={{ color: TOKENS.colors.textSecondary, lineHeight: 1.45 }}>{rv.comment}</div>
                  {rv.reply ? <div style={{ marginTop: 6, fontSize: '0.76rem', color: TOKENS.colors.emeraldDark }}><strong>Respuesta:</strong> {rv.reply}</div> : null}
                </td>
                <td style={{ padding: '10px 14px', color: TOKENS.colors.textSecondary, whiteSpace: 'nowrap' }}>
                  {rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('es-CO') : '—'}
                </td>
                <td style={{ padding: '10px 14px' }}>{pill(rv.status)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {rv.status === 'submitted' ? (
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button type="button" disabled={busy === rv.id} onClick={(e) => { openTriggerRef.current = e.currentTarget; setActing({ review: rv, kind: 'approve' }); setDraft(''); setMsg(''); }}
                        style={{ border: `1px solid ${TOKENS.colors.emeraldDark}`, background: 'transparent', color: TOKENS.colors.emeraldDark, borderRadius: TOKENS.radii.pill, padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}>
                        <Check size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Aprobar
                      </button>
                      <button type="button" disabled={busy === rv.id} onClick={(e) => { openTriggerRef.current = e.currentTarget; setActing({ review: rv, kind: 'reject' }); setDraft(''); setMsg(''); }}
                        style={{ border: '1px solid #b91c1c', background: 'transparent', color: '#b91c1c', borderRadius: TOKENS.radii.pill, padding: '6px 12px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}>
                        <X size={12} style={{ marginRight: 4, verticalAlign: -2 }} />Rechazar
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: TOKENS.colors.textMuted }}>—</span>
                  )}
                </td>
              </tr>
            ))}
            {reviews.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '18px 14px', color: TOKENS.colors.textSecondary }}>No hay reseñas en este estado.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button type="button" aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800,
            cursor: page <= 1 ? 'not-allowed' : 'pointer', border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated,
            color: page <= 1 ? TOKENS.colors.textMuted : TOKENS.colors.textMain, boxShadow: TOKENS.shadows.btnConvex }}>
          <ChevronLeft size={14} /> Anterior
        </button>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>Página {page}</span>
        <button type="button" aria-label="Página siguiente" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.8rem', fontWeight: 800,
            cursor: !hasMore ? 'not-allowed' : 'pointer', border: `1px solid ${TOKENS.colors.borderLight}`, background: TOKENS.colors.surfaceElevated,
            color: !hasMore ? TOKENS.colors.textMuted : TOKENS.colors.textMain, boxShadow: TOKENS.shadows.btnConvex }}>
          Siguiente <ChevronRight size={14} />
        </button>
      </div>

      {acting ? (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={acting.kind === 'approve' ? 'Aprobar reseña' : 'Rechazar reseña'} onKeyDown={handleDialogKeyDown}
          style={{ position: 'fixed', inset: 0, background: 'rgba(16,36,28,0.55)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }}>
          <div style={{ background: TOKENS.colors.white, borderRadius: TOKENS.radii.xl, padding: '26px 28px', maxWidth: 470, width: '100%', boxShadow: TOKENS.shadows.card }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', marginBottom: '8px' }}>
              {acting.kind === 'approve' ? 'Aprobar y publicar reseña' : 'Rechazar reseña'} — {acting.review.authorName}
            </h3>
            <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, marginBottom: '14px', lineHeight: 1.5 }}>
              {acting.review.comment}
            </p>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
              {acting.kind === 'approve' ? 'Respuesta pública (opcional)' : 'Motivo del rechazo (obligatorio, mín. 10 caracteres)'}
            </label>
            <textarea ref={draftRef} rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Borrador de decisión"
              style={{ width: '100%', padding: '10px 12px', borderRadius: TOKENS.radii.md, border: `1px solid ${TOKENS.colors.borderLight}`, fontSize: '0.9rem', marginBottom: '16px', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={closeModal}
                style={{ padding: '9px 16px', borderRadius: TOKENS.radii.pill, border: `1px solid ${TOKENS.colors.borderLight}`, background: 'transparent', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="button" disabled={busy === acting.review.id || (acting.kind === 'reject' && draft.trim().length < 10)} onClick={submit}
                style={{ padding: '9px 16px', borderRadius: TOKENS.radii.pill, border: 'none',
                  background: acting.kind === 'approve' ? TOKENS.colors.emeraldDark : (draft.trim().length >= 10 ? '#b91c1c' : TOKENS.colors.borderLight),
                  color: acting.kind === 'approve' ? '#fff' : (draft.trim().length >= 10 ? '#fff' : TOKENS.colors.textSecondary),
                  fontWeight: 800, fontSize: '0.82rem', cursor: acting.kind === 'approve' || draft.trim().length >= 10 ? 'pointer' : 'not-allowed' }}>
                {acting.kind === 'approve' ? 'Aprobar y publicar' : 'Rechazar reseña'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}