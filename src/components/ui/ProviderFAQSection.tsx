'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import { buildProviderFaqs, ProviderFaq } from '@/lib/provider_faq';

interface ProviderFAQSectionProps {
  businessName: string;
  city: string;
  phone: string;
}

export default function ProviderFAQSection({
  businessName,
  city,
  phone,
}: ProviderFAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs: ProviderFaq[] = buildProviderFaqs({ businessName, city, phone });

  const toggleFAQ = (idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section style={{ marginBottom: '36px' }}>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            color: TOKENS.colors.textMain,
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          Preguntas Frecuentes
        </h2>
        <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '500px' }}>
          Todo lo que necesitas saber antes de tu visita o consulta con {businessName}.
        </p>
      </div>

      <div
        className="neu-level-2"
        style={{
          padding: '16px 20px',
          borderRadius: TOKENS.radii.lg,
          backgroundColor: TOKENS.colors.surfaceElevated,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              style={{
                borderRadius: TOKENS.radii.md,
                backgroundColor: isOpen ? '#FFFFFF' : 'rgba(23, 56, 45, 0.03)',
                border: `1px solid ${isOpen ? TOKENS.colors.borderLight : 'transparent'}`,
                overflow: 'hidden',
                transition: 'background-color 160ms ease, border-color 160ms ease',
              }}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: TOKENS.colors.textMain,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={16} color={TOKENS.colors.emeraldDark} style={{ flexShrink: 0 }} />
                  <span>{faq.question}</span>
                </div>
                {isOpen ? <ChevronUp size={16} color={TOKENS.colors.emeraldDark} /> : <ChevronDown size={16} color={TOKENS.colors.textMuted} />}
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: '0 16px 14px 40px',
                    fontSize: '0.84rem',
                    color: TOKENS.colors.textSecondary,
                    lineHeight: 1.55,
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
