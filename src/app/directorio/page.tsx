import type { Metadata } from 'next';
import { Suspense } from 'react';
import GuakiHeader from '../../components/ui/GuakiHeader';
import { TOKENS } from '../../lib/design-tokens';
import { absoluteUrl } from '@/lib/site';
import DirectoryClient from './DirectoryClient';

export const metadata: Metadata = {
  title: 'Directorio de Negocios y Servicios Verificados en Colombia | Guaki',
  description:
    'Explora comercios, profesionales y servicios en Colombia. Compara fichas con fotos, horarios y reseñas, y contacta directo por WhatsApp sin intermediarios.',
  alternates: { canonical: absoluteUrl('/directorio') },
  openGraph: {
    title: 'Directorio de Negocios y Servicios Verificados | Guaki',
    description: 'Comercios y profesionales cerca de ti, con contacto directo por WhatsApp.',
    url: absoluteUrl('/directorio'),
    type: 'website',
  },
};

function DirectorySeoHeading() {
  return (
    <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 20px 20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.7rem)', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', margin: '0 0 8px', color: TOKENS.colors.textMain }}>
          Directorio de Negocios
        </h1>
        <p style={{ fontSize: '0.96rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '560px', textAlign: 'center', lineHeight: 1.5 }}>
          Explora comercios y profesionales en Colombia con información de contacto directa y WhatsApp 1-clic.
        </p>
      </div>
    </section>
  );
}

export default function DirectoryPage() {
  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />
      <DirectorySeoHeading />
      <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Cargando directorio...</div>}>
        <DirectoryClient />
      </Suspense>
    </div>
  );
}
