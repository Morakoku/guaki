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
  // Modo escritura: por defecto NO se muestra el input (cero teclado al abrir).
  // Se activa solo si el usuario toca "Prefiero escribir" o si la voz falla.
  const [typingMode, setTypingMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const suppressCueRef = useRef(false);

  const intent = parseSearchIntent(transcript, 'Medellín');

  // 🔔 Señal sonora/háptica de "tu turno para hablar".
  // Tono = funciona también en iOS (Safari no soporta vibrate).
  const ensureAudio = () => {
    if (typeof window === 'undefined') return null;
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new Ctor();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch {
      return null;
    }
    return audioCtxRef.current;
  };

  const playCue = (kind: 'ready' | 'done') => {
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const t = ctx.currentTime + 0.01;
      // 'ready': dos notas ascendentes suaves ("puedes hablar")
      // 'done': una nota grave corta ("terminó la escucha")
      const notes: Array<[number, number]> =
        kind === 'ready' ? [[660, 0], [990, 0.11]] : [[523, 0], [392, 0.1]];
      for (const [freq, offset] of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.055, t + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.18);
      }
    } catch {}
  };

  const vibratePattern = (kind: 'ready' | 'done') => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(kind === 'ready' ? 36 : [16, 70, 16]);
    } catch {}
  };

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
          // "Tu turno": tono + vibración para que el usuario sepa que puede hablar.
          playCue('ready');
          vibratePattern('ready');
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
            // Sin voz: mostramos la barra de escritura, pero SIN autofocus
            // (el foco abre el teclado del celular y arruina la experiencia).
            setTypingMode(true);
          } else if (event.error !== 'no-speech') {
            setErrorMessage('No detectamos audio claro. Intenta tocar de nuevo.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          // Cue de cierre solo si seguimos abiertos (no cuando cerramos el modal).
          if (!suppressCueRef.current) {
            playCue('done');
            vibratePattern('done');
          }
          suppressCueRef.current = false;
        };

        recognitionRef.current = recognition;
      }
    }
    // playCue/vibratePattern usan refs estables; registrar una sola vez es intencional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preparar una búsqueda nueva al abrir el modal. Un solo tap = hablar:
  // activamos la escucha automáticamente tras un micro-delay si el navegador
  // la soporta. NO enfocamos el input en ese caso (evita que el teclado del
  // celular se abra y tape el micrófono); el foco va al input solo cuando la
  // voz no está disponible o si el usuario decide escribir.
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setErrorMessage('');
      setTopThreeResults([]);
      setIsListening(false);
      setTypingMode(false);
      suppressCueRef.current = false;
      // Calentamos el AudioContext dentro del gesto del usuario (iOS exige
      // interacción para permitir audio); así el cue "puedes hablar" suena.
      ensureAudio();
      // NUNCA autofocamos el input: el foco dispara el teclado del celular y
      // tapa el modal. Si no hay voz soportada mostramos la barra, pero el
      // usuario decide cuándo tocarla para escribir.
      if (!speechSupported || !recognitionRef.current) {
        setTypingMode(true);
      }
      const listenTimer = speechSupported && recognitionRef.current
        ? window.setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch {
              /* start() duplicado o bloqueado: el usuario puede tocar el mic manualmente */
            }
          }, 260)
        : undefined;
      return () => {
        if (listenTimer) window.clearTimeout(listenTimer);
      };
    } else if (!isOpen && recognitionRef.current) {
      // No queremos cue de "fin" al cerrar el modal con la escucha activa.
      suppressCueRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, [isOpen, speechSupported]);

  // SIN auto-redirect: al terminar de dictar mostramos las tarjetas del Top-3
  // dentro del modal para que el usuario elija (WhatsApp / ficha) o pulse
  // "Buscar en el Directorio" si quiere la lista completa.

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
      setTypingMode(true);
      setErrorMessage('La voz no está disponible en este navegador. Escribe tu búsqueda abajo.');
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
          {/* Modo escucha: cero teclado. El input solo aparece si el usuario
              pide escribir o si la voz no está disponible/falló. */}
          {!typingMode && speechSupported && (
            <button
              type="button"
              onClick={() => {
                setTypingMode(true);
                window.setTimeout(() => inputRef.current?.focus(), 80);
              }}
              style={{
                alignSelf: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: TOKENS.colors.textSecondary,
                fontSize: '0.78rem',
                fontWeight: 700,
                textDecoration: 'underline',
                padding: '6px 10px',
              }}
            >
              Prefiero escribir en su lugar
            </button>
          )}

          {(typingMode || !speechSupported) && (
          <div style={{ position: 'relative' }}>
            <input
              ref={inputRef}
              className="guaki-voice-input-glow"
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              aria-label="Buscar en Guaki"
              placeholder="Escribe qué necesitas…"
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
          )}

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

          {/* Botón de Acción Principal — solo en modo escritura;
              por voz, al terminar de hablar la búsqueda se ejecuta sola. */}
          {(typingMode || !speechSupported) && (
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
          )}
        </form>
      </div>
    </div>
  );
}
