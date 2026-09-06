'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';

interface StickyWhatsAppBarProps {
  businessName: string;
  rating: number;
  whatsappUrl: string;
}

export default function StickyWhatsAppBar({
  businessName,
  rating,
  whatsappUrl,
}: StickyWhatsAppBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsVisible(window.scrollY > 340);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Acceso directo a WhatsApp"
      style={{
        position: 'fixed',
        bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99990,
        width: 'calc(100% - 28px)',
        maxWidth: '430px',
        backgroundColor: 'rgba(23, 56, 45, 0.94)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderRadius: TOKENS.radii.pill,
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 12px 32px rgba(18, 38, 28, 0.32), 0 2px 6px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        animation: 'guaki-fade-in 220ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: '4px' }}>
        <span
          style={{
            fontSize: '0.84rem',
            fontWeight: 800,
            color: '#FFFFFF',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '180px',
          }}
        >
          {businessName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={12} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: '0.72rem', color: '#D1FAE5', fontWeight: 700 }}>
            {rating.toFixed(1)} · Verificado
          </span>
        </div>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(12);
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          backgroundColor: '#22C55E',
          color: '#FFFFFF',
          fontSize: '0.82rem',
          fontWeight: 900,
          textDecoration: 'none',
          borderRadius: TOKENS.radii.pill,
          boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
          transition: 'transform 140ms cubic-bezier(0.23, 1, 0.32, 1)',
          whiteSpace: 'nowrap',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <MessageCircle size={15} /> WhatsApp
      </a>
    </aside>
  );
}
