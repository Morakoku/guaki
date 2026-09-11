'use client';

import React from 'react';
import { MessageCircle, Phone, Eye, Search, TrendingUp, Zap } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

interface MetricsProps {
  whatsappClicks?: number;
  phoneCalls?: number;
  profileViews?: number;
  searchImpressions?: number;
  conversionRate?: string;
}

export default function ProviderMetricsCard({
  whatsappClicks = 0,
  phoneCalls = 0,
  profileViews = 1,
  searchImpressions = 3,
  conversionRate = '0%',
}: MetricsProps) {
  const totalDirectContacts = whatsappClicks + phoneCalls;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. Hero KPI Bar: Resumen de Conversión Directa ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Tarjeta Principal: Contactos de Clientes */}
        <div
          style={{
            padding: '24px',
            borderRadius: TOKENS.radii.xl,
            background: 'linear-gradient(135deg, rgba(23, 56, 45, 0.06) 0%, rgba(21, 128, 61, 0.12) 100%)',
            border: '1px solid rgba(21, 128, 61, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(21, 128, 61, 0.06)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: TOKENS.radii.pill,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#15803D',
                    boxShadow: '0 0 8px #15803D',
                  }}
                />
                Contactos Directos
              </span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: TOKENS.colors.textMain, lineHeight: 1.1 }}>
              {totalDirectContacts}{' '}
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: TOKENS.colors.textSecondary }}>
                clientes
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>
              Suma de WhatsApp + llamadas directas
            </div>
          </div>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(21, 128, 61, 0.15)',
              color: '#15803D',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.6)',
            }}
          >
            <Zap size={28} />
          </div>
        </div>

        {/* Tarjeta Secundaria: Eficiencia / Tasa de Conversión */}
        <div
          style={{
            padding: '24px',
            borderRadius: TOKENS.radii.xl,
            background: 'linear-gradient(135deg, rgba(231, 236, 231, 0.6) 0%, rgba(218, 226, 218, 0.9) 100%)',
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: TOKENS.shadows.card,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(23, 56, 45, 0.08)',
                  color: TOKENS.colors.textSecondary,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: TOKENS.radii.pill,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Tasa de Contacto
              </span>
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: TOKENS.colors.emeraldDark, lineHeight: 1.1 }}>
              {conversionRate}
            </div>
            <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary, marginTop: '4px', fontWeight: 500 }}>
              De cada 100 visitas que ven tu afiche
            </div>
          </div>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(23, 56, 45, 0.08)',
              color: TOKENS.colors.emeraldDark,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* ── 2. Grid de Métricas Específicas ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Leads por WhatsApp */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: TOKENS.radii.lg,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.btnConvex,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
              Leads WhatsApp
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 211, 102, 0.12)',
                color: '#15803D',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <MessageCircle size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
            {whatsappClicks}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Clics recibidos al chat
          </div>
        </div>

        {/* Llamadas Directas */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: TOKENS.radii.lg,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.btnConvex,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
              Llamadas Directas
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(30, 90, 60, 0.10)',
                color: TOKENS.colors.emeraldDark,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Phone size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
            {phoneCalls}
          </div>
          <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, fontWeight: 600 }}>
            Clics en botón de llamar
          </div>
        </div>

        {/* Visualizaciones de Ficha */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: TOKENS.radii.lg,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.btnConvex,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
              Visualizaciones
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 99, 235, 0.10)',
                color: '#2563EB',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Eye size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
            {profileViews}
          </div>
          <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, fontWeight: 600 }}>
            Visitas a tu afiche completo
          </div>
        </div>

        {/* Impresiones en Búsqueda */}
        <div
          style={{
            padding: '18px 20px',
            borderRadius: TOKENS.radii.lg,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.btnConvex,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
              Búsquedas Locales
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(217, 119, 6, 0.10)',
                color: '#D97706',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Search size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
            {searchImpressions}
          </div>
          <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, fontWeight: 600 }}>
            Veces visto en resultados
          </div>
        </div>
      </div>
    </div>
  );
}
