'use client';

import React from 'react';
import Link from 'next/link';
import { TOKENS } from '../lib/design-tokens';
import { CITY_CATALOG, COUNTRY_META } from '../lib/geo';
import SoftCard from './ui/SoftCard';

export function GuakiCorporateIdentity() {
  const cities = CITY_CATALOG;

  const verificationFilters = [
    {
      num: '01',
      title: 'Validación Legal y Tributaria',
      desc: 'Comprobamos el registro legal y tributario del negocio (RUT en Colombia, RIF en Venezuela) y su actividad comercial para asegurar que está en regla.',
      icon: '📜',
    },
    {
      num: '02',
      title: 'Ubicación Física Real',
      desc: 'Confirmamos la dirección física y sede de atención para que nunca llegues a un lugar inexistente.',
      icon: '📍',
    },
    {
      num: '03',
      title: 'Canales de Respuesta Rápida',
      desc: 'Probamos que el número y WhatsApp estén activos y respondan con amabilidad y agilidad.',
      icon: '⚡',
    },
  ];

  return (
    <section
      id="quienes-somos"
      style={{
        marginTop: '40px',
        marginBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      {/* 🏛️ 1. HERO CORPORATIVO: ¿QUIÉN ES GUAKI? */}
      <SoftCard style={{ padding: 'clamp(28px, 5vw, 48px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '36px', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 900, color: TOKENS.colors.textMain, lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              ¿Qué es <span style={{ color: TOKENS.colors.emeraldDark }}>GUAKI</span>?
            </h1>

            <p style={{ fontSize: '1rem', color: TOKENS.colors.textSecondary, lineHeight: 1.65, margin: '0 0 24px' }}>
              Guaki nació para solucionar la falta de confianza en las búsquedas locales. Te conectamos de forma directa, rápida y segura con especialistas y negocios verificados de tu ciudad. Sin comisiones ocultas, sin rodeos y con contacto directo a WhatsApp en 1 solo clic.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href="/directorio"
                className="soft-btn-primary"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  borderRadius: TOKENS.radii.pill,
                }}
              >
                <span>🔍</span> Explorar Directorio
              </Link>
              <Link
                href="/provider/dashboard?action=upgrade"
                className="soft-btn"
                style={{
                  padding: '12px 22px',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  borderRadius: TOKENS.radii.pill,
                }}
              >
                <span>🚀</span> Registrar mi Negocio
              </Link>
            </div>
          </div>

          {/* 🏷️ TARJETA DE NEGOCIO GUAKI */}
          <div
            style={{
              backgroundColor: TOKENS.colors.surfaceElevated,
              padding: '28px',
              borderRadius: TOKENS.radii.lg,
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              border: `1px solid ${TOKENS.colors.borderLight}`,
              boxShadow: TOKENS.shadows.card,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`, paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: TOKENS.radii.sm,
                    backgroundColor: TOKENS.colors.emeraldDark,
                    color: TOKENS.colors.white,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.4rem',
                  }}
                >
                  🥑
                </div>
                <div>
                  <strong style={{ fontSize: '1.05rem', color: TOKENS.colors.textMain, display: 'block' }}>GUAKI S.A.S. 🥑</strong>
                  <span style={{ fontSize: '0.78rem', color: TOKENS.colors.emeraldDark, fontWeight: 700 }}>Directorio Local · Fresco & Verificado</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>📍</span>
                <div>
                  <strong style={{ color: TOKENS.colors.textMain, display: 'block' }}>Sede Central:</strong>
                  <span style={{ color: TOKENS.colors.textSecondary }}>Medellín (El Poblado) & Bogotá, Colombia</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>💬</span>
                <div>
                  <strong style={{ color: TOKENS.colors.textMain, display: 'block' }}>Contacto Concierge:</strong>
                  <span style={{ color: TOKENS.colors.textSecondary }}>WhatsApp Directo (+57 304 333 8899)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                <div>
                  <strong style={{ color: TOKENS.colors.textMain, display: 'block' }}>Garantía 0% Cartón:</strong>
                  <span style={{ color: TOKENS.colors.textSecondary }}>Negocios 100% reales, sin empresas fantasma ni intermediarios.</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${TOKENS.colors.borderSubtle}`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: TOKENS.colors.textSecondary }}>
              <span>Cobertura Nacional</span>
              <strong style={{ color: TOKENS.colors.emeraldDark }}>6 Ciudades Principales</strong>
            </div>
          </div>
        </div>
      </SoftCard>

      {/* 🛡️ 2. PROTOCOLO DE VERIFICACIÓN EN 3 FILTROS */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: '0 0 8px' }}>
            Nuestro Estándar de Verificación 0% Cartón
          </h3>
          <p style={{ fontSize: '0.92rem', color: TOKENS.colors.textSecondary, maxWidth: '600px', margin: '0 auto' }}>
            Auditamos cada negocio antes de otorgar el sello oficial para asegurarte una experiencia confiable y sin sorpresas.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
          {verificationFilters.map((filter) => (
            <SoftCard
              key={filter.num}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                borderRadius: TOKENS.radii.xl,
                border: `1px solid ${TOKENS.colors.borderLight}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.8rem' }}>{filter.icon}</span>
                <span
                  style={{
                    backgroundColor: TOKENS.colors.surfaceInset,
                    width: '36px',
                    height: '36px',
                    borderRadius: TOKENS.radii.pill,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1rem',
                    fontWeight: 900,
                    color: TOKENS.colors.emeraldDark,
                  }}
                >
                  {filter.num}
                </span>
              </div>
              <strong style={{ fontSize: '1.05rem', color: TOKENS.colors.textMain }}>{filter.title}</strong>
              <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, lineHeight: 1.5, margin: 0 }}>
                {filter.desc}
              </p>
            </SoftCard>
          ))}
        </div>
      </div>

      {/* 📍 3. CIUDADES & COBERTURA */}
      <SoftCard style={{ padding: 'clamp(24px, 4vw, 34px)', background: 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(232,241,234,0.82))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: TOKENS.colors.greenPrimary, fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              <span aria-hidden="true" style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: TOKENS.colors.greenPrimary, boxShadow: `0 0 0 4px rgba(61, 128, 79, 0.12)` }} />
              Cobertura activa
            </span>
            <h4 style={{ fontSize: 'clamp(1.15rem, 2vw, 1.35rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0, letterSpacing: '-0.02em' }}>
              Presencia Operativa en Colombia y Venezuela
            </h4>
            <span style={{ display: 'block', fontSize: '0.84rem', color: TOKENS.colors.textSecondary, marginTop: '5px' }}>
              Red de proveedores auditados con geolocalización en tiempo real
            </span>
          </div>
          <Link
            href="/directorio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 13px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: TOKENS.colors.surface,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              boxShadow: TOKENS.shadows.glass,
              fontSize: '0.78rem',
              color: TOKENS.colors.emeraldDark,
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Ver catálogo completo <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
          {cities.map((c) => (
            <div
              key={c.name}
              style={{
                backgroundColor: TOKENS.colors.surfaceInset,
                padding: '17px 18px',
                borderRadius: TOKENS.radii.md,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minHeight: '126px',
                border: `1px solid ${TOKENS.colors.borderLight}`,
                boxShadow: '0 5px 16px rgba(23, 56, 45, 0.045)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  aria-label={COUNTRY_META[c.country].name}
                  style={{
                    width: '16px',
                    height: '11px',
                    borderRadius: '2px',
                    background: COUNTRY_META[c.country].flagGradient,
                    boxShadow: '0 0 0 1px rgba(23, 56, 45, 0.10)',
                    flexShrink: 0,
                  }}
                />
                <strong style={{ fontSize: '0.98rem', color: TOKENS.colors.textMain }}>{c.name}</strong>
              </div>
              <span style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>{c.zone}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', color: TOKENS.colors.textMuted, fontWeight: 700 }}>
                  {COUNTRY_META[c.country].name}
                </span>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.68rem', color: TOKENS.colors.greenPrimary, fontWeight: 800, padding: '4px 8px', borderRadius: TOKENS.radii.pill, backgroundColor: 'rgba(61, 128, 79, 0.09)' }}>
                  {c.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SoftCard>
    </section>
  );
}
