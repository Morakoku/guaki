import type { Metadata } from 'next';
import React from 'react';
import GuakiHeader from '@/components/ui/GuakiHeader';
import { GuakiCorporateIdentity } from '@/components/GuakiCorporateIdentity';
import { GuakiFAQSection } from '@/components/GuakiFAQSection';
import { TOKENS } from '@/lib/design-tokens';
import { absoluteUrl } from '@/lib/site';
import { buildGuakiFaqStructuredData } from '@/lib/guaki_faq';

export const metadata: Metadata = {
  title: 'Quiénes Somos, Dónde Estamos y Preguntas Frecuentes | Guaki',
  description:
    'Conoce a Guaki: Directorio local transparente y verificado en Colombia y Venezuela. Presencia en Medellín, Bogotá y Caracas, protocolo 0% cartón y FAQ oficial.',
  alternates: { canonical: absoluteUrl('/nosotros') },
};

export default function NosotrosPage() {
  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent', color: TOKENS.colors.textMain }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildGuakiFaqStructuredData()).replace(/</g, '\\u003c'),
        }}
      />
      <GuakiHeader />

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <GuakiCorporateIdentity />
        <GuakiFAQSection />

        {/* 🎨 Kit de Marca & Calcomanías Físicas */}
        <section
          style={{
            marginTop: '40px',
            padding: '24px 28px',
            borderRadius: TOKENS.radii.xl,
            backgroundColor: '#17382D',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 12px 36px rgba(23, 56, 45, 0.25)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 4px' }}>
              🎨 Kit de Marca & Calcomanías Físicas con QR
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#DCE9D5', margin: 0 }}>
              Descarga logos oficiales en alta resolución y genera calcomanías listas para imprimir para vitrinas y mostradores.
            </p>
          </div>

          <a
            href="/recursos-marca"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#AFC8AD',
              color: '#102B22',
              fontSize: '0.86rem',
              fontWeight: 900,
              textDecoration: 'none',
              borderRadius: TOKENS.radii.pill,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'transform 140ms ease',
            }}
          >
            Ver Recursos & Calcomanías →
          </a>
        </section>
      </main>
    </div>
  );
}
