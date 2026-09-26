'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  List,
  Map as MapIcon,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';
import FilterBottomSheet from '../../components/ui/FilterBottomSheet';
import { cityNames } from '../../lib/geo';
import SearchBar from '../../components/ui/SearchBar';
import AficheCard from '../../components/ui/AficheCard';
import BusinessListItem from '../../components/ui/BusinessListItem';
import InteractiveCityMap from '../../components/ui/InteractiveCityMap';
import EmptyState from '../../components/ui/EmptyState';
import PlanCardsSection from '../../components/ui/PlanCardsSection';
import { AficheBusinessData } from '../../lib/demo_afiche';
import { trackEvent } from '../../lib/analytics';

// Normaliza acentos: "barbería".includes("barberia") falla sin esto.
const norm = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// --- #49: distancia de edición (Levenshtein acotada, iterativa) ---
const lev = (a: string, b: string, max = 3): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1; // poda: ya no puede quedar ≤ max
    prev = cur;
  }
  return prev[b.length];
};

// #49 (a): tolerancia a typos — tokens con distancia ≤ 2 (≤1 si token ≤4 chars).
// Devuelve la distancia mínima del token contra el texto, o -1 si ningún token queda cerca.
const minTokenDist = (token: string, text: string): number => {
  const max = token.length <= 4 ? 1 : 2;
  let best = max + 1;
  for (const w of text.split(/[^a-z0-9ñ]+/)) {
    if (!w) continue;
    if (w === token) return 0;
    const d = lev(token, w, max);
    if (d < best) best = d;
    if (best === 0) break;
  }
  return best <= max ? best : -1;
};

// #47: tier de match para ranking (3=categoría exacta, 2=nombre, 1=otros).
const matchTier = (b: AficheBusinessData, q: string): number => {
  if (!q) return 0;
  const nq = norm(q);
  if (norm(b.category).includes(nq)) return 3;
  if (norm(b.name).includes(nq)) return 2;
  return 1;
};

interface DirectoryClientProps {
  // Inventario server-rendered (ISR 5 min). El filtrado por categoría/ciudad y
  // la búsqueda en vivo quedan como interacción client-side sobre estos datos.
  initialBusinesses?: AficheBusinessData[];
  // Estado inicial proveniente de searchParams, leídos en el server component
  // para mantener el directorio totalmente server-rendered (sin bailout).
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
  // #45: deep-link del filtro "solo abierto ahora" (compartir búsqueda)
  initialOnlyOpenNow?: boolean;
  // #45: deep-link del filtro de país
  initialCountry?: 'todos' | 'co' | 've';
}

