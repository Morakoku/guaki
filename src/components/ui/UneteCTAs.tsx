'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MessageCircle, Store } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { trackEvent } from '@/lib/analytics';

// Número oficial de WhatsApp de Guaki (pendiente de compra).
// Se configura con NEXT_PUBLIC_GUAKI_WHATSAPP en Vercel; si no existe, el CTA se oculta.
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_GUAKI_WHATSAPP || '').replace(/\D/g, '');

function readRef(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('ref') || params.get('utm_source');
    if (fromUrl) return fromUrl.slice(0, 40);
    const match = document.cookie.split('; ').find((row) => row.startsWith('guaki_attr='));
    if (!match) return null;
    const parsed = JSON.parse(decodeURIComponent(match.slice('guaki_attr='.length)));
    return typeof parsed?.ref === 'string' ? parsed.ref.slice(0, 40) : typeof parsed?.utm_source === 'string' ? parsed.utm_source.slice(0, 40) : null;
  } catch {
    return null;
  }
}

export default function UneteCTAs() {
  const hasWhatsApp = WHATSAPP_NUMBER.length >= 10;

  const buildWhatsAppHref = () => {
    const ref = readRef();
    const message = ref
      ? `Hola, quiero registrar mi negocio en Guaki (ref: ${ref})`
      : 'Hola, quiero registrar mi negocio en Guaki';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link
        href="/provider/dashboard"
        onClick={() => trackEvent({ event_name: 'merchant_cta_clicked', metadata: { channel: 'register', entry: 'unete' } })}
        className="neu-btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '9px',
          padding: '15px 26px',
          borderRadius: TOKENS.radii.pill,
          fontSize: '0.98rem',
          fontWeight: 900,
          textDecoration: 'none',
        }}
      >
        <Store size={18} />
        Registrar mi negocio gratis
        <ArrowRight size={16} />
      </Link>

      {hasWhatsApp && (
        <a
          href={buildWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent({ event_name: 'merchant_cta_clicked', metadata: { channel: 'whatsapp', entry: 'unete' } })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            padding: '15px 26px',
            borderRadius: TOKENS.radii.pill,
            fontSize: '0.98rem',
            fontWeight: 900,
            textDecoration: 'none',
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            boxShadow: '0 8px 22px rgba(37, 211, 102, 0.28)',
          }}
        >
          <MessageCircle size={18} />
          Hablar por WhatsApp
        </a>
      )}
    </div>
  );
}
