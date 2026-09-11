'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuditQueue, BusinessAuditItem } from '@/types/audit';
import { StatusPill } from './AdminDashboard';
import { CheckCircle2, AlertCircle, Search, ShieldCheck, RefreshCw } from 'lucide-react';
import { NM_DARK as NM } from './neumorphism-styles';

export default function AuditCenter() {
  const [queue, setQueue] = useState<AuditQueue>({
    pending: [],
    inReview: [],
    approved: [],
    rejected: [],
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'in_review' | 'approved' | 'rejected'>('pending');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAuditItem | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/admin/audit', { cache: 'no-store' });
      if (!res.ok) throw new Error(`AUDIT_${res.status}`);
      const data = await res.json();
      const rawQueue = data?.queue || data || {};
      const safeQueue: AuditQueue = {
        pending: Array.isArray(rawQueue.pending) ? rawQueue.pending : [],
        inReview: Array.isArray(rawQueue.inReview) ? rawQueue.inReview : [],
        approved: Array.isArray(rawQueue.approved) ? rawQueue.approved : [],
        rejected: Array.isArray(rawQueue.rejected) ? rawQueue.rejected : [],
      };
      setQueue(safeQueue);
      setHasLoaded(true);
      if (activeTab === 'pending' && safeQueue.pending.length > 0 && !selectedBusiness) {
        setSelectedBusiness(safeQueue.pending[0]);
      }
    } catch {
      setLoadError('No se pudo cargar la cola de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedBusiness]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const getActiveList = (): BusinessAuditItem[] => {
    switch (activeTab) {
      case 'pending': return queue.pending || [];
      case 'in_review': return queue.inReview || [];
      case 'approved': return queue.approved || [];
      case 'rejected': return queue.rejected || [];
      default: return [];
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedBusiness) return;
    setLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/audit/${selectedBusiness.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (res.ok) {
        setActionMessage(status === 'approved' ? '¡Negocio verificado y publicado!' : 'Solicitud rechazada.');
        setNotes('');
        await fetchQueue();
      }
    } catch (e) {
      console.error(e);
      setActionMessage('Error de conexión al procesar decisión.');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = queue.pending?.length || 0;
  const inReviewCount = queue.inReview?.length || 0;
  const approvedCount = queue.approved?.length || 0;
  const rejectedCount = queue.rejected?.length || 0;

  const currentList = getActiveList();
  const filteredList = currentList.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      {/* Left Column: Cola de Solicitudes */}
      <section style={{ ...NM.card, padding: '26px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#10B981" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>
              Cola de Auditoría
            </h2>
          </div>
          <button
            type="button"
            onClick={fetchQueue}
            style={{
              ...NM.buttonConvex,
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refrescar
          </button>
        </div>

        {/* Status Subtabs */}
        <div style={{ ...NM.inset, display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'pending', label: `Pendientes (${pendingCount})`, count: pendingCount },
            { id: 'in_review', label: `En revisión (${inReviewCount})`, count: inReviewCount },
            { id: 'approved', label: `Aprobadas (${approvedCount})`, count: approvedCount },
            { id: 'rejected', label: `Rechazadas (${rejectedCount})`, count: rejectedCount },
          ].map((tab) => {
            const isSel = activeTab === tab.id;
            const queueKey = tab.id === 'in_review' ? 'inReview' : (tab.id as keyof AuditQueue);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedBusiness(queue[queueKey]?.[0] || null);
                }}
                style={{
                  ...(isSel ? NM.buttonPressed : { background: 'transparent', border: 'none', borderRadius: '10px' }),
                  flex: '1 1 120px',
                  padding: '8px 4px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: isSel ? '#10B981' : '#8493A8',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Buscar proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...NM.input, width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* Requests List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
          {loadError ? (
            <div style={{ ...NM.inset, textAlign: 'center', padding: '28px 16px', color: '#FBBF24', fontSize: '0.82rem' }}>
              <AlertCircle size={22} style={{ margin: '0 auto 10px' }} />
              <strong style={{ display: 'block', color: '#F9FAFB', marginBottom: '4px' }}>No se pudo cargar la cola</strong>
              <p style={{ margin: '0 0 14px', fontSize: '0.78rem' }}>{loadError}</p>
              <button
                type="button"
                onClick={fetchQueue}
                disabled={loading}
                style={{ ...NM.buttonEmerald, padding: '8px 16px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Reintentar
              </button>
            </div>
          ) : loading && !hasLoaded ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ ...NM.cardSmall, padding: '16px' }}>
                <div className="skeleton" style={{ width: '55%', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '80%', height: '12px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '35%', height: '12px' }} />
              </div>
            ))
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B', fontSize: '0.84rem' }}>
              Sin solicitudes en esta sección.
            </div>
          ) : (
            filteredList.map((item) => {
              const isSelected = selectedBusiness?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedBusiness(item)}
                  style={{
                    padding: '16px',
                    ...(isSelected ? NM.buttonPressed : NM.cardSmall),
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <strong style={{ color: isSelected ? '#10B981' : '#F9FAFB', fontSize: '0.9rem', fontWeight: 800 }}>
                      {item.name}
                    </strong>
                    <StatusPill tone={item.status === 'published' ? 'green' : item.status === 'in_audit' ? 'amber' : 'slate'}>
                      {item.status === 'published' ? 'Publicado' : item.status === 'in_audit' ? 'En Auditoría' : item.status}
                    </StatusPill>
                  </div>
                  <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '0 0 4px' }}>
                    {item.category} · {item.city}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: '#60A5FA', fontFamily: 'monospace' }}>
                    ID: {item.id}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Column: Detalle y Resolución */}
      <section style={{ ...NM.card, padding: '26px', display: 'flex', flexDirection: 'column' }}>
        {selectedBusiness ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #1E293B', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase' }}>
                  Ficha Técnica de Proveedor
                </span>
                <h2 style={{ fontSize: '1.5rem', color: '#F9FAFB', fontWeight: 900, margin: '4px 0 2px' }}>
                  {selectedBusiness.name}
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
                  {selectedBusiness.category} en {selectedBusiness.city}
                </p>
              </div>
              <StatusPill tone="green">PROVEEDOR REAL</StatusPill>
            </div>

            {actionMessage && (
              <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34D399', fontSize: '0.84rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> {actionMessage}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '18px' }}>
              <div style={{ ...NM.inset, padding: '16px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>WhatsApp / Teléfono</span>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: '#F9FAFB', marginTop: '4px' }}>
                  {selectedBusiness.phone || selectedBusiness.whatsapp || '—'}
                </strong>
              </div>
              <div style={{ ...NM.inset, padding: '16px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Dirección Física</span>
                <strong style={{ display: 'block', fontSize: '0.94rem', color: '#F9FAFB', marginTop: '4px' }}>
                  {selectedBusiness.address || '—'}
                </strong>
              </div>
            </div>

            {/* Notes Textarea */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                Notas de Validación / Auditoría
              </label>
              <textarea
                placeholder="Observaciones de la verificación telefónica o legal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ ...NM.input, width: '100%', minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                disabled={loading}
                style={{ ...NM.buttonConvex, padding: '10px 16px', color: '#F87171', fontSize: '0.82rem', fontWeight: 800 }}
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => handleDecision('approved')}
                disabled={loading}
                style={{
                  ...NM.buttonConvex,
                  padding: '10px 20px',
                  backgroundColor: '#10B981',
                  color: '#0A0D14',
                  fontSize: '0.84rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
                }}
              >
                <CheckCircle2 size={16} /> Aprobar & Publicar
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#64748B' }}>
            Selecciona una solicitud para auditarla.
          </div>
        )}
      </section>
    </div>
  );
}
