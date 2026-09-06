import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, CheckCircle2, Star, ArrowUpRight } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import SoftBadge from './SoftBadge';
import VerifiedBadge from './VerifiedBadge';

export interface BusinessCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  featuredImage?: string | null;
  logo?: string | null;
  shortDescription?: string | null;
  phone?: string | null;
  isVerified?: boolean | null;
  plan?: string | null;
}

interface BusinessCardProps {
  business: BusinessCardData;
  className?: string;
  style?: React.CSSProperties;
}

export default function BusinessCard({
  business,
  className = '',
  style = {},
}: BusinessCardProps) {
  const defaultImage =
    business.featuredImage ||
    '/images/veterinaria/hero.jpg';

  return (
    <article
      className={`soft-card ${className}`}
      style={{
        borderRadius: TOKENS.radii.xl,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: TOKENS.colors.surface,
        border: `1px solid ${TOKENS.colors.borderLight}`,
        boxShadow: TOKENS.shadows.card,
        transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Photo Container */}
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: TOKENS.colors.surfaceInset }}>
        <Image
          src={defaultImage}
          alt={business.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
        />
        {/* Soft gradient overlay for contrast */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(22, 35, 29, 0.4) 0%, transparent 60%)',
          }}
        />

        {/* Category Badge */}
        <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
          <SoftBadge tone="highlight">{business.category}</SoftBadge>
        </div>

        {/* Verified / VIP Badge (Follows legal rule: Free has NO badge) */}
        <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
          <VerifiedBadge plan={business.plan} isVerified={business.isVerified} size="md" />
        </div>
      </div>

      {/* Content Body */}
      <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, gap: '10px' }}>
        <div style={{ width: '100%' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: '0 0 6px', textAlign: 'center' }}>
            {business.name}
          </h3>
          {business.shortDescription && (
            <p
              style={{
                fontSize: '0.86rem',
                color: TOKENS.colors.textSecondary,
                lineHeight: 1.45,
                margin: 0,
                textAlign: 'center',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {business.shortDescription}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: 'auto', width: '100%' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: TOKENS.colors.textSecondary }}>
            <MapPin size={14} color={TOKENS.colors.greenPrimary} />
            <span>{business.city}{business.address ? ` · ${business.address}` : ''}</span>
          </span>

          {typeof business.rating === 'number' && business.rating > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
              <Star size={13} fill="#EAB308" color="#EAB308" />
              <span>{business.rating.toFixed(1)}</span>
              {business.reviewCount && <span style={{ color: TOKENS.colors.textMuted }}>({business.reviewCount})</span>}
            </span>
          )}
        </div>

        {/* Single Primary Action */}
        <Link
          href={`/proveedores/${business.slug}`}
          className="neu-btn-primary"
          style={{
            width: '100%',
            borderRadius: TOKENS.radii.pill,
            padding: '12px 18px',
            fontSize: '0.92rem',
            fontWeight: 900,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: TOKENS.colors.emeraldDark,
            color: TOKENS.colors.white,
            boxShadow: '0 6px 18px rgba(23, 56, 45, 0.26), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
            transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1)',
            textAlign: 'center',
            marginTop: '6px',
          }}
        >
          <span>Ver Ficha Completa</span>
        </Link>
      </div>
    </article>
  );
}
