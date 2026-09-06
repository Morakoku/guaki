import React from 'react';
import Link from 'next/link';
import { TOKENS } from '@/lib/design-tokens';
import SoftCard from '@/components/ui/SoftCard';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px 20px',
        backgroundColor: TOKENS.colors.bgMain,
        color: TOKENS.colors.textMain,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <SoftCard style={{ padding: '48px 36px', maxWidth: '520px', width: '100%' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: TOKENS.radii.md,
            backgroundColor: TOKENS.colors.emeraldDark,
            color: TOKENS.colors.white,
            display: 'grid',
            placeItems: 'center',
            fontSize: '2.4rem',
            margin: '0 auto 16px',
          }}
        >
          🥑
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: TOKENS.colors.emeraldDark, lineHeight: 1, marginBottom: '12px' }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
          Página No Encontrada
        </h1>
        <p style={{ color: TOKENS.colors.textSecondary, fontSize: '0.92rem', margin: '0 0 28px', lineHeight: 1.5 }}>
          La página que buscas no existe o ha sido movida. Puedes explorar los negocios verificados o regresar al inicio.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/"
            className="soft-btn-primary"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              fontSize: '0.92rem',
              borderRadius: TOKENS.radii.pill,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Volver al Inicio
          </Link>

          <Link
            href="/directorio"
            className="soft-btn"
            style={{
              padding: '12px 24px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              borderRadius: TOKENS.radii.pill,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Explorar Directorio
          </Link>
        </div>
      </SoftCard>
    </div>
  );
}