export default function DirectoryClient({
  initialBusinesses = [],
  initialQuery = '',
  initialCity = '',
  initialCategory = 'todos',
  initialOnlyOpenNow = false,
  initialCountry = 'todos',
}: DirectoryClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  // 2026-09-23: separación por país (decisión Edwin — VE/CO no se juntan).
  // País derivado del prefijo del teléfono (57=CO, 58=VE) + ciudades clave.
  const [selectedCountry, setSelectedCountry] = useState<'todos' | 'co' | 've'>(initialCountry);
  const [onlyOpenNow, setOnlyOpenNow] = useState(initialOnlyOpenNow);
  // #49: "Ver solo lo exacto" desactiva el reintento tolerante (fuzzy)
  const [showExactOnly, setShowExactOnly] = useState(false);
  // #45: feedback de "Link copiado"
  const [copied, setCopied] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'map'>('card');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // El inventario llega ya server-rendered desde el server component (ISR).
  // No se re-fetchea en cliente: el filtrado en vivo opera sobre estos datos.
  const [businesses, setBusinesses] = useState<AficheBusinessData[]>(initialBusinesses);
  const [loading, setLoading] = useState(false);
  // 2026-09-23 (explorer: ALTA): paginar el RENDER — 2.291 tarjetas explotan
  // el DOM/móvil. 48 por página + "Cargar más".
  const [visibleCount, setVisibleCount] = useState(48);
  const [showClearX, setShowClearX] = useState(false);

  const countryOf = (b: AficheBusinessData): 'co' | 've' => {
    const phone = ((b.phone || b.whatsapp || '') as string).replace(/\D/g, '');
    if (phone.startsWith('58')) return 've';
    if (phone.startsWith('57')) return 'co';
    const city = (b.city || '').toLowerCase();
    if (['caracas', 'maracaibo', 'valencia', 'maracay', 'barquisimeto', 'maturin', 'venezuela'].some((c) => city.includes(c))) return 've';
    return 'co';
  };

  // Cargar búsquedas recientes de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guaki_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 4));
      }
    } catch {}
  }, []);

  // #1 Precargar término: si llega sin ?q= y hay búsquedas previas,
  // llenamos el input con la más reciente (post-mount para evitar hydration mismatch).
  useEffect(() => {
    if (!initialQuery.trim() && recentSearches.length > 0) {
      setQuery(recentSearches[0]);
    }
  }, [initialQuery, recentSearches]);

  // Detectar viewport móvil después del mount (evita hydration mismatch):
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const listener = () => setIsMobile(mq.matches);
    mq.addEventListener?.('change', listener);
    return () => mq.removeEventListener?.('change', listener);
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

  const cities = cityNames();
  // 2026-09-24 (decisión Edwin): el catálogo real ampliado — las categorías
  // de las fichas importadas (barbería/uñas/tatuajes/gimnasio/inmobiliaria).
  const categories = [
    { id: 'todos', label: 'Todas las Categorías', icon: '✨' },
    { id: 'barberia', label: 'Barberías', icon: '💈' },
    { id: 'spa', label: 'Belleza & Spa', icon: '💅' },
    { id: 'unas', label: 'Salones de Uñas', icon: '💅' },
    { id: 'odontologia', label: 'Odontología', icon: '🦷' },
    { id: 'salud', label: 'Salud & Bienestar', icon: '🌿' },
    { id: 'gimnasio', label: 'Gimnasios & Fitness', icon: '🏋️' },
    { id: 'tatuajes', label: 'Estudios de Tatuajes', icon: '🖋️' },
    { id: 'veterinaria', label: 'Veterinarias', icon: '🐾' },
    { id: 'inmobiliaria', label: 'Inmobiliarias', icon: '🏠' },
    { id: 'restaurante', label: 'Restaurantes', icon: '☕' },
    { id: 'servicios', label: 'Servicios Profesionales', icon: '💼' },
  ];
  // Lógica de filtrado
  // --- Cálculo de isOpenNow por ficha usando el schedule JSON ---
  // El mapper ahora serializa el array a string JSON; lo parseamos aquí.
  const isOpenNowMap = useMemo(() => {
    const now = new Date();
    // Offset -05:00 para Venezuela/Colombia (horario local sin DST Considerado)
    const offset = 5 * 60; // minutos
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    const dayIdx = localTime.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const currentDayName = dayNames[dayIdx].toLowerCase();
    const currentHours = localTime.getHours() * 60 + localTime.getMinutes(); // minutos desde medianoche

    const result = new Map();
    businesses.forEach((b) => {
      let openNow = false;
      if (b.schedule) {
        try {
          const schedule = typeof b.schedule === 'string' ? JSON.parse(b.schedule) : b.schedule;
          if (Array.isArray(schedule)) {
            for (const slot of schedule) {
              const slotDay = (slot.day || '').toLowerCase();
              const slotHours = (slot.hours || '').trim();
              const isOpen = slot.isOpen ?? true;

              // Rangos de día: "lunes a viernes" | día simple: "sábado", "domingo"
              let dayMatches = false;
              const rangeMatch = slotDay.match(/^(.+?)\s+a\s+(.+)$/);
              if (rangeMatch) {
                const startIdx = dayNames.findIndex((d) => rangeMatch[1].trim().startsWith(d.substring(0, 4)));
                const endIdx = dayNames.findIndex((d) => rangeMatch[2].trim().startsWith(d.substring(0, 4)));
                if (startIdx >= 0 && endIdx >= 0) {
                  dayMatches =
                    startIdx <= endIdx
                      ? dayIdx >= startIdx && dayIdx <= endIdx
                      : dayIdx >= startIdx || dayIdx <= endIdx;
                }
              } else {
                dayMatches = dayNames.some((d) => slotDay.startsWith(d.substring(0, 4)));
              }

              if (!dayMatches) continue;

              // Parsear horas: "8:00 AM – 6:00 PM" (separador – o -)
              if (isOpen && slotHours && !/cerrado/i.test(slotHours)) {
                const times = [...slotHours.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)/gi)];
                const toMin = (m: RegExpExecArray) => {
                  let h = parseInt(m[1], 10) % 12;
                  if (m[3].toUpperCase() === 'PM') h += 12;
                  return h * 60 + parseInt(m[2], 10);
                };
                if (times.length >= 2) {
                  const startTotal = toMin(times[0]);
                  const endTotal = toMin(times[1]);
                  if (currentHours >= startTotal && currentHours < endTotal) openNow = true;
                } else if (times.length === 1 && currentHours >= toMin(times[0])) {
                  // Solo hora de inicio, abierta desde entonces
                  openNow = true;
                }
              } else if (isOpen && !slotHours) {
                // Día marcado como open sin horas específicas
                openNow = true;
              }
            }
          }
        } catch {}
      }
      result.set(b.id, openNow);
    });
    return result;
  }, [businesses]); // isOpenNow no depende de onlyOpenNow (solo del schedule)

  // #49: "Ver solo lo exacto" debe volver a desactivarse si cambia la query/filtros.
  useEffect(() => {
    setShowExactOnly(false);
  }, [query, selectedCity, selectedCategory, selectedCountry, onlyOpenNow]);

  const filterResult = useMemo<{ list: AficheBusinessData[]; usedFuzzy: boolean }>(() => {
    const nq = norm(query);
    const matchFuzzy = (b: AficheBusinessData) => {
      const fields = [norm(b.name), norm(b.category), b.shortDescription ? norm(b.shortDescription) : '', norm(b.city)];
      const tokens = nq.split(/\s+/).filter(Boolean);
      return tokens.every((t) => fields.some((f) => f.includes(t) || minTokenDist(t, f) !== -1));
    };
    const passFilters = (b: AficheBusinessData) => {
      const matchCity =
        !selectedCity ||
        norm(b.city).includes(norm(selectedCity)) ||
        (b.address && norm(b.address).includes(norm(selectedCity)));

      const matchCategory =
        selectedCategory === 'todos' ||
        norm(b.category).includes(norm(selectedCategory));

      // 2026-09-23: separación por país — VE/CO no se juntan.
      const matchCountry = selectedCountry === 'todos' || countryOf(b) === selectedCountry;

      // Usa el isOpenNow calculado en lugar de b.isOpenNow (que suele ser undefined)
      const matchOpen = !onlyOpenNow || (isOpenNowMap.get(b.id) === true);

      return matchCity && matchCategory && matchCountry && matchOpen;
    };

    if (!nq) return { list: businesses.filter(passFilters), usedFuzzy: false };

    // Pass 1 (exacto): substring en nombre/categoría/descripción — el orden original.
    const exact = businesses.filter((b) =>
      passFilters(b) &&
      (norm(b.name).includes(nq) ||
        norm(b.category).includes(nq) ||
        (b.shortDescription && norm(b.shortDescription).includes(nq)))
    );
    if (exact.length > 0 || showExactOnly) return { list: exact, usedFuzzy: false };

    // Pass 2 (#49): tolerancia a typos + sin acentos → tokens con distancia ≤2.
    const fuzzy = businesses.filter((b) => passFilters(b) && matchFuzzy(b));
    if (fuzzy.length > 0) return { list: fuzzy, usedFuzzy: true };

    // Pass 3 (#49b): si aún 0 y había ciudad activa, reintenta SIN ciudad
    // (la query frecuentemente ya contiene la ciudad).
    if (selectedCity) {
      const relaxed = businesses.filter((b) => {
        const matchCategory =
          selectedCategory === 'todos' || norm(b.category).includes(norm(selectedCategory));
        const matchCountry = selectedCountry === 'todos' || countryOf(b) === selectedCountry;
        const matchOpen = !onlyOpenNow || isOpenNowMap.get(b.id) === true;
        return matchCategory && matchCountry && matchOpen && matchFuzzy(b);
      });
      if (relaxed.length > 0) return { list: relaxed, usedFuzzy: true };
    }
    return { list: [], usedFuzzy: false };
  }, [businesses, query, selectedCity, selectedCategory, selectedCountry, onlyOpenNow, isOpenNowMap, showExactOnly]);

  const filteredBusinesses = filterResult.list;
  // #49: mostrar el aviso "sin coincidencias exactas" solo cuando hubo reintento.
  const fuzzyActive = filterResult.usedFuzzy && !showExactOnly && filteredBusinesses.length > 0;

  // #49c: en 0 resultados, sugiere ciudades reales del inventario parecidas a la query.
  const citySuggestions = useMemo(() => {
    const nq = norm(query);
    if (!nq || businesses.length === 0) return [];
    const present = new Set<string>();
    for (const b of businesses) if (b.city) present.add(b.city);
    const score = (c: string) => {
      const nc = norm(c);
      if (nc.includes(nq) || nq.includes(nc)) return 0;
      const d = minTokenDist(nc, nq);
      return d === -1 ? 99 : d;
    };
    return Array.from(present)
      .map((c) => ({ c, s: score(c) }))
      .filter((x) => x.s < 99)
      .sort((a, z) => a.s - z.s || a.c.localeCompare(z.c))
      .slice(0, 3)
      .map((x) => x.c);
  }, [query, businesses]);

  // #47: mejor match primero — solo cuando hay query, con desempate estable por
  // orden original (siempre que no esté activa la reordenación por cercanía).
  const rankedBusinesses = useMemo(() => {
    if (!query.trim() || onlyOpenNow) return filteredBusinesses;
    const withTier = filteredBusinesses.map((b, i) => ({ b, t: matchTier(b, query), i }));
    withTier.sort((a, z) => z.t - a.t || a.i - z.i);
    return withTier.map((x) => x.b);
  }, [filteredBusinesses, query, onlyOpenNow]);

  // --- Orden por cercanía cuando onlyOpenNow está activo y hay coords ---
  const sortedBusinesses = useMemo(() => {
    if (!onlyOpenNow) return rankedBusinesses;
    // Leer coords guardadas de localStorage
    let savedCoords = null;
    try {
      const sl = localStorage.getItem('guaki_user_location');
      if (sl) {
        const parsed = JSON.parse(sl);
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          savedCoords = { lat: parsed.lat, lng: parsed.lng };
        }
      }
    } catch {}
    // Si no hay coords guardadas, no reordenar (order normal)
    if (!savedCoords || !rankedBusinesses.some((b) => typeof b.lat === 'number' && typeof b.lng === 'number')) {
      return rankedBusinesses;
    }
    const userLat = savedCoords.lat;
    const userLng = savedCoords.lng;
    const to = rankedBusinesses.filter((b) => typeof b.lat === 'number' && typeof b.lng === 'number');
    const from = rankedBusinesses.filter((b) => !(typeof b.lat === 'number' && typeof b.lng === 'number'));
    // Haversine formula (radio Tierra: 6371 km)
    const haversine = (b: AficheBusinessData) => {
      const r = 6371;
      const lat1 = userLat * Math.PI / 180;
      const lat2 = b.lat! * Math.PI / 180;
      const dLat = (b.lat! - userLat) * Math.PI / 180;
      const dLng = (b.lng! - userLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.asin(Math.sqrt(a));
      return r * c;
    };
    const sorted = [...to].sort((a, b) => haversine(a) - haversine(b));
    return [...sorted, ...from];
  }, [onlyOpenNow, rankedBusinesses]);

  const activeFiltersCount = (selectedCity ? 1 : 0) + (selectedCategory !== 'todos' ? 1 : 0) + (selectedCountry !== 'todos' ? 1 : 0) + (onlyOpenNow ? 1 : 0);

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

        {/* 🌎 Separación por País (2026-09-23 — VE/CO no se juntan) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '18px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { id: 'todos', label: 'Todos', flag: '🌍' },
            { id: 'co', label: 'Colombia', flag: '🇨🇴' },
            { id: 've', label: 'Venezuela', flag: '🇻🇪' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8);
                setSelectedCountry(c.id as 'todos' | 'co' | 've');
              }}
              style={{
                padding: '8px 18px',
                borderRadius: TOKENS.radii.pill,
                fontSize: '0.84rem',
                fontWeight: selectedCountry === c.id ? 800 : 600,
                cursor: 'pointer',
                border: `2px solid ${selectedCountry === c.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                backgroundColor: selectedCountry === c.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                color: selectedCountry === c.id ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease',
                willChange: 'transform',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>{c.flag}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>

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
          {isFiltersOpen && isMobile ? (
              <FilterBottomSheet
                isOpen={isFiltersOpen}
                onClose={() => setIsFiltersOpen(false)}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
                selectedCity={selectedCity}
                setSelectedCity={setSelectedCity}
                selectedCategory={selectedCategory}
                setQuery={setQuery}
                setSelectedCategory={setSelectedCategory}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                onlyOpenNow={onlyOpenNow}
                setOnlyOpenNow={setOnlyOpenNow}
                activeFiltersCount={activeFiltersCount}
                cities={cities.map((c) => ({ id: c, label: c }))}
                categories={categories}
              />
            ) : (
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
          ) : null
        </div>

        {/* Contador de Resultados + Compartir (#45) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, fontWeight: 700, textAlign: 'center' }}>
            {loading
              ? 'Cargando comercios…'
              : `${rankedBusinesses.length} ${rankedBusinesses.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}`}
          </span>
          {!loading && rankedBusinesses.length > 0 && (
            <button
              type="button"
              aria-label="Compartir esta búsqueda"
              onClick={async () => {
                const params = new URLSearchParams();
                if (query.trim()) params.set('q', query.trim());
                if (selectedCity) params.set('city', selectedCity);
                if (selectedCategory !== 'todos') params.set('cat', selectedCategory);
                if (selectedCountry !== 'todos') params.set('country', selectedCountry);
                if (onlyOpenNow) params.set('open', '1');
                const path = `/directorio${params.toString() ? `?${params}` : ''}`;
                const url = `${window.location.origin}${path}`;
                let copiedOk = false;
                try {
                  await navigator.clipboard.writeText(url);
                  copiedOk = true;
                } catch {
                  // Fallback: navegadores sin Clipboard API (o contexto no seguro).
                  try {
                    const ta = document.createElement('textarea');
                    ta.value = url;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    copiedOk = document.execCommand('copy');
                    document.body.removeChild(ta);
                  } catch {}
                  if (!copiedOk) {
                    // Último recurso: prompt con el link para copiarlo a mano.
                    try { window.prompt('Copia el enlace de tu búsqueda:', url); } catch {}
                  }
                }
                if (copiedOk) {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 2000);
                }
              }}
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                color: copied ? '#15803D' : TOKENS.colors.textSecondary,
                backgroundColor: copied ? 'rgba(34, 197, 94, 0.14)' : TOKENS.colors.surfaceElevated,
                border: `1px solid ${copied ? '#22C55E' : TOKENS.colors.borderLight}`,
                borderRadius: '999px',
                padding: '6px 14px',
                boxShadow: TOKENS.shadows.btnConvex,
              }}
            >
              {copied ? 'Link copiado ✓' : 'Compartir búsqueda'}
            </button>
          )}
        </div>

        {/* #49: aviso de reintento tolerante (fuzzy) */}
        {!loading && fuzzyActive && (
          <div
            role="status"
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              flexWrap: 'wrap', textAlign: 'center', margin: '-8px 0 20px',
              fontSize: '0.82rem', fontWeight: 700, color: '#92400E',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px', padding: '8px 14px',
            }}
          >
            <span>
              No hubo coincidencias exactas con “{query.trim()}” — mostrando resultados similares.
            </span>
            <button
              type="button"
              onClick={() => setShowExactOnly(true)}
              style={{
                fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                color: '#92400E', backgroundColor: 'transparent',
                border: 'none', textDecoration: 'underline', padding: 0,
              }}
            >
              Ver solo coincidencias exactas
            </button>
          </div>
        )}

        {/* Grid o Lista de Resultados */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: TOKENS.colors.textSecondary }}>
            <p style={{ fontWeight: 600 }}>Cargando directorio oficial de comercios...</p>
          </div>
        ) : sortedBusinesses.length === 0 ? (
          <div>
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
            {/* #49c: sugerencias de ciudad cuando la búsqueda agota resultados */}
            {citySuggestions.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '-14px' }}>
                <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, fontWeight: 700 }}>
                  ¿Quizás quisiste decir?
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                  {citySuggestions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c);
                        setShowExactOnly(false);
                      }}
                      style={{
                        fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                        color: TOKENS.colors.greenPrimary,
                        backgroundColor: 'rgba(34, 197, 94, 0.10)',
                        border: `1px solid ${TOKENS.colors.greenPrimary}44`,
                        borderRadius: '999px', padding: '7px 15px',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'map' ? (
          <InteractiveCityMap
            defaultCity={selectedCity || 'Medellín'}
            businesses={sortedBusinesses.filter((b) => typeof b.lat === 'number' && typeof b.lng === 'number').map((b) => ({
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
            {sortedBusinesses.slice(0, visibleCount).map((b) => (
              <AficheCard key={b.id} afiche={b} source={query.trim() ? 'search_result' : 'directory'} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '840px', margin: '0 auto' }}>
            {sortedBusinesses.slice(0, visibleCount).map((b) => (
              <BusinessListItem key={b.id} business={b} />
            ))}
          </div>
        )}

        {/* 2026-09-23: Cargar más — paginación del render (el DOM se mantiene sano) */}
        {viewMode !== 'map' && sortedBusinesses.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <button
              type="button"
              onClick={() => setVisibleCount(visibleCount + 48)}
              className="neu-btn-primary"
              style={{
                padding: '12px 32px',
                borderRadius: TOKENS.radii.pill,
                fontSize: '0.92rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cargar más ({sortedBusinesses.length - visibleCount} restantes)
            </button>
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
