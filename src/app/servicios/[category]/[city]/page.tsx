import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { getPublishedProviders } from '@/lib/published_providers';
import { TOKENS } from '@/lib/design-tokens';
import SoftCard from '@/components/ui/SoftCard';
import SoftBadge from '@/components/ui/SoftBadge';
import BusinessCard from '@/components/ui/BusinessCard';
import { absoluteUrl, slugify } from '@/lib/site';

interface Props {
  params: {
    category: string;
    city: string;
  };
}

// Diccionario de tildes para slugs de ciudades y categorías de Guaki.
// El slug pierde tildes (slugify), así que restituimos la escritura correcta.
const WORD_FIXES: Record<string, string> = {
  medellin: 'Medellín',
  bogota: 'Bogotá',
  cali: 'Cali',
  soacha: 'Soacha',
  barranquilla: 'Barranquilla',
  bucaramanga: 'Bucaramanga',
  cartagena: 'Cartagena',
  pereira: 'Pereira',
  manizales: 'Manizales',
  odontologia: 'Odontología',
  estetica: 'Estética',
  barberias: 'Barberías',
  peluquerias: 'Peluquerías',
  mecanica: 'Mecánica',
  laser: 'Láser',
  gastronomia: 'Gastronomía',
  tecnicos: 'Técnicos',
  logistica: 'Logística',
  distribucion: 'Distribución',
  educacion: 'Educación',
  asesoria: 'Asesoría',
  tecnologia: 'Tecnología',
  energia: 'Energía',
  psicologia: 'Psicología',
  juridica: 'Jurídica',
  diseno: 'Diseño',
};
const LOWERCASE_WORDS = new Set(['y', 'de', 'en', 'la', 'las', 'los', 'el', 'del', 'para']);

function label(slug: string) {
  const words = decodeURIComponent(slug).replace(/-/g, ' ').toLowerCase().trim().split(/\s+/);
  return words
    .map((word, index) => {
      const fixed = WORD_FIXES[word];
      if (fixed) return fixed;
      if (index > 0 && LOWERCASE_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

async function providersFor(params: Props['params']) {
  const category = normalizeText(label(params.category));
  const city = normalizeText(label(params.city));
  const providers = await getPublishedProviders();
  return providers.filter(
    (provider) =>
      normalizeText(provider.category) === category &&
      normalizeText(provider.city) === city,
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categoryFormatted = label(params.category);
  const cityFormatted = label(params.city);
  const providers = await providersFor(params);
  if (!providers.length) {
    return {
      title: `${categoryFormatted} en ${cityFormatted} — Guaki`,
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${categoryFormatted} en ${cityFormatted} — Guaki`,
    description: `Encuentra y contacta directamente por WhatsApp a especialistas de ${categoryFormatted} verificados en ${cityFormatted}.`,
    alternates: {
      canonical: absoluteUrl(`/servicios/${slugify(categoryFormatted)}/${slugify(cityFormatted)}`),
    },
    openGraph: {
      title: `${categoryFormatted} en ${cityFormatted} — Guaki`,
      description: `Encuentra especialistas verificados de ${categoryFormatted} en ${cityFormatted}.`,
      url: absoluteUrl(`/servicios/${slugify(categoryFormatted)}/${slugify(cityFormatted)}`),
      type: 'website',
    },
  };
}

export default async function SeoCategoryCityPage({ params }: Props) {
  const providers = await providersFor(params);
  if (!providers.length) notFound();

  const categoryFormatted = label(params.category);
  const cityFormatted = label(params.city);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Servicios de ${categoryFormatted} en ${cityFormatted}`,
    itemListElement: providers.map((provider, position) => ({
      '@type': 'ListItem',
      position: position + 1,
       url: absoluteUrl(`/proveedores/${provider.slug}`),
      name: provider.name,
    })),
  };

  return (
    <div
      className="page-fade-in"
      style={{
        backgroundColor: TOKENS.colors.bgMain,
        color: TOKENS.colors.textMain,
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Minimalist Editorial Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: 'rgba(231, 236, 231, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${TOKENS.colors.borderSubtle}`,
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: TOKENS.colors.textMain,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: TOKENS.radii.sm,
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
              }}
            >
              G
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>
              guaki<span style={{ color: TOKENS.colors.greenPrimary }}>.</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem', fontWeight: 700 }}>
            <Link href="/directorio" style={{ color: TOKENS.colors.textMain }}>
              Directorio
            </Link>
            <Link href="/nosotros" style={{ color: TOKENS.colors.textSecondary }}>
              Nosotros
            </Link>
            <Link
              href="/provider/dashboard?action=new"
              className="soft-btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderRadius: TOKENS.radii.pill,
              }}
            >
              + Mi Negocio
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* Breadcrumbs */}
        <nav aria-label="Ruta de navegación" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: TOKENS.colors.textSecondary }}>
          <Link href="/" style={{ color: TOKENS.colors.textSecondary, textDecoration: 'none', fontWeight: 600 }}>Inicio</Link>
          <span>/</span>
          <Link href="/directorio" style={{ color: TOKENS.colors.textSecondary, textDecoration: 'none', fontWeight: 600 }}>Directorio</Link>
          <span>/</span>
          <span style={{ color: TOKENS.colors.emeraldDark, textTransform: 'capitalize', fontWeight: 800 }}>
            {categoryFormatted} en {cityFormatted}
          </span>
        </nav>

        {/* Category Hero Header */}
        <SoftCard style={{ padding: '36px 32px', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', gap: '8px', marginBottom: '14px' }}>
            <SoftBadge tone="emerald">Directorio Verificado</SoftBadge>
            <SoftBadge tone="sage">{cityFormatted}</SoftBadge>
          </div>
          <h1 style={{ fontSize: '2.4rem', color: TOKENS.colors.textMain, fontWeight: 900, marginBottom: '8px', textTransform: 'capitalize', letterSpacing: '-0.03em' }}>
            {categoryFormatted} en {cityFormatted}
          </h1>
          <p style={{ fontSize: '1rem', color: TOKENS.colors.textSecondary, maxWidth: '640px', margin: 0 }}>
            Negocios y especialistas verificados en {cityFormatted}. Contacta directamente por WhatsApp o llamada sin intermediarios.
          </p>
        </SoftCard>

        {/* Providers Grid */}
        <section aria-labelledby="resultados-heading">
          <h2
            id="resultados-heading"
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: TOKENS.colors.textMain,
              margin: '0 0 18px',
              letterSpacing: '-0.01em',
            }}
          >
            {providers.length > 0
              ? `${providers.length} ${providers.length === 1 ? 'negocio publicado' : 'negocios publicados'} en ${cityFormatted}`
              : `Negocios en ${cityFormatted}`}
          </h2>

          {providers.length === 0 ? (
            <div
              style={{
                padding: '44px 24px',
                textAlign: 'center',
                borderRadius: TOKENS.radii.lg,
                backgroundColor: TOKENS.colors.surfaceElevated,
                border: `1px dashed ${TOKENS.colors.borderLight}`,
              }}
            >
              <p style={{ fontSize: '0.95rem', color: TOKENS.colors.textSecondary, margin: '0 0 14px' }}>
                Aún no hay negocios publicados en esta categoría y ciudad. Muy pronto verás fichas aquí.
              </p>
              <Link
                href="/directorio"
                className="soft-btn-primary"
                style={{
                  display: 'inline-flex',
                  padding: '10px 20px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  borderRadius: TOKENS.radii.pill,
                }}
              >
                Explorar todo el Directorio
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {providers.map((provider) => (
                <BusinessCard key={provider.id} business={provider} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
