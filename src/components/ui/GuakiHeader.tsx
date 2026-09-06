'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOKENS } from '../../lib/design-tokens';

interface GuakiHeaderProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function GuakiHeader({ className = '', style = {} }: GuakiHeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className={`guaki-master-header ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(232, 237, 232, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${TOKENS.colors.borderLight}`,
        padding: '14px 20px',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {/* 🥑 Logo GUAKI Oficial */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: TOKENS.radii.sm,
              backgroundColor: TOKENS.colors.emeraldDark,
              color: TOKENS.colors.white,
              display: 'grid',
              placeItems: 'center',
              fontSize: '18px',
              boxShadow: TOKENS.shadows.btnPrimary,
              flexShrink: 0,
            }}
          >
            🥑
          </div>
          <span
            style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              letterSpacing: '-0.02em',
            }}
          >
            GUAKI
          </span>
        </Link>

        {/* 🧭 Navegación Superior Estandarizada */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="guaki-desktop-nav-links">
            <Link
              href="/"
              style={{
                fontSize: '0.84rem',
                fontWeight: pathname === '/' ? 800 : 700,
                color: pathname === '/' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                backgroundColor: pathname === '/' ? 'rgba(220, 233, 213, 0.6)' : 'transparent',
                borderRadius: TOKENS.radii.pill,
                textDecoration: 'none',
                padding: '6px 12px',
                transition: 'all 160ms ease',
              }}
            >
              Inicio
            </Link>

            <Link
              href="/directorio"
              style={{
                fontSize: '0.84rem',
                fontWeight: pathname === '/directorio' ? 800 : 700,
                color: pathname === '/directorio' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                backgroundColor: pathname === '/directorio' ? 'rgba(220, 233, 213, 0.6)' : 'transparent',
                borderRadius: TOKENS.radii.pill,
                textDecoration: 'none',
                padding: '6px 12px',
                transition: 'all 160ms ease',
              }}
            >
              Directorio
            </Link>

            <Link
              href="/nosotros"
              style={{
                fontSize: '0.84rem',
                fontWeight: pathname === '/nosotros' ? 800 : 700,
                color: pathname === '/nosotros' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                backgroundColor: pathname === '/nosotros' ? 'rgba(220, 233, 213, 0.6)' : 'transparent',
                borderRadius: TOKENS.radii.pill,
                textDecoration: 'none',
                padding: '6px 12px',
                transition: 'all 160ms ease',
              }}
            >
              Nosotros
            </Link>
          </div>

          <Link
            href="/provider/dashboard"
            className="neu-btn-primary"
            style={{
              padding: '7px 15px',
              fontSize: '0.80rem',
              fontWeight: 800,
              textDecoration: 'none',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: TOKENS.colors.emeraldDark,
              color: TOKENS.colors.white,
              boxShadow: TOKENS.shadows.btnPrimary,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            + Mi Negocio
          </Link>
        </nav>
      </div>
    </header>
  );
}
