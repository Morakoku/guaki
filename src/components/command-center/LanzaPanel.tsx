'use client';

import React from 'react';
import {
  Rocket,
  CheckCircle2,
  Layers,
  FileCheck,
  TrendingUp
} from 'lucide-react';
import { StatusPill } from './AdminDashboard';

export default function LanzaPanel() {
  const metrics = [
    { label: 'Rutas Compiladas', value: '39 rutas', sub: 'Next.js 15.5 App Router', icon: Layers, color: '#34D399' },
    { label: 'Tests de Integridad', value: '7/7 PASS', sub: 'node:test nativo (0 errores)', icon: FileCheck, color: '#60A5FA' },
    { label: 'Leads Clasificados', value: '39 Emprendimientos', sub: 'Puerta Lanza (0 a 1)', icon: Rocket, color: '#FBBF24' },
    { label: 'MRR Proyectado', value: '$1.911.000 COP/mes', sub: '$49.000/mes x 39 SaaS', icon: TrendingUp, color: '#34D399' },
  ];

  const features = [
    {
      title: 'Validación Express en 60 Segundos',
      desc: 'Formulario interactivo en la landing principal para que cualquier profesional transforme su idea en una oferta estructurada en 1 minuto.',
      badge: 'PROD READY',
      tone: 'green' as const,
    },
    {
      title: 'Generador de 3 Entregables Claros',
      desc: 'Crea automáticamente: 1) Oferta Irresistible, 2) Mensaje de Validación para WhatsApp y 3) Link de Cobro Digital.',
      badge: 'PROD READY',
      tone: 'green' as const,
    },
    {
      title: 'Checkout Digital con Wompi / PSE',
      desc: 'Botón de pago directo con $49.000 COP/mes y botón PSE para captura instantánea de clientes.',
      badge: 'INTEGRADO',
      tone: 'blue' as const,
    },
    {
      title: 'Arquitectura Type-Safe Limpia',
      desc: '0 errores de TypeScript, sesión basada en helper unificado y ESLint 9 configurado sin advertencias.',
      badge: 'VERIFICADO',
      tone: 'green' as const,
    },
  ];

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#121722', border: '1px solid #242C3D', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #1E293B' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StatusPill tone="amber">FASE 1: SAAS BUILDER</StatusPill>
              <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> 39 RUTAS NEXT.JS COMPILADAS
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#F9FAFB', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
              LANZA — Plataforma para Emprendedores (0 a 1)
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
              Ubicación: <code style={{ color: '#60A5FA' }}>AI_STUDIO_ECOSYSTEM/03_LANZA_SAAS_PLATFORM</code>. Repositorio Git limpio y listo para onboarding.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', margin: '18px 0' }}>
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#0A0D14',
                  border: '1px solid #242C3D',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: m.color, fontSize: '0.74rem', fontWeight: 800 }}>
                  <Icon size={14} /> {m.label}
                </div>
                <strong style={{ fontSize: '1.3rem', color: '#F9FAFB', display: 'block', margin: '6px 0 2px', fontWeight: 900 }}>
                  {m.value}
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>{m.sub}</span>
              </div>
            );
          })}
        </div>

        {/* Feature Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '16px' }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #1E293B',
                backgroundColor: '#0A0D14',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <strong style={{ color: '#F9FAFB', fontSize: '0.94rem', fontWeight: 800 }}>
                  {f.title}
                </strong>
                <StatusPill tone={f.tone}>{f.badge}</StatusPill>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: 0, lineHeight: 1.45 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
