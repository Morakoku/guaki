'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TOKENS } from '../../lib/design-tokens';

export const PLACEHOLDER_PHRASES = [
  '¿Qué servicio necesitas hoy?',
  '¿Qué negocio estás buscando?',
  '¿Necesitas un profesional cerca?',
  '¿Buscas dónde comer?',
  '¿Quieres encontrar un servicio?',
  '¿Qué necesitas resolver hoy?',
  '¿Buscas un negocio en tu zona?',
  '¿Necesitas ayuda con algo?',
  '¿Qué estás buscando cerca de ti?',
  '¿Quieres descubrir negocios locales?',
  '¿Buscas un profesional específico?',
  '¿Qué necesitas encontrar?',
];

interface SearchBarProps {
  initialQuery?: string;
  initialCity?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  onSearchSubmit?: (query: string, city: string) => void;
  detectedLocation?: string | null;
}

export default function SearchBar({
  initialQuery = '',
  initialCity = '',
  className = '',
  style = {},
  autoFocus = false,
  onSearchSubmit,
  detectedLocation = null,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [slideState, setSlideState] = useState<'entering' | 'active' | 'exiting'>('active');
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // 🔄 Sincronizar initialQuery si cambia desde la URL o el padre
  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // 🔄 Rotación fluida con animación de slide cada 4.5s
  useEffect(() => {
    if (isFocused || query.length > 0) return;

    const interval = setInterval(() => {
      setSlideState('exiting');
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % PLACEHOLDER_PHRASES.length);
        setSlideState('entering');
        setTimeout(() => setSlideState('active'), 50);
      }, 200);
    }, 4500);

    return () => clearInterval(interval);
  }, [isFocused, query]);

  // Si se detecta una ubicación, preestablecer ciudad en segundo plano
  useEffect(() => {
    if (detectedLocation && !city) {
      if (
        detectedLocation.toLowerCase().includes('medellín') ||
        detectedLocation.toLowerCase().includes('poblado') ||
        detectedLocation.toLowerCase().includes('laureles') ||
        detectedLocation.toLowerCase().includes('envigado')
      ) {
        setCity('Medellín');
      } else if (
        detectedLocation.toLowerCase().includes('bogotá') ||
        detectedLocation.toLowerCase().includes('usaquén') ||
        detectedLocation.toLowerCase().includes('chapinero')
      ) {
        setCity('Bogotá');
      } else if (detectedLocation.toLowerCase().includes('cali')) {
        setCity('Cali');
      } else if (detectedLocation.toLowerCase().includes('soacha')) {
        setCity('Soacha');
      }
    }
  }, [detectedLocation, city]);

  // 🎙️ Dictado por voz directo en la barra (Speech-to-Text en el input)
  const toggleVoiceDictation = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta dictado directo por voz. Puedes escribir tu búsqueda.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-CO';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        inputRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting voice dictation:', err);
      setIsListening(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (onSearchSubmit) {
      onSearchSubmit(query.trim(), city.trim());
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city.trim()) params.set('city', city.trim());
    router.push(`/directorio?${params.toString()}`);
  };

  const showAnimatedOverlay = !isFocused && query.length === 0;

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      aria-label="Buscar negocios y servicios en Guaki"
      className={`glass-surface-elevated search-bar-form ${className}`}
      style={{
        borderRadius: TOKENS.radii.hero,
        padding: isFocused ? '7px 8px 7px 16px' : '6px 8px 6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        boxShadow: isListening
          ? '0 0 20px rgba(16, 185, 129, 0.24)'
          : isFocused
          ? '0 4px 16px rgba(23, 56, 45, 0.09)'
          : 'none',
        border: isListening
          ? '1.5px solid #10B981'
          : isFocused
          ? `1.5px solid ${TOKENS.colors.emeraldDark}`
          : `1px solid ${TOKENS.colors.borderLight}`,
        transition:
          'transform 180ms cubic-bezier(0.23, 1, 0.32, 1), border-color 180ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 180ms ease',
        willChange: 'transform, border-color, box-shadow',
        position: 'relative',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* 🔍 Icono de búsqueda */}
      <Search
        size={19}
        color={isFocused || isListening ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary}
        style={{
          flexShrink: 0,
          transition:
            'color 180ms cubic-bezier(0.23, 1, 0.32, 1), transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
          transform: isFocused || isListening ? 'scale(1.05)' : 'scale(1)',
          willChange: 'transform',
        }}
      />

      {/* Input con Placeholder Animado por Slide */}
      <div style={{ flex: '1 1 auto', minWidth: 0, position: 'relative', overflow: 'hidden' }}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isListening ? 'Escuchando tu voz...' : isFocused ? 'Escribe lo que necesitas...' : ''}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            fontSize: 'clamp(0.90rem, 2.4vw, 1.02rem)',
            fontWeight: 600,
            color: TOKENS.colors.textMain,
            padding: '10px 0',
            minWidth: 0,
            position: 'relative',
            zIndex: 2,
          }}
        />

        {/* 🎬 Capa de Placeholder Deslizante Animado */}
        {showAnimatedOverlay && !isListening && (
          <div
            onClick={() => inputRef.current?.focus()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              transform:
                slideState === 'active'
                  ? 'translateX(0)'
                  : slideState === 'entering'
                  ? 'translateX(18px)'
                  : 'translateX(-18px)',
              opacity: slideState === 'active' ? 1 : 0,
              transition: 'transform 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 220ms ease',
              willChange: 'transform, opacity',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(0.86rem, 2.4vw, 0.98rem)',
                fontWeight: 600,
                color: TOKENS.colors.textMuted,
              }}
            >
              {PLACEHOLDER_PHRASES[phraseIndex]}
            </span>
          </div>
        )}
      </div>

      {/* 🎙️ Botón de Micrófono para Dictado Directo con Ondas de Escucha */}
      <button
        type="button"
        onClick={toggleVoiceDictation}
        aria-label={isListening ? 'Detener dictado por voz' : 'Dictar por voz en la barra'}
        title={isListening ? 'Detener dictado' : 'Dictar con tu voz'}
        className={isListening ? 'guaki-voice-listening' : ''}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: TOKENS.radii.pill,
          backgroundColor: isListening ? '#10B981' : TOKENS.colors.surfaceElevated,
          color: isListening ? '#FFFFFF' : TOKENS.colors.emeraldDark,
          border: isListening ? '1px solid #059669' : `1px solid ${TOKENS.colors.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: isListening ? '0 0 10px rgba(16, 185, 129, 0.5)' : TOKENS.shadows.btnConvex,
          transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
          position: 'relative',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isListening ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
            <span className="guaki-wave-bar" style={{ backgroundColor: '#FFFFFF', width: '2px', height: '10px' }} />
            <span className="guaki-wave-bar" style={{ backgroundColor: '#FFFFFF', width: '2px', height: '14px' }} />
            <span className="guaki-wave-bar" style={{ backgroundColor: '#FFFFFF', width: '2px', height: '8px' }} />
          </div>
        ) : (
          <Mic size={16} color={TOKENS.colors.emeraldDark} />
        )}
      </button>

      {/* 🚀 Botón Buscar */}
      <button
        type="submit"
        className="search-bar-btn"
        style={{
          borderRadius: TOKENS.radii.pill,
          padding: '8px 18px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.86rem',
          fontWeight: 800,
          flexShrink: 0,
          minWidth: '72px',
          whiteSpace: 'nowrap',
          backgroundColor: TOKENS.colors.emeraldDark,
          color: TOKENS.colors.white,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(23, 56, 45, 0.22)',
          transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1F4D3E';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = TOKENS.colors.emeraldDark;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>Buscar</span>
      </button>
    </form>
  );
}
