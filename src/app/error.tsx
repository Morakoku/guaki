'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#FAF7F2',
        color: '#3D2617',
      }}
    >
      <span style={{ fontSize: '3rem', marginBottom: '12px' }}>🦜</span>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: '#3D2617' }}>
        Ocurrió un error inesperado
      </h1>
      <p style={{ color: '#7A4E2D', maxWidth: '480px', marginBottom: '24px', fontSize: '0.92rem' }}>
        {error.message || 'No se pudo cargar la vista solicitada. Puedes reintentar la conexión o volver al inicio.'}
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            backgroundColor: '#D82B2B',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
        <Link
          href="/"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#3D2617',
            border: '1px solid rgba(122, 78, 45, 0.2)',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.88rem',
            textDecoration: 'none',
          }}
        >
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}
