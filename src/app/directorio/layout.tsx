import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directorio de negocios y servicios verificados en Colombia y Venezuela | Guaki',
  description: 'Encuentra negocios y profesionales verificados por categoría y ciudad, con contacto directo por WhatsApp.',
  alternates: { canonical: '/directorio' },
  openGraph: {
    title: 'Directorio de negocios y servicios verificados | Guaki',
    description: 'Explora negocios y profesionales verificados en Colombia y Venezuela.',
    url: '/directorio',
    type: 'website',
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
