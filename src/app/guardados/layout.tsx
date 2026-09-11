import type { Metadata } from 'next';

// Página personal (se alimenta de localStorage): fuera del índice.
export const metadata: Metadata = {
  title: 'Tus negocios guardados | Guaki',
  description: 'Revisa y contacta los negocios que guardaste en Guaki.',
  robots: { index: false, follow: false },
};

export default function GuardadosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
