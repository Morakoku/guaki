'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Maximize2,
  Minimize2,
  Train,
  Compass,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { getVisibleMapBounds, projectCoordinateToPercent } from '@/lib/map-projection';
import {
  calculateDistanceKm,
  formatDistance,
  estimateTravelTimes,
  getNearestTransitStation,
  CITY_SECTORS,
  GeoLocation,
} from '@/lib/geo_spatial';

interface MapBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  plan?: string;
}

interface InteractiveCityMapProps {
  businesses?: MapBusiness[];
  defaultCity?: string;
}

export default function InteractiveCityMap({
  businesses = [],
  defaultCity = 'Medellín',
}: InteractiveCityMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [activeSector, setActiveSector] = useState<string>('todos');
  const [isLocating, setIsLocating] = useState(false);
  const [locationUnavailable, setLocationUnavailable] = useState(false);

  // Coordenadas base de Medellín
  const baseLat = 6.2088;
  const baseLng = -75.5678;


  const handleGetLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setUserLocation(null);
      setLocationUnavailable(true);
      return;
    }

    setIsLocating(true);
    setLocationUnavailable(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationUnavailable(false);
        } else {
          setUserLocation(null);
          setLocationUnavailable(true);
        }
        setIsLocating(false);
      },
      () => {
        setUserLocation(null);
        setLocationUnavailable(true);
        setIsLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const visibleBounds = getVisibleMapBounds(defaultCity);
  const mappedBusinesses = visibleBounds
    ? businesses.flatMap((business) => {
        const position = projectCoordinateToPercent(business, visibleBounds);
        return position ? [{ business, position }] : [];
      })
    : [];
  const activeBiz = selectedBusiness || mappedBusinesses[0]?.business || null;
  const userOrBizLoc = userLocation || (activeBiz ? { lat: activeBiz.lat, lng: activeBiz.lng } : { lat: baseLat, lng: baseLng });
  const nearestStation = getNearestTransitStation(userOrBizLoc, defaultCity);

  const distanceKm = userLocation && activeBiz
    ? calculateDistanceKm(userLocation, { lat: activeBiz.lat, lng: activeBiz.lng })
    : 0;

  const travelTimes = estimateTravelTimes(distanceKm);

  // Fondo cartográfico real de OpenStreetMap. La capa es solo visual; los pines
  // siguen siendo los comercios del directorio y mantienen sus acciones propias.
  const mapZoom = 13;
  const tileSize = 256;
  const worldTiles = 2 ** mapZoom;
  const centerX = ((baseLng + 180) / 360) * worldTiles;
  const sinLat = Math.sin((baseLat * Math.PI) / 180);
  const centerY = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * worldTiles;
  const mapTiles = Array.from({ length: 9 }, (_, index) => {
    const column = (index % 3) - 1;
    const row = Math.floor(index / 3) - 1;
    const rawX = Math.floor(centerX) + column;
    const tileX = ((rawX % worldTiles) + worldTiles) % worldTiles;
    const tileY = Math.floor(centerY) + row;
    return {
      key: `${tileX}-${tileY}`,
      src: `https://tile.openstreetmap.org/${mapZoom}/${tileX}/${tileY}.png`,
      left: (rawX - centerX) * tileSize,
      top: (tileY - centerY) * tileSize,
    };
  });

  return (
    <section
      className={`neu-level-2 ${isFullscreen ? 'guaki-map-fullscreen' : ''}`}
      style={{
        padding: '22px 20px',
        borderRadius: isFullscreen ? '0px' : TOKENS.radii.xl,
        backgroundColor: TOKENS.colors.surfaceElevated,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 99999 : 1,
        height: isFullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Barra Superior del Mapa */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#17382D',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
              Explorador Geoespacial de {defaultCity}
            </h3>
            <span style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>
              {mappedBusinesses.length} comercios dentro del área visible
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Botón Cerca de Mí */}
          <button
            type="button"
            onClick={handleGetLocation}
            className="neu-level-3"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 800,
              color: userLocation ? '#15803D' : TOKENS.colors.emeraldDark,
              borderRadius: TOKENS.radii.pill,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            {userLocation ? 'Ubicación detectada' : isLocating ? 'Buscando ubicación…' : locationUnavailable ? 'Ubicación no disponible' : 'Cerca de mí'}
          </button>

          {/* Botón Pantalla Completa */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="neu-level-3"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Ver mapa en pantalla completa'}
            style={{
              padding: '7px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              color: TOKENS.colors.emeraldDark,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Chips de Barrios y Sectores (Punto 125) */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveSector('todos')}
          style={{
            padding: '4px 12px',
            borderRadius: TOKENS.radii.pill,
            fontSize: '0.72rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeSector === 'todos' ? '#17382D' : '#FFFFFF',
            color: activeSector === 'todos' ? '#FFFFFF' : TOKENS.colors.textSecondary,
          }}
        >
          📍 Todos los sectores
        </button>
        {(CITY_SECTORS[defaultCity as keyof typeof CITY_SECTORS] || CITY_SECTORS.Medellín).map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => setActiveSector(s.slug)}
            style={{
              padding: '4px 12px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.72rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSector === s.slug ? '#17382D' : '#FFFFFF',
              color: activeSector === s.slug ? '#FFFFFF' : TOKENS.colors.textSecondary,
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Canvas Visual Neumórfico del Mapa */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? 'calc(100vh - 220px)' : '320px',
          borderRadius: TOKENS.radii.lg,
          backgroundColor: '#DFE7DE',
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.20) 0%, rgba(223,231,222,0.36) 100%)',
          overflow: 'hidden',
          border: `1px solid ${TOKENS.colors.borderLight}`,
          boxShadow: 'inset 2px 2px 6px rgba(90,110,95,0.15)',
        }}
      >
        {/* Cartografía base real; si el proveedor de tiles no responde, permanece el fondo degradado. */}
        <div
          role="img"
          aria-label={`Mapa de OpenStreetMap de ${defaultCity}`}
          style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: '#DFE7DE' }}
        >
          {mapTiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.src}
              alt=""
              aria-hidden="true"
              loading="lazy"
              style={{
                position: 'absolute',
                width: `${tileSize}px`,
                height: `${tileSize}px`,
                left: `calc(50% + ${tile.left}px)`,
                top: `calc(50% + ${tile.top}px)`,
                maxWidth: 'none',
                opacity: 0.72,
                filter: 'saturate(0.72) sepia(0.08)',
              }}
            />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(226, 239, 226, 0.26), rgba(255, 255, 255, 0.12))', pointerEvents: 'none' }} />
        </div>

        <span
          style={{ position: 'absolute', left: '10px', bottom: '8px', zIndex: 3, padding: '3px 6px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.82)', color: '#52635A', fontSize: '0.62rem', fontWeight: 700 }}
        >
          Densidad: sin datos verificados
        </span>

        {/* Cuadrícula de calles sutil */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.10 }}>
          <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5A6E63" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#city-grid)" />
        </svg>

        <span style={{ position: 'absolute', right: '10px', bottom: '8px', zIndex: 3, padding: '3px 6px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.82)', color: '#52635A', fontSize: '0.62rem', fontWeight: 700 }}>
          © OpenStreetMap contributors
        </span>

        {/* Pines Interactivos en el Mapa (Puntos 121 y 122) */}
        {mappedBusinesses.length === 0 ? (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: '24px', textAlign: 'center', color: TOKENS.colors.textSecondary, zIndex: 4 }}>
            <span>No hay comercios con coordenadas verificables dentro del área visible.</span>
          </div>
        ) : mappedBusinesses.map(({ business: b, position }) => {
          const isSelected = activeBiz?.id === b.id;
          const posX = position.left;
          const posY = position.top;

          return (
            <div
              key={b.id}
              onClick={() => setSelectedBusiness(b)}
              style={{
                position: 'absolute',
                top: `${posY}%`,
                left: `${posX}%`,
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                zIndex: isSelected ? 10 : 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
              }}
            >
              {/* Etiqueta del Comercio sobre el pin */}
              <div
                style={{
                  backgroundColor: isSelected ? '#17382D' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : TOKENS.colors.textMain,
                  padding: '4px 10px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '2px',
                  border: isSelected ? '1.5px solid #AFC8AD' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <span>{b.plan === 'vip' ? '👑' : '🥑'}</span>
                <span>{b.name.split(' ')[0]}</span>
                <span style={{ color: isSelected ? '#FDE68A' : '#D97706' }}>★ {b.rating}</span>
              </div>

              {/* Pin Neumórfico */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50% 50% 50% 0',
                  backgroundColor: isSelected ? '#15803D' : '#5F8F67',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ficha Inferior del Comercio Seleccionado con Tiempos de Llegada (Puntos 124, 126 y 127) */}
      {activeBiz && <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: TOKENS.radii.lg,
          padding: '14px 16px',
          border: `1px solid ${TOKENS.colors.borderLight}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
              {activeBiz.category} · {activeBiz.city}
            </span>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '2px 0 0' }}>
              {activeBiz.name}
            </h4>
            <span style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary }}>
              📍 {activeBiz.address}
            </span>
          </div>

          <Link
            href={`/proveedores/${activeBiz.slug}`}
            className="neu-btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textDecoration: 'none',
              borderRadius: TOKENS.radii.pill,
            }}
          >
            Ver Ficha Completa →
          </Link>
        </div>

        {/* Tiempos de Llegada & Estación de Metro (Puntos 126 y 127) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            fontSize: '0.74rem',
            color: TOKENS.colors.textSecondary,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: TOKENS.colors.textMain }}>
            <span>🚶</span> <span>{travelTimes.walkingMin} min a pie ({formatDistance(distanceKm)})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <span>🚲</span> <span>{travelTimes.cyclingMin} min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <span>🚗</span> <span>{travelTimes.transitCarMin} min en auto</span>
          </div>
          {nearestStation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803D', fontWeight: 800 }}>
              <Train size={13} />
              <span>{nearestStation.station.name} ({formatDistance(nearestStation.distanceKm)})</span>
            </div>
          )}
        </div>
      </div>}
    </section>
  );
}
