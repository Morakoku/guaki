'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth_service';
import { getSupabaseClient } from '@/lib/supabase';
import { TOKENS } from '@/lib/design-tokens';
import SoftCard from '@/components/ui/SoftCard';
import SoftButton from '@/components/ui/SoftButton';
import SoftInput from '@/components/ui/SoftInput';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Detectar si el usuario llega desde el enlace de confirmación de correo
    try {
      const supabase = getSupabaseClient();
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.access_token && (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION')) {
          const res = await fetch('/api/auth/session', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: session.access_token }),
          });
          if (res.ok) {
            window.location.href = '/provider/dashboard';
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch {
      // client error fallback
    }
  }, []);

  async function handleResendConfirmation() {
    const userEmail = email.trim();
    if (!userEmail) {
      setError('Por favor escribe tu correo electrónico arriba para reenviarte el enlace.');
      return;
    }
    setBusy(true);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://guakiweb.vercel.app/login';
      const { error: resendErr } = await getSupabaseClient().auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (resendErr) {
        setError(`No pudimos reenviar el correo: ${resendErr.message}`);
      } else {
        setSuccessMessage(`✓ Enlace de activación reenviado a ${userEmail}. Por favor revisa tu bandeja de entrada o spam y haz clic en el enlace.`);
        setError(null);
      }
    } catch {
      setError('Tuvimos un inconveniente al conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e?: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccessMessage(null);

    const userEmail = email.trim();
    const userPass = password;
    const userName = fullName.trim() || 'Comerciante Guaki';

    try {
      if (mode === 'register') {
        const result = await authService.register(userEmail, userPass, userName);
        if (!result.token) {
          if (result.error === 'CONFIRMATION_REQUIRED') {
            setSuccessMessage(`✓ ¡Cuenta creada con éxito para ${userEmail}! Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada o intenta Iniciar Sesión.`);
            setMode('login');
            return;
          }
          setError(result.error ?? 'No pudimos registrar tu cuenta. Verifica los datos.');
          return;
        }

        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: result.token }),
        });
        if (!sessionResponse.ok) {
          const sessionError = await sessionResponse.json().catch(() => ({}));
          setError(sessionError.error ?? 'No se pudo establecer la sesión segura.');
          return;
        }

        await ensureProviderRole({ token: result.token, user: result.user });
        window.location.href = '/provider/dashboard';
      } else {
        const result = await authService.login(userEmail, userPass);
        if (!result.token) {
          setError(result.error ?? 'Verifica tu usuario o contraseña e intenta de nuevo.');
          return;
        }

        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: result.token }),
        });
        if (!sessionResponse.ok) {
          const sessionError = await sessionResponse.json().catch(() => ({}));
          setError(sessionError.error ?? 'No se pudo establecer la sesión segura.');
          return;
        }

        await ensureProviderRole({ token: result.token, user: result.user });
        window.location.href = '/provider/dashboard';
      }
    } catch {
      setError('Tuvimos un inconveniente al conectar con el servidor. Intenta nuevamente.');
    } finally {
      setBusy(false);
    }
  }

  // Degradación: los cuentas recién registradas nacen 'client'; pedimos la
  // provisión de rol 'provider' (validada por sesión en servidor) para que el
  // middleware permita /provider/dashboard. Error tolerado: solo retrasa el bucle.
  const ensureProviderRole = async (result: { token: string; user?: { role?: string } | null }) => {
    if (result.user?.role === 'provider') return;
    await fetch('/api/provider/provision', {
      headers: { Authorization: `Bearer ${result.token}` },
    }).catch(() => undefined);
  };

  return (
    <div
      className="page-fade-in"
      style={{
        backgroundColor: TOKENS.colors.bgMain,
        color: TOKENS.colors.textMain,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        // En viewports bajos el card puede exceder el alto disponible:
        // margin:auto centra cuando hay espacio y se degrada arriba
        // (con scroll) sin quedar bajo el dock fijo, jamás lo tapa.
        justifyContent: 'center',
        padding: '20px 16px',
        // Reserva espacio para el dock inferior + FAB elevado (no tapar el submit)
        paddingBottom: 'calc(150px + env(safe-area-inset-bottom, 0px))',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <SoftCard
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: 'clamp(24px, 5vw, 40px) clamp(18px, 4vw, 32px)',
          margin: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 12px',
              backgroundColor: TOKENS.colors.emeraldDark,
              color: TOKENS.colors.white,
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.8rem',
              borderRadius: TOKENS.radii.md,
              boxShadow: TOKENS.shadows.btnPrimary,
            }}
          >
            🥑
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.35rem, 4vw, 1.6rem)',
              fontWeight: 900,
              color: TOKENS.colors.textMain,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            {mode === 'register' ? 'Registra tu Negocio 🥑' : 'Portal de Negocios 🥑'}
          </h1>
          <p
            style={{
              color: TOKENS.colors.textSecondary,
              fontSize: '0.86rem',
              margin: 0,
              fontWeight: 500,
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            {mode === 'register'
              ? 'Únete a Guaki y publica tu afiche comercial en minutos'
              : 'Acceso a tu panel de control y estadísticas'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: TOKENS.colors.surfaceInset,
            padding: '4px',
            borderRadius: TOKENS.radii.pill,
            marginBottom: '20px',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: TOKENS.radii.pill,
              border: 'none',
              backgroundColor: mode === 'login' ? TOKENS.colors.surfaceElevated : 'transparent',
              color: mode === 'login' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
              boxShadow: mode === 'login' ? TOKENS.shadows.btnConvex : 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: TOKENS.radii.pill,
              border: 'none',
              backgroundColor: mode === 'register' ? TOKENS.colors.surfaceElevated : 'transparent',
              color: mode === 'register' ? TOKENS.colors.emeraldDark : TOKENS.colors.textSecondary,
              boxShadow: mode === 'register' ? TOKENS.shadows.btnConvex : 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          {mode === 'register' && (
            <div style={{ width: '100%' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: TOKENS.colors.textMain,
                  marginBottom: '6px',
                  textAlign: 'left',
                }}
              >
                Nombre del Negocio o Contacto
              </label>
              <SoftInput
                type="text"
                id="login-fullname"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Veterinaria San Lucas"
                required
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ width: '100%' }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: TOKENS.colors.textMain,
                marginBottom: '6px',
                textAlign: 'left',
              }}
            >
              Correo Electrónico
            </label>
            <SoftInput
              type="email"
              id="login-email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="negocio@correo.com"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ width: '100%' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: TOKENS.colors.textMain,
                marginBottom: '6px',
                textAlign: 'left',
              }}
            >
              Contraseña
            </label>
            <SoftInput
              type="password"
              id="login-password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%' }}
            />
          </div>

          {successMessage && (
            <div
              style={{
                backgroundColor: 'rgba(21, 128, 61, 0.12)',
                border: '1px solid rgba(21, 128, 61, 0.3)',
                color: '#15803D',
                padding: '12px 14px',
                borderRadius: TOKENS.radii.md,
                fontSize: '0.84rem',
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.45,
              }}
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#DC2626',
                padding: '12px 14px',
                borderRadius: TOKENS.radii.md,
                fontSize: '0.84rem',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              <div>{error}</div>
              {error.toLowerCase().includes('confirmar') && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={busy}
                  style={{
                    marginTop: '8px',
                    backgroundColor: '#DC2626',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: TOKENS.radii.pill,
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {busy ? 'Enviando...' : 'Reenviar Enlace de Activación'}
                </button>
              )}
            </div>
          )}

          <SoftButton
            type="submit"
            variant="primary"
            disabled={busy}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.94rem',
              borderRadius: TOKENS.radii.md,
              marginTop: '4px',
            }}
          >
            {busy
              ? 'Verificando...'
              : mode === 'register'
              ? 'Crear Cuenta y Entrar'
              : 'Iniciar Sesión'}
          </SoftButton>
        </form>

        {/* Secondary CTA Toggle */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.84rem' }}>
          {mode === 'login' ? (
            <p style={{ margin: 0, color: TOKENS.colors.textSecondary }}>
              ¿Eres nuevo en GUAKI?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: TOKENS.colors.emeraldDark,
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Crear una cuenta
              </button>
            </p>
          ) : (
            <p style={{ margin: 0, color: TOKENS.colors.textSecondary }}>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: TOKENS.colors.emeraldDark,
                  fontWeight: 800,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Iniciar sesión aquí
              </button>
            </p>
          )}
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.82rem' }}>
          <Link href="/" style={{ color: TOKENS.colors.textMuted, textDecoration: 'none', fontWeight: 600 }}>
            ← Volver a la página principal
          </Link>
        </div>
      </SoftCard>
    </div>
  );
}
