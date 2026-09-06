'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { TOKENS } from '../lib/design-tokens';

interface Props {
  images: string[];
  businessName: string;
}

export function ProviderPhotoCarousel({ images, businessName }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  const safeImages =
    images && images.length > 0
      ? images
      : ['/images/veterinaria/hero.jpg', '/images/veterinaria/foto1.jpg', '/images/veterinaria/foto2.jpg'];

  useEffect(() => {
    if (isHovered || safeImages.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, safeImages.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Carousel Frame */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: TOKENS.radii.xl,
          height: 'clamp(260px, 45vw, 420px)',
          backgroundColor: TOKENS.colors.surfaceInset,
          border: `1px solid ${TOKENS.colors.borderLight}`,
          boxShadow: TOKENS.shadows.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Sliding Image Track (GPU Accelerated, 0% CLS) */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {safeImages.map((src, idx) => (
            <div
              key={idx}
              style={{
                flex: '0 0 100%',
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: 'zoom-in',
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <Image
                src={src}
                alt={`Fotografía ${idx + 1} de ${businessName}`}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        {/* Previous Button */}
        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Foto anterior"
            className="soft-btn"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(232, 237, 232, 0.88)',
              backdropFilter: 'blur(10px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 10,
              boxShadow: TOKENS.shadows.glass,
            }}
          >
            <ChevronLeft size={20} color={TOKENS.colors.emeraldDark} />
          </button>
        )}

        {/* Next Button */}
        {safeImages.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Siguiente foto"
            className="soft-btn"
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '44px',
              height: '44px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(232, 237, 232, 0.88)',
              backdropFilter: 'blur(10px)',
              display: 'grid',
              placeItems: 'center',
              zIndex: 10,
              boxShadow: TOKENS.shadows.glass,
            }}
          >
            <ChevronRight size={20} color={TOKENS.colors.emeraldDark} />
          </button>
        )}

        {/* Counter Pill */}
        {safeImages.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: 'rgba(22, 35, 29, 0.75)',
              backdropFilter: 'blur(10px)',
              color: TOKENS.colors.white,
              borderRadius: TOKENS.radii.pill,
              padding: '4px 12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              zIndex: 10,
            }}
          >
            <Maximize2 size={12} />
            <span>
              {currentIndex + 1} / {safeImages.length}
            </span>
          </div>
        )}
      </div>

      {/* Mini Thumbnails Strip */}
      {safeImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '12px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
          className="no-scrollbar"
        >
          {safeImages.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              style={{
                position: 'relative',
                width: '64px',
                height: '48px',
                borderRadius: TOKENS.radii.sm,
                overflow: 'hidden',
                border:
                  currentIndex === idx
                    ? `2px solid ${TOKENS.colors.greenPrimary}`
                    : `1px solid ${TOKENS.colors.borderLight}`,
                opacity: currentIndex === idx ? 1 : 0.65,
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
                backgroundColor: TOKENS.colors.surfaceInset,
                transition: `all ${TOKENS.motion.fast} ${TOKENS.motion.ease}`,
              }}
            >
              <Image src={src} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(16, 43, 34, 0.94)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar vista completa"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              width: '44px',
              height: '44px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: TOKENS.colors.white,
              border: 'none',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={22} />
          </button>

          <div
            style={{ position: 'relative', width: '100%', maxWidth: '960px', height: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[currentIndex]}
              alt={`Foto ${currentIndex + 1} de ${businessName}`}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
