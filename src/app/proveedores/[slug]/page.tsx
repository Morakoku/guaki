import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  Star,
  Clock,
  Globe,
  Share2,
  Calendar,
  Sparkles,
  ShieldCheck,
  Navigation,
  Award,
} from 'lucide-react';
import { getPublishedProviderBySlug } from '@/lib/published_providers';
import { BusinessStore } from '@/lib/business_store';
import { GuakiDataService } from '@/lib/supabase';
import { ProviderShareButton } from '@/components/ProviderShareButton';
import SaveBusinessButton from '@/components/ui/SaveBusinessButton';
import { ProviderReviewForm } from '@/components/ProviderReviewForm';
import { ProviderPhotoCarousel } from '@/components/ProviderPhotoCarousel';
import ProviderServicesView from '@/components/ui/ProviderServicesView';
import ProviderFAQSection from '@/components/ui/ProviderFAQSection';
import DynamicScheduleView from '@/components/ui/DynamicScheduleView';
import GuakiHeader from '@/components/ui/GuakiHeader';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import ProviderReviewsAccordion from '@/components/ProviderReviewsAccordion';
import { TOKENS } from '@/lib/design-tokens';
import { absoluteUrl, slugify } from '@/lib/site';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { buildProviderFaqs, buildOpeningHoursSpecification } from '@/lib/provider_faq';

interface Props {
  params: Promise<{ slug: string }>;
}

// Public profiles are backed by the live published directory; never cache a stale slug lookup.
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const provider = await getPublishedProviderBySlug(params.slug);
  if (!provider) {
    return {
      title: 'Proveedor — Guaki',
      robots: { index: false, follow: false },
    };
  }
  const pageTitle = `${provider.name} — ${provider.category} en ${provider.city} | Guaki`;
  const pageDesc = provider.description ?? `${provider.category} en ${provider.city}. Información pública del directorio Guaki.`;
  const pageUrl = absoluteUrl(`/proveedores/${provider.slug}`);
  const ogImg = `/api/og?title=${encodeURIComponent(provider.name)}&category=${encodeURIComponent(
    provider.category
  )}&city=${encodeURIComponent(provider.city)}`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      type: 'profile',
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: `${provider.name} en Guaki`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImg],
    },
  };
}

