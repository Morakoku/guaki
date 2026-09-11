'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TOKENS } from '../../lib/design-tokens';
import VoiceSearchModal from './VoiceSearchModal';
import {
  AnimatedVoiceMic,
  AnimatedHomeIcon,
  AnimatedCompassIcon,
  AnimatedStoreIcon,
  AnimatedInfoIcon,
} from './GuakiAnimatedIcons';

const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // overshoot suave
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

interface NavItem {
  href: string;
  label: string;
  match: (path: string) => boolean;
  Icon: React.ComponentType<{ size?: number; color?: string; active?: boolean }>;
}

// Rutas del dock: href="/" · href="/directorio" · href="/provider/dashboard" · href="/nosotros"
const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Inicio', match: (p) => p === '/', Icon: AnimatedHomeIcon },
  { href: '/directorio', label: 'Explorar', match: (p) => p.startsWith('/directorio'), Icon: AnimatedCompassIcon },
  { href: '/provider/dashboard', label: 'Mi Negocio', match: (p) => p.startsWith('/provider') || p.startsWith('/mi-negocio'), Icon: AnimatedStoreIcon },
  { href: '/nosotros', label: 'Nosotros', match: (p) => p.startsWith('/nosotros'), Icon: AnimatedInfoIcon },
];

export default function SoftBottomNav() {
  const pathname = usePathname();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // El dock se oculta en flujos internos donde estorba: admin, command-center y
  // autenticación (login/registro). En auth además resolvía oclusión del botón
  // de "Crear Cuenta y Entrar" en viewports bajos.
  const isHidden =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/command-center') ||
    pathname.startsWith('/login');
  if (isHidden) return null;

  const openVoice = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
    setIsVoiceOpen(true);
  };

  const left = NAV_ITEMS[0];
  const explore = NAV_ITEMS[1];
  const business = NAV_ITEMS[2];
  const about = NAV_ITEMS[3];

  const renderItem = (item: NavItem) => {
    const active = item.match(pathname);
    const { Icon } = item;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className="guaki-dock-item"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          padding: '8px 6px 6px',
          minHeight: '48px',
          minWidth: '56px',
          flex: 1,
          borderRadius: TOKENS.radii.lg,
          backgroundColor: active ? 'rgba(220, 233, 213, 0.55)' : 'transparent',
          color: active ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
          fontWeight: active ? 800 : 600,
          fontSize: '0.64rem',
          textDecoration: 'none',
          transform: active ? 'translateY(-2px)' : 'translateY(0)',
          transition: `transform 320ms ${EASE_SPRING}, background-color 240ms ${EASE_OUT}, color 200ms ease`,
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = active ? 'translateY(-2px) scale(0.94)' : 'scale(0.94)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = active ? 'translateY(-2px)' : 'translateY(0)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = active ? 'translateY(-2px)' : 'translateY(0)')}
      >
        <span
          style={{
            display: 'flex',
            transform: active ? 'translateY(-1px)' : 'none',
            transition: `transform 320ms ${EASE_SPRING}`,
          }}
        >
          <Icon size={19} color={active ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary} active={active} />
        </span>
        <span style={{ letterSpacing: '0.01em' }}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Sombra proyectada del dock (separada para que la muesca no la corte) */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 28px)',
          maxWidth: '400px',
          height: '20px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(18, 38, 28, 0.18) 0%, transparent 70%)',
          filter: 'blur(6px)',
          zIndex: 99997,
          pointerEvents: 'none',
        }}
      />

      <nav
        aria-label="Navegación flotante"
        className="soft-bottom-dock guaki-dock-enter"
        style={{
          position: 'fixed',
          bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99998,
          width: 'calc(100% - 28px)',
          maxWidth: '400px',
          height: '62px',
          backgroundColor: 'rgba(244, 247, 242, 0.94)',
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          borderRadius: '22px',
          border: `1px solid ${TOKENS.colors.borderLight}`,
          boxShadow: '0 6px 20px rgba(18, 38, 28, 0.10), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '2px',
          pointerEvents: 'auto',
          // Muesca superior central para el FAB
          WebkitMaskImage: 'radial-gradient(circle 34px at 50% 0, transparent 32px, black 33px)',
          maskImage: 'radial-gradient(circle 34px at 50% 0, transparent 32px, black 33px)',
        }}
      >
        {renderItem(left)}
        {renderItem(explore)}

        {/* Espacio del FAB */}
        <div style={{ width: '68px', flexShrink: 0 }} aria-hidden />

        {renderItem(business)}
        {renderItem(about)}
      </nav>

      {/* FAB de voz elevado sobre la muesca */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(34px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <button
          type="button"
          onClick={openVoice}
          aria-label="Abrir buscador por voz"
          aria-expanded={isVoiceOpen}
          aria-controls="guaki-voice-search-dialog"
          className="guaki-fab-float guaki-dock-enter"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            backgroundColor: TOKENS.colors.emeraldDark,
            color: TOKENS.colors.white,
            border: '4px solid #F4F7F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            boxShadow: '0 10px 26px rgba(23, 56, 45, 0.38), 0 2px 6px rgba(23, 56, 45, 0.18)',
            transition: `transform 380ms ${EASE_SPRING}, box-shadow 280ms ${EASE_OUT}`,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.9)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 56, 45, 0.30)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 26px rgba(23, 56, 45, 0.38), 0 2px 6px rgba(23, 56, 45, 0.18)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 26px rgba(23, 56, 45, 0.38), 0 2px 6px rgba(23, 56, 45, 0.18)';
          }}
        >
          <AnimatedVoiceMic size={26} color="#FFFFFF" active={isVoiceOpen} />
        </button>
        <span
          role="button"
          tabIndex={0}
          onClick={() => setIsVoiceOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsVoiceOpen(true);
            }
          }}
          style={{
            pointerEvents: 'auto',
            fontSize: '0.62rem',
            fontWeight: 900,
            color: TOKENS.colors.emeraldDark,
            marginTop: '2px',
            cursor: 'pointer',
            textShadow: '0 1px 2px rgba(244, 247, 242, 0.9)',
          }}
        >
          Hablar ahora
        </span>
      </div>

      <VoiceSearchModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </>
  );
}
