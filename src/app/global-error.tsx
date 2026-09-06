'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ backgroundColor: '#FAF7F2', color: '#3D2617', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Algo salió mal</h2>
        <p style={{ color: '#7A4E2D', margin: '12px 0 24px' }}>{error.message || 'Error en el servidor de la aplicación.'}</p>
        <button
          type="button"
          onClick={() => reset()}
          style={{ backgroundColor: '#D82B2B', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
