import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';
import { getPublishedProviders } from '@/lib/published_providers';
import { mapPublicBusinessToAfiche } from '@/lib/public_card_mapper.mjs';
import type { AficheBusinessData } from '@/lib/demo_afiche';
import GuakiHeader from '../../components/ui/GuakiHeader';
import SearchClient from './SearchClient';

// ISR: los resultados se prerenderizan en build y se refrescan cada 5 minutos.
// La lista inicial de resultados queda en el HTML (SEO); la búsqueda en vivo
// filtra client-side sobre el inventario server-rendered.
export const revalidate = 300;

interface SearchPageProps {
  searchParams: Promise<{ q?: string; city?: string }>;
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const params = await props.searchParams;
  const q = params.q || '';
  return {
    title: q ? `Resultados para "${q}" | Guaki` : 'Búsqueda de Negocios | Guaki',
    description: q
      ? `Encuentra comercios y profesionales que coinciden con "${q}" en Colombia y Venezuela, con contacto directo por WhatsApp.`
      : 'Busca negocios y servicios verificados en Colombia y Venezuela con contacto directo por WhatsApp.',
    alternates: { canonical: absoluteUrl('/search') },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams;
  const q = params.q || '';
  const city = params.city || '';

  // Graceful degradation: si la fuente falla o no está configurada, se sirven
  // resultados vacíos (no 500, no spinner infinito) y se revalida al siguiente
  // ciclo de ISR.
  let initialBusinesses: AficheBusinessData[] = [];
  try {
    const providers = await getPublishedProviders();
    initialBusinesses = providers.map(
      (p) => mapPublicBusinessToAfiche(p) as AficheBusinessData
    );
  } catch (cause) {
    console.error('search: inventory unavailable, serving empty results', cause);
  }

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />
      <SearchClient
        initialBusinesses={initialBusinesses}
        initialQuery={q}
        initialCity={city}
      />
    </div>
  );
}