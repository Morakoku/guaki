'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';

interface SaveBusinessButtonProps {
  businessId: string;
  businessName?: string;
}

export default function SaveBusinessButton({
  businessId,
  businessName,
}: SaveBusinessButtonProps) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('guaki_saved_businesses') || '[]');
      setIsSaved(saved.includes(businessId));
    } catch {}
  }, [businessId]);

  const toggleSave = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    try {
      const saved = JSON.parse(localStorage.getItem('guaki_saved_businesses') || '[]');
      let updated: string[];
      if (saved.includes(businessId)) {
        updated = saved.filter((id: string) => id !== businessId);
        setIsSaved(false);
      } else {
        updated = [...saved, businessId];
        setIsSaved(true);
      }
      localStorage.setItem('guaki_saved_businesses', JSON.stringify(updated));
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggleSave}
      aria-label={
        businessName
          ? isSaved
            ? `Quitar ${businessName} de guardados`
            : `Guardar ${businessName} en favoritos`
          : isSaved
            ? 'Quitar de guardados'
            : 'Guardar negocio en favoritos'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 14px',
        backgroundColor: isSaved ? 'rgba(239, 68, 68, 0.1)' : TOKENS.colors.surfaceElevated,
        color: isSaved ? '#EF4444' : TOKENS.colors.textSecondary,
        border: `1px solid ${isSaved ? 'rgba(239, 68, 68, 0.3)' : TOKENS.colors.borderLight}`,
        borderRadius: TOKENS.radii.pill,
        fontSize: '0.78rem',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: TOKENS.shadows.btnConvex,
        transition: 'transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Heart
        size={14}
        fill={isSaved ? '#EF4444' : 'transparent'}
        color={isSaved ? '#EF4444' : 'currentColor'}
      />
      <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
    </button>
  );
}
