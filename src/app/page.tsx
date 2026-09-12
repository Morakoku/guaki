import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { absoluteUrl } from '@/lib/site';

// El home es un componente cliente (buscador, geolocalización, feed dinámico).
// Este wrapper de servidor existe para emitir metadata rastreable, en especial
// el canonical que antes faltaba por completo en la raíz del sitio.
export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl('/') },
};

export default function HomePage() {
  return <HomeClient />;
}
