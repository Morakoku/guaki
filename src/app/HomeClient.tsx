'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ArrowRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { TOKENS } from '../lib/design-tokens';
import { isOpenNowFromSchedule } from '../lib/schedule';
import SearchBar from '../components/ui/SearchBar';
import LocationButton from '../components/ui/LocationButton';
import AficheCard from '../components/ui/AficheCard';
import GuakiHeader from '../components/ui/GuakiHeader';
import PlanCardsSection from '../components/ui/PlanCardsSection';
import { AficheBusinessData } from '../lib/demo_afiche';
import { metroOf } from '../lib/geo';

interface HomeClientProps {
  // Inventario server-rendered (ISR 5 min). El filtrado por categoría y la
  // geolocalización siguen siendo interacción client-side.
  initialBusinesses?: AficheBusinessData[];
}

export default function HomeClient({ initialBusinesses = [] }: HomeClientProps) {
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Cargar búsquedas recientes de localStorage (post-mount para evitar hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guaki_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {}
  }, []);

  // 2026-09-24 (decisión Edwin): el catálogo ampliado al real.
  const categories = [
    { id: 'todos', label: 'Todos', icon: '✨' },
    { id: 'barberia', label: 'Barberías', icon: '💈' },
    { id: 'spa', label: 'Belleza & Spa', icon: '💅' },
    { id: 'unas', label: 'Uñas', icon: '💅' },
    { id: 'odontologia', label: 'Odontología', icon: '🦷' },
    { id: 'salud', label: 'Salud & Bienestar', icon: '🌿' },
    { id: 'gimnasio', label: 'Gimnasios', icon: '🏋️' },
    { id: 'tatuajes', label: 'Tatuajes', icon: '🖋️' },
    { id: 'veterinaria', label: 'Veterinarias', icon: '🐾' },
    { id: 'inmobiliaria', label: 'Inmobiliarias', icon: '🏠' },
  ];

  const allBusinesses = initialBusinesses;

  // Cifras reales para la franja de stats (derivan del inventario publicado).
  const uniqueCategoryCount = new Set(
    allBusinesses
      .map((b) => b.category.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  // 2026-09-23: "Comercios destacados según MI UBICACIÓN" (decisión Edwin) —
  // cuando detectamos tu ciudad, los comercios de tu ciudad suben en el feed
  // manteniendo la prioridad de plan (pro → verificado → free) dentro de cada
  // grupo. Sin ubicación: el orden por plan del inventario server-rendered.
  const filteredBusinesses = useMemo(() => {
    const byCategory =
      activeCategory === 'todos'
        ? allBusinesses
        : allBusinesses.filter((a) =>
            a.category.toLowerCase().includes(activeCategory.toLowerCase())
          );
    if (!detectedCity) return byCategory;
    // 2026-09-24: match por ÁREA METROPOLITANA — el LocationButton detecta
    // municipios (Envigado, Soacha, Los Teques) que no están en las fichas;
    // el metro los resuelve ("Envigado" → medellín → las fichas de Medellín
    // suben en el feed).
    const metro = metroOf(detectedCity) || detectedCity.toLowerCase().trim();
    const inCity = byCategory.filter((a) => {
      const aMetro = metroOf((a.city || '') + ' ' + (a.address || ''));
      return aMetro !== null && (aMetro === metro || metro.includes(aMetro));
    });
    const rest = byCategory.filter((a) => !inCity.includes(a));
    return [...inCity, ...rest];
  }, [allBusinesses, activeCategory, detectedCity]);

  // #44 "Hoy en tu ciudad": datos dinámicos según ciudad detectada.
  // Pool estricto por área metropolitana (mismo patrón del ranking de arriba);
  // sin ubicación: el inventario completo server-rendered.
  const cityPool = useMemo(() => {
    if (!detectedCity) return allBusinesses;
    const metro = metroOf(detectedCity) || detectedCity.toLowerCase().trim();
    return allBusinesses.filter((a) => {
      const aMetro = metroOf((a.city || '') + ' ' + (a.address || ''));
      return aMetro !== null && (aMetro === metro || metro.includes(aMetro));
    });
  }, [allBusinesses, detectedCity]);

  // "Abierto ahora": horario real del schedule (offset -05:00, AM/PM).
  const hoyAbiertos = useMemo(
    () => cityPool.filter((b) => isOpenNowFromSchedule(b.schedule)).slice(0, 8),
    [cityPool]
  );

  // "Fichas nuevas": frescura real (updated_at); sin fechas → últimas del inventario.
  const hoyNuevas = useMemo(() => {
    const withDate = cityPool.filter((b) => !!b.updatedAt);
    const source =
      withDate.length > 0
        ? [...withDate].sort((a, z) => (z.updatedAt! > a.updatedAt! ? 1 : -1))
        : cityPool;
    return source.slice(0, 8);
  }, [cityPool]);

  // "Mejor valorados": rating real descendente (el mapper ya lo oculta en free).
  const hoyMejores = useMemo(
    () =>
      [...cityPool]
        .filter((b) => typeof b.rating === 'number')
        .sort((a, z) => z.rating! - a.rating!)
        .slice(0, 8),
    [cityPool]
  );

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />


      {/* ── HERO RADICALMENTE MINIMALISTA ── */}
      <section
        style={{
          padding: '48px 20px 32px',
          maxWidth: '760px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'center' }}>
          <LocationButton
            onLocationChange={(locName, city) => {
              setDetectedLocationName(locName);
              setDetectedCity(city);
            }}
          />
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.2rem)',
            fontWeight: 900,
            color: TOKENS.colors.textMain,
            lineHeight: 1.15,
            margin: '0 auto 12px',
            letterSpacing: '-0.03em',
          }}
        >
          Encuentra negocios verificados cerca de ti
        </h1>

        <p
          style={{
            fontSize: 'clamp(0.94rem, 2.2vw, 1.05rem)',
            color: TOKENS.colors.textSecondary,
            maxWidth: '480px',
            margin: '0 auto 28px',
            lineHeight: 1.5,
          }}
        >
          Contacta directamente por WhatsApp a comercios y profesionales locales.
        </p>

        {/* Buscador Central con Botón de Búsqueda */}
        <div style={{ marginBottom: '24px' }}>
          <SearchBar
            initialCity={detectedCity}
            detectedLocation={detectedLocationName}
            staticPlaceholder="Ej. veterinaria en Medellín"
          />
        </div>

        {/* 🔍 Chips de Búsquedas Recientes en Home */}
        {recentSearches.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            {recentSearches.slice(0, 5).map((sTerm) => (
              <button
                key={sTerm}
                type="button"
                style={{
                  background: 'none',
                  border: `1px solid ${TOKENS.colors.borderLight}`,
                  backgroundColor: 'rgba(23, 56, 45, 0.04)',
                  color: TOKENS.colors.emeraldDark,
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: TOKENS.radii.pill,
                  cursor: 'pointer',
                  transition: 'transform 120ms ease, background-color 120ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onClick={() => {
                  router.push(`/directorio?q=${encodeURIComponent(sTerm)}`);
                }}
              >
                {sTerm}
              </button>
            ))}
          </div>
        )}

        {/* Chips de Categorías Minimalistas */}
        {allBusinesses.length === 0 ? (
          <p style={{ textAlign: 'center', color: TOKENS.colors.textSecondary, padding: '36px 20px' }}>Estamos verificando los primeros comercios de tu zona. Muy pronto verás fichas aquí.</p>
        ) : filteredBusinesses.length === 0 && activeCategory !== 'todos' ? (
          <p style={{ textAlign: 'center', color: TOKENS.colors.textSecondary, padding: '36px 20px' }}>No encontramos negocios con esta categoría.</p>
        ) : <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: TOKENS.radii.pill,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: `1px solid ${activeCategory === cat.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                backgroundColor: activeCategory === cat.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                color: activeCategory === cat.id ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                boxShadow: activeCategory === cat.id ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
                transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms cubic-bezier(0.23, 1, 0.32, 1), border-color 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                willChange: 'transform',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>}
      </section>

      {/* ── FEED DE NEGOCIOS VERIFICADOS (MÁXIMO 12 RESULTADOS) ── */}
      <section
        style={{
          padding: '16px 20px 48px',
          maxWidth: '1120px',
          margin: '0 auto',
        }}
      >
        {/* ── FRANJA DE STATS (cifras reales del inventario publicado) ── */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div
            className="glass-surface-elevated"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 20px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.84rem',
              fontWeight: 700,
              color: TOKENS.colors.textSecondary,
            }}
          >
            <span>
              {allBusinesses.length > 0
                ? `${allBusinesses.length} negocios verificados · ${uniqueCategoryCount} categorías · WhatsApp directo`
                : 'Negocios verificados · WhatsApp directo'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: `1px solid ${TOKENS.colors.borderLight}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={18} color={TOKENS.colors.emeraldDark} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
              {detectedCity ? `Los mejores en ${detectedCity}` : 'Comercios destacados'}
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: TOKENS.colors.textMuted, fontWeight: 600 }}>
            {`${Math.min(filteredBusinesses.length, 12)} de ${filteredBusinesses.length} resultados`}
          </span>
        </div>

        {/* Grid de Tarjetas Limpias (Máximo 12 Resultados) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredBusinesses.slice(0, 12).map((afiche) => (
            <AficheCard key={afiche.id} afiche={afiche} />
          ))}
        </div>

        {/* Botón Ver Más */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <Link
            href={activeCategory === 'todos' ? '/directorio' : `/directorio?cat=${encodeURIComponent(activeCategory)}`}
            className="neu-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 32px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.92rem',
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            <span>Ver más en el Directorio</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* #44: "Hoy en tu ciudad" — abierto ahora + fichas nuevas + mejor valorados,
          dinámico según ciudad detectada. Solo se renderizan los rails con datos. */}
      {(hoyAbiertos.length > 0 || hoyNuevas.length > 0 || hoyMejores.length > 0) && (
        <section style={{ padding: '8px 20px 28px', maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Clock size={18} color={TOKENS.colors.emeraldDark} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
              {detectedCity ? `Hoy en ${detectedCity}` : 'Hoy en tu ciudad'}
            </h2>
          </div>
          {[
            { key: 'abiertos', title: 'Abierto ahora', items: hoyAbiertos },
            { key: 'nuevas', title: 'Fichas nuevas', items: hoyNuevas },
            { key: 'mejores', title: 'Mejor valorados', items: hoyMejores },
          ]
            .filter((rail) => rail.items.length > 0)
            .map((rail) => (
              <div key={rail.key} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: TOKENS.colors.textSecondary, margin: '0 0 10px' }}>
                  {rail.title}
                </h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {rail.items.map((b) => (
                    <div key={b.id} style={{ flexShrink: 0, width: '270px' }}>
                      <AficheCard afiche={b} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>
      )}

      {/* ── 💡 SECCIÓN: ¿CÓMO FUNCIONA GUAKI? ── */}
      <section
        style={{
          padding: '52px 20px 48px',
          maxWidth: '1120px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '38px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(23, 56, 45, 0.08)',
              color: TOKENS.colors.emeraldDark,
              padding: '4px 14px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '10px',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={12} />
            <span>Simple, Directo y Seguro</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4.2vw, 2.35rem)',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              margin: '0 0 10px',
              letterSpacing: '-0.025em',
            }}
          >
            ¿Cómo funciona Guaki?
          </h2>

          <p
            style={{
              fontSize: '0.96rem',
              color: TOKENS.colors.textSecondary,
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.55,
            }}
          >
            Te conectamos con los mejores comercios y profesionales de tu ciudad en 3 sencillos pasos, sin intermediarios ni cobros extra.
          </p>
        </div>

        {/* 3 Pasos Ilustrados en Tarjetas Neumórficas Redondeadas */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '22px',
          }}
        >
          {/* PASO 1 */}
          <div
            className="neu-level-2"
            style={{
              padding: '32px 24px',
              borderRadius: '28px',
              backgroundColor: TOKENS.colors.surfaceElevated,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '16px',
                boxShadow: '0 8px 18px rgba(23, 56, 45, 0.28)',
              }}
            >
              1
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: TOKENS.colors.emeraldDark,
                backgroundColor: TOKENS.colors.highlight,
                padding: '3px 10px',
                borderRadius: TOKENS.radii.pill,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Búsqueda Inteligente
            </span>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: TOKENS.colors.textMain,
                margin: '0 0 8px',
              }}
            >
              Busca o Habla
            </h3>

            <p
              style={{
                fontSize: '0.86rem',
                color: TOKENS.colors.textSecondary,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Escribe lo que necesitas o usa el botón de voz para decir naturalmente qué servicio o profesional estás buscando en tu ciudad.
            </p>
          </div>

          {/* PASO 2 */}
          <div
            className="neu-level-2"
            style={{
              padding: '32px 24px',
              borderRadius: '28px',
              backgroundColor: TOKENS.colors.surfaceElevated,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '16px',
                boxShadow: '0 8px 18px rgba(23, 56, 45, 0.28)',
              }}
            >
              2
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#15803D',
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                padding: '3px 10px',
                borderRadius: TOKENS.radii.pill,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Afiches Auditados
            </span>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: TOKENS.colors.textMain,
                margin: '0 0 8px',
              }}
            >
              Compara Opciones
            </h3>

            <p
              style={{
                fontSize: '0.86rem',
                color: TOKENS.colors.textSecondary,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Revisa afiches digitales con fotos reales, horarios de atención, catálogo de servicios, ubicación exacta y reseñas auténticas.
            </p>
          </div>

          {/* PASO 3 */}
          <div
            className="neu-level-2"
            style={{
              padding: '32px 24px',
              borderRadius: '28px',
              backgroundColor: TOKENS.colors.surfaceElevated,
              border: `1px solid ${TOKENS.colors.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.25rem',
                fontWeight: 900,
                marginBottom: '16px',
                boxShadow: '0 8px 18px rgba(37, 211, 102, 0.35)',
              }}
            >
              3
            </div>

            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#15803D',
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                padding: '3px 10px',
                borderRadius: TOKENS.radii.pill,
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              WhatsApp 1-Clic
            </span>

            <h3
              style={{
                fontSize: '1.2rem',
                fontWeight: 900,
                color: TOKENS.colors.textMain,
                margin: '0 0 8px',
              }}
            >
              Contacta al Instante
            </h3>

            <p
              style={{
                fontSize: '0.86rem',
                color: TOKENS.colors.textSecondary,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Toca el botón directo de WhatsApp o llamada para hablar con el encargado del negocio sin intermediarios, comisiones ni esperas.
            </p>
          </div>
        </div>
      </section>

      {/* ── 💎 SECCIÓN DE PLANES Y PRECIOS PARA NEGOCIOS ── */}
      <section
        style={{
          padding: '48px 20px 64px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: TOKENS.colors.highlight,
              color: TOKENS.colors.emeraldDark,
              padding: '4px 12px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            <Sparkles size={12} />
            <span>PLANES PARA COMERCIOS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              margin: '0 0 8px',
              letterSpacing: '-0.025em',
            }}
          >
            Publica tu negocio en Guaki
          </h2>

          <p
            style={{
              fontSize: '0.94rem',
              color: TOKENS.colors.textSecondary,
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Elige cómo deseas conectar con clientes locales que buscan tus servicios todos los días.
          </p>
        </div>

        {/* Comparativa de 3 Planes Unificados */}
        <PlanCardsSection mode="display" />
      </section>

      {/* ── FOOTER DISCRETO Y ELEGANTE ── */}
      <footer
        style={{
          borderTop: `1px solid ${TOKENS.colors.borderLight}`,
          padding: '32px 20px',
          textAlign: 'center',
          backgroundColor: TOKENS.colors.surface,
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: TOKENS.colors.textMuted }}>
            © {new Date().getFullYear()} GUAKI 🥑 · El Directorio Local Más Fresco de Colombia y Venezuela
          </span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/directorio" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Directorio
            </Link>
            <Link href="/nosotros" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Nosotros
            </Link>
            <Link href="/provider/dashboard" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Registrar Negocio
            </Link>
            <Link href="/unete" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Únete a Guaki
            </Link>
            <Link href="/privacidad" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Privacidad
            </Link>
            <Link href="/terminos" style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, textDecoration: 'none' }}>
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
