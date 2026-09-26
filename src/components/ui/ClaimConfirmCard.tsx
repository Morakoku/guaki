'use client';

/**
 * ClaimConfirmCard — paso de CONFIRMACIÓN antes del registro (2026-09-23).
 * Flujo del funnel "Tu Afiche Aquí": el lead llega del email a SU ficha,
 * pulsa "Reclamar mi ficha" → confirma aquí su WhatsApp → recién entonces
 * lo llevamos al registro (/provider/dashboard?claim=…).
 * El número de WhatsApp capturado viaja en la URL para que el equipo de Guaki
 * le escriba por ambos canales (correo con su ficha + WhatsApp directo).
 */
import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import { normalizeWhatsAppNumber } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/analytics';

interface ClaimConfirmCardProps {
  businessId: string;
  slug: string;
  name: string;
  city?: string | null;
  category?: string | null;
}

export default function ClaimConfirmCard({
  businessId,
  slug,
  name,
  city,
  category,
}: ClaimConfirmCardProps) {
  const [open, setOpen] = useState(false);
  const [waInput, setWaInput] = useState('');
  const [error, setError] = useState('');

  // 2026-09-23 (bloque 2 #13): medir el funnel — el lead llega del email con
  // utm_source=guaki_email → registrar el click (email → ficha → claim).
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get('utm_source');
      if (utmSource) {
        trackEvent({
          event_name: 'email_click',
          business_id: businessId,
          metadata: {
            slug,
            name,
            utm_source: utmSource,
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || '',
            entry: 'email_ficha',
          },
        });
      }
    } catch {}
  }, [businessId, slug, name]);

  const whatsapp = normalizeWhatsAppNumber(waInput);

  const confirm = () => {
    if (!whatsapp || whatsapp.replace(/\D/g, '').length < 7) {
      setError('Escribe tu número de WhatsApp para enviarte el resultado.');
      return;
    }
    trackEvent({
      event_name: 'claim_confirmed',
      business_id: businessId,
      metadata: { slug, name, entry: 'ficha', step: 'confirm' },
    });
    const target = `/provider/dashboard?claim=${encodeURIComponent(businessId)}&wa=${encodeURIComponent(whatsapp)}`;
    window.location.href = target;
  };

  return (
    <section
      className="neu-level-2"
      style={{
        marginBottom: '32px',
        padding: '18px 22px',
        borderRadius: TOKENS.radii.xl,
        backgroundColor: TOKENS.colors.surfaceElevated,
        border: `1px solid ${TOKENS.colors.borderLight}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} color={TOKENS.colors.emeraldDark} />
          <div>
            <strong style={{ display: 'block', fontSize: '0.92rem', color: TOKENS.colors.textMain }}>
              ¿Eres el dueño de {name}?
            </strong>
            <span style={{ fontSize: '0.82rem', color: TOKENS.colors.textSecondary }}>
              Confirma que es tu ficha, y te la llevamos a tu panel para publicarla gratis.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: TOKENS.colors.emeraldDark,
            color: '#FFFFFF',
            fontSize: '0.86rem',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Reclamar mi ficha {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: `1px solid ${TOKENS.colors.borderLight}`,
            display: 'grid',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '0.88rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
            Confirma tu ficha {(city || category) && '· '}
            {category ? `${category}` : ''}
            {city ? ` — ${city}` : ''}
          </p>
          <label
            htmlFor="claim-whatsapp"
            style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: TOKENS.colors.textSecondary }}
          >
            TU WHATSAPP (para enviarte el acceso y escribirte por ambos lados)
          </label>
          <input
            id="claim-whatsapp"
            type="tel"
            inputMode="tel"
            value={waInput}
            onChange={(e) => {
              setWaInput(e.target.value);
              setError('');
            }}
            placeholder="+57 320 000 0000"
            style={{
              width: '100%',
              padding: '12px 14px',
              border: `2px solid ${error ? '#DC2626' : TOKENS.colors.borderLight}`,
              borderRadius: TOKENS.radii.sm,
              fontSize: '0.92rem',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {error && (
            <span style={{ fontSize: '0.8rem', color: '#DC2626', fontWeight: 700 }}>{error}</span>
          )}
          <button
            type="button"
            onClick={confirm}
            style={{
              padding: '14px 24px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: TOKENS.colors.emeraldDark,
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ES MI NEGOCIO — CONFIRMAR Y CONTINUAR →
          </button>
          <span style={{ fontSize: '0.75rem', color: TOKENS.colors.textMuted }}>
            Sin tarjeta, sin compromiso. Después de confirmar creamos tu cuenta para que edites tu ficha.
          </span>
        </div>
      )}
    </section>
  );
}
