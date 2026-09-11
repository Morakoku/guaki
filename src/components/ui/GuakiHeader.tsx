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
            href="/guardados"
            aria-label="Tus negocios guardados"
            className="guaki-save-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(220, 233, 213, 0.55)',
              color: TOKENS.colors.emeraldDark,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.9), 0 1px 2px rgba(28, 25, 23, 0.05)',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1), background-color 180ms ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'rgba(220, 233, 213, 0.55)';
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 233, 213, 0.9)')}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20s-7-4.4-9.2-8.7C1.3 8.2 3.1 5 6.3 5c2 0 3.5 1.2 4.3 2.6C11.4 6.2 12.9 5 14.9 5 17.9 5 19.7 8 18.6 11.3 16.8 15.6 12 20 12 20Z" />
            </svg>
          </Link>

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
