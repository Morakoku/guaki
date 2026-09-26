/**
 * ComparadorGratisVerificado — la oferta visual del funnel "Tu Afiche Aquí"
 * (2026-09-23, spec B de designer): lado a lado, cómo se ve tu ficha gratis
 * vs con el Plan Verificado. Durante la apertura: el Verificado sale GRATIS
 * (concesión con cupo) — coherente con la promo del email.
 */
import React from 'react';
import { Check, Crown, Gift, Sparkles } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import type { LaunchPromoState } from '../../lib/plans';

// Copy VE: verificado con PagoMóvil o Zelle — sin tarjeta internacional
const VE_COPY = 'Verificado con PagoMóvil o Zelle — sin tarjeta internacional';

interface ComparadorProps {
  launchPromo?: LaunchPromoState | null;
  priceVerificado?: string | null;
}

export default function ComparadorGratisVerificado({ launchPromo, priceVerificado }: ComparadorProps) {
  const promoActiva = !!launchPromo?.active;

  const columnas = [
    {
      key: 'verificado',
      titulo: 'Plan Verificado',
      badge: promoActiva ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)', color: '#FFFFFF', padding: '4px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.72rem', fontWeight: 900 }}>
          <Check size={13} /> VERIFICADO
        </span>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#15803D', color: '#FFFFFF', padding: '4px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.72rem', fontWeight: 900 }}>
          <Check size={13} /> VERIFICADO
        </span>
      ),
      filas: [
        { icon: <Sparkles size={14} />, texto: 'Insignia ✓ Verificado por Guaki' },
        { icon: <Sparkles size={14} />, texto: 'Ficha web propia e indexable' },
        { icon: <Sparkles size={14} />, texto: 'Prioridad en el directorio' },
        { icon: <Sparkles size={14} />, texto: 'Contactos directos ilimitados' },
      ],
      precio: promoActiva ? 'GRATIS' : (priceVerificado || '$49.900'),
      periodo: promoActiva
        ? `${launchPromo!.remaining} de ${launchPromo!.limit} fichas de apertura`
        : 'COP / mes',
      destacado: true,
    },
    {
      key: 'gratis',
      titulo: 'Plan Esencial',
      badge: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: TOKENS.colors.surface, color: TOKENS.colors.textSecondary, padding: '4px 14px', borderRadius: TOKENS.radii.pill, fontSize: '0.72rem', fontWeight: 800, border: `1px solid ${TOKENS.colors.borderLight}` }}>
          <Gift size={13} /> GRATIS
        </span>
      ),
      filas: [
        { icon: <Sparkles size={14} />, texto: 'Aparición en el buscador' },
        { icon: <Sparkles size={14} />, texto: 'Botón directo a tu WhatsApp' },
        { icon: <Sparkles size={14} />, texto: 'Catálogo de servicios editable' },
        { icon: <Sparkles size={14} />, texto: '0% de comisión, para siempre' },
      ],
      precio: '$0',
      periodo: 'COP / para siempre',
      destacado: false,
    },
  ];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <strong style={{ fontSize: '1.05rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
          Tu ficha gratis vs con el Plan Verificado
        </strong>
        {promoActiva && (
          <>
            <p style={{ fontSize: '0.82rem', color: '#15803D', fontWeight: 700, marginTop: '6px' }}>
              🎁 {launchPromo!.label} — quedan {launchPromo!.remaining} de {launchPromo!.limit}
            </p>
            <p style={{ fontSize: '0.78rem', color: TOKENS.colors.textMuted, marginTop: '6px' }}>
              {VE_COPY}
            </p>
          </>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {columnas.map((col) => (
          <div
            key={col.key}
            className="neu-level-2"
            style={{
              padding: '26px 22px',
              borderRadius: TOKENS.radii.lg,
              backgroundColor: TOKENS.colors.surfaceElevated,
              border: `2px solid ${col.destacado ? '#15803D' : TOKENS.colors.borderLight}`,
              textAlign: 'center',
            }}
          >
            <div style={{ marginBottom: '14px' }}>{col.badge}</div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 12px' }}>
              {col.titulo}
            </h3>
            <div style={{ display: 'grid', gap: '8px', textAlign: 'left', marginBottom: '16px' }}>
              {col.filas.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: TOKENS.colors.textSecondary }}>
                  <span style={{ color: '#15803D', flexShrink: 0 }}>{f.icon}</span>
                  <span>{f.texto}</span>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: '14px', borderTop: `1px dashed ${TOKENS.colors.borderLight}` }}>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: col.destacado ? '#15803D' : TOKENS.colors.textMain, letterSpacing: '-0.03em' }}>
                {col.precio}
              </div>
              <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {col.periodo}
              </div>
            </div>
          </div>
        ))}
      </div>

      {promoActiva && (
        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: TOKENS.colors.textMuted, marginTop: '12px' }}>
          Al cerrar la apertura, el Plan Verificado vuelve a su precio normal.
        </p>
      )}
    </div>
  );
}
