'use client';

import React, { useState } from 'react';
import { NM_PEARL } from '@/lib/neumorphism-styles';

interface Props {
  businessName: string;
}

export function ProviderShareButton({ businessName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const shareData = {
      title: `${businessName} en Guaki`,
      text: `Te comparto la ficha verificada de ${businessName} en Guaki Marketplace.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or fallback
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      style={{
        ...NM_PEARL.buttonConvex,
        padding: '10px 18px',
        color: copied ? '#059669' : '#0F172A',
        fontSize: '0.84rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
      title="Compartir ficha de negocio"
    >
      <span>{copied ? '✔' : '🔗'}</span>
      <span>{copied ? '¡Enlace copiado!' : 'Compartir perfil'}</span>
    </button>
  );
}
