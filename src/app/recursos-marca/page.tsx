'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Palette,
} from 'lucide-react';
import GuakiHeader from '@/components/ui/GuakiHeader';
import { TOKENS } from '@/lib/design-tokens';

export default function BrandResourcesPage() {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('Veterinaria Pets & Care Poblado');
  const [slug, setSlug] = useState('veterinaria-pets-and-care-poblado');
  const [phone, setPhone] = useState('+57 304 333 8899');
  const [stickerType, setStickerType] = useState<'round' | 'rect'>('round');

  const copyColor = (hex: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(hex);
      if (navigator.vibrate) navigator.vibrate(10);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    `https://guaki.online/proveedores/${slug}`
  )}&bgcolor=FFFFFF&color=17382D&margin=2`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const brandColors = [
    { name: 'Dark Emerald', hex: '#17382D', role: 'Color primario de marca & confianza' },
    { name: 'Deep Emerald', hex: '#102B22', role: 'Contrastes de alta jerarquía & textos' },
    { name: 'Sage Green', hex: '#5F8F67', role: 'Acentos botánicos & botones secundarios' },
    { name: 'Light Sage', hex: '#AFC8AD', role: 'Gradientes ambientales suaves' },
    { name: 'Soft Neumorphic Base', hex: '#E7ECE7', role: 'Fondo ambiental calmado' },
    { name: 'Highlight Mint', hex: '#DCE9D5', role: 'Badges y píldoras activas' },
    { name: 'Golden VIP', hex: '#F59E0B', role: 'Insignias patrocinadas & estrellas' },
  ];

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Cabecera Editorial */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(23, 56, 45, 0.08)',
              padding: '5px 14px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.78rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} /> Centro Oficial de Recursos & Identidad
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 2.6rem)',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              letterSpacing: '-0.025em',
              margin: '0 0 10px',
            }}
          >
            Kit de Marca & Calcomanías Físicas
          </h1>
          <p style={{ fontSize: '0.94rem', color: TOKENS.colors.textSecondary, maxWidth: '640px', margin: '0 auto', lineHeight: 1.55 }}>
            Descarga logos vectoriales oficiales, distintivos de verificación en alta resolución y genera calcomanías neumórficas con código QR listas para imprimir para tu vitrina o mostrador.
          </p>
        </div>

        {/* ── SECCIÓN 1: GENERADOR DE CALCOMANÍAS FÍSICAS CON QR (Punto 152) ── */}
        <section
          className="neu-level-2"
          style={{
            padding: '28px 24px',
            borderRadius: TOKENS.radii.xl,
            backgroundColor: TOKENS.colors.surfaceElevated,
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: '#17382D',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <QrCode size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
                  Generador de Calcomanías Físicas para Vitrinas
                </h2>
                <span style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>
                  Formato de alta resolución listo para imprimir en papel adhesivo o vinilo
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="neu-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                fontSize: '0.84rem',
                fontWeight: 800,
                borderRadius: TOKENS.radii.pill,
                cursor: 'pointer',
              }}
            >
              <Printer size={15} /> Imprimir / Guardar PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
            {/* Controles de Personalización */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: TOKENS.colors.textMain, marginBottom: '4px' }}>
                  Nombre del Comercio en la Calcomanía
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: TOKENS.radii.sm,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    fontSize: '0.88rem',
                    color: TOKENS.colors.textMain,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: TOKENS.colors.textMain, marginBottom: '4px' }}>
                  Slug o Enlace de la Ficha en Guaki
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: TOKENS.radii.sm,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    fontSize: '0.88rem',
                    color: TOKENS.colors.textMain,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: TOKENS.colors.textMain, marginBottom: '4px' }}>
                  Teléfono / WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: TOKENS.radii.sm,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    fontSize: '0.88rem',
                    color: TOKENS.colors.textMain,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                  Formato de la Calcomanía
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setStickerType('round')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: stickerType === 'round' ? '#17382D' : '#FFFFFF',
                      color: stickerType === 'round' ? '#FFFFFF' : TOKENS.colors.textSecondary,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      fontWeight: 700,
                      fontSize: '0.80rem',
                      cursor: 'pointer',
                    }}
                  >
                    🔘 Circular (Vitrina)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStickerType('rect')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: stickerType === 'rect' ? '#17382D' : '#FFFFFF',
                      color: stickerType === 'rect' ? '#FFFFFF' : TOKENS.colors.textSecondary,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      fontWeight: 700,
                      fontSize: '0.80rem',
                      cursor: 'pointer',
                    }}
                  >
                    📄 Rectangular (Mostrador)
                  </button>
                </div>
              </div>
            </div>

            {/* Vista Previa en Vivo de la Calcomanía Imprimible */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {stickerType === 'round' ? (
                <div
                  style={{
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    backgroundColor: '#17382D',
                    color: '#FFFFFF',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '4px solid #AFC8AD',
                    boxShadow: '0 12px 36px rgba(23, 56, 45, 0.3)',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em', color: '#AFC8AD', textTransform: 'uppercase' }}>
                    ✓ COMERCIO AUDITADO
                  </span>
                  <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 6px', maxWidth: '190px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {businessName}
                  </span>
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      padding: '6px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    <img
                      src={qrUrl}
                      alt={`Código QR ${businessName}`}
                      style={{ width: '90px', height: '90px', display: 'block' }}
                    />
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#DCE9D5', marginTop: '6px' }}>
                    Escanea para ver horarios & WhatsApp
                  </span>
                  <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                    guaki.online · Verificado
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    width: '280px',
                    borderRadius: '18px',
                    backgroundColor: '#FFFFFF',
                    border: '3px solid #17382D',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ShieldCheck size={18} color="#15803D" />
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#17382D' }}>
                      COMERCIO AUDITADO POR GUAKI
                    </span>
                  </div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 900, color: '#16231D', marginBottom: '8px' }}>
                    {businessName}
                  </div>
                  <img
                    src={qrUrl}
                    alt={`Código QR ${businessName}`}
                    style={{ width: '120px', height: '120px', display: 'block', borderRadius: '8px', border: '1px solid #DFE6DE' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: TOKENS.colors.textSecondary, fontWeight: 700, marginTop: '8px' }}>
                    {phone}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#15803D', fontWeight: 800, marginTop: '2px' }}>
                    ✓ Contacto Directo Sin Intermediarios
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 2: LOGOS Y DISTINTIVOS EN ALTA RESOLUCIÓN (Punto 153) ── */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
              Logos & Distintivos Oficiales
            </h2>
            <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '520px' }}>
              Archivos SVG vectoriales y PNG transparentes de alta resolución para prensa, comercios afiliados y marketing.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {/* Logo Primario Verde Esmeralda */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: TOKENS.radii.lg,
                padding: '24px',
                border: `1px solid ${TOKENS.colors.borderLight}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ height: '80px', display: 'grid', placeItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '2.2rem' }}>🥑</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#17382D', letterSpacing: '-0.03em' }}>
                    GUAKI
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                  Logo Primario Esmeralda
                </span>
                <a
                  href="/manifest.webmanifest"
                  download="guaki-logo-emerald.svg"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: TOKENS.colors.emeraldDark,
                    textDecoration: 'none',
                  }}
                >
                  <Download size={13} /> SVG
                </a>
              </div>
            </div>

            {/* Badge de Verificación Oficial */}
            <div
              style={{
                backgroundColor: '#17382D',
                borderRadius: TOKENS.radii.lg,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(23, 56, 45, 0.25)',
              }}
            >
              <div style={{ height: '80px', display: 'grid', placeItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1.5px solid #AFC8AD',
                    padding: '8px 18px',
                    borderRadius: TOKENS.radii.pill,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 900,
                    fontSize: '0.90rem',
                  }}
                >
                  <ShieldCheck size={18} color="#4ADE80" />
                  <span>✓ VERIFICADO POR GUAKI</span>
                </div>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#DCE9D5' }}>
                  Distintivo de Verificación
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4ADE80' }}>
                  Vectorial HD
                </span>
              </div>
            </div>

            {/* Badge Nivel TOP VIP */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                borderRadius: TOKENS.radii.lg,
                padding: '24px',
                border: '1.5px solid #F59E0B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 6px 18px rgba(245, 158, 11, 0.2)',
              }}
            >
              <div style={{ height: '80px', display: 'grid', placeItems: 'center' }}>
                <div
                  style={{
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: TOKENS.radii.pill,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                  }}
                >
                  <Sparkles size={16} />
                  <span>👑 TOP VIP VERIFICADO</span>
                </div>
              </div>
              <div style={{ width: '100%', borderTop: '1px solid rgba(146, 64, 14, 0.2)', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400E' }}>
                  Insignia Oficial TOP VIP
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#92400E' }}>
                  Vectorial HD
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: PALETA DE COLORES OFICIALES (1-Clic Copiar) ── */}
        <section
          className="neu-level-2"
          style={{
            padding: '24px',
            borderRadius: TOKENS.radii.xl,
            backgroundColor: TOKENS.colors.surfaceElevated,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Palette size={18} color={TOKENS.colors.emeraldDark} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
              Paleta de Tokens Oficiales Guaki
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {brandColors.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => copyColor(c.hex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: TOKENS.radii.sm,
                  border: `1px solid ${TOKENS.colors.borderLight}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'transform 140ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    backgroundColor: c.hex,
                    border: '1px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: TOKENS.colors.textSecondary, fontFamily: 'monospace' }}>
                    {c.hex}
                  </div>
                </div>
                {copiedHex === c.hex ? <Check size={14} color="#15803D" /> : <Copy size={13} color="#94A3B8" />}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
