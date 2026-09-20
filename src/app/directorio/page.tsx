import type { Metadata } from 'next';
import GuakiHeader from '../../components/ui/GuakiHeader';
import { TOKENS } from '../../lib/design-tokens';
import { absoluteUrl } from '@/lib/site';
import { getPublishedProviders } from '@/lib/published_providers';
import { mapPublicBusinessToAfiche } from '@/lib/public_card_mapper.mjs';
import type { AficheBusinessData } from '@/lib/demo_afiche';
import DirectoryClient from './DirectoryClient';

// ISR: el directorio se prerenderiza en build y se refresca cada 5 minutos.
// La lista de negocios queda en el HTML inicial (SEO) y el filtrado por
// categoría/ciudad + búsqueda en vivo siguen siendo client-side.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Directorio de Negocios y Servicios Verificados en Colombia y Venezuela | Guaki',
  description:
    'Explora comercios, profesionales y servicios en Colombia y Venezuela. Compara fichas con fotos, horarios y reseñas, y contacta directo por WhatsApp sin intermediarios.',
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
          Explora comercios y profesionales en Colombia y Venezuela con información de contacto directa y WhatsApp 1-clic.
        </p>
      </div>
    </section>
  );
}

interface DirectoryPageProps {
  searchParams: Promise<{ q?: string; city?: string; cat?: string; category?: string }>;
}

export default async function DirectoryPage(props: DirectoryPageProps) {
  const params = await props.searchParams;
  // Deep-link de categoría: /directorio?cat=veterinaria. Acepta también "category".
  const initialCategory = params.cat || params.category || 'todos';

  // Graceful degradation: si la fuente de datos falla o no está configurada,
  // se sirve un directorio vacío (no 500, no spinner infinito) y se revalida
  // al siguiente ciclo de ISR.
  let initialBusinesses: AficheBusinessData[] = [];
  try {
    const providers = await getPublishedProviders();
    initialBusinesses = providers.map(
      (p) => mapPublicBusinessToAfiche(p) as AficheBusinessData
    );
  } catch (cause) {
    console.error('directorio: inventory unavailable, serving empty directory', cause);
  }

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />
      <DirectorySeoHeading />
      <DirectoryClient
        initialBusinesses={initialBusinesses}
        initialQuery={params.q || ''}
        initialCity={params.city || ''}
        initialCategory={initialCategory}
      />
    </div>
  );
}
