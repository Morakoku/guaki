import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { absoluteUrl } from '@/lib/site';
import { getPublishedProviders } from '@/lib/published_providers';
import { mapPublicBusinessToAfiche } from '@/lib/public_card_mapper.mjs';
import type { AficheBusinessData } from '@/lib/demo_afiche';

// ISR: el inventario se prerenderiza en build y se refresca cada 5 minutos.
// La interacción (búsqueda, geolocalización, filtrado) sigue client-side.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/') },
};

export default async function HomePage() {
  let initialBusinesses: AficheBusinessData[] = [];
  try {
    const providers = await getPublishedProviders();
    initialBusinesses = providers.map(
      (p) => mapPublicBusinessToAfiche(p) as AficheBusinessData
    );
  } catch (cause) {
    // El prerender no debe romper el build: sin inventario, la home se sirve
    // sin perfiles y revalida al siguiente ciclo de ISR.
    console.error('home: inventory unavailable, serving empty inventory', cause);
  }
  return <HomeClient initialBusinesses={initialBusinesses} />;
}
