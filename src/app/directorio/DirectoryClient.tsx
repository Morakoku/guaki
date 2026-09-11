'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import { cityNames } from '../../lib/geo';
import SearchBar from '../../components/ui/SearchBar';
import AficheCard from '../../components/ui/AficheCard';
import BusinessListItem from '../../components/ui/BusinessListItem';
import InteractiveCityMap from '../../components/ui/InteractiveCityMap';
import EmptyState from '../../components/ui/EmptyState';
import PlanCardsSection from '../../components/ui/PlanCardsSection';
import { AficheBusinessData } from '../../lib/demo_afiche';
import { mapPublicBusinessToAfiche } from '../../lib/public_card_mapper.mjs';
import { trackEvent } from '../../lib/analytics';

export default function DirectoryClient() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || '';
  // Deep-link de categoría: /directorio?cat=veterinaria (usado por el home
  // y por enlaces externos). Acepta también "category".
  const initialCat = searchParams.get('cat') || searchParams.get('category') || 'todos';

  const [query, setQuery] = useState(initialQ);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'map'>('card');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [businesses, setBusinesses] = useState<AficheBusinessData[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar búsquedas recientes de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guaki_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 4));
      }
    } catch {}
  }, []);

  const handleSearchSubmit = (q: string, city?: string) => {
    setQuery(q);
    if (city) setSelectedCity(city);
    if (q.trim()) {
      trackEvent({
        event_name: 'search_executed',
        metadata: {
          query: q.trim(),
          city: city || selectedCity || '',
          category: selectedCategory !== 'todos' ? selectedCategory : null,
          source: 'search_bar',
        },
      });
      try {
        const next = Array.from(new Set([q.trim(), ...recentSearches])).slice(0, 4);
        setRecentSearches(next);
        localStorage.setItem('guaki_recent_searches', JSON.stringify(next));
      } catch {}
    }
  };

  // Cargar comercios reales sincronizados con el Home y la base de datos
  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true);
      try {
        const res = await fetch('/api/businesses?status=published', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const rawItems = Array.isArray(data) ? data : (data.items || []);
          const mapped: AficheBusinessData[] = rawItems.map(mapPublicBusinessToAfiche);
          setBusinesses(mapped);
        }
      } catch (err) {
        console.error('Error fetching directory:', err);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    }
    loadBusinesses();
  }, []);

  const cities = cityNames();
  const categories = [
    { id: 'todos', label: 'Todas las Categorías', icon: '✨' },
    { id: 'veterinaria', label: 'Veterinarias', icon: '🐾' },
    { id: 'spa', label: 'Belleza & Spa', icon: '💅' },
    { id: 'odontologia', label: 'Odontología', icon: '🦷' },
    { id: 'salud', label: 'Salud & Bienestar', icon: '🌿' },
    { id: 'restaurante', label: 'Restaurantes', icon: '☕' },
    { id: 'servicios', label: 'Servicios Profesionales', icon: '💼' },
  ];

  // Lógica de filtrado
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchQuery =
        !query.trim() ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase()) ||
        (b.shortDescription && b.shortDescription.toLowerCase().includes(query.toLowerCase()));

      const matchCity =
        !selectedCity ||
        b.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        (b.address && b.address.toLowerCase().includes(selectedCity.toLowerCase()));

      const matchCategory =
        selectedCategory === 'todos' ||
        b.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchOpen = !onlyOpenNow || b.isOpenNow === true;

      return matchQuery && matchCity && matchCategory && matchOpen;
    });
  }, [businesses, query, selectedCity, selectedCategory, onlyOpenNow]);

  const activeFiltersCount = (selectedCity ? 1 : 0) + (selectedCategory !== 'todos' ? 1 : 0) + (onlyOpenNow ? 1 : 0);

  return (
    <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px 20px' }}>

        {/* Buscador Central (El mismo de la página principal) */}
        <div style={{ marginBottom: '14px' }}>
          <SearchBar
            initialQuery={query}
            initialCity={selectedCity}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>

        {/* 🕒 Chips de Búsquedas Recientes */}
        {recentSearches.length > 0 && !query && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '0.74rem', color: TOKENS.colors.textMuted, fontWeight: 700 }}>
              Recientes:
            </span>
            {recentSearches.map((sTerm) => (
              <button
                key={sTerm}
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8);
                  trackEvent({
                    event_name: 'search_executed',
                    metadata: {
                      query: sTerm,
                      city: selectedCity || '',
                      category: selectedCategory !== 'todos' ? selectedCategory : null,
                      source: 'recent_search',
                    },
                  });
                  setQuery(sTerm);
                }}
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
              >
                {sTerm}
              </button>
            ))}
          </div>
        )}

        {/* Barra de Controles Compacta (Filtros desplegables + Vista) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '720px',
            margin: '0 auto 28px',
          }}
        >
          <div className="directory-controls-bar">
            <div className="directory-filter-group">
              {/* Botón Píldora para Desplegar/Recoger Filtros */}
              <button
                type="button"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={isFiltersOpen || activeFiltersCount > 0 ? 'soft-btn-primary' : 'soft-btn'}
                style={{
                  borderRadius: TOKENS.radii.pill,
                  padding: '8px 18px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Filtros y Categorías</span>
                {activeFiltersCount > 0 && (
                  <span
                    style={{
                      backgroundColor: isFiltersOpen ? 'rgba(255,255,255,0.25)' : TOKENS.colors.emeraldDark,
                      color: TOKENS.colors.white,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
                {isFiltersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* 🟢 Switch 'Abierto Ahora' */}
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
                  setOnlyOpenNow(!onlyOpenNow);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  fontSize: '0.80rem',
                  fontWeight: onlyOpenNow ? 800 : 600,
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: onlyOpenNow ? 'rgba(34, 197, 94, 0.14)' : TOKENS.colors.surfaceElevated,
                  color: onlyOpenNow ? '#15803D' : TOKENS.colors.textSecondary,
                  border: `1px solid ${onlyOpenNow ? '#22C55E' : TOKENS.colors.borderLight}`,
                  boxShadow: onlyOpenNow ? '0 2px 8px rgba(34, 197, 94, 0.25)' : TOKENS.shadows.btnConvex,
                  cursor: 'pointer',
                  transition: 'transform 140ms ease, background-color 140ms ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#22C55E',
                    boxShadow: onlyOpenNow ? '0 0 8px #22C55E' : 'none',
                  }}
                />
                <span>Abierto Ahora</span>
              </button>
            </div>

            {/* Toggle de Vista Tarjetas / Lista / Mapa */}
            <div className="directory-view-toggle">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                aria-label="Ver tarjetas"
                style={{
                  padding: '6px 14px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: viewMode === 'card' ? TOKENS.colors.surfaceElevated : 'transparent',
                  boxShadow: viewMode === 'card' ? TOKENS.shadows.btnConvex : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'card' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <LayoutGrid size={14} />
                <span>Tarjetas</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="Ver lista"
                style={{
                  padding: '6px 14px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: viewMode === 'list' ? TOKENS.colors.surfaceElevated : 'transparent',
                  boxShadow: viewMode === 'list' ? TOKENS.shadows.btnConvex : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'list' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <List size={14} />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                aria-label="Ver mapa"
                style={{
                  padding: '6px 14px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: viewMode === 'map' ? TOKENS.colors.surfaceElevated : 'transparent',
                  boxShadow: viewMode === 'map' ? TOKENS.shadows.btnConvex : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: viewMode === 'map' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              >
                <MapIcon size={14} />
                <span>Mapa</span>
              </button>
            </div>
          </div>

          {/* 📂 PANEL DESPLEGABLE DE FILTROS */}
          {isFiltersOpen && (
            <div
              className="neu-level-1"
              style={{
                width: '100%',
                padding: '20px',
                borderRadius: TOKENS.radii.xl,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center',
                marginTop: '4px',
                border: `1px solid ${TOKENS.colors.borderLight}`,
                animation: 'pageFadeIn 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
              }}
            >
              {/* Filtro de Ciudades */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Ciudades Auditadas
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCity('')}
                    className={selectedCity === '' ? 'soft-btn-primary' : 'soft-btn'}
                    style={{ borderRadius: TOKENS.radii.pill, padding: '6px 14px', fontSize: '0.78rem', minHeight: '34px' }}
                  >
                    Todas las Ciudades
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                      className={selectedCity === city ? 'soft-btn-primary' : 'soft-btn'}
                      style={{ borderRadius: TOKENS.radii.pill, padding: '6px 14px', fontSize: '0.78rem', minHeight: '34px' }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro de Categorías */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Categorías de Servicio
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={selectedCategory === cat.id ? 'soft-btn-primary' : 'soft-btn'}
                      style={{
                        borderRadius: TOKENS.radii.pill,
                        padding: '7px 15px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Botón Limpiar Filtros si hay alguno activo */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedCategory('todos');
                    setQuery('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    marginTop: '4px',
                  }}
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contador de Resultados Centrado */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '22px' }}>
          <span style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, fontWeight: 700, textAlign: 'center' }}>
            {loading
              ? 'Buscando comercios verificados…'
              : `${filteredBusinesses.length} ${filteredBusinesses.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}`}
          </span>
        </div>

        {/* Grid o Lista de Resultados */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: TOKENS.colors.textSecondary }}>
            <p style={{ fontWeight: 600 }}>Cargando directorio oficial de comercios...</p>
          </div>
        ) : businesses.length === 0 ? (
          <EmptyState
            title="Sin datos todavía"
            description="No hay negocios públicos para mostrar en este momento."
          />
        ) : filteredBusinesses.length === 0 ? (
          <EmptyState
            title="No encontramos negocios con estos filtros"
            description="Intenta buscando otros términos o eliminando los filtros seleccionados."
            actionText="Limpiar filtros"
            onAction={() => {
              setQuery('');
              setSelectedCity('');
              setSelectedCategory('todos');
            }}
          />
        ) : viewMode === 'map' ? (
          <InteractiveCityMap
            defaultCity={selectedCity || 'Medellín'}
            businesses={filteredBusinesses.filter((b) => typeof b.lat === 'number' && typeof b.lng === 'number').map((b) => ({
              id: b.id,
              slug: b.slug,
              name: b.name,
              category: b.category,
              city: b.city,
              address: b.address || '',
              lat: b.lat!,
              lng: b.lng!,
              rating: b.rating,
              plan: b.plan,
            }))}
          />
        ) : viewMode === 'card' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredBusinesses.map((b) => (
              <AficheCard key={b.id} afiche={b} source={query.trim() ? 'search_result' : 'directory'} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '840px', margin: '0 auto' }}>
            {filteredBusinesses.map((b) => (
              <BusinessListItem key={b.id} business={b} />
            ))}
          </div>
        )}

        {/* ── BANNER DE REGISTRO DE NEGOCIOS & PLANES ── */}
        <div
          className="neu-level-2"
          style={{
            marginTop: '60px',
            padding: '36px 28px',
            borderRadius: TOKENS.radii.hero,
            backgroundColor: TOKENS.colors.surfaceElevated,
            border: `1px solid ${TOKENS.colors.borderLight}`,
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '640px', margin: '0 auto 30px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 900,
                color: TOKENS.colors.emeraldDark,
                backgroundColor: 'rgba(37, 211, 102, 0.15)',
                padding: '4px 12px',
                borderRadius: TOKENS.radii.pill,
                display: 'inline-block',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              🥑 Para Dueños de Negocios y Especialistas
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 8px' }}>
              ¿Prestas servicios en tu ciudad? Únete a GUAKI
            </h2>
            <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
              Registra tu afiche comercial en menos de 2 minutos y empieza a recibir contactos directos a tu WhatsApp sin intermediarios.
            </p>
          </div>

          {/* 3 Planes Unificados */}
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <PlanCardsSection mode="display" />
          </div>
        </div>
    </section>
  );
}
