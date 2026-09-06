import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Guaki — Directorio Verificado';
    const category = searchParams.get('category') || 'Servicios Profesionales';
    const city = searchParams.get('city') || 'Colombia';
    const rating = searchParams.get('rating');
    const isVerified = searchParams.get('verified') === 'true';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#102B22',
            backgroundImage: 'radial-gradient(circle at 10% 10%, rgba(95, 143, 103, 0.4) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(23, 56, 45, 0.8) 0%, transparent 60%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '48px' }}>🥑</span>
              <span style={{ fontSize: '38px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                GUAKI
              </span>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1.5px solid #AFC8AD',
                padding: '8px 22px',
                borderRadius: '999px',
                color: '#DCE9D5',
                fontSize: '20px',
                fontWeight: 800,
              }}
            >
              {isVerified ? '✓ COMERCIO AUDITADO' : '✓ DIRECTORIO COMERCIAL'}
            </div>
          </div>

          {/* Center Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: '#5F8F67',
                  color: '#FFFFFF',
                  padding: '6px 18px',
                  borderRadius: '999px',
                  fontSize: '22px',
                  fontWeight: 700,
                }}
              >
                {category}
              </span>
              <span style={{ color: '#AFC8AD', fontSize: '24px', fontWeight: 700 }}>
                📍 {city}
              </span>
            </div>

            <div
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                maxWidth: '960px',
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {rating ? (
                <>
                  <span style={{ fontSize: '28px', color: '#F59E0B' }}>⭐</span>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: '#FFFFFF' }}>
                    {rating} · Opiniones Reales Verificadas
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#DCE9D5' }}>
                  Directorio Inteligente de Confianza
                </span>
              )}
            </div>
            <span style={{ fontSize: '20px', color: '#AFC8AD', fontWeight: 700 }}>
              guaki.co · WhatsApp 1-Clic
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Error generando tarjeta OpenGraph', { status: 500 });
  }
}
