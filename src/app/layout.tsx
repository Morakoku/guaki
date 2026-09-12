import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import SoftBottomNav from '@/components/ui/SoftBottomNav';
import DynamicFavicon from '@/components/ui/DynamicFavicon';
import AttributionTracker from '@/components/ui/AttributionTracker';
import { absoluteUrl, SITE_URL } from '@/lib/site';

const siteStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Guaki',
      url: SITE_URL,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Guaki',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${absoluteUrl('/search')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: '#E7ECE7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Guaki — Directorio Inteligente & Servicios Verificados',
  description: 'Encuentra y contacta directamente con negocios y profesionales verificados en Colombia y Venezuela.',
  keywords: ['Guaki', 'Directorio de servicios', 'Proveedores Colombia', 'Proveedores Venezuela', 'Veterinaria Medellín', 'Odontología Bogotá', 'Negocios verificados Caracas'],
  authors: [{ name: 'Guaki Team' }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Guaki — Directorio Inteligente & Servicios Verificados',
    description: 'Encuentra y contacta directamente con negocios y profesionales verificados en Colombia y Venezuela.',
    url: SITE_URL,
    siteName: 'Guaki',
    locale: 'es_CO',
    type: 'website',
    images: [
      {
        url: '/api/og?title=Guaki%20Directorio%20Inteligente&category=Servicios%20Verificados&city=Colombia%20y%20Venezuela',
        width: 1200,
        height: 630,
        alt: 'Guaki Directorio Inteligente Colombia y Venezuela',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guaki — Directorio Inteligente & Servicios Verificados',
    description: 'Encuentra y contacta directamente con negocios y profesionales verificados en Colombia y Venezuela.',
    images: ['/api/og?title=Guaki%20Directorio%20Inteligente&category=Servicios%20Verificados&city=Colombia%20y%20Venezuela'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData).replace(/</g, '\\u003c') }}
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥑</text></svg>" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('Guaki SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <DynamicFavicon />
        <AttributionTracker />
        <div className="has-bottom-dock" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <SoftBottomNav />
      </body>
    </html>
  );
}
