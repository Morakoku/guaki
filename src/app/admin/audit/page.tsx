'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Check,
  Eye,
  FileCheck,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Store,
  Tag,
  X,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import GuakiHeader from '@/components/ui/GuakiHeader';
import SoftCard from '@/components/ui/SoftCard';
import Skeleton from '@/components/ui/Skeleton';

interface AuditBusinessRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  plan: 'gratis' | 'verificado' | 'vip';
  description: string;
  workflowStatus: string;
}

const PENDING_STATES = ['draft', 'in_audit'];

const STATE_LABELS: Record<string, string> = {
  draft: 'Borrador nuevo',
  in_audit: 'En auditoría',
};

export default function AdminAuditQueuePage() {
  const [queue, setQueue] = useState<AuditBusinessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const loadQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/audit', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('ADMIN_AUDIT_UNAVAILABLE');
      const payload = await response.json();
      if (!Array.isArray(payload.inventory)) throw new Error('ADMIN_INVENTORY_UNAVAILABLE');
      const pending = payload.inventory
        .filter((business: Record<string, unknown>) => PENDING_STATES.includes(String(business.status || 'draft')))
        .map(
          (business: Record<string, unknown>): AuditBusinessRecord => ({
            id: String(business.id),
            slug: String(business.slug || ''),
            name: String(business.name || ''),
            category: String(business.category || ''),
            city: String(business.city || ''),
            address: String(business.address || ''),
            whatsapp: String(business.whatsapp || ''),
            plan: ['gratis', 'verificado', 'vip'].includes(String(business.plan)) ? (business.plan as AuditBusinessRecord['plan']) : 'gratis',
            description: String(business.description || ''),
            workflowStatus: String(business.status || 'draft'),
          }),
        );
      setQueue(pending);
      setLoadError(false);
    } catch {
      setQueue([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  // Misma API de decisión que ya usa el dashboard: approved → published.
  const handleApprove = async (id: string) => {
    try {
      const decision = async (value: 'approved' | 'published') => {
        const response = await fetch('/api/admin/audit/' + encodeURIComponent(id) + '/decision', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: value, notes: 'Aprobación desde la cola de auditoría.' }),
        });
        if (!response.ok) throw new Error('AUDIT_DECISION_FAILED');
      };
      await decision('approved');
      await decision('published');
      await loadQueue();
      showToast('✓ Ficha aprobada y publicada en el directorio');
    } catch {
      showToast('No se pudo completar la aprobación. Inténtalo de nuevo.');
    }
  };

  // Mismo contrato de rechazo que el dashboard: motivo obligatorio (≥10 caracteres).
  const handleReject = async (id: string, name: string) => {
    const reason = window.prompt(
      `Rechazar la ficha de "${name}". El motivo es OBLIGATORIO: se le envía al comercio para que pueda corregir (mínimo 10 caracteres).`,
    );
    if (!reason || reason.trim().length < 10) {
      if (reason !== null) showToast('El motivo del rechazo debe tener al menos 10 caracteres.');
      return;
    }
    try {
      const response = await fetch('/api/admin/audit/' + encodeURIComponent(id) + '/decision', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'rejected', notes: reason.trim().slice(0, 500) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        showToast(String(data?.message || data?.error || 'No se pudo registrar el rechazo.'));
        return;
      }
      await loadQueue();
      showToast('Ficha rechazada: el comercio recibió el motivo por correo.');
    } catch {
      showToast('No se pudo registrar el rechazo.');
    }
  };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: TOKENS.radii.pill,
    fontSize: TOKENS.typography.button.fontSize,
    fontWeight: TOKENS.typography.button.fontWeight,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    backgroundColor: active ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
    color: active ? TOKENS.colors.textInverse : TOKENS.colors.textMain,
    border: `1px solid ${active ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
    boxShadow: active ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
    cursor: 'pointer',
  });

  const statusChip = (workflowStatus: string) => {
    const isDraft = workflowStatus === 'draft';
    const dotColor = isDraft ? TOKENS.colors.textMuted : TOKENS.colors.warning;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          borderRadius: TOKENS.radii.pill,
          backgroundColor: isDraft ? TOKENS.colors.surfaceInset : 'rgba(180, 83, 9, 0.08)',
          border: `1px solid ${isDraft ? TOKENS.colors.borderSubtle : 'rgba(180, 83, 9, 0.28)'}`,
          fontSize: TOKENS.typography.caption.fontSize,
          fontWeight: TOKENS.typography.caption.fontWeight,
          color: TOKENS.colors.textMain,
          whiteSpace: 'nowrap',
        }}
      >
        <span aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
        {STATE_LABELS[workflowStatus] || workflowStatus}
      </span>
    );
  };

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: TOKENS.colors.bgMain }}>
      <GuakiHeader />

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '28px 20px 96px' }}>
        {/* Toast */}
        {toastMessage && (
          <div
            role="status"
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              right: '20px',
              maxWidth: '420px',
              margin: '0 auto',
              zIndex: 9999,
              padding: '14px 20px',
              borderRadius: TOKENS.radii.md,
              backgroundColor: TOKENS.colors.emeraldDark,
              color: TOKENS.colors.textInverse,
              fontWeight: TOKENS.typography.small.fontWeight,
              fontSize: TOKENS.typography.small.fontSize,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: TOKENS.shadows.glassHover,
            }}
          >
            <CheckCircle2 size={18} color={TOKENS.colors.greenSoft} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cabecera del panel */}
        <section
          className="glass-surface-elevated"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 24px',
            borderRadius: TOKENS.radii.xl,
            boxShadow: TOKENS.shadows.glass,
            marginBottom: '18px',
          }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: TOKENS.radii.pill,
                backgroundColor: 'rgba(21, 128, 61, 0.10)',
                color: TOKENS.colors.textMain,
                fontSize: TOKENS.typography.caption.fontSize,
                fontWeight: TOKENS.typography.caption.fontWeight,
                letterSpacing: TOKENS.typography.caption.letterSpacing,
                marginBottom: '10px',
              }}
            >
              <ShieldCheck size={13} color={TOKENS.colors.success} />
              SESIÓN ADMINISTRATIVA
            </span>
            <h1 style={{ ...TOKENS.typography.h1, color: TOKENS.colors.textMain, margin: 0 }}>
              Cola de Auditoría
            </h1>
            <p style={{ ...TOKENS.typography.body, color: TOKENS.colors.textSecondary, margin: '4px 0 0' }}>
              Fichas registradas por proveedores desde /unete esperando tu decisión para publicarse.
            </p>
          </div>
        </section>

        {/* Navegación Dashboard ↔ Auditoría */}
        <nav
          aria-label="Navegación del panel"
          style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '26px' }}
        >
          <Link href="/admin/dashboard" style={navLinkStyle(false)}>
            <LayoutDashboard size={16} />
            <span>Panel general</span>
          </Link>
          <Link href="/admin/audit" style={navLinkStyle(true)}>
            <FileCheck size={16} />
            <span>Cola de auditoría</span>
            {queue.length > 0 && (
              <span
                aria-label={`${queue.length} fichas pendientes`}
                style={{
                  padding: '2px 9px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: TOKENS.colors.warning,
                  color: TOKENS.colors.white,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                {queue.length}
              </span>
            )}
          </Link>
        </nav>

        {/* Cuerpo de la cola */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={118} borderRadius={TOKENS.radii.xl} />
            ))}
          </div>
        ) : loadError ? (
          <SoftCard style={{ textAlign: 'center', padding: '40px 24px' }}>
            <Inbox size={30} color={TOKENS.colors.textSecondary} style={{ marginBottom: '12px' }} />
            <h2 style={{ ...TOKENS.typography.h2, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
              No se pudo cargar la cola
            </h2>
            <p style={{ ...TOKENS.typography.body, color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '420px' }}>
              Verifica que tu sesión administrativa sigue activa y vuelve a intentarlo desde el panel.
            </p>
          </SoftCard>
        ) : queue.length === 0 ? (
          <SoftCard
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'center',
              padding: '56px 24px',
              maxWidth: '560px',
              margin: '0 auto',
            }}
          >
            <span
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(21, 128, 61, 0.10)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <CheckCircle2 size={30} color={TOKENS.colors.success} />
            </span>
            <h2 style={{ ...TOKENS.typography.h2, color: TOKENS.colors.textMain, margin: 0 }}>
              Todo al día: sin fichas pendientes
            </h2>
            <p style={{ ...TOKENS.typography.body, color: TOKENS.colors.textSecondary, margin: 0, maxWidth: '400px' }}>
              Cuando un proveedor registre su negocio desde /unete, la ficha aparecerá aquí para que la apruebes o rechaces.
            </p>
            <Link
              href="/admin/dashboard"
              className="soft-btn"
              style={{
                padding: '10px 20px',
                fontSize: TOKENS.typography.button.fontSize,
                borderRadius: TOKENS.radii.pill,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <LayoutDashboard size={15} />
              <span>Volver al panel general</span>
            </Link>
          </SoftCard>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ ...TOKENS.typography.caption, color: TOKENS.colors.textSecondary, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {queue.length} {queue.length === 1 ? 'ficha esperando' : 'fichas esperando'} decisión
            </p>

            {queue.map((business) => (
              <SoftCard
                key={business.id}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', padding: '20px 22px' }}
              >
                {/* Identidad */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 260px', minWidth: 0 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: TOKENS.radii.md,
                      backgroundColor: TOKENS.colors.emeraldDark,
                      color: TOKENS.colors.textInverse,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: TOKENS.shadows.btnPrimary,
                    }}
                  >
                    {business.name ? business.name.charAt(0).toUpperCase() : <Store size={20} />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <h2 style={{ ...TOKENS.typography.h3, color: TOKENS.colors.textMain, margin: 0 }}>{business.name || 'Ficha sin nombre'}</h2>
                      {statusChip(business.workflowStatus)}
                    </div>
                    <div style={{ ...TOKENS.typography.small, color: TOKENS.colors.textSecondary, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: '4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Tag size={12} aria-hidden="true" />
                        {business.category || 'Sin categoría'}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={12} aria-hidden="true" />
                        {business.city || 'Sin ciudad'}
                      </span>
                      {business.whatsapp && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <MessageCircle size={12} aria-hidden="true" />
                          {business.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: '0 1 auto' }}>
                  {business.slug && (
                    <a
                      href={'/proveedores/' + encodeURIComponent(business.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="soft-btn"
                      style={{
                        padding: '9px 16px',
                        fontSize: '0.82rem',
                        borderRadius: TOKENS.radii.pill,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Eye size={15} />
                      <span>Ver</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleReject(business.id, business.name)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: TOKENS.radii.pill,
                      border: `1px solid rgba(185, 28, 28, 0.35)`,
                      backgroundColor: TOKENS.colors.white,
                      color: TOKENS.colors.danger,
                      fontWeight: TOKENS.typography.button.fontWeight,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <X size={15} />
                    <span>Rechazar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(business.id)}
                    className="neu-btn-primary"
                    style={{
                      padding: '9px 18px',
                      fontSize: '0.82rem',
                      borderRadius: TOKENS.radii.pill,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={15} />
                    <span>Aprobar y publicar</span>
                  </button>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
