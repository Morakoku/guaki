'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import GuakiHeader from '@/components/ui/GuakiHeader';
import AficheCard from '@/components/ui/AficheCard';
import { mapPublicBusinessToAfiche } from '@/lib/public_card_mapper.mjs';
import type { AficheBusinessData } from '@/lib/demo_afiche';

interface GuardadosClientProps {}

export default function GuardadosPage() {
  const [saved, setSaved] = useState<AficheBusinessData[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem('guaki_saved_businesses') || '[]');
        if (!ids.length) {
          if (active) setSaved([]);
          return;
        }
        const res = await fetch('/api/businesses?status=published');
        if (res.ok) {
          const data = await res.json();
          const items: AficheBusinessData[] = (data.items || []).map(mapPublicBusinessToAfiche);
          // Mantener el orden en que el usuario los guardó
          const byId = new Map(items.map((b: AficheBusinessData) => [String(b.id), b]));
          const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as AficheBusinessData[];
          if (active) setSaved(ordered);
        }
      } catch {
        if (active) setSaved([]);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />

      <main className="guaki-container" style={{ paddingTop: '28px', paddingBottom: '48px', maxWidth: '1120px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '22px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${TOKENS.colors.borderLight}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart size={20} color="#EF4444" fill="#EF4444" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
              Tus negocios guardados
            </h1>
          </div>
          <Link
            href="/directorio"
            className="neu-level-3"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: TOKENS.colors.emeraldDark,
              textDecoration: 'none',
              borderRadius: TOKENS.radii.pill,
            }}
          >
            <ArrowLeft size={14} /> Volver al Directorio
          </Link>
        </div>

        {!loaded ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '420px', borderRadius: '20px', opacity: 0.55 }} />
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div
            className="neu-level-2"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              borderRadius: TOKENS.radii.xl,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Sparkles size={30} color={TOKENS.colors.emeraldDark} />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0 }}>
              Aún no guardas negocios
            </h2>
            <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0, maxWidth: '440px' }}>
              Toca el corazón en cualquier afiche del directorio y lo tendrás aquí para contactarlo cuando quieras.
            </p>
            <Link
              href="/directorio"
              className="neu-btn-primary"
              style={{
                padding: '11px 22px',
                fontSize: '0.9rem',
                fontWeight: 800,
                textDecoration: 'none',
                borderRadius: TOKENS.radii.pill,
              }}
            >
              Explorar el Directorio
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
            {saved.map((afiche) => (
              <AficheCard key={afiche.id} afiche={afiche} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
