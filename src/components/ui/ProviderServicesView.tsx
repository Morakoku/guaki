'use client';

import React, { useState } from 'react';
import { MessageCircle, ChevronDown, ChevronUp, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';

export interface FormattedServiceItem {
  name: string;
  price: string;
  description: string;
  tag?: string;
  duration?: string;
  includes?: string[];
}

interface ProviderServicesViewProps {
  services: FormattedServiceItem[];
  providerName: string;
  cleanWhatsapp: string;
  category: string;
}

export default function ProviderServicesView({
  services,
  providerName,
  cleanWhatsapp,
  category,
}: ProviderServicesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Mostrar únicamente datos aportados por el negocio; no completar con claims sintéticos.
  const enrichedServices: FormattedServiceItem[] = services.map((srv) => ({ ...srv }));

  // Extraer tags únicos para los filtros
  const filterTabs = ['Todos', ...Array.from(new Set(enrichedServices.map((s) => s.tag).filter(Boolean)))];

  const filteredServices =
    activeFilter === 'Todos'
      ? enrichedServices
      : enrichedServices.filter((s) => s.tag === activeFilter);

  const toggleExpand = (idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section style={{ marginBottom: '36px' }}>
      {/* Cabecera Centrada */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 900,
            color: TOKENS.colors.textMain,
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Servicios & Especialidades
        </h2>
        <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '540px' }}>
          Servicios publicados por el negocio y contacto directo cuando exista un canal verificado.
        </p>
      </div>

      {/* 🏷️ Pestañas de Filtro Rápido */}
      {filterTabs.length > 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px',
          }}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                  setActiveFilter(tab as string);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  backgroundColor: isActive ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                  color: isActive ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                  border: `1px solid ${isActive ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                  boxShadow: isActive ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
                  cursor: 'pointer',
                  transition: 'transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {tab}
              </button>
            );
          })}
        </div>
      )}

      {/* 📦 Grilla de Servicios */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredServices.length === 0 ? (
          <p style={{ textAlign: 'center', color: TOKENS.colors.textSecondary }}>Sin datos todavía.</p>
        ) : filteredServices.map((srv, idx) => {
          const isExpanded = expandedIndex === idx;
          const serviceWhatsappMessage = encodeURIComponent(
            `Hola ${providerName}, vi su afiche en Guaki y me interesa consultar sobre el servicio de *${srv.name}*.`
          );
          const serviceWhatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${serviceWhatsappMessage}` : '';

          return (
            <div
              key={idx}
              className="neu-level-2"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                borderRadius: TOKENS.radii.lg,
                border: `1px solid ${TOKENS.colors.borderLight}`,
                backgroundColor: TOKENS.colors.surfaceElevated,
                transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms ease',
              }}
            >
              <div>
                {/* Indicador + Tag + Título */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#22C55E',
                        boxShadow: '0 0 8px #22C55E',
                        flexShrink: 0,
                      }}
                    />
                    <h3 style={{ fontSize: '1.04rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0 }}>
                      {srv.name}
                    </h3>
                  </div>
                  {srv.tag && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(23, 56, 45, 0.07)',
                        color: TOKENS.colors.emeraldDark,
                        padding: '2px 8px',
                        borderRadius: TOKENS.radii.pill,
                      }}
                    >
                      {srv.tag}
                    </span>
                  )}
                </div>

                {srv.description && <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: '0 0 10px', lineHeight: 1.55 }}>
                  {srv.description}
                </p>}

                {/* Tag de Duración */}
                {srv.duration && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: TOKENS.colors.textMuted, marginBottom: '10px' }}>
                    <span>{srv.duration}</span>
                    <span>·</span>
                    <span>🏥 Presencial</span>
                  </div>
                )}

                {/* Acordeón '¿Qué incluye este procedimiento?' */}
                <div style={{ marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px 0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: TOKENS.colors.emeraldDark,
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {isExpanded ? 'Ocultar detalles' : '¿Qué incluye este servicio?'}
                  </button>

                  {isExpanded && srv.includes && (
                    <ul
                      style={{
                        margin: '8px 0 0',
                        paddingLeft: '0',
                        listStyle: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                        backgroundColor: 'rgba(23, 56, 45, 0.03)',
                        borderRadius: TOKENS.radii.sm,
                        padding: '10px 12px',
                      }}
                    >
                      {srv.includes.map((inc, iIdx) => (
                        <li key={iIdx} style={{ fontSize: '0.76rem', color: TOKENS.colors.textSecondary, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <CheckCircle2 size={12} color="#22C55E" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Fila Inferior: Precio + Botón WhatsApp */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: `1px solid ${TOKENS.colors.borderLight}`,
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                {srv.price && <div>
                  <span style={{ fontSize: '0.68rem', color: TOKENS.colors.textMuted, display: 'block', fontWeight: 600 }}>
                    Tarifa orientativa:
                  </span>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 900,
                      color: TOKENS.colors.emeraldDark,
                    }}
                  >
                    {srv.price}
                  </span>
                </div>}

                {serviceWhatsappUrl && <a
                  href={serviceWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    borderRadius: TOKENS.radii.pill,
                    backgroundColor: TOKENS.colors.emeraldDark,
                    color: TOKENS.colors.white,
                    boxShadow: TOKENS.shadows.btnPrimary,
                    transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms ease',
                  }}
                  onMouseDown={(e) => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                    e.currentTarget.style.transform = 'scale(0.96)';
                  }}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <MessageCircle size={13} /> Cotizar
                </a>}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
