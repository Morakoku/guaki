'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TOKENS } from '../lib/design-tokens';
import { GUAKI_FAQS } from '../lib/guaki_faq';

export function GuakiFAQSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const faqs = GUAKI_FAQS;

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      style={{
        marginTop: '40px',
        marginBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Preguntas Frecuentes
        </h3>
        <p style={{ fontSize: '0.95rem', color: TOKENS.colors.textSecondary, maxWidth: '640px', margin: '0 auto' }}>
          Todo lo que necesitas saber sobre el funcionamiento de Guaki, nuestro estándar de verificación y soluciones para negocios.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '860px', width: '100%', margin: '0 auto' }}>
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              style={{
                backgroundColor: TOKENS.colors.surface,
                padding: '20px 24px',
                borderRadius: TOKENS.radii.lg,
                boxShadow: TOKENS.shadows.card,
                border: isOpen ? `1.5px solid ${TOKENS.colors.greenPrimary}` : `1px solid ${TOKENS.colors.borderLight}`,
                transition: `all ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
              }}
            >
              <button
                type="button"
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  padding: 0,
                  color: isOpen ? TOKENS.colors.emeraldDark : TOKENS.colors.textMain,
                  transition: `color ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
                }}
              >
                <span style={{ fontSize: '1.02rem', fontWeight: 800, lineHeight: 1.35, color: TOKENS.colors.textMain }}>
                  {faq.question}
                </span>
                <span
                  style={{
                    backgroundColor: TOKENS.colors.surfaceInset,
                    width: '32px',
                    height: '32px',
                    borderRadius: TOKENS.radii.pill,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    color: isOpen ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
                  }}
                >
                  <ChevronDown size={18} />
                </span>
              </button>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: `grid-template-rows 200ms cubic-bezier(0.23, 1, 0.32, 1)`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    minHeight: 0,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0)' : 'translateY(-4px)',
                    transition: `opacity 180ms cubic-bezier(0.23, 1, 0.32, 1), transform 180ms cubic-bezier(0.23, 1, 0.32, 1)`,
                    paddingTop: isOpen ? '14px' : '0px',
                    marginTop: isOpen ? '14px' : '0px',
                    borderTop: isOpen ? `1px solid ${TOKENS.colors.borderSubtle}` : '1px solid transparent',
                    color: TOKENS.colors.textSecondary,
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
