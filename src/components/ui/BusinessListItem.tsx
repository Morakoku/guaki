'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, CheckCircle2, Star, MessageCircle, ArrowRight } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import { AficheBusinessData } from '../../lib/demo_afiche';
import { normalizeWhatsAppNumber } from '../../lib/whatsapp';

interface BusinessListItemProps {
  business: AficheBusinessData;
  className?: string;
  style?: React.CSSProperties;
}

export default function BusinessListItem({
  business,
  className = '',
  style = {},
}: BusinessListItemProps) {
  const [imgSrc, setImgSrc] = useState(business.imageUrl);
  const [imgError, setImgError] = useState(false);

  const fallback = business.fallbackImageUrl;

  const handleImageError = () => {
    if (!imgError && fallback) {
      setImgSrc(fallback);
      setImgError(true);
    }
  };

  const whatsappNumber = normalizeWhatsAppNumber(business.whatsapp);
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola ${business.name}, vi su información en GUAKI y deseo consultar sus servicios.`
      )}`
    : '';

  return (
    <article
      className={`soft-card ${className}`}
      style={{
        borderRadius: TOKENS.radii.xl,
        padding: '16px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '18px',
        backgroundColor: TOKENS.colors.surface,
        border: `1px solid ${TOKENS.colors.borderLight}`,
        boxShadow: TOKENS.shadows.card,
        transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* 🖼️ Foto Thumbnail */}
      {imgSrc && <div
        style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          borderRadius: TOKENS.radii.lg,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: TOKENS.colors.surfaceInset,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Image
          src={imgSrc}
          alt={business.name}
          fill
          sizes="96px"
          style={{ objectFit: 'cover' }}
          onError={handleImageError}
        />
      </div>}

      {/* 📋 Información Principal */}
      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
          <span
            style={{
              backgroundColor: 'rgba(220, 233, 213, 0.94)',
              borderRadius: TOKENS.radii.pill,
              padding: '3px 10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
            }}
          >
            {business.category}
          </span>

          {business.isVerified === true && (
            <span
              style={{
                backgroundColor: 'rgba(248, 250, 247, 0.92)',
                borderRadius: TOKENS.radii.pill,
                padding: '3px 9px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: TOKENS.colors.emeraldDark,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <CheckCircle2 size={12} color={TOKENS.colors.greenPrimary} />
              <span>Verificado</span>
            </span>
          )}

          {typeof business.rating === 'number' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '0.74rem',
                fontWeight: 800,
                color: TOKENS.colors.textMain,
                backgroundColor: TOKENS.colors.surfaceElevated,
                padding: '3px 8px',
                borderRadius: TOKENS.radii.pill,
              }}
            >
              <Star size={12} fill="#EAB308" color="#EAB308" />
              <span>{business.rating.toFixed(1)}</span>
              {business.reviewCount && <span style={{ color: TOKENS.colors.textSecondary, fontWeight: 500 }}>({business.reviewCount})</span>}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: '0 0 4px', lineHeight: 1.3 }}>
          {business.name}
        </h3>

        {business.shortDescription && (
          <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: '0 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {business.shortDescription}
          </p>
        )}

        {(business.city || business.address) && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>
            <MapPin size={13} color={TOKENS.colors.greenPrimary} />
            <span>{business.city}{business.address ? `${business.city ? ' · ' : ''}${business.address}` : ''}</span>
          </span>
        </div>}
      </div>

      {/* 🚀 Botones de Acción */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        {whatsappUrl && <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Contactar por WhatsApp"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: '#25D366',
            color: '#FFFFFF',
            display: 'grid',
            placeItems: 'center',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={18} />
        </a>}

        <Link
          href={`/proveedores/${business.slug}`}
          className="neu-btn-primary"
          style={{
            borderRadius: TOKENS.radii.pill,
            padding: '10px 18px',
            fontSize: '0.84rem',
            fontWeight: 800,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: TOKENS.colors.emeraldDark,
            color: TOKENS.colors.white,
            boxShadow: TOKENS.shadows.btnPrimary,
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <span>Ver Ficha</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
