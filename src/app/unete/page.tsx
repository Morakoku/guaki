import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { BadgeCheck, Clock, MessageCircle, ShieldCheck, Store, TrendingUp } from 'lucide-react';
import GuakiHeader from '@/components/ui/GuakiHeader';
import SoftCard from '@/components/ui/SoftCard';
import PlanCardsSection from '@/components/ui/PlanCardsSection';
import UneteCTAs from '@/components/ui/UneteCTAs';
import { TOKENS } from '@/lib/design-tokens';
import { absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Únete a Guaki — Publica tu negocio gratis y recibe clientes por WhatsApp',
  description:
    'Crea la ficha de tu negocio en 2 minutos y recibe contactos directos por WhatsApp, sin comisiones. Guaki opera en Colombia y Venezuela.',
  alternates: { canonical: absoluteUrl('/unete') },
  openGraph: {
    title: 'Únete a Guaki — Tu negocio en el directorio, gratis',
    description: 'Publica tu negocio gratis y recibe clientes directos por WhatsApp, sin comisiones.',
    url: absoluteUrl('/unete'),
    type: 'website',
  },
};

const STEPS = [
  {
    icon: Store,
    title: '1. Crea tu ficha gratis',
    text: 'Registra tu negocio en 2 minutos: nombre, ciudad, servicios, horarios y WhatsApp. Sin tarjeta, sin letra pequeña.',
  },
  {
    icon: ShieldCheck,
    title: '2. La auditamos',
    text: 'Verificamos tu identidad comercial (RUT en Colombia, RIF en Venezuela). Al aprobarla, tu ficha queda pública y aparece en Google.',
  },
  {
    icon: MessageCircle,
    title: '3. Recibes clientes',
    text: 'Los clientes te escriben directo a tu WhatsApp con un clic. Tú negocias y cobras a tu manera: Guaki no cobra comisiones.',
  },
];

const BENEFITS = [
  { icon: TrendingUp, text: 'Aparece cuando busquen tu servicio en tu ciudad' },
  { icon: BadgeCheck, text: 'Insignia Verificado que genera confianza y credibilidad' },
  { icon: Clock, text: 'Ficha web propia con horarios, fotos y catálogo editable' },
  { icon: MessageCircle, text: 'Contacto directo por WhatsApp 1-clic, sin intermediarios' },
];

export default function UnetePage() {
  const hasWhatsApp = (process.env.NEXT_PUBLIC_GUAKI_WHATSAPP || '').replace(/\D/g, '').length >= 10;

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent', color: TOKENS.colors.textMain }}>
      <GuakiHeader />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '36px 20px 80px' }}>
        {/* HERO */}
        <section style={{ textAlign: 'center', marginBottom: '44px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(220, 233, 213, 0.94)',
              color: TOKENS.colors.emeraldDark,
              fontSize: '0.76rem',
              fontWeight: 900,
              marginBottom: '14px',
            }}
          >
            <Store size={13} /> Para dueños de negocios y especialistas
          </span>

          <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 auto 14px', maxWidth: '820px' }}>
            Tu negocio en Guaki, <span style={{ color: TOKENS.colors.emeraldDark }}>gratis</span>. Clientes directos por WhatsApp.
          </h1>

          <p style={{ fontSize: '1.02rem', color: TOKENS.colors.textSecondary, lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 26px' }}>
            Crea tu ficha en 2 minutos, la auditamos y empiezas a recibir contactos. Sin comisiones por venta, sin intermediarios.
          </p>

          <UneteCTAs />
        </section>

        {/* CÓMO FUNCIONA */}
        <section style={{ marginBottom: '44px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: '20px' }}>
            Así funciona
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
            {STEPS.map((step) => (
              <SoftCard key={step.title} style={{ padding: '24px 22px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '42px',
                    height: '42px',
                    borderRadius: '13px',
                    backgroundColor: 'rgba(23, 56, 45, 0.08)',
                    color: TOKENS.colors.emeraldDark,
                    marginBottom: '12px',
                  }}
                >
                  <step.icon size={20} />
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: '0 0 6px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, lineHeight: 1.55, margin: 0 }}>{step.text}</p>
              </SoftCard>
            ))}
          </div>
        </section>

        {/* BENEFICIOS + EJEMPLO REAL */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '18px', marginBottom: '48px', alignItems: 'stretch' }}>
          <SoftCard style={{ padding: '26px 24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 16px' }}>Qué obtienes al registrarte</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {BENEFITS.map((benefit) => (
                <li key={benefit.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: TOKENS.colors.textMain }}>
                  <benefit.icon size={17} color={TOKENS.colors.emeraldDark} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ lineHeight: 1.45 }}>{benefit.text}</span>
                </li>
              ))}
            </ul>
          </SoftCard>

          <SoftCard style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 10px' }}>Mira una ficha real</h2>
            <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, lineHeight: 1.55, margin: '0 0 18px' }}>
              Así se ve un negocio publicado en Guaki: fotos, servicios, horarios, mapa y contacto directo. Los clientes llegan con un clic a tu WhatsApp.
            </p>
            <Link
              href="/proveedores/veterinaria-pets-care-poblado"
              style={{
                marginTop: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: TOKENS.radii.pill,
                border: `1px solid ${TOKENS.colors.borderLight}`,
                backgroundColor: TOKENS.colors.surfaceInset,
                color: TOKENS.colors.emeraldDark,
                fontSize: '0.86rem',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Ver ficha de ejemplo →
            </Link>
          </SoftCard>
        </section>

        {/* PLANES */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: '8px' }}>
            Empieza gratis. Crece cuando quieras.
          </h2>
          <p style={{ fontSize: '0.9rem', color: TOKENS.colors.textSecondary, textAlign: 'center', margin: '0 0 22px' }}>
            El Plan Esencial es $0 para siempre. Verificado y VIP añaden insignia, ficha web indexable y prioridad.
          </p>
          <PlanCardsSection mode="display" />
        </section>

        {/* CTA FINAL */}
        <section style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, margin: '0 0 10px' }}>¿Listo para recibir clientes?</h2>
          <p style={{ fontSize: '0.92rem', color: TOKENS.colors.textSecondary, margin: '0 0 22px' }}>
            {hasWhatsApp
              ? 'Si prefieres, un asesor te acompaña por WhatsApp y creamos la ficha contigo.'
              : 'Crea tu ficha en 2 minutos. Es 100% gratis y sin comisiones.'}
          </p>
          <UneteCTAs />
        </section>
      </main>
    </div>
  );
}
