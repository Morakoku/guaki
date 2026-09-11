import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Kit de Marca y Recursos de Identidad | Guaki',
  description:
    'Descarga el logo, los colores y las guías de marca de Guaki. Recursos oficiales para aliados y comercios verificados.',
  alternates: { canonical: absoluteUrl('/recursos-marca') },
};

export default function RecursosMarcaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
