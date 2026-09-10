'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  X,
  Sparkles,
  MapPin,
  MessageCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { parseSearchIntent } from '@/lib/search_intent.mjs';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceSearchModal({ isOpen, onClose }: VoiceSearchModalProps) {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [topThreeResults, setTopThreeResults] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const intent = parseSearchIntent(transcript, 'Medellín');

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechSupported(false);
      } else {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-CO';

        recognition.onstart = () => {
          setIsListening(true);
          setErrorMessage('');
          autoSubmitRef.current = true;
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setErrorMessage('Permiso de micrófono denegado. Escribe tu búsqueda abajo.');
          } else if (event.error !== 'no-speech') {
            setErrorMessage('No detectamos audio claro. Intenta tocar de nuevo.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Preparar una búsqueda nueva al abrir el modal. Un solo tap = hablar:
  // activamos la escucha automáticamente tras un micro-delay si el navegador
  // la soporta; si no (permiso denegado / navegador sin Web Speech), el foco
  // cae directo en el input para escribir sin pasos extra.
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setErrorMessage('');
      setTopThreeResults([]);
      setIsListening(false);
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 120);
      if (speechSupported && recognitionRef.current) {
        const listenTimer = window.setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            /* start() duplicado o bloqueado: el usuario puede tocar el mic manualmente */
          }
        }, 260);
        return () => {
          window.clearTimeout(focusTimer);
          window.clearTimeout(listenTimer);
        };
      }
      return () => window.clearTimeout(focusTimer);
    } else if (!isOpen && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [isOpen, speechSupported]);

  // Fin de la dictación → búsqueda automática. El usuario habla y obtiene
  // resultados sin pasos intermedios (sin re-tocar el mic ni el botón de buscar).
  const autoSubmitRef = useRef(false);
  useEffect(() => {
    if (!isListening && transcript.trim().length >= 3 && autoSubmitRef.current) {
      autoSubmitRef.current = false;
      const submitTimer = window.setTimeout(() => handleExecuteSearch(), 480);
      return () => window.clearTimeout(submitTimer);
    }
  }, [isListening, transcript]);

  // El modal debe comportarse como una capa de diálogo real: no desplazar el fondo
  // y permitir cerrarlo con Escape sin activar el micrófono de forma inesperada.
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Búsqueda del Top 3 en tiempo real
  useEffect(() => {
    const query = transcript.trim();
    if (query.length < 3) {
      setTopThreeResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          const list = data.results || [];
          const sorted = list
            .slice()
            .sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0))
            .slice(0, 3);
          setTopThreeResults(sorted);
        } else {
          setTopThreeResults([]);
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') setTopThreeResults([]);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [transcript]);

  const toggleListening = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    if (!speechSupported || !recognitionRef.current) {
      setErrorMessage('La voz no está disponible en este navegador. Escribe tu búsqueda abajo.');
      inputRef.current?.focus();
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMessage('');
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const handleExecuteSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = transcript.trim();
    if (!query) return;

    onClose();
    const params = new URLSearchParams();
    params.set('q', query);
    if (intent.categoryHint) params.set('category', intent.categoryHint);
    router.push(`/directorio?${params.toString()}`);
  };

  if (!isOpen) return null;

  const medalBadges = ['🥇 #1 Recomendado', '🥈 #2 Recomendado', '🥉 #3 Recomendado'];

  return (
    <div
      className="guaki-voice-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        backgroundColor: 'rgba(15, 23, 19, 0.52)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 0 calc(12px + env(safe-area-inset-bottom, 0px))',
        animation: 'fadeIn 180ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
      }}
      onClick={onClose}
    >
      <div
        className="neu-level-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guaki-voice-title"
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 10px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '30px',
          padding: '24px 20px',
          backgroundColor: TOKENS.colors.surfaceElevated,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.26), 0 2px 10px rgba(255, 255, 255, 0.95)',
          position: 'relative',
          animation: 'guaki-slide-up 220ms cubic-bezier(0.23, 1, 0.32, 1) forwards',
          willChange: 'transform, opacity',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: TOKENS.colors.surface,
            border: `1px solid ${TOKENS.colors.borderLight}`,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            color: TOKENS.colors.textSecondary,
            transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            willChange: 'transform',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <X size={15} />
        </button>

        {/* Encabezado */}
        <div className="guaki-modal-item-in" style={{ textAlign: 'center', marginBottom: '18px', animationDelay: '40ms' }}>
          <div
            className="guaki-modal-item-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: TOKENS.colors.highlight,
              color: TOKENS.colors.emeraldDark,
              padding: '3px 10px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={11} />
            <span>BUSCADOR POR VOZ DE GUAKI</span>
          </div>

          <h2
            id="guaki-voice-title"
            style={{
              fontSize: 'clamp(1.15rem, 3.6vw, 1.35rem)',
              fontWeight: 800,
              color: TOKENS.colors.textMain,
              margin: '0 0 4px',
              textAlign: 'center',
              letterSpacing: '-0.02em',
            }}
          >
            {isListening ? 'Te estamos escuchando' : '¿Qué necesitas encontrar?'}
          </h2>

          <p style={{ fontSize: '0.8rem', color: TOKENS.colors.textSecondary, margin: 0, textAlign: 'center' }}>
            {isListening
              ? 'Dilo naturalmente (ej. "Peluquería cerca", "Veterinaria 24h")'
              : speechSupported
                ? 'Te escuchamos automáticamente al abrir — o escribe tu búsqueda'
                : 'La búsqueda por voz no está disponible aquí. Escribe tu búsqueda.'}
          </p>
        </div>

        {/* Botón Central Micrófono con 3 Ondas de Audio Fluidas */}
        <div className="guaki-modal-item-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px', animationDelay: '180ms' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Halo Orgánico de Respiración */}
            {isListening && (
              <div
                className="animate-guaki-breathe"
                style={{
                  position: 'absolute',
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(23, 56, 45, 0.16)',
                  pointerEvents: 'none',
                  willChange: 'transform, opacity',
                }}
              />
            )}

            <button
              type="button"
              onClick={toggleListening}
              className="guaki-voice-center-btn"
              aria-label={isListening ? 'Detener escucha' : 'Comenzar a hablar'}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: TOKENS.colors.emeraldDark,
                color: TOKENS.colors.white,
                border: '3px solid rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4.5px',
                cursor: 'pointer',
                opacity: 1,
                boxShadow: isListening
                  ? '0 10px 28px rgba(23, 56, 45, 0.38)'
                  : '0 8px 24px rgba(23, 56, 45, 0.25)',
                transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                willChange: 'transform',
                position: 'relative',
                zIndex: 2,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* 3 Barras de Onda de Audio Orgánicas (Transform GPU) */}
              <span
                className={`guaki-wave-bar-1${isListening ? ' animate-guaki-bar-1' : ''}`}
                style={{
                  width: '4px',
                  height: '24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '999px',
                  transformOrigin: 'center',
                  transform: isListening ? undefined : 'scaleY(0.35)',
                  transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                  willChange: 'transform',
                }}
              />
              <span
                className={`guaki-wave-bar-2${isListening ? ' animate-guaki-bar-2' : ''}`}
                style={{
                  width: '4px',
                  height: '24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '999px',
                  transformOrigin: 'center',
                  transform: isListening ? undefined : 'scaleY(0.7)',
                  transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                  willChange: 'transform',
                }}
              />
              <span
                className={`guaki-wave-bar-3${isListening ? ' animate-guaki-bar-3' : ''}`}
                style={{
                  width: '4px',
                  height: '24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '999px',
                  transformOrigin: 'center',
                  transform: isListening ? undefined : 'scaleY(0.35)',
                  transition: 'transform 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                  willChange: 'transform',
                }}
              />
            </button>
          </div>

          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: TOKENS.colors.emeraldDark,
              marginTop: '10px',
              letterSpacing: '0.01em',
            }}
          >
            {isListening ? '🎙️ Escuchando...' : speechSupported ? 'Toca para volver a hablar' : 'Escribe tu búsqueda'}
          </span>
        </div>

        {/* Input y Transcripción */}
        <form className="guaki-modal-item-in" onSubmit={handleExecuteSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px', animationDelay: '280ms' }}>
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              className="guaki-voice-input-glow"
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              aria-label="Buscar en Guaki"
              placeholder="Escribe qué necesitas o toca el micrófono..."
              style={{
                width: '100%',
                padding: '12px 38px 12px 14px',
                borderRadius: TOKENS.radii.md,
                backgroundColor: TOKENS.colors.surface,
                border: `1px solid ${TOKENS.colors.borderLight}`,
                boxShadow: TOKENS.shadows.inset,
                color: TOKENS.colors.textMain,
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 160ms ease',
              }}
            />
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                aria-label="Limpiar texto"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: TOKENS.colors.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Detección de Intención */}
          {transcript.trim().length >= 3 && (
            <div
              style={{
                padding: '7px 10px',
                borderRadius: TOKENS.radii.sm,
                backgroundColor: TOKENS.colors.surface,
                border: `1px solid ${TOKENS.colors.borderLight}`,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                fontSize: '0.72rem',
              }}
            >
              <span style={{ fontWeight: 700, color: TOKENS.colors.textSecondary }}>Detectado:</span>
              {intent.categoryHint && (
                <span style={{ backgroundColor: TOKENS.colors.highlight, color: TOKENS.colors.emeraldDark, padding: '2px 8px', borderRadius: TOKENS.radii.pill, fontWeight: 800 }}>
                  🏷️ {intent.categoryHint.toUpperCase()}
                </span>
              )}
              {intent.nearby && (
                <span style={{ backgroundColor: 'rgba(21, 128, 61, 0.12)', color: '#15803D', padding: '2px 8px', borderRadius: TOKENS.radii.pill, fontWeight: 800 }}>
                  📍 Cerca de ti
                </span>
              )}
              {intent.availability && (
                <span style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#B45309', padding: '2px 8px', borderRadius: TOKENS.radii.pill, fontWeight: 800 }}>
                  ⚡ Disponible hoy
                </span>
              )}
            </div>
          )}

          {/* Despliegue del Top 3 Dinámico */}
          {topThreeResults.length > 0 && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Top 3 mejores opciones encontradas:</span>
                <span style={{ color: TOKENS.colors.emeraldDark, fontSize: '0.7rem' }}>Verificados</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topThreeResults.map((biz, idx) => {
                  const whatsappNumber = normalizeWhatsAppNumber(biz.whatsapp);

                  return (
                  <div
                    key={biz.id || biz.slug}
                    style={{
                      padding: '11px 13px',
                      borderRadius: TOKENS.radii.md,
                      backgroundColor: idx === 0 ? 'rgba(23, 56, 45, 0.04)' : TOKENS.colors.surface,
                      border: idx === 0 ? `1.5px solid ${TOKENS.colors.emeraldDark}` : `1px solid ${TOKENS.colors.borderLight}`,
                      boxShadow: idx === 0 ? '0 4px 14px rgba(23, 56, 45, 0.06)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                      <div>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: idx === 0 ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                            color: idx === 0 ? TOKENS.colors.white : TOKENS.colors.textSecondary,
                            display: 'inline-block',
                            marginBottom: '4px',
                          }}
                        >
                          {medalBadges[idx]}
                        </span>
                        <div style={{ fontWeight: 800, fontSize: '0.86rem', color: TOKENS.colors.textMain }}>
                          {biz.name}
                        </div>
                      </div>

                      {/* Plan gratuito: sin reputación visible (regla de planes) */}
                      {!['free', 'gratis', 'basico'].includes(String(biz.plan || '').toLowerCase()) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.78rem', fontWeight: 800, color: '#D97706' }}>
                          <Star size={12} fill="#D97706" color="#D97706" />
                          <span>{(biz.rating || 4.9).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} color={TOKENS.colors.emeraldDark} /> {biz.address || biz.city}
                    </div>

                    {/* Acciones 1-Clic */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${biz.name}, los vi en Guaki buscando: "${transcript.trim()}". ¿Tienen disponibilidad?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: '#25D366',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                          }}
                          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <MessageCircle size={12} /> WhatsApp Directo
                        </a>
                      )}
                      {/* Plan gratuito: sin ficha — el WhatsApp ES el contacto */}
                      {!['free', 'gratis', 'basico'].includes(String(biz.plan || '').toLowerCase()) && (
                      <Link
                        href={`/proveedores/${biz.slug}`}
                        onClick={onClose}
                        style={{
                          padding: '6px 12px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: TOKENS.colors.surfaceElevated,
                          border: `1px solid ${TOKENS.colors.borderLight}`,
                          color: TOKENS.colors.textMain,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        Ver Ficha
                      </Link>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {errorMessage && (
            <div role="alert" style={{ color: TOKENS.colors.danger, fontSize: '0.76rem', textAlign: 'center' }}>
              {errorMessage}
            </div>
          )}

          {/* Botón de Acción Principal */}
          <button
            type="submit"
            disabled={!transcript.trim()}
            className="neu-btn-primary guaki-voice-cta-pulse"
            style={{
              padding: '12px',
              fontSize: '0.88rem',
              width: '100%',
              marginTop: '4px',
              opacity: transcript.trim() ? 1 : 0.6,
              cursor: transcript.trim() ? 'pointer' : 'not-allowed',
              transition: 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms cubic-bezier(0.23, 1, 0.32, 1)',
              willChange: 'transform, opacity',
            }}
            onMouseDown={(e) => {
              if (transcript.trim()) e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>Buscar en el Directorio</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
