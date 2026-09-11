import type { Metadata } from 'next';

// Flujo interno de autenticación: fuera del índice de búsqueda.
export const metadata: Metadata = {
  title: 'Accede o registra tu negocio | Guaki',
  description:
    'Entra al panel de tu negocio o crea tu cuenta gratis en Guaki para publicar tu ficha y recibir contactos directos por WhatsApp.',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
