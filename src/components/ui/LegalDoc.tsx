import React from 'react';
import { TOKENS } from '@/lib/design-tokens';
import SoftCard from './SoftCard';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalDoc({ title, updated, intro, sections }: LegalDocProps) {
  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <SoftCard style={{ padding: 'clamp(24px, 4vw, 44px)' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.68rem',
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: TOKENS.colors.greenPrimary,
            marginBottom: '10px',
          }}
        >
          <span aria-hidden style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: TOKENS.colors.greenPrimary }} />
          Documento oficial
        </span>

        <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.1rem)', fontWeight: 900, letterSpacing: '-0.02em', color: TOKENS.colors.textMain, margin: '0 0 8px' }}>
          {title}
        </h1>
        <p style={{ fontSize: '0.82rem', color: TOKENS.colors.textMuted, margin: '0 0 28px' }}>
          Última actualización: {updated}
        </p>

        <p style={{ fontSize: '0.95rem', color: TOKENS.colors.textSecondary, lineHeight: 1.75, margin: '0 0 28px', maxWidth: '70ch' }}>
          {intro}
        </p>

        {sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: '26px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                style={{ fontSize: '0.92rem', color: TOKENS.colors.textSecondary, lineHeight: 1.75, margin: '0 0 10px', maxWidth: '70ch' }}
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && (
              <ul style={{ margin: '10px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {section.bullets.map((bullet, index) => (
                  <li key={index} style={{ fontSize: '0.92rem', color: TOKENS.colors.textSecondary, lineHeight: 1.65 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <div
          style={{
            marginTop: '32px',
            padding: '16px 18px',
            borderRadius: TOKENS.radii.lg,
            backgroundColor: TOKENS.colors.surfaceInset,
            border: `1px solid ${TOKENS.colors.borderLight}`,
          }}
        >
          <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textMain, fontWeight: 700, margin: 0 }}>
            ¿Dudas sobre este documento? Escríbenos a{' '}
            <a href="mailto:contacto@guaki.online" style={{ color: TOKENS.colors.emeraldDark, fontWeight: 800 }}>
              contacto@guaki.online
            </a>
          </p>
        </div>
      </SoftCard>
    </main>
  );
}
