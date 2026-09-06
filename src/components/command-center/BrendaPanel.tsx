'use client';

import React from 'react';
import {
  Sparkles,
  Clock,
  Coffee,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { StatusPill } from './AdminDashboard';

export default function BrendaPanel() {
  const metrics = [
    { label: 'Fases Mesa Rentable', value: '6 Fases', sub: 'Setup 3 min a Cierre', icon: Clock, color: '#34D399' },
    { label: 'Menú Sensorial', value: '$2.500 COP/costo', sub: 'Retorno 5x en ticket promedio', icon: Coffee, color: '#FBBF24' },
    { label: 'Catálogo de Diseños', value: '30 Pre-diseños', sub: 'Optimización de tiempo', icon: Palette, color: '#A78BFA' },
    { label: 'Ecosistema', value: 'React Native', sub: 'Expo + Haptic Feedback', icon: Sparkles, color: '#60A5FA' },
  ];

  const phases = [
    { name: '1. Bienvenida & Menú Sensorial', time: '0:00 - 3:00', goal: 'Selección de aroma y bebida ($2.500 COP costo)' },
    { name: '2. Diagnóstico & Elección de Diseño', time: '3:00 - 8:00', goal: 'Selección de uno de los 30 pre-diseños rentables' },
    { name: '3. Preparación de Mesa & Manicura Rusa', time: '8:00 - 25:00', goal: 'Protocolo de corte y limpieza sin distracciones' },
    { name: '4. Nivelación & Estructura', time: '25:00 - 45:00', goal: 'Aplicación de base rubber o acrílico' },
    { name: '5. Arte Express & Sellado', time: '45:00 - 55:00', goal: 'Diseño en menos de 10 min por mano' },
    { name: '6. Hidratación & Cierre de Agenda', time: '55:00 - 60:00', goal: 'Masaje de manos y re-agendamiento a 21 días' },
  ];

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#121722', border: '1px solid #242C3D', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #1E293B' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StatusPill tone="amber">VERTICAL BELLEZA & ACADEMIA</StatusPill>
              <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> MESA RENTABLE ACTIVA
              </span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#F9FAFB', margin: '6px 0 2px', letterSpacing: '-0.02em' }}>
              Brenda Beauty OS — Sistema Operativo de Rentabilidad
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
              Ubicación: <code style={{ color: '#60A5FA' }}>AI_STUDIO_ECOSYSTEM/03_BRENDA_MOBILE</code>. React Native Expo con cronómetro háptico y catálogo de experiencias.
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

        {/* Phases Breakdown */}
        <div style={{ marginTop: '16px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#F9FAFB', margin: '0 0 12px' }}>
            Protocolo de 6 Fases (Mesa Rentable en 60 min)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {phases.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #1E293B',
                  backgroundColor: '#0A0D14',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ color: '#F9FAFB', fontSize: '0.88rem', fontWeight: 800 }}>
                    {p.name}
                  </strong>
                  <StatusPill tone="blue">{p.time}</StatusPill>
                </div>
                <p style={{ color: '#94A3B8', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
                  {p.goal}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
