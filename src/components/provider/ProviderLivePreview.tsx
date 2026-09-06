'use client';

import React from 'react';
import { TOKENS } from '@/lib/design-tokens';
import AficheCard from '@/components/ui/AficheCard';
import { AficheBusinessData } from '@/lib/demo_afiche';

export interface ProviderPreviewData {
  id?: string;
  slug?: string;
  name: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  phone: string;
  description: string;
  services: string[];
  scheduleText: string;
  plan: string;
  imageUrl?: string;
}

export default function ProviderLivePreview({ data }: { data: ProviderPreviewData }) {
  const isFreePlan = data.plan === 'gratis' || data.plan === 'free';
  const categoryLower = (data.category || '').toLowerCase();

  const categoryImage =
    data.imageUrl ||
    (categoryLower.includes('odont')
      ? '/images/dental/hero.jpg'
      : categoryLower.includes('bell') || categoryLower.includes('spa') || categoryLower.includes('peluq') || categoryLower.includes('barb')
      ? '/images/belleza/hero.jpg'
      : categoryLower.includes('salud') || categoryLower.includes('médic')
      ? '/images/salud/hero.jpg'
      : categoryLower.includes('rest') || categoryLower.includes('gastro')
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
      : '/images/veterinaria/hero.jpg');

  const aficheObj: AficheBusinessData = {
    id: data.id || 'preview-live',
    slug: data.slug || 'mi-negocio',
    name: data.name.trim() || 'Nombre de tu Negocio',
    rating: 0,
    reviewCount: 0,
    category: data.category || '',
    categoryIcon: categoryLower.includes('vet') ? '🐾' : '🏪',
    description: data.description.trim(),
    shortDescription: data.description.trim(),
    city: data.city || '',
    address: data.address.trim(),
    schedule: data.scheduleText.trim(),
    phone: data.phone.trim() || data.whatsapp.trim(),
    whatsapp: data.whatsapp.trim(),
    services: data.services || [],
    imageUrl: categoryImage,
    fallbackImageUrl: categoryImage,
    isVerified: false,
    isDemo: false,
    isOpenNow: false,
    plan: data.plan as any,
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto',
      }}
    >
      {/* Indicador superior del Simulador */}
      <div
        style={{
          backgroundColor: TOKENS.colors.emeraldDark,
          color: TOKENS.colors.white,
          padding: '8px 16px',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.04em',
        }}
      >
        <span>🥑 VISTA REAL EN EL DIRECTORIO</span>
        <span
          style={{
            backgroundColor: isFreePlan ? 'rgba(255,255,255,0.2)' : data.plan === 'vip' ? '#D97706' : '#15803D',
            padding: '2px 8px',
            borderRadius: TOKENS.radii.pill,
          }}
        >
          {data.plan === 'vip' ? '👑 VIP ELITE' : data.plan === 'verificado' || data.plan === 'pro' ? '✓ VERIFICADO' : 'PLAN ESENCIAL'}
        </span>
      </div>

      {/* Renderizado idéntico del Afiche Oficial de Guaki */}
      <div
        style={{
          borderRadius: '0 0 28px 28px',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        <AficheCard afiche={aficheObj} />
      </div>
    </div>
  );
}
