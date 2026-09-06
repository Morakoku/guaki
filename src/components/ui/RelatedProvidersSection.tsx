'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MessageCircle, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface RelatedProviderItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  whatsapp?: string;
  plan?: string;
  isVerified?: boolean;
}

interface RelatedProvidersSectionProps {
  currentCategory: string;
  currentCity: string;
  currentSlug: string;
  relatedProviders?: RelatedProviderItem[];
}

export default function RelatedProvidersSection({
  currentCategory,
  currentCity,
  currentSlug,
  relatedProviders = [],
}: RelatedProvidersSectionProps) {
  const relatedItems = relatedProviders.filter((item) => item.slug !== currentSlug);

  if (relatedItems.length === 0) return null;

  return (
    <section
      className="neu-level-2"
      style={{
        marginTop: '32px',
        padding: '24px 20px',
        borderRadius: TOKENS.radii.xl,
        backgroundColor: TOKENS.colors.surfaceElevated,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color={TOKENS.colors.emeraldDark} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
            Comercios & Especialistas Relacionados
          </h3>
        </div>
        <Link
          href={`/servicios/${currentCategory.toLowerCase().replace(/\s+/g, '-')}/${currentCity.toLowerCase().replace(/\s+/g, '-')}`}
          style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: TOKENS.colors.emeraldDark,
            textDecoration: 'none',
          }}
        >
          Ver más en {currentCity} →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {relatedItems.map((item) => {
          const whatsappNumber = normalizeWhatsAppNumber(item.whatsapp);

          return (
          <div
            key={item.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: TOKENS.radii.lg,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                  {item.category}
                </span>
                <VerifiedBadge plan={item.plan} isVerified={item.isVerified ?? false} size="sm" />
              </div>

              <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                {item.name}
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: TOKENS.colors.textSecondary, marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#D97706', fontWeight: 800 }}>
                  <Star size={13} fill="#D97706" /> {item.rating}
                </div>
                <span>·</span>
                <span>{item.reviewCount} opiniones</span>
                <span>·</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <MapPin size={12} /> {item.city}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href={`/proveedores/${item.slug}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '7px',
                  backgroundColor: TOKENS.colors.surfaceInset,
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: TOKENS.colors.emeraldDark,
                  textDecoration: 'none',
                }}
              >
                Ver Afiche
              </Link>
              {whatsappNumber && <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${item.name}, encontré su perfil recomendado en Guaki.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 12px',
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={13} /> WhatsApp
              </a>}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}
