'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { TOKENS } from '../../lib/design-tokens';

interface LocationButtonProps {
  onLocationChange?: (locationName: string, city: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

type LocationStatus = 'idle' | 'locating' | 'success' | 'denied' | 'unsupported' | 'error';

export default function LocationButton({
  onLocationChange,
  className = '',
  style = {},
}: LocationButtonProps) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [locationName, setLocationName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recuperar ubicación guardada previamente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('guaki_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.locationName && parsed.city) {
          setLocationName(parsed.locationName);
          setStatus('success');
          if (onLocationChange) {
            onLocationChange(parsed.locationName, parsed.city);
          }
        }
      }
    } catch {
      // Fallback silencioso en caso de SSR o storage bloqueado
    }
  }, [onLocationChange]);

  const requestLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setErrorMessage('Tu navegador no soporta geolocalización.');
      return;
    }

    setStatus('locating');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Consultar el endpoint de geocodificación inversa real
          const res = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const formatted = data.locationName || `${data.city}, Colombia`;
            const cityName = data.city || 'Colombia';

            setLocationName(formatted);
            setStatus('success');

            try {
              localStorage.setItem(
                'guaki_user_location',
                JSON.stringify({
                  locationName: formatted,
                  city: cityName,
                  lat: latitude,
                  lng: longitude,
                  timestamp: Date.now(),
                })
              );
            } catch {}

            if (onLocationChange) {
              onLocationChange(formatted, cityName);
            }
          } else {
            // Fallback con coordenadas
            const coordsText = `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}`;
            setLocationName(coordsText);
            setStatus('success');
          }
        } catch {
          setLocationName(`Ubicación GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`);
          setStatus('success');
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('No pudimos acceder a tu ubicación.');
        } else if (error.code === error.TIMEOUT) {
          setStatus('error');
          setErrorMessage('Tiempo de espera agotado al obtener ubicación.');
        } else {
          setStatus('error');
          setErrorMessage('No pudimos obtener la ubicación.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 min de caché
      }
    );
  };

  return (
    <div
      className={`location-control-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
    >
      {status === 'idle' && (
        <button
          type="button"
          onClick={requestLocation}
          className="soft-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: TOKENS.colors.surfaceElevated,
            borderRadius: TOKENS.radii.pill,
            padding: '7px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: TOKENS.colors.emeraldDark,
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.card,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <MapPin size={15} color={TOKENS.colors.emeraldDark} />
          <span>📍 Saber mi ubicación</span>
        </button>
      )}

      {status === 'locating' && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: TOKENS.colors.highlight,
            borderRadius: TOKENS.radii.pill,
            padding: '7px 16px',
            fontSize: '0.84rem',
            fontWeight: 700,
            color: TOKENS.colors.emeraldDark,
            border: `1px solid ${TOKENS.colors.borderLight}`,
          }}
        >
          <RefreshCw size={14} className="animate-spin" color={TOKENS.colors.emeraldDark} />
          <span>Obteniendo ubicación...</span>
        </div>
      )}

      {status === 'success' && locationName && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: TOKENS.colors.surfaceElevated,
            borderRadius: TOKENS.radii.pill,
            padding: '6px 14px 6px 12px',
            border: `1px solid ${TOKENS.colors.borderSubtle}`,
            boxShadow: TOKENS.shadows.card,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.84rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
            }}
          >
            <MapPin size={15} color={TOKENS.colors.greenPrimary} />
            <span>📍 {locationName}</span>
          </span>

          <button
            type="button"
            onClick={requestLocation}
            title="Actualizar ubicación"
            aria-label="Actualizar ubicación"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: TOKENS.colors.textMuted,
              padding: '2px',
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      )}

      {(status === 'denied' || status === 'error' || status === 'unsupported') && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEE2E2',
            borderRadius: TOKENS.radii.pill,
            padding: '6px 14px',
            border: '1px solid #FECACA',
          }}
        >
          <AlertCircle size={14} color={TOKENS.colors.danger} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: TOKENS.colors.danger }}>
            {errorMessage || 'No pudimos acceder a tu ubicación.'}
          </span>
          <button
            type="button"
            onClick={requestLocation}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
              textDecoration: 'underline',
              cursor: 'pointer',
              marginLeft: '4px',
            }}
          >
            Intentar nuevamente
          </button>
        </div>
      )}
    </div>
  );
}
