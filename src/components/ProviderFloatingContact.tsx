'use client';

import React, { useState } from 'react';
import { NM_PEARL } from '@/lib/neumorphism-styles';

interface Props {
  businessName: string;
  whatsappUrl: string | null;
  phone: string;
}

export function ProviderFloatingContact({ businessName, whatsappUrl, phone }: Props) {
  const [expanded, setExpanded] = useState(true);
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  if (!whatsappUrl && !cleanPhone) return null;

  return (
    <>
      {/* 📱 1. VISTA MÓVIL: BARRA FIJA INFERIOR (STICKY BOTTOM DOCK) */}
      <div
        className="mobile-sticky-contact"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(18, 22, 31, 0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          padding: '10px 16px',
          display: 'none',
          gap: '10px',
          zIndex: 9999,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
        }}
      >
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Contactar a ${businessName} por WhatsApp`}
            style={{
              ...NM_PEARL.buttonEmerald,
              flex: 1,
              padding: '12px 14px',
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 800,
              minHeight: '44px',
            }}
          >
            <span>💬</span> WhatsApp Directo
          </a>
        )}
        {cleanPhone && (
          <a
            href={`tel:${cleanPhone}`}
            aria-label={`Llamar a ${businessName}`}
            style={{
              ...NM_PEARL.buttonConvex,
              padding: '12px 16px',
              fontSize: '0.88rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#F8FAFC',
              fontWeight: 800,
              minHeight: '44px',
            }}
          >
            <span>📞</span> Llamar
          </a>
        )}
      </div>

      {/* 🖥️ 2. VISTA ESCRITORIO: DOCK FLOTANTE */}
      <div
        className="desktop-floating-contact"
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '28px',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {expanded ? (
          <div
            style={{
              ...NM_PEARL.card,
              padding: '18px 20px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '260px',
              boxShadow: '14px 14px 44px #101218, -14px -14px 44px #202634',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ⚡ En línea ahora
                </span>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Minimizar dock de contacto"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  fontSize: '1rem',
                  padding: '4px 8px',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Escribir por WhatsApp a ${businessName}`}
                style={{
                  ...NM_PEARL.buttonEmerald,
                  padding: '12px 18px',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textAlign: 'center',
                  minHeight: '44px',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💬</span> Escribir por WhatsApp
              </a>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                aria-label={`Llamar a ${businessName} al ${phone}`}
                style={{
                  ...NM_PEARL.buttonConvex,
                  padding: '12px 18px',
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textAlign: 'center',
                  color: '#F8FAFC',
                  fontWeight: 700,
                  minHeight: '44px',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>📞</span> Llamar {phone}
              </a>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`Contactar a ${businessName}`}
            style={{
              ...NM_PEARL.buttonEmerald,
              width: '56px',
              height: '56px',
              borderRadius: '6px',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.6rem',
              cursor: 'pointer',
              boxShadow: '6px 6px 18px #101218, -6px -6px 18px #202634',
              position: 'relative',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            💬
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981', border: '2px solid #171B26' }} />
          </button>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-sticky-contact {
            display: flex !important;
          }
          .desktop-floating-contact {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
