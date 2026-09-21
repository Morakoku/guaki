'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2, MessageCircle, PartyPopper, Send, Store, Zap } from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import { citiesByCountry } from '@/lib/geo';
import { trackEvent } from '@/lib/analytics';

// Categorías alineadas con el panel de comerciante (dashboard).
const CATEGORIES = [
  'Veterinarias & Mascotas',
  'Odontología & Salud Dental',
  'Belleza, Spa & Estética',
  'Barberías & Peluquerías',
  'Salud & Consultas Médicas',
  'Restaurantes & Gastronomía',
  'Abogados & Asesoría Legal',
  'Inmobiliarias & Arriendos',
  'Talleres & Mecánica Automotriz',
  'Servicios Técnicos & Hogar',
  'Otros',
];

// Número oficial de WhatsApp de soporte de Guaki (server-only config en build client).
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_GUAKI_WHATSAPP || '').replace(/\D/g, '');

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 18px',
  borderRadius: TOKENS.radii.pill,
  backgroundColor: TOKENS.colors.surfaceInset,
  border: `1px solid ${TOKENS.colors.borderLight}`,
  boxShadow: TOKENS.shadows.inset,
  color: TOKENS.colors.textMain,
  fontSize: '0.95rem',
  outline: 'none',
  fontWeight: 600,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.84rem',
  fontWeight: 800,
  color: TOKENS.colors.textMain,
  marginBottom: '6px',
};

interface RegisterResult {
  ok: boolean;
  message?: string;
  error?: string;
  details?: Record<string, string>;
}

export default function UneteRegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState<string>(() => citiesByCountry()[0]?.cities[0]?.name ?? 'Medellín');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [services, setServices] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<RegisterResult | null>(null);

  const hasSupportWhatsApp = WHATSAPP_NUMBER.length >= 10;

  const supportHref = () =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hola, envié mi ficha "${name || 'mi negocio'}" en Guaki y quiero activarla lo antes posible.`,
    )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Ingresa el nombre de tu negocio (mínimo 2 caracteres).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Ingresa un correo válido — te enviamos ahí la confirmación de tu ficha.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, '').length < 8) {
      setError('Ingresa un número de WhatsApp válido para que los clientes te contacten.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          city,
          category,
          services: services.trim(),
          whatsapp: whatsapp.trim(),
          description: services.trim(),
        }),
      });
      const data: RegisterResult = await res.json().catch(() => ({ ok: false, error: 'Error de conexión.' }));
      if (res.ok && data.ok) {
        trackEvent({ event_name: 'public_registration_submitted', metadata: { name: name.trim(), category, city } });
        setDone(data);
      } else {
        setError(
          data.details?.whatsapp ||
            data.details?.name ||
            data.details?.category ||
            data.details?.city ||
            data.message ||
            data.error ||
            'No pudimos registrar tu ficha. Intenta de nuevo o escríbenos por WhatsApp.',
        );
      }
    } catch {
      setError('Error de red. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Estado de éxito: ficha enviada a revisión (pending) ──
  if (done?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="soft-card"
        style={{
          borderRadius: '28px',
          padding: 'clamp(24px, 5vw, 40px)',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            backgroundColor: 'rgba(37, 211, 102, 0.16)',
            color: '#15803D',
            display: 'grid',
            placeItems: 'center',
            borderRadius: '20px',
          }}
        >
          <PartyPopper size={30} />
        </div>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 10px', color: TOKENS.colors.textMain }}>
          ¡Ficha enviada a revisión!
        </h3>
        <p style={{ fontSize: '0.95rem', color: TOKENS.colors.textSecondary, lineHeight: 1.6, margin: '0 auto 18px', maxWidth: '440px' }}>
          Gracias, <strong>{name}</strong>. Tu negocio quedó en <strong>revisión</strong> (estado pending).
          El equipo Guaki audita tu ficha y te contactamos por correo para activarla — normalmente en menos de 48 horas.
        </p>

        {hasSupportWhatsApp ? (
          <a
            href={supportHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="neu-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '14px 24px',
              borderRadius: TOKENS.radii.pill,
              fontSize: '0.95rem',
              fontWeight: 900,
              textDecoration: 'none',
              color: '#FFFFFF',
              backgroundColor: '#25D366',
              boxShadow: '0 8px 22px rgba(37, 211, 102, 0.28)',
            }}
          >
            <MessageCircle size={18} />
            Activar mi ficha por WhatsApp
          </a>
        ) : (
          <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
            Te contactaremos pronto. Mientras tanto, puedes completar los datos de tu ficha cuando quieras.
          </p>
        )}
      </div>
    );
  }

  // ── Formulario de alta ──
  return (
    <form
      onSubmit={handleSubmit}
      className="soft-card"
      style={{
        borderRadius: '28px',
        padding: 'clamp(24px, 5vw, 40px)',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: TOKENS.radii.pill,
            backgroundColor: 'rgba(37, 211, 102, 0.14)',
            color: '#15803D',
            fontSize: '0.74rem',
            fontWeight: 900,
            marginBottom: '10px',
          }}
        >
          <Zap size={13} /> Gratis · Sin tarjeta · 2 minutos
        </span>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
          Crea tu ficha gratis
        </h3>
        <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: '6px 0 0', lineHeight: 1.5 }}>
          Deja tus datos y tu ficha entra a revisión. Sin contraseña, sin esperas en un login.
        </p>
      </div>

      <div>
        <label htmlFor="ficha-negocio" style={labelStyle}>Nombre del negocio *</label>
        <input
          id="ficha-negocio"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Peluquería & Estilo Laura"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label htmlFor="ficha-categoria" style={labelStyle}>Categoría *</label>
          <select
            id="ficha-categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...fieldStyle, backgroundColor: TOKENS.colors.surfaceElevated, cursor: 'pointer' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ficha-ciudad" style={labelStyle}>Ciudad *</label>
          <select
            id="ficha-ciudad"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ ...fieldStyle, backgroundColor: TOKENS.colors.surfaceElevated, cursor: 'pointer' }}
          >
            {citiesByCountry().map((group) => (
              <optgroup key={group.country} label={`${group.meta.name} · ${group.meta.currency}`}>
                {group.cities.map((entry) => (
                  <option key={entry.name} value={entry.name}>{entry.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ficha-servicios" style={labelStyle}>
          Servicios (opcional) <span style={{ fontWeight: 600, color: TOKENS.colors.textMuted }}>— separados por coma</span>
        </label>
        <input
          id="ficha-servicios"
          type="text"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          placeholder="Ej. Corte, tintura, peinados"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="ficha-email" style={labelStyle}>Correo electrónico *</label>
        <input
          id="ficha-email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej. laura@tunegocio.com"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="ficha-whatsapp" style={labelStyle}>WhatsApp para que te contacten *</label>
        <input
          id="ficha-whatsapp"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej. +57 300 123 4567"
          style={fieldStyle}
        />
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: '0.84rem',
            color: '#B91C1C',
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="neu-btn-primary"
        style={{
          padding: '15px 26px',
          fontSize: '1rem',
          borderRadius: TOKENS.radii.pill,
          cursor: submitting ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="gk-spin" />
            Enviando tu ficha…
          </>
        ) : (
          <>
            <Store size={18} />
            Crear mi ficha gratis
            <Send size={16} />
          </>
        )}
      </button>

      <p style={{ fontSize: '0.78rem', color: TOKENS.colors.textMuted, margin: '4px 0 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <CheckCircle2 size={14} color="#15803D" />
        Sin tarjeta de crédito. 0% comisión. Cancelas cuando quieras.
      </p>
    </form>
  );
}