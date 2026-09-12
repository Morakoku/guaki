'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TOKENS } from '../lib/design-tokens';
import SearchBar from '../components/ui/SearchBar';
import LocationButton from '../components/ui/LocationButton';
import AficheCard from '../components/ui/AficheCard';
import GuakiHeader from '../components/ui/GuakiHeader';
import PlanCardsSection from '../components/ui/PlanCardsSection';
import { AficheBusinessData } from '../lib/demo_afiche';
import { mapPublicBusinessToAfiche } from '../lib/public_card_mapper.mjs';

export default function HomePage() {
  const [detectedCity, setDetectedCity] = useState<string>('');
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [realBusinesses, setRealBusinesses] = useState<AficheBusinessData[]>([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);

  // Cargar comercios reales
  useEffect(() => {
    async function loadBusinesses() {
      try {
        const res = await fetch('/api/businesses?status=published');
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            const mapped: AficheBusinessData[] = data.items.map(mapPublicBusinessToAfiche);
            setRealBusinesses(mapped);
          }
        }
      } catch {
        setRealBusinesses([]);
      } finally {
        setInventoryLoaded(true);
      }
    }
    loadBusinesses();
  }, []);

  const categories = [
    { id: 'todos', label: 'Todos', icon: '✨' },
    { id: 'veterinaria', label: 'Veterinarias', icon: '🐾' },
    { id: 'spa', label: 'Belleza & Spa', icon: '💅' },
    { id: 'odontologia', label: 'Odontología', icon: '🦷' },
    { id: 'restaurante', label: 'Restaurantes', icon: '☕' },
  ];

  const allBusinesses = realBusinesses;

  const filteredBusinesses =
    activeCategory === 'todos'
      ? allBusinesses
      : allBusinesses.filter((a) =>
          a.category.toLowerCase().includes(activeCategory.toLowerCase())
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
          Encuentra lo que necesitas
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
          />
        </div>

        {/* Chips de Categorías Minimalistas */}
        {inventoryLoaded && allBusinesses.length === 0 ? (
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
              Comercios destacados
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: TOKENS.colors.textMuted, fontWeight: 600 }}>
            {!inventoryLoaded
              ? 'Buscando comercios verificados…'
              : `${Math.min(filteredBusinesses.length, 12)} de ${filteredBusinesses.length} resultados`}
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
          {!inventoryLoaded
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="skeleton"
                  style={{ height: '420px', borderRadius: '20px', opacity: 0.55 }}
                />
              ))
            : filteredBusinesses.slice(0, 12).map((afiche) => (
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
