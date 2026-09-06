'use client';

import React from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, Crown, X as XIcon, ArrowRight, Sparkles } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { GUAKI_PLANS, GuakiPlan } from '@/lib/plans';

interface PlanCardsSectionProps {
  mode?: 'display' | 'select';
  selectedPlanId?: string;
  onSelectPlan?: (planId: 'gratis' | 'verificado' | 'vip') => void;
}

export default function PlanCardsSection({
  mode = 'display',
  selectedPlanId = 'gratis',
  onSelectPlan,
}: PlanCardsSectionProps) {
  return (
    <div className="guaki-plans-grid">
      {GUAKI_PLANS.map((plan: GuakiPlan) => {
        const isSelected = selectedPlanId === plan.id;
        const isSelectMode = mode === 'select';

        let borderColor: string = TOKENS.colors.borderLight;
        let bgColor: string = TOKENS.colors.surfaceElevated;
        let shadow: string | undefined = undefined;

        if (plan.vip) {
          borderColor = isSelected && isSelectMode ? '#D97706' : '#F59E0B';
          bgColor = isSelected && isSelectMode ? '#FFFBEB' : '#FFFDF5';
          shadow = '0 12px 36px rgba(245, 158, 11, 0.22)';
        } else if (plan.highlight) {
          borderColor = isSelected && isSelectMode ? '#15803D' : '#15803D';
          bgColor = isSelected && isSelectMode ? 'rgba(37, 211, 102, 0.08)' : TOKENS.colors.surfaceElevated;
          shadow = '0 8px 24px rgba(21, 128, 61, 0.14)';
        } else if (isSelected && isSelectMode) {
          borderColor = TOKENS.colors.emeraldDark;
          bgColor = 'rgba(220, 233, 213, 0.4)';
        }

        return (
          <div
            key={plan.id}
            onClick={isSelectMode && onSelectPlan ? () => onSelectPlan(plan.id) : undefined}
            className={isSelected || !isSelectMode ? 'neu-level-2' : 'neu-level-1'}
            style={{
              padding: '30px 22px',
              borderRadius: '26px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: bgColor,
              border: `2px solid ${borderColor}`,
              boxShadow: shadow,
              position: 'relative',
              cursor: isSelectMode ? 'pointer' : 'default',
              transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'center',
            }}
          >
            {/* Badge Flotante Superior para Plan VIP */}
            {plan.vip && (
              <div
                style={{
                  position: 'absolute',
                  top: '-13px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                  color: TOKENS.colors.white,
                  padding: '4px 14px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Crown size={13} />
                <span>{plan.badgeText}</span>
              </div>
            )}

            <div>
              {/* Encabezado del Plan Centrado */}
              <div style={{ textAlign: 'center', marginTop: plan.vip ? '6px' : '0', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {plan.name}
                </h3>
                {!plan.vip && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: plan.highlight ? 'rgba(37, 211, 102, 0.15)' : TOKENS.colors.surface,
                      color: plan.highlight ? '#15803D' : TOKENS.colors.textSecondary,
                      border: plan.highlight ? '1px solid rgba(21, 128, 61, 0.2)' : `1px solid ${TOKENS.colors.borderLight}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {plan.highlight && <CheckCircle2 size={12} />} {plan.badgeText}
                  </span>
                )}
              </div>

              {/* Bloque de Precio Ultra Prominente y Centrado */}
              <div style={{ textAlign: 'center', margin: '14px 0 16px', padding: '10px 0', borderTop: `1px dashed ${TOKENS.colors.borderLight}`, borderBottom: `1px dashed ${TOKENS.colors.borderLight}` }}>
                <div
                  style={{
                    fontSize: '2.45rem',
                    fontWeight: 900,
                    color: plan.vip ? '#D97706' : plan.highlight ? '#15803D' : TOKENS.colors.textMain,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.05,
                  }}
                >
                  {plan.priceFormatted}
                </div>
                <div style={{ fontSize: '0.82rem', color: TOKENS.colors.textSecondary, fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {plan.period}
                </div>
              </div>

              {/* Descripción del Plan Centrada */}
              <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, lineHeight: 1.45, textAlign: 'center', marginBottom: '20px' }}>
                {plan.description}
              </p>

              {/* Lista de Características */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px', textAlign: 'left' }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '0.82rem', color: TOKENS.colors.textMain }}>
                    {plan.vip ? (
                      <Crown size={15} color="#D97706" style={{ marginTop: '2px', flexShrink: 0 }} />
                    ) : (
                      <Check size={15} color="#15803D" style={{ marginTop: '2px', flexShrink: 0 }} />
                    )}
                    <span style={{ lineHeight: 1.35 }}>{feat}</span>
                  </div>
                ))}

                {plan.notIncluded && plan.notIncluded.map((notFeat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '0.82rem', color: TOKENS.colors.textMuted }}>
                    <XIcon size={15} color="#9CA3AF" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ lineHeight: 1.35 }}>{notFeat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN HASTA EL FONDO DE LA TARJETA */}
            {isSelectMode ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => onSelectPlan && onSelectPlan(plan.id)}
                  className={isSelected ? 'neu-btn-primary' : 'neu-level-3'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: TOKENS.radii.pill,
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: isSelected
                      ? (plan.vip ? 'linear-gradient(135deg, #17382D 0%, #2A5A4A 100%)' : '#15803D')
                      : TOKENS.colors.surface,
                    color: isSelected ? TOKENS.colors.white : TOKENS.colors.textMain,
                    border: isSelected ? 'none' : `1px solid ${TOKENS.colors.borderLight}`,
                    boxShadow: isSelected ? '0 6px 18px rgba(21, 128, 61, 0.25)' : undefined,
                    transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {isSelected ? <Check size={16} /> : null}
                  <span>{isSelected ? '✓ Plan Seleccionado' : 'Elegir ' + plan.name}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
                <Link
                  href="/provider/dashboard"
                  className="neu-btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: TOKENS.radii.pill,
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    textAlign: 'center',
                    background: plan.vip
                      ? 'linear-gradient(135deg, #17382D 0%, #2A5A4A 100%)'
                      : plan.highlight
                      ? undefined
                      : TOKENS.colors.surface,
                    color: !plan.highlight && !plan.vip ? TOKENS.colors.textMain : undefined,
                    border: !plan.highlight && !plan.vip ? `1px solid ${TOKENS.colors.borderLight}` : undefined,
                  }}
                >
                  <span>{plan.ctaText}</span>
                  {plan.vip ? <Sparkles size={15} /> : <ArrowRight size={15} />}
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}