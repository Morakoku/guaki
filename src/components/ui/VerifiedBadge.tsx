'use client';

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Crown, X, Check } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';

export interface VerifiedBadgeProps {
  plan?: string | null;
  isVerified?: boolean | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * REGLA DE LEY GUAKI:
 * 1. Plan Gratis ($0) -> NUNCA lleva botón ni badge de verificado.
 * 2. Plan Suscripción ($50.000) -> Badge "✓ Verificado" oficial verde esmeralda con Modal de Garantía.
 * 3. Plan VIP ($99.000) -> SÚPER BOTÓN / BADGE VIP con aura dorada, corona y resplandor.
 */
export default function VerifiedBadge({
  plan,
  isVerified = false,
  size = 'md',
  className = '',
  style = {},
}: VerifiedBadgeProps) {
  const [showModal, setShowModal] = useState(false);
  const normPlan = (plan || '').toLowerCase();
  const isFree = normPlan === 'gratis' || normPlan === 'free' || normPlan === 'basico' || (!normPlan && isVerified === false);

  // REGLA DE LEY: Los afiches gratis NO llevan botón ni badge de verificado
  if (isFree || isVerified === false) {
    return null;
  }

  const isVip = normPlan === 'vip' || normPlan === 'elite' || normPlan === 'premium' || normPlan === 'pro_max';
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setShowModal(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`${isVip ? 'badge-gold-sheen ' : ''}${className}`}
        title="Clic para ver detalles de la auditoría y garantía Guaki"
        style={{
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: isSmall ? '4px' : '6px',
          background: isVip
            ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 50%, #FDE68A 100%)'
            : 'rgba(248, 250, 247, 0.96)',
          color: isVip ? '#92400E' : TOKENS.colors.emeraldDark,
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: isVip ? '#F59E0B' : 'rgba(21, 128, 61, 0.3)',
          borderRadius: TOKENS.radii.pill,
          padding: isSmall ? '3px 8px' : isLarge ? '8px 18px' : '5px 12px',
          fontSize: isSmall ? '0.7rem' : isLarge ? '0.86rem' : '0.76rem',
          fontWeight: 900,
          letterSpacing: '0.03em',
          boxShadow: isVip
            ? '0 4px 14px rgba(245, 158, 11, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.8)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
          textTransform: isVip ? 'uppercase' : 'none',
          transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform',
          ...style,
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isVip ? (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: isSmall ? '14px' : isLarge ? '20px' : '16px',
                height: isSmall ? '14px' : isLarge ? '20px' : '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
              }}
            >
              <Crown size={isSmall ? 9 : isLarge ? 13 : 11} />
            </span>
            <span>TOP VIP VERIFICADO</span>
            <Sparkles size={isSmall ? 10 : isLarge ? 14 : 12} color="#D97706" />
          </>
        ) : (
          <>
            <CheckCircle2 size={isSmall ? 11 : isLarge ? 15 : 13} color="#15803D" />
            <span>{isLarge ? 'Verificado por Guaki' : 'Verificado'}</span>
          </>
        )}
      </button>

      {/* 🛡️ POPUP / MODAL DE GARANTÍA AUDITADA GUAKI (SIN BLUR PARA MÁXIMA VELOCIDAD) */}
      {showModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="neu-level-2"
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: '#F7FAF6',
              borderRadius: '24px',
              padding: '26px 22px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
              textAlign: 'left',
            }}
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: TOKENS.colors.textMuted,
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#17382D',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#17382D', margin: 0 }}>
                  Garantía de Comercio Auditado
                </h3>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#15803D' }}>
                  {isVip ? '👑 Certificación Oficial Nivel TOP VIP' : '✓ Certificación Oficial Guaki'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, lineHeight: 1.5, margin: '0 0 18px' }}>
              Este negocio ha superado los filtros de confianza e identidad del ecosistema Guaki:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#15803D', marginTop: '2px' }}><Check size={16} /></div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: TOKENS.colors.textMain, display: 'block' }}>
                    Identidad Comercial & RUT Verificado
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: TOKENS.colors.textSecondary }}>
                    Comprobación de existencia legal y tributaria en Colombia.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#15803D', marginTop: '2px' }}><Check size={16} /></div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: TOKENS.colors.textMain, display: 'block' }}>
                    Ubicación Física Inspeccionada
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: TOKENS.colors.textSecondary }}>
                    Dirección real comprobada con horario y fotos reales del establecimiento.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ color: '#15803D', marginTop: '2px' }}><Check size={16} /></div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: TOKENS.colors.textMain, display: 'block' }}>
                    Canal Directo de WhatsApp
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: TOKENS.colors.textSecondary }}>
                    Hablas directamente con el dueño o equipo sin intermediarios ni sobrecostos.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="neu-btn-primary"
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: TOKENS.radii.pill,
                fontSize: '0.88rem',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

