'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Sparkles,
  Heart,
  Eye,
} from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import VerifiedBadge from './VerifiedBadge';
import { AficheBusinessData } from '../../lib/demo_afiche';
import { normalizeWhatsAppNumber } from '../../lib/whatsapp';
import { trackEvent } from '../../lib/analytics';

interface AficheCardProps {
  afiche: AficheBusinessData;
  className?: string;
  style?: React.CSSProperties;
  source?: 'directory' | 'search_result' | 'category_page' | 'recent_search' | 'voice_top3';
  previewMode?: boolean;
}

export default function AficheCard({
  afiche,
  className = '',
  style = {},
  source = 'directory',
  previewMode = false,
}: AficheCardProps) {
  const [imgSrc, setImgSrc] = useState(afiche.imageUrl);
  const [imgError, setImgError] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const viewTrackedRef = useRef(false);
  const router = useRouter();
  const whatsappNumber = normalizeWhatsAppNumber(afiche.whatsapp);

  // ♥ Guardar negocio (mismo contrato localStorage que la ficha: guaki_saved_businesses)
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('guaki_saved_businesses') || '[]');
      setIsSaved(saved.includes(afiche.id));
    } catch {}
  }, [afiche.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
    try {
      const saved = JSON.parse(localStorage.getItem('guaki_saved_businesses') || '[]');
      const updated = saved.includes(afiche.id)
        ? saved.filter((id: string) => id !== afiche.id)
        : [...saved, afiche.id];
      localStorage.setItem('guaki_saved_businesses', JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch {}
  };

  // 📊 Vista del afiche (telemetría) + ⚡ prefetch predictivo.
  // El tracking corre para TODOS los planes (incluido gratis); el prefetch solo
  // para planes con ficha.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!viewTrackedRef.current) {
            viewTrackedRef.current = true;
            trackEvent({
              event_name: 'afiche_vista',
              business_id: afiche.id,
              metadata: {
                slug: afiche.slug,
                name: afiche.name,
                plan: afiche.plan,
                city: afiche.city,
                category: afiche.category,
                source,
              },
            });
          }
          if (afiche.slug && afiche.plan !== 'free') {
            router.prefetch(`/proveedores/${afiche.slug}`);
          }
          observer.disconnect();
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [afiche.slug, afiche.plan, afiche.id, afiche.name, afiche.city, afiche.category, source, router]);

  const handleImageError = () => {
    if (!imgError && afiche.fallbackImageUrl) {
      setImgSrc(afiche.fallbackImageUrl);
      setImgError(true);
    }
  };

  return (
    <article
      ref={cardRef}
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
      {/* 🖼️ Cabecera Fotográfica del Negocio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          backgroundColor: TOKENS.colors.surfaceInset,
          overflow: 'hidden',
        }}
      >
        {imgSrc && <Image
          src={imgSrc}
          alt={afiche.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
          style={{ objectFit: 'cover' }}
          onError={handleImageError}
          priority={false}
        />}

        {/* Gradiente sutil para legibilidad de badges */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(22, 35, 29, 0.6) 0%, rgba(22, 35, 29, 0.1) 40%, transparent 80%)',
          }}
        />

        {/* ♥ Guardar / Quitar de guardados (disponible en TODOS los planes) */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={isSaved ? `Quitar ${afiche.name} de guardados` : `Guardar ${afiche.name} en favoritos`}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            backgroundColor: isSaved ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isSaved ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 2px 8px rgba(18, 38, 28, 0.14)',
            color: isSaved ? '#EF4444' : TOKENS.colors.emeraldDark,
            transition: 'transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 160ms ease, border-color 160ms ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.88)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Heart size={15} strokeWidth={isSaved ? 2 : 2.1} fill={isSaved ? '#EF4444' : 'transparent'} color={isSaved ? '#EF4444' : 'currentColor'} />
        </button>

        {/* Badge de Categoría (Pill Redondeado y sin icono, armonizado con Verificado) */}
        <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
          <span
            style={{
              backgroundColor: 'rgba(220, 233, 213, 0.94)',
              backdropFilter: 'blur(10px)',
              borderRadius: TOKENS.radii.pill,
              padding: '4px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              letterSpacing: '0.02em',
            }}
          >
            {afiche.category}
          </span>
        </div>

        {/* Indicador DEMO o Verificado */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
          {afiche.isDemo && (
            <span
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.92)',
                backdropFilter: 'blur(10px)',
                borderRadius: TOKENS.radii.pill,
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                color: TOKENS.colors.white,
                letterSpacing: '0.04em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <Sparkles size={12} />
              <span>CASO DEMO</span>
            </span>
          )}

          {afiche.isVerified === true && <VerifiedBadge plan={afiche.plan} isVerified size="md" />}
        </div>

        {/* Badge de Calificación Flotante y Estado Abierto Ahora */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {typeof afiche.rating === 'number' && <div
            style={{
              backgroundColor: 'rgba(22, 35, 29, 0.88)',
              backdropFilter: 'blur(8px)',
              borderRadius: TOKENS.radii.pill,
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: TOKENS.colors.white,
              fontSize: '0.82rem',
              fontWeight: 800,
            }}
          >
            <Star size={13} fill="#EAB308" color="#EAB308" />
            <span>{afiche.rating.toFixed(1)}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem' }}>
              ({afiche.reviewCount})
            </span>
          </div>}

          {/* Badge en Tiempo Real 🟢 Abierto Ahora (Estilo Google Maps) */}
          {afiche.isOpenNow === true && <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              borderRadius: TOKENS.radii.pill,
              padding: '3px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#15803D',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                boxShadow: '0 0 8px #22C55E',
              }}
            />
            <span>Abierto Ahora</span>
          </div>}
        </div>
      </div>

      {/* 📝 Cuerpo del Afiche Organizado y Centrado */}
      <div
        style={{
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          flex: 1,
          gap: '10px',
        }}
      >
        <div style={{ width: '100%' }}>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              margin: '0 0 4px',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            {afiche.name}
          </h3>
          <p
            style={{
              fontSize: '0.84rem',
              color: TOKENS.colors.textSecondary,
              lineHeight: 1.4,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {afiche.shortDescription}
          </p>
        </div>

        {/* Ubicación y Horario Centrados */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.78rem',
            color: TOKENS.colors.textSecondary,
            width: '100%',
          }}
        >
          {(afiche.city || afiche.address) && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
            <MapPin size={13} color={TOKENS.colors.emeraldDark} style={{ flexShrink: 0 }} />
            {afiche.city && <span style={{ fontWeight: 700, color: TOKENS.colors.textMain }}>{afiche.city}</span>}
            {afiche.address && <span style={{ color: TOKENS.colors.textMuted }}>{afiche.city ? '· ' : ''}{afiche.address}</span>}
          </div>}

          {afiche.schedule && <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Clock size={13} color={TOKENS.colors.greenPrimary} style={{ flexShrink: 0 }} />
            <span>{afiche.schedule}</span>
          </div>}
        </div>

        {/* Píldoras de Servicios Centradas */}
        {afiche.services.length > 0 && <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            margin: '2px 0',
            width: '100%',
          }}
        >
          {afiche.services.slice(0, 3).map((serv) => (
            <span
              key={serv}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: TOKENS.colors.emeraldDark,
                backgroundColor: TOKENS.colors.highlight,
                padding: '3px 8px',
                borderRadius: TOKENS.radii.pill,
              }}
            >
              {serv}
            </span>
          ))}
        </div>}

        {/* Botón Principal */}
        <div style={{ marginTop: 'auto', paddingTop: '8px', width: '100%' }}>
          {previewMode ? (
            <div
              aria-disabled="true"
              style={{
                width: '100%',
                borderRadius: TOKENS.radii.pill,
                padding: '12px 18px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: TOKENS.colors.surfaceInset,
                color: TOKENS.colors.textSecondary,
                border: `1px dashed ${TOKENS.colors.borderLight}`,
                textAlign: 'center',
              }}
            >
              <Eye size={16} />
              <span>Vista previa — tu ficha se activa al publicarse</span>
            </div>
          ) : afiche.plan === 'free' && whatsappNumber ? (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${afiche.name}, encontré su negocio en Guaki.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent({
                  event_name: 'whatsapp_clicked',
                  business_id: afiche.id,
                  metadata: {
                    slug: afiche.slug,
                    name: afiche.name,
                    source: 'afiche_card',
                    plan: afiche.plan,
                    destination: 'whatsapp',
                    origin: source,
                  },
                });
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(10);
                }
              }}
              className="neu-btn-primary"
              style={{
                width: '100%',
                borderRadius: TOKENS.radii.pill,
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 900,
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(37, 211, 102, 0.28)',
                textAlign: 'center',
              }}
            >
              <MessageCircle size={17} />
              <span>Chatear por WhatsApp</span>
            </a>
          ) : afiche.isDemo ? (
            <Link
              href={`/proveedores/${afiche.slug}`}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(10);
                }
              }}
              className="neu-btn-primary"
              style={{
                width: '100%',
                borderRadius: TOKENS.radii.pill,
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 900,
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                boxShadow: '0 6px 18px rgba(23, 56, 45, 0.28)',
                textAlign: 'center',
              }}
            >
              <span>Ver Ficha Demo</span>
            </Link>
          ) : (
            <Link
              href={`/proveedores/${afiche.slug}`}
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(10);
                }
                if (source === 'search_result') {
                  trackEvent({
                    event_name: 'search_result_clicked',
                    business_id: afiche.id,
                    metadata: {
                      slug: afiche.slug,
                      name: afiche.name,
                      source: 'afiche_card_from_search',
                      destination: `/proveedores/${afiche.slug}`,
                    },
                  });
                }
              }}
              className="neu-btn-primary"
              style={{
                width: '100%',
                borderRadius: TOKENS.radii.pill,
                padding: '12px 18px',
                fontSize: '0.9rem',
                fontWeight: 900,
                letterSpacing: '-0.01em',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                boxShadow: '0 6px 18px rgba(23, 56, 45, 0.28), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
                textAlign: 'center',
              }}
            >
              <span>Ver Ficha Completa</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
