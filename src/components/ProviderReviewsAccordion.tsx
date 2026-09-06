'use client';

import React, { useState } from 'react';
import { Star, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { ProviderReviewForm } from './ProviderReviewForm';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date?: string;
  verified?: boolean;
}

interface Props {
  rating: number;
  reviewsCount: number;
  reviewsList: any[];
  businessId: string;
  businessName: string;
}

export default function ProviderReviewsAccordion({
  rating,
  reviewsCount,
  reviewsList,
  businessId,
  businessName,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div id="reviews-section" style={{ width: '100%', marginTop: '14px' }}>
      {/* ── 1 AL LADO DEL OTRO: BOTÓN DE OPINIONES + BOTÓN DE RESPUESTA EN 1 MINUTO ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {/* Botón de Opiniones (Interactivo: despliega las opiniones al hacer clic) */}
        <button
          type="button"
          onClick={toggleOpen}
          className="neu-level-3"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: isOpen ? '#FEF3C7' : TOKENS.colors.surfaceElevated,
            border: isOpen ? '1.5px solid #F59E0B' : `1px solid ${TOKENS.colors.borderLight}`,
            color: isOpen ? '#92400E' : TOKENS.colors.textMain,
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: TOKENS.shadows.btnConvex,
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease',
            willChange: 'transform',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#D97706' }}>
            <Star size={15} fill="#D97706" color="#D97706" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <span>({reviewsCount} opiniones)</span>
          {isOpen ? <ChevronUp size={15} color="#92400E" /> : <ChevronDown size={15} color={TOKENS.colors.textMuted} />}
        </button>

        {/* Botón / Badge de Respuesta en 1 Minuto */}
        <div
          className="neu-level-3"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: '#DCFCE7',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#15803D',
            fontSize: '0.84rem',
            fontWeight: 800,
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)',
          }}
        >
          <Zap size={14} fill="#15803D" color="#15803D" />
          <span>Responde en 1 minuto</span>
        </div>
      </div>

      {/* ── CONTENIDO DESPLEGABLE DE OPINIONES ── */}
      {isOpen && (
        <div
          className="neu-level-2 page-fade-in"
          style={{
            marginTop: '16px',
            padding: '22px 20px',
            borderRadius: TOKENS.radii.xl,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderLight}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0 }}>
              Opiniones de Clientes Verificados ({reviewsList.length})
            </h3>
            <button
              type="button"
              onClick={toggleOpen}
              style={{
                background: 'none',
                border: 'none',
                color: TOKENS.colors.textMuted,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cerrar ▲
            </button>
          </div>

          {/* Listado de Opiniones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
            {reviewsList.length === 0 ? (
              <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textMuted, margin: '10px 0' }}>
                Sé el primero en dejar una opinión verificada sobre este comercio.
              </p>
            ) : (
              reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: TOKENS.radii.md,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: TOKENS.colors.textMain, fontSize: '0.88rem' }}>
                        {rev.authorName}
                      </span>
                      {rev.verified && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: '#15803D',
                            fontWeight: 700,
                            backgroundColor: 'rgba(21, 128, 61, 0.1)',
                            padding: '2px 6px',
                            borderRadius: TOKENS.radii.pill,
                          }}
                        >
                          ✓ Visita Verificada
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#D97706" color="#D97706" />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: 0, lineHeight: 1.45 }}>
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Formulario de Nueva Opinión */}
          <div style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '16px' }}>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '12px' }}>
              ¿Has visitado este negocio? Deja tu opinión:
            </h4>
            <ProviderReviewForm businessId={businessId} businessName={businessName} />
          </div>
        </div>
      )}
    </div>
  );
}
