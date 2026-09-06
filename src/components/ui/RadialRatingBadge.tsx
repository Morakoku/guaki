'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';

interface RadialRatingBadgeProps {
  rating: number;
  reviewsCount?: number;
  size?: number;
}

export default function RadialRatingBadge({
  rating,
  reviewsCount,
  size = 54,
}: RadialRatingBadgeProps) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedRating = Math.min(Math.max(rating, 0), 5);
  const progress = (normalizedRating / 5) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: TOKENS.colors.surfaceElevated,
        padding: '6px 14px',
        borderRadius: TOKENS.radii.pill,
        border: `1px solid ${TOKENS.colors.borderLight}`,
        boxShadow: TOKENS.shadows.btnConvex,
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Fondo de círculo */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(23, 56, 45, 0.12)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Barra de progreso animada */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#emerald-gradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          />
          <defs>
            <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>
        </svg>

        {/* Valor numérico en el centro */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.86rem',
            fontWeight: 900,
            color: TOKENS.colors.textMain,
          }}
        >
          {rating.toFixed(1)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              fill={i < Math.floor(rating) ? '#D97706' : 'transparent'}
              color={i < Math.floor(rating) ? '#D97706' : '#CBD5E1'}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: TOKENS.colors.textSecondary, fontWeight: 700, marginTop: '2px' }}>
          {reviewsCount ? `${reviewsCount} opiniones verificadas` : 'Auditado'}
        </span>
      </div>
    </div>
  );
}