export default async function ProviderProfilePage(props: Props) {
  const params = await props.params;
  const provider = await getPublishedProviderBySlug(params.slug);
  if (!provider) notFound();

  const fullDetails = GuakiDataService.isConfigured()
    ? await GuakiDataService.getBusinessById(provider.id)
    : BusinessStore.getBySlug(params.slug);

  const pageUrl = absoluteUrl(`/proveedores/${provider.slug}`);
  const categoryUrl = absoluteUrl(`/servicios/${slugify(provider.category)}/${slugify(provider.city)}`);
  const localBusiness: Record<string, unknown> = {
    '@type': 'LocalBusiness',
    '@id': `${pageUrl}#business`,
    name: provider.name,
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      ...(provider.address ? { streetAddress: provider.address } : {}),
      addressLocality: provider.city,
      addressCountry: 'CO',
    },
    ...(provider.description ? { description: provider.description } : {}),
    ...(provider.phone ? { telephone: provider.phone } : {}),
  };
  if (provider.rating !== null && provider.rating !== undefined && provider.review_count && provider.review_count > 0) {
    localBusiness.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: provider.rating,
      reviewCount: provider.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  const schedule = fullDetails?.schedule ?? [];

  const rawServices = fullDetails?.services ?? [];

  const services = rawServices.map((item: any) => {
    if (typeof item === 'string') {
      return {
        name: item,
        price: '',
        description: '',
      };
    }
    return {
      name: item.name || '',
      price: item.price || '',
      description: item.description || '',
    };
  });

  const rawPhone = fullDetails?.phone || provider.phone || '';
  const rawWhatsapp = fullDetails?.whatsapp || provider.whatsapp || '';

  const cleanWhatsapp = normalizeWhatsAppNumber(rawWhatsapp) ?? '';
  const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');

  const rating = fullDetails?.rating ?? provider.rating ?? null;
  const reviewsCount = fullDetails?.reviewCount ?? provider.review_count ?? 0;
  const address = fullDetails?.address || provider.address || '';
  // H-03 FIX: Verification badge must depend on actual audit approval, not payment plan.
  const isVerified = Boolean(fullDetails?.approvedAt || fullDetails?.isVerified);

  const rawWebsite = fullDetails?.website || (provider as any).website || '';
  const websiteUrl = rawWebsite ? (rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`) : null;
  const mapSearchQuery = encodeURIComponent(`${provider.name}, ${address}, ${provider.city}, Colombia`);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  const smartMessage = encodeURIComponent(
    `Hola ${provider.name}, encontré su perfil en Guaki y me gustaría consultar sobre sus servicios y agendamiento.`
  );
  const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}?text=${smartMessage}` : '';
  const providerImages = Array.isArray(fullDetails?.images)
    ? fullDetails.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];
  const coverImage = fullDetails?.heroImage || providerImages[0] || fullDetails?.logoUrl || null;
  const logoImage = fullDetails?.logoUrl || providerImages[1] || coverImage;

  const reviewsList = fullDetails?.reviews ?? [];

  // SEO: enriquecer la ficha con imagen, horarios parseados, mapa y FAQPage
  if (coverImage) {
    localBusiness.image = [/^https?:\/\//.test(coverImage) ? coverImage : absoluteUrl(coverImage)];
  }
  if (googleMapsUrl) {
    localBusiness.hasMap = googleMapsUrl;
  }
  const openingHoursSpecs = buildOpeningHoursSpecification(schedule as Array<{ day?: string; hours?: string }>);
  if (openingHoursSpecs.length > 0) {
    localBusiness.openingHoursSpecification = openingHoursSpecs;
  }

  const faqs = buildProviderFaqs({ businessName: provider.name, city: provider.city, phone: rawPhone });
  const faqJsonLd = faqs.length > 0
    ? {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      localBusiness,
      faqJsonLd,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Directorio',
            item: absoluteUrl('/directorio'),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: provider.category,
            item: categoryUrl,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: provider.name,
            item: pageUrl,
          },
        ],
      },
    ].filter(Boolean),
  };

  return (
    <div className="page-fade-in" style={{ backgroundColor: 'transparent', color: TOKENS.colors.textMain, minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <GuakiHeader />

      {/* ── CONTENIDO PRINCIPAL CENTRADO ── */}
      <main className="guaki-container" style={{ paddingTop: '16px', paddingBottom: '60px', maxWidth: '860px', margin: '0 auto' }}>
        
        {/* Barra Superior de Ficha (Retorno a Directorio y Acciones) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/directorio"
            className="neu-level-3"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: TOKENS.colors.emeraldDark,
              textDecoration: 'none',
              borderRadius: TOKENS.radii.pill,
            }}
          >
            ← Directorio
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SaveBusinessButton
              businessId={fullDetails?.id || provider.id || params.slug}
              businessName={provider.name}
            />
            <ProviderShareButton businessName={provider.name} />
          </div>
        </div>

        {/* ── 2. HERO PRINCIPAL DE FICHA ── */}
        <section
          className="neu-level-2"
          style={{
            overflow: 'hidden',
            marginBottom: '24px',
            position: 'relative',
            borderRadius: '28px',
          }}
        >
          {/* Portada con Imagen HD */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 'clamp(200px, 35vw, 320px)',
              backgroundColor: TOKENS.colors.surfaceElevated,
            }}
          >
            {coverImage ? <Image
              src={coverImage}
              alt={provider.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              style={{ objectFit: 'cover' }}
            /> : (
              <div aria-label="Sin fotos publicadas todavía" style={{ height: '100%', display: 'grid', placeItems: 'center', color: TOKENS.colors.textMuted, fontWeight: 700 }}>
                Sin fotos publicadas todavía
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(22, 35, 29, 0.75) 0%, rgba(22, 35, 29, 0.1) 60%, transparent 100%)',
              }}
            />

            {/* Badges Flotantes sobre portada (Follows legal rule: Free has NO badge) */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
              }}
            >
              {/* Verificado por Guaki (Follows legal rule: Free has NO badge) */}
              <VerifiedBadge
                plan={fullDetails?.plan || (provider as any).plan || null}
                isVerified={isVerified}
                size="lg"
              />
            </div>
          </div>

          {/* Cuerpo Informativo del Hero (Centrado y Simétrico) */}
          <div style={{ padding: '24px 20px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* 📷 FOTO / LOGO REAL DEL PROVEEDOR (CENTRADO) */}
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '22px',
                overflow: 'hidden',
                backgroundColor: TOKENS.colors.surfaceElevated,
                boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
                border: `3px solid ${TOKENS.colors.white}`,
                marginTop: '-48px',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 2,
                flexShrink: 0,
              }}
            >
              {logoImage ? <Image
                src={logoImage}
                alt={provider.name}
                fill
                sizes="78px"
                style={{ objectFit: 'cover' }}
              /> : <span aria-label="Sin logo publicado">{provider.name.charAt(0)}</span>}
            </div>

            {/* Badges de Categoría y Estado Abierto */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: TOKENS.colors.highlight,
                  color: TOKENS.colors.emeraldDark,
                  padding: '4px 12px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.76rem',
                  fontWeight: 700,
                }}
              >
                {provider.category}
              </span>

            </div>

            {/* Nombre del Negocio Centrado */}
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                fontWeight: 900,
                color: TOKENS.colors.textMain,
                marginBottom: '8px',
                letterSpacing: '-0.025em',
                textAlign: 'center',
              }}
            >
              {provider.name}
            </h1>

            {/* Dirección Centrada */}
            <p
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.9rem',
                color: TOKENS.colors.textSecondary,
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <MapPin size={16} color={TOKENS.colors.emeraldDark} /> {address || 'Sin datos todavía'}
            </p>

            {/* ── 3. BOTONES DE CONTACTO SIMÉTRICOS Y BALANCEADOS ── */}
            <div
              style={{
                marginTop: '22px',
                display: 'grid',
                gridTemplateColumns: cleanPhone ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
                gap: '12px',
                width: '100%',
                maxWidth: '560px',
                margin: '22px auto 0',
                alignItems: 'stretch',
              }}
            >
              {whatsappUrl && <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  textDecoration: 'none',
                  width: '100%',
                  borderRadius: TOKENS.radii.pill,
                  textAlign: 'center',
                }}
              >
                <MessageCircle size={19} /> Hablar por WhatsApp
              </a>}

              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="neu-level-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 20px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: TOKENS.colors.textMain,
                    textDecoration: 'none',
                    width: '100%',
                    borderRadius: TOKENS.radii.pill,
                    textAlign: 'center',
                    backgroundColor: TOKENS.colors.surfaceElevated,
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                  }}
                >
                  <Phone size={18} color={TOKENS.colors.emeraldDark} /> Llamar Directo
                </a>
              )}

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neu-level-3"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    gridColumn: cleanPhone ? '1 / -1' : undefined,
                    justifySelf: 'center',
                    padding: '14px 20px',
                    fontSize: '0.96rem',
                    fontWeight: 700,
                    color: TOKENS.colors.textMain,
                    textDecoration: 'none',
                    width: '100%',
                    maxWidth: cleanPhone ? '280px' : undefined,
                    borderRadius: TOKENS.radii.pill,
                    textAlign: 'center',
                    backgroundColor: TOKENS.colors.surfaceElevated,
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    boxShadow: TOKENS.shadows.btnConvex,
                  }}
                >
                  <Globe size={18} color={TOKENS.colors.emeraldDark} /> Visitar Página Web
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── 4. MÉTRICAS RÁPIDAS & ACCIONES (OPINIONES & UBICACIÓN GPS) ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px',
            marginBottom: '32px',
            alignItems: 'stretch',
          }}
        >
          {/* Tarjeta de Opiniones con Botón de Ver Opiniones estilo GPS */}
          <div
            className="neu-level-2"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              borderRadius: TOKENS.radii.lg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: TOKENS.colors.surfaceElevated,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: TOKENS.shadows.btnConvex,
                  flexShrink: 0,
                }}
              >
                <Star size={20} color="#D97706" fill="#D97706" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                  {rating !== null ? `${rating.toFixed(1)} / 5.0 ⭐` : 'Sin datos todavía'}
                </div>
                <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary, marginTop: '2px' }}>
                  {reviewsCount > 0 ? `${reviewsCount} opiniones registradas` : 'Sin opiniones todavía'}
                </div>
              </div>
            </div>

            <a
              href="#seccion-opiniones"
              className="neu-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 14px',
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                borderRadius: TOKENS.radii.pill,
                width: '100%',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                boxShadow: TOKENS.shadows.btnPrimary,
                transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              <Star size={13} fill="#FFFFFF" /> {reviewsCount > 0 ? `Ver Opiniones (${reviewsCount})` : 'Sé el primero en opinar'}
            </a>
          </div>

          {/* Tarjeta de Ubicación con Botón Abrir Mapa GPS */}
          <div
            className="neu-level-2"
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              borderRadius: TOKENS.radii.lg,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: TOKENS.colors.surfaceElevated,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: TOKENS.shadows.btnConvex,
                  flexShrink: 0,
                }}
              >
                <MapPin size={18} color={TOKENS.colors.emeraldDark} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                  {provider.city} · Ubicación comercial
                </div>
                <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary, lineHeight: 1.35, marginTop: '2px' }}>
                   {address || 'Dirección no publicada todavía'}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                width: '100%',
              }}
            >
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: TOKENS.colors.emeraldDark,
                  color: TOKENS.colors.white,
                  boxShadow: TOKENS.shadows.btnPrimary,
                  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <Navigation size={13} /> Google Maps
              </a>

            </div>
          </div>
        </section>

        {/* ── 5. GALERÍA DE FOTOS REALES (CENTRADA) ── */}
        {providerImages.length > 0 && <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '14px', textAlign: 'center' }}>
            Fotos de las Instalaciones & Pacientes
          </h2>
          <div className="neu-level-2" style={{ padding: '16px', overflow: 'hidden', borderRadius: TOKENS.radii.lg }}>
            <ProviderPhotoCarousel images={providerImages} businessName={provider.name} />
          </div>
        </section>}

        {/* ── 6. SERVICIOS Y ESPECIALIDADES (INTERACTIVO, CON FILTROS, ACORDEÓN Y GARANTÍA) ── */}
        <ProviderServicesView
          services={services}
          providerName={provider.name}
          cleanWhatsapp={cleanWhatsapp}
          category={provider.category}
        />

        {/* ── 7. HORARIOS DINÁMICOS DE ATENCIÓN (CENTRADA) ── */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '14px', textAlign: 'center' }}>
            Horarios de Atención
          </h2>
          <DynamicScheduleView schedule={schedule} businessName={provider.name} />
        </section>

        {/* ── 8. SOBRE EL NEGOCIO (CENTRADO) ── */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '14px', textAlign: 'center' }}>
            Sobre {provider.name}
          </h2>
          <div className="neu-level-2" style={{ padding: '24px 22px', borderRadius: TOKENS.radii.lg, textAlign: 'center' }}>
            <p style={{ fontSize: '0.94rem', color: TOKENS.colors.textMain, lineHeight: 1.7, margin: '0 auto 16px', maxWidth: '680px', textAlign: 'center' }}>
              {provider.description || `${provider.name} está preparando su presentación comercial. Contáctale directo por WhatsApp para conocer sus servicios y disponibilidad.`}
            </p>

            {fullDetails?.features && fullDetails.features.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
                {fullDetails.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.84rem',
                      color: TOKENS.colors.emeraldDark,
                      backgroundColor: 'rgba(23, 56, 45, 0.06)',
                      padding: '5px 12px',
                      borderRadius: TOKENS.radii.pill,
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 size={15} color={TOKENS.colors.greenPrimary} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 9. OPINIONES (CENTRADA) ── */}
        <section id="seccion-opiniones" style={{ marginBottom: '32px', scrollMarginTop: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Opiniones
            </h2>
            <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '520px' }}>
              Experiencias reales de clientes y pacientes verificados en la comunidad.
            </p>
          </div>

          <div
            className="neu-level-2"
            style={{
              padding: '24px 20px',
              borderRadius: TOKENS.radii.lg,
              backgroundColor: TOKENS.colors.surfaceElevated,
            }}
          >
            {/* Listado de Opiniones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
              {reviewsList.length === 0 ? (
                <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textMuted, textAlign: 'center', margin: '14px 0' }}>
                  Sé el primero en dejar una opinión verificada sobre este comercio.
                </p>
              ) : (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: TOKENS.radii.md,
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: TOKENS.colors.textMain, fontSize: '0.92rem' }}>
                          {rev.authorName}
                        </span>
                        {rev.verified && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              color: '#15803D',
                              fontWeight: 700,
                              backgroundColor: 'rgba(21, 128, 61, 0.1)',
                              padding: '2px 8px',
                              borderRadius: TOKENS.radii.pill,
                            }}
                          >
                            ✓ Visita Verificada
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#D97706" color="#D97706" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: 0, lineHeight: 1.55 }}>
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Formulario para Dejar Opinión */}
            <div style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '18px' }}>
              <ProviderReviewForm
                businessId={fullDetails?.id || provider.id || 'GKI-0001290'}
                businessName={provider.name}
              />
            </div>
          </div>
        </section>

        {/* ❓ 10. PREGUNTAS FRECUENTES (FAQ) */}
        <ProviderFAQSection
          businessName={provider.name}
          category={provider.category}
          city={provider.city}
          phone={rawPhone}
        />

        {/* 🛡️ 11. TARJETA DE CONFIANZA & GARANTÍA AUDITADA (CENTRADA) */}
        <section
          className="neu-level-2"
          style={{
            padding: '22px 24px',
            borderRadius: TOKENS.radii.xl,
            backgroundColor: 'rgba(23, 56, 45, 0.04)',
            border: '1px solid rgba(23, 56, 45, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px',
            flexDirection: 'column',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: '#17382D',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div style={{ maxWidth: '640px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#17382D' }}>
              {isVerified ? '✓ Garantía de Comercio Auditado por Guaki' : '✓ Directorio Comercial Guaki'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: TOKENS.colors.textSecondary, lineHeight: 1.5 }}>
              {isVerified
                ? 'RUT e identidad comercial comprobados · Ubicación física validada · Contacto directo por WhatsApp sin comisiones intermedias.'
                : 'Contacto directo con comercios y profesionales en Colombia sin comisiones intermedias.'}
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
