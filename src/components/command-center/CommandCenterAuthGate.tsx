'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, Sparkles, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const MASTER_DEFAULT_PIN = '7788';

export default function CommandCenterAuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if session token or localhost
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const savedAuth = localStorage.getItem('guaki_admin_auth');
      
      if (isLocal || savedAuth === 'authorized_session') {
        setIsAuthenticated(true);
      }
      setLoading(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Accept Master PIN '7788', '2026', or '1234'
    if (pin === MASTER_DEFAULT_PIN || pin === '2026' || pin === '1234') {
      localStorage.setItem('guaki_admin_auth', 'authorized_session');
      setIsAuthenticated(true);
    } else {
      setError('PIN de seguridad incorrecto. Intenta de nuevo.');
      setPin('');
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleKeypadClear = () => {
    setPin('');
    setError(null);
  };

  const handleKeypadDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', backgroundColor: '#0A0D14', color: '#94A3B8' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles size={28} color="#34D399" className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.86rem', margin: 0 }}>Cargando Centro de Mando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0A0D14',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            backgroundColor: '#121722',
            border: '1px solid #242C3D',
            borderRadius: '24px',
            padding: '36px 28px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(52,211,153,0.3)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 18px',
              color: '#34D399',
            }}
          >
            <Lock size={28} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ACCESO MÓVIL SEGURO
            </span>
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#F9FAFB', margin: '0 0 6px' }}>
            Centro de Comando
          </h2>

          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0 0 24px', lineHeight: 1.45 }}>
            Ingresa tu PIN Maestro de Administrador para controlar La Trinidad desde tu celular.
          </p>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(248,113,113,0.3)',
                color: '#F87171',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* PIN Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: isFilled ? '#10B981' : '#0A0D14',
                    border: isFilled ? '2px solid #34D399' : '2px solid #242C3D',
                    boxShadow: isFilled ? '0 0 10px rgba(16,185,129,0.5)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Numeric Keypad for Mobile Comfort */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') handleKeypadClear();
                  else if (k === '⌫') handleKeypadDelete();
                  else handleKeypadPress(k);
                }}
                style={{
                  height: '52px',
                  borderRadius: '12px',
                  border: '1px solid #242C3D',
                  backgroundColor: '#0A0D14',
                  color: k === 'C' ? '#F87171' : k === '⌫' ? '#60A5FA' : '#F9FAFB',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'all 0.1s ease',
                }}
              >
                {k}
              </button>
            ))}
          </div>

          <form onSubmit={handleUnlock}>
            <button
              type="submit"
              disabled={pin.length < 4}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: pin.length >= 4 ? '#10B981' : '#242C3D',
                color: pin.length >= 4 ? '#0A0D14' : '#64748B',
                fontSize: '0.92rem',
                fontWeight: 900,
                cursor: pin.length >= 4 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: pin.length >= 4 ? '0 0 20px rgba(16,185,129,0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Desbloquear Centro de Mando <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '16px', fontSize: '0.72rem', color: '#64748B' }}>
            PIN por defecto: <strong style={{ color: '#94A3B8' }}>7788</strong>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
