'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { VeyraDiagnosticReport } from '@/types/veyra';
import { StatusPill } from './AdminDashboard';
import {
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Building2,
  Search,
  MessageSquare,
  Mail,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { NM_DARK as NM } from './neumorphism-styles';
import { VeyraEnterpriseLead } from '@/lib/veyra_enterprise_leads';

type VeyraTab = 'leads' | 'diagnostics' | 'smtp';

export default function VeyraDiagnosticCenter() {
  const [activeSubTab, setActiveSubTab] = useState<VeyraTab>('leads');
  const [reports, setReports] = useState<VeyraDiagnosticReport[]>([]);
  const [enterpriseLeads, setEnterpriseLeads] = useState<VeyraEnterpriseLead[]>([]);
  const [selectedReport, setSelectedReport] = useState<VeyraDiagnosticReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generatingLeadId, setGeneratingLeadId] = useState<string | null>(null);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/veyra/diagnostics', { cache: 'no-store' });
      if (!res.ok) throw new Error(`VEYRA_${res.status}`);
      const data = await res.json();
      const safeReports = Array.isArray(data.reports) ? data.reports : [];
      const safeLeads = Array.isArray(data.enterpriseLeads) ? data.enterpriseLeads : [];
      setReports(safeReports);
      setEnterpriseLeads(safeLeads);
      if (safeReports.length > 0 && !selectedReport) {
        setSelectedReport(safeReports[0]);
      }
    } catch {
      setLoadError('No se pudo cargar el Centro de Operaciones VEYRA.');
    } finally {
      setLoading(false);
    }
  }, [selectedReport]);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  const handleApprove = async () => {
    if (!selectedReport) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/veyra/diagnostics/${selectedReport.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      if (res.ok) {
        setFeedback(`✔ Diagnóstico para ${selectedReport.companyName} APROBADO y portal activado.`);
        await fetchDiagnostics();
      }
    } catch {
      setFeedback('Error al aprobar diagnóstico.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMri = async (lead: VeyraEnterpriseLead) => {
    setGeneratingLeadId(lead.id);
    try {
      const res = await fetch('/api/veyra/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: lead.name.split(' ')[0] + ' (Gerencia)',
          companyName: lead.name,
          email: lead.email,
          phone: lead.phone,
          city: lead.city,
          sector: lead.category,
          goal: 'Duplicar captación y automatizar atención médica/legal 24/7',
          bottleneck: lead.bottleneck,
          systems: 'WhatsApp + Sitio Web + Correo',
          priority: 'Alta',
          budget: '$2,850 USD',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchDiagnostics();
        if (data.report) {
          setSelectedReport(data.report);
          setActiveSubTab('diagnostics');
          setFeedback(`✨ Reporte Business MRI™ generado con éxito para ${lead.name}`);
        }
      }
    } catch (err) {
      console.error('Error generando MRI:', err);
    } finally {
      setGeneratingLeadId(null);
    }
  };

  const filteredLeads = enterpriseLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = cityFilter === 'all' || lead.city.toLowerCase() === cityFilter.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const cities = ['all', 'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga'];

  const leadCount = enterpriseLeads.length;
  const pipelineUsd = enterpriseLeads.reduce((sum, lead) => sum + (lead.dealValue || 0), 0);
  const loadingInitial = loading && reports.length === 0 && enterpriseLeads.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {loadError && (
        <div style={{ ...NM.inset, padding: '14px 16px', color: '#FBBF24', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <AlertCircle size={16} />
          <span style={{ flex: 1, minWidth: '200px' }}>{loadError} Revisa que el backend de VEYRA esté disponible.</span>
          <button
            type="button"
            onClick={fetchDiagnostics}
            disabled={loading}
            style={{ ...NM.buttonConvex, padding: '8px 14px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F9FAFB' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reintentar
          </button>
        </div>
      )}

      {loadingInitial && !loadError ? (
        <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 28px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '14px' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '180px', height: '12px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '240px', height: '22px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '64px', borderRadius: '12px' }} />
            ))}
          </div>
        </section>
      ) : (
      <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 28px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...NM.inset, width: '48px', height: '48px', borderRadius: '14px', display: 'grid', placeItems: 'center', color: '#60A5FA', flexShrink: 0 }}>
              <BrainCircuit size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Puerta Enterprise B2B · $2,850 USD / Contrato
              </div>
              <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', color: '#F9FAFB', fontWeight: 900, margin: '2px 0 0' }}>
                Centro de Operaciones VEYRA
              </h2>
            </div>
          </div>
          <StatusPill tone="blue">{leadCount > 0 ? `${leadCount} PROSPECTOS CLASIFICADOS` : 'SIN PROSPECTOS'}</StatusPill>
        </div>

        {/* 4 Metric Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div style={{ ...NM.inset, padding: '12px 14px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Pipeline Total</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#34D399', marginTop: '2px' }}>${pipelineUsd.toLocaleString('en-US')} USD</strong>
          </div>
          <div style={{ ...NM.inset, padding: '12px 14px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Ticket Promedio</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#60A5FA', marginTop: '2px' }}>$2,850 USD</strong>
          </div>
          <div style={{ ...NM.inset, padding: '12px 14px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Empresas Veyra</span>
            <strong style={{ display: 'block', fontSize: '1.1rem', color: '#FBBF24', marginTop: '2px' }}>{leadCount > 0 ? `${leadCount} Clínicas & Bufetes` : '—'}</strong>
          </div>
          <div style={{ ...NM.inset, padding: '12px 14px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Buzón SMTP</span>
            <strong style={{ display: 'block', fontSize: '0.9rem', color: '#10B981', marginTop: '4px' }}>Hostinger TLS 465 ✔</strong>
          </div>
        </div>

        {/* Sub-Navigation Switcher */}
        <div style={{ marginTop: '20px', display: 'flex', ...NM.inset, padding: '4px', gap: '4px', borderRadius: '12px', overflowX: 'auto' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('leads')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 14px',
              ...(activeSubTab === 'leads' ? NM.buttonPressed : { background: 'transparent', color: '#94A3B8' }),
              borderRadius: '9px',
              border: 'none',
              color: activeSubTab === 'leads' ? '#10B981' : '#94A3B8',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Building2 size={15} /> {leadCount > 0 ? `${leadCount} Leads Enterprise` : 'Leads Enterprise'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('diagnostics')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 14px',
              ...(activeSubTab === 'diagnostics' ? NM.buttonPressed : { background: 'transparent', color: '#94A3B8' }),
              borderRadius: '9px',
              border: 'none',
              color: activeSubTab === 'diagnostics' ? '#10B981' : '#94A3B8',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <BrainCircuit size={15} /> Diagnósticos MRI™ ({reports.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('smtp')}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 14px',
              ...(activeSubTab === 'smtp' ? NM.buttonPressed : { background: 'transparent', color: '#94A3B8' }),
              borderRadius: '9px',
              border: 'none',
              color: activeSubTab === 'smtp' ? '#10B981' : '#94A3B8',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Mail size={15} /> Buzón SMTP
          </button>
        </div>
      </section>
      )}

      {/* SUB-TAB 1: LEADS ENTERPRISE PIPELINE */}
      {activeSubTab === 'leads' && (
        <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 26px)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>
                Directorio de {leadCount} Prospectos Enterprise Veyra
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Empresas consolidadas con 50+ reseñas en Google Maps, sitio web propio y alta capacidad de inversión ($2.850 USD).
              </span>
            </div>
            <span style={{ ...NM.inset, color: '#34D399', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.76rem', fontWeight: 800 }}>
              {filteredLeads.length} Empresas
            </span>
          </div>

          {/* Search & City Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', ...NM.input, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
              <Search size={16} color="#64748B" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por clínica, sector o ciudad..."
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#F9FAFB', fontSize: '0.86rem', width: '100%' }}
              />
            </div>

            {/* City Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setCityFilter(city)}
                  style={{
                    padding: '6px 12px',
                    ...(cityFilter === city ? NM.buttonPressed : NM.buttonConvex),
                    borderRadius: '8px',
                    border: 'none',
                    color: cityFilter === city ? '#10B981' : '#94A3B8',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {city === 'all' ? 'Todas' : city}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Grid - Mobile Responsive */}
          {filteredLeads.length === 0 ? (
            <div style={{ ...NM.inset, padding: '32px 20px', textAlign: 'center', color: '#94A3B8' }}>
              <Building2 size={26} color="#60A5FA" style={{ margin: '0 auto 10px' }} />
              <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.9rem', marginBottom: '4px' }}>
                No hay empresas que coincidan
              </strong>
              <p style={{ fontSize: '0.78rem', margin: 0, lineHeight: 1.45 }}>
                {leadCount === 0
                  ? 'El backend de VEYRA no devolvió prospectos.'
                  : 'Ajusta la búsqueda o el filtro de ciudad para encontrar más empresas.'}
              </p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
            {filteredLeads.map((lead) => {
              const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
              const whatsappPitch = encodeURIComponent(
                `Hola ${lead.name}, te escribimos de Veyra Soluciones Tecnológicas. Analizamos tu presencia digital y encontramos oportunidades para automatizar la atención médica y agendamiento 24/7. ¿Te gustaría recibir tu diagnóstico Business MRI™ sin costo?`
              );

              return (
                <div
                  key={lead.id}
                  style={{
                    ...NM.cardSmall,
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase' }}>
                          {lead.category}
                        </span>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#F9FAFB', margin: '2px 0 0', lineHeight: 1.3 }}>
                          {lead.name}
                        </h4>
                      </div>
                      <span style={{ ...NM.inset, padding: '3px 8px', fontSize: '0.72rem', color: '#FBBF24', fontWeight: 800, flexShrink: 0 }}>
                        ⭐ {lead.rating} ({lead.reviewsCount})
                      </span>
                    </div>

                    {/* Location & Ticket */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#94A3B8', marginBottom: '8px' }}>
                      <span>📍 {lead.city}, Colombia</span>
                      <strong style={{ color: '#34D399' }}>Ticket: ${lead.dealValue} USD</strong>
                    </div>

                    {/* Bottleneck / Diagnosis Cue */}
                    <div style={{ ...NM.inset, padding: '10px 12px', fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.4, marginBottom: '4px' }}>
                      <strong style={{ color: '#F87171', display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Fricción Detectada:
                      </strong>
                      {lead.bottleneck}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${whatsappPitch}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        ...NM.buttonEmerald,
                        flex: 1,
                        minWidth: '120px',
                        padding: '9px 12px',
                        fontSize: '0.78rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <MessageSquare size={14} /> WhatsApp Directo
                    </a>

                    <button
                      type="button"
                      onClick={() => handleGenerateMri(lead)}
                      disabled={generatingLeadId === lead.id}
                      style={{
                        ...NM.buttonConvex,
                        padding: '9px 12px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        color: '#60A5FA',
                      }}
                    >
                      <Sparkles size={14} /> {generatingLeadId === lead.id ? 'Generando...' : 'Generar MRI™'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </section>
      )}

      {/* SUB-TAB 2: DIAGNÓSTICOS BUSINESS MRI™ */}
      {activeSubTab === 'diagnostics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Left Column: Lista de Casos en Pipeline VEYRA */}
          <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 26px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ ...NM.inset, width: '40px', height: '40px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#60A5FA' }}>
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#F9FAFB', fontWeight: 900, margin: 0 }}>
                  Reportes Generados
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#8493A8' }}>
                  {reports.length} Casos con Diagnóstico Activo
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
              {reports.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', ...NM.inset, color: '#94A3B8' }}>
                  <Building2 size={26} color="#60A5FA" style={{ margin: '0 auto 10px' }} />
                  <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.88rem', marginBottom: '4px' }}>
                    Sin Reportes Generados Todavía
                  </strong>
                  <p style={{ fontSize: '0.76rem', color: '#8493A8', margin: '0 0 12px', lineHeight: 1.45 }}>
                    Selecciona cualquier empresa en la pestaña “31 Leads Enterprise” y pulsa “Generar MRI™” para crear un diagnóstico en vivo.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('leads')}
                    style={{ ...NM.buttonEmerald, padding: '8px 14px', fontSize: '0.78rem' }}
                  >
                    Ver 31 Empresas ➔
                  </button>
                </div>
              ) : (
                reports.map((item) => {
                  const isSelected = selectedReport?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedReport(item);
                        setFeedback(null);
                      }}
                      style={{
                        padding: '14px',
                        ...(isSelected ? NM.buttonPressed : NM.cardSmall),
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <strong style={{ color: isSelected ? '#10B981' : '#F9FAFB', fontSize: '0.88rem', fontWeight: 800 }}>
                          {item.clientName}
                        </strong>
                        <StatusPill tone={item.status === 'approved' ? 'green' : 'amber'}>
                          {item.status === 'approved' ? 'Aprobado' : 'Borrador'}
                        </StatusPill>
                      </div>
                      <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: '0 0 6px' }}>
                        {item.companyName}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748B' }}>
                        <span>Score: {item.opportunityScore}/100</span>
                        <span style={{ color: '#34D399', fontWeight: 700 }}>
                          $2,850 USD
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Column: Detalle y Acciones del Diagnóstico */}
          <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 26px)', display: 'flex', flexDirection: 'column' }}>
            {selectedReport ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase' }}>
                      Reporte Business MRI™
                    </span>
                    <h3 style={{ fontSize: '1.35rem', color: '#F9FAFB', fontWeight: 900, margin: '2px 0' }}>
                      {selectedReport.companyName}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: 0 }}>
                      Contacto: {selectedReport.clientName}
                    </p>
                  </div>
                  <StatusPill tone={selectedReport.status === 'approved' ? 'green' : 'amber'}>
                    {selectedReport.status === 'approved' ? 'PUBLICADO' : 'BORRADOR'}
                  </StatusPill>
                </div>

                {feedback && (
                  <div style={{ padding: '12px 14px', ...NM.inset, color: '#34D399', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} /> {feedback}
                  </div>
                )}

                {/* Situation Scores - Fluid Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ ...NM.inset, padding: '12px' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Presencia Digital</span>
                    <strong style={{ display: 'block', fontSize: '1.15rem', color: '#60A5FA', marginTop: '2px' }}>
                      {selectedReport.currentSituation.digitalPresence}%
                    </strong>
                  </div>
                  <div style={{ ...NM.inset, padding: '12px' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Conversión WA</span>
                    <strong style={{ display: 'block', fontSize: '1.15rem', color: '#FBBF24', marginTop: '2px' }}>
                      {selectedReport.currentSituation.conversion}%
                    </strong>
                  </div>
                  <div style={{ ...NM.inset, padding: '12px' }}>
                    <span style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Automatización</span>
                    <strong style={{ display: 'block', fontSize: '1.15rem', color: '#F87171', marginTop: '2px' }}>
                      {selectedReport.currentSituation.automation}%
                    </strong>
                  </div>
                </div>

                {/* Findings List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase' }}>
                    Hallazgos Clave de la Auditoría:
                  </span>
                  {selectedReport.findings.map((f, idx) => (
                    <div key={idx} style={{ ...NM.inset, padding: '10px 12px', fontSize: '0.78rem' }}>
                      <strong style={{ color: f.statusTone === 'red' ? '#F87171' : '#FBBF24', display: 'block', marginBottom: '2px' }}>
                        {f.area}: {f.finding}
                      </strong>
                      <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.74rem' }}>
                        Oportunidad: {f.impact}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Bar */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={loading || selectedReport.status === 'approved'}
                    style={{
                      ...NM.buttonEmerald,
                      padding: '12px 18px',
                      fontSize: '0.84rem',
                      cursor: selectedReport.status === 'approved' ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    {selectedReport.status === 'approved' ? 'Portal de Cliente Habilitado ✔' : loading ? 'Aprobando...' : 'Aprobar & Activar Portal'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 16px', textAlign: 'center', color: '#94A3B8' }}>
                <div style={{ width: '48px', height: '48px', ...NM.inset, borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#60A5FA', marginBottom: '14px' }}>
                  <TrendingUp size={22} />
                </div>
                <h4 style={{ fontSize: '1.1rem', color: '#F9FAFB', fontWeight: 800, margin: '0 0 6px' }}>
                  Pipeline VEYRA (${pipelineUsd.toLocaleString('en-US')} USD)
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', maxWidth: '380px', margin: '0 0 16px', lineHeight: 1.45 }}>
                  {leadCount > 0 ? `Las ${leadCount} empresas clasificadas para Veyra ya están listas para recibir propuesta y diagnóstico.` : 'Genera un diagnóstico desde la pestaña de leads para activar el pipeline.'}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* SUB-TAB 3: BUZÓN HOSTINGER SMTP */}
      {activeSubTab === 'smtp' && (
        <section style={{ ...NM.card, padding: 'clamp(18px, 3vw, 26px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ ...NM.inset, width: '38px', height: '38px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#10B981' }}>
                <Mail size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
                  Buzón Profesional Hostinger SMTP
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  edwin@veyrasoluciones.com · Servidor TLS Puerto 465
                </span>
              </div>
            </div>
            <StatusPill tone="blue">CONFIGURADO (DOCUMENTADO)</StatusPill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ ...NM.inset, padding: '14px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Host SMTP</span>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#F9FAFB', marginTop: '2px' }}>smtp.hostinger.com:465</strong>
            </div>
            <div style={{ ...NM.inset, padding: '14px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Host IMAP (Bandeja)</span>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#F9FAFB', marginTop: '2px' }}>imap.hostinger.com:993</strong>
            </div>
            <div style={{ ...NM.inset, padding: '14px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Envíos Realizados</span>
              <strong style={{ display: 'block', fontSize: '0.92rem', color: '#34D399', marginTop: '2px' }}>{leadCount > 0 ? `${leadCount} Prospectos en carpeta` : '—'}</strong>
            </div>
          </div>

          <div style={{ ...NM.inset, padding: '14px', borderRadius: '12px', fontSize: '0.78rem', color: '#94A3B8' }}>
            <strong style={{ color: '#10B981', display: 'block', marginBottom: '2px' }}>
              ✓ Seguridad y Entregabilidad Óptima
            </strong>
            El buzón de Veyra opera con aislamiento multi-tenant y autenticación DKIM/SPF activa para evitar bandejas de spam.
          </div>
        </section>
      )}

    </div>
  );
}
