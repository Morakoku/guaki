'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  MessageCircle,
  Sliders,
  ArrowRight,
  Zap,
  Copy,
  Check,
  Volume2,
  Power,
  LayoutGrid,
} from 'lucide-react';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface NeumorphicPreset {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  baseColor: string;
  lightShadow: string;
  darkShadow: string;
  gradientLight: string;
  gradientDark: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  accentGlow: string;
}

const PRESETS: NeumorphicPreset[] = [
  {
    id: 'obsidian-dark',
    name: 'Obsidian Dark (Cyber Neumorphism)',
    mode: 'dark',
    baseColor: '#171B26',
    lightShadow: '#202634',
    darkShadow: '#101218',
    gradientLight: '#1A1E29',
    gradientDark: '#151922',
    textColor: '#F8FAFC',
    mutedColor: '#94A3B8',
    accentColor: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'guaki-soft-light',
    name: 'Guaki Soft Pearl (Adam Giebl Classic)',
    mode: 'light',
    baseColor: '#E0E0E0',
    lightShadow: '#FFFFFF',
    darkShadow: '#BEBEBE',
    gradientLight: '#F0F0F0',
    gradientDark: '#CACACA',
    textColor: '#1E293B',
    mutedColor: '#64748B',
    accentColor: '#059669',
    accentGlow: 'rgba(184, 74, 40, 0.3)',
  },
  {
    id: 'cobalt-slate',
    name: 'Cobalt Deep Space',
    mode: 'dark',
    baseColor: '#181C26',
    lightShadow: '#202634',
    darkShadow: '#101218',
    gradientLight: '#1A1E29',
    gradientDark: '#151922',
    textColor: '#F1F5F9',
    mutedColor: '#8493A8',
    accentColor: '#3B82F6',
    accentGlow: 'rgba(59, 130, 246, 0.4)',
  },
  {
    id: 'selva-moss',
    name: 'Selva Esmeralda Tactile',
    mode: 'dark',
    baseColor: '#0E1713',
    lightShadow: '#14211B',
    darkShadow: '#080D0B',
    gradientLight: '#0F1914',
    gradientDark: '#0C1410',
    textColor: '#ECFDF5',
    mutedColor: '#6EE7B7',
    accentColor: '#34D399',
    accentGlow: 'rgba(52, 211, 153, 0.4)',
  },
];

const SAMPLE_PROVIDERS = [
  {
    id: '1',
    name: 'Clínica Dental Home Poblado',
    category: 'Odontología & Estética',
    city: 'Medellín · El Poblado',
    rating: 4.9,
    reviews: 142,
    badge: 'VERIFICADO AUDIT',
    tagline: 'Especialistas en diseño de sonrisa e implantes con tecnología 3D.',
    price: 'Desde $180.000 COP',
    phone: '+57 316 814 5485',
  },
  {
    id: '2',
    name: 'Fraga Spa & Wellness Laureles',
    category: 'Spa & Bienestar',
    city: 'Medellín · Laureles',
    rating: 4.8,
    reviews: 98,
    badge: 'TOP VALORADO',
    tagline: 'Circuitos hídricos, masajes descontracturantes y rituales sensoriales.',
    price: 'Desde $95.000 COP',
    phone: '+57 300 913 3447',
  },
  {
    id: '3',
    name: 'Alipike Gastrobar & Lounge',
    category: 'Gastronomía & Eventos',
    city: 'Cali · Granada',
    rating: 4.9,
    reviews: 210,
    badge: 'ALTA DEMANDA',
    tagline: 'Cocina de autor y coctelería para eventos corporativos y celebraciones.',
    price: 'Menú degustación',
    phone: '+57 315 765 4321',
  },
];

type ShapeType = 'flat' | 'concave' | 'convex' | 'pressed';

export default function NeumorphismPage() {
  const [selectedPreset, setSelectedPreset] = useState<NeumorphicPreset>(PRESETS[0]);
  const [distance, setDistance] = useState<number>(14);
  const [blur, setBlur] = useState<number>(44);
  const [radius, setRadius] = useState<number>(6);
  const [shape, setShape] = useState<ShapeType>('convex');
  const [copied, setCopied] = useState(false);
  
  // Interactive Controls State
  const [toggleActive, setToggleActive] = useState(true);
  const [powerActive, setPowerActive] = useState(true);
  const [sliderValue, setSliderValue] = useState(72);
  const [activeTab, setActiveTab] = useState<'todos' | 'odontologia' | 'spa' | 'legal'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const p = selectedPreset;

  // Compute CSS styles based on Adam Giebl's formula
  const getNeumorphicStyle = (customShape?: ShapeType, customRadius?: number) => {
    const s = customShape || shape;
    const r = customRadius !== undefined ? customRadius : radius;

    const baseBoxShadow = `${distance}px ${distance}px ${blur}px ${p.darkShadow}, -${distance}px -${distance}px ${blur}px ${p.lightShadow}`;
    const insetBoxShadow = `inset ${Math.round(distance * 0.75)}px ${Math.round(distance * 0.75)}px ${Math.round(blur * 0.6)}px ${p.darkShadow}, inset -${Math.round(distance * 0.75)}px -${Math.round(distance * 0.75)}px ${Math.round(blur * 0.6)}px ${p.lightShadow}`;

    let background = p.baseColor;
    let boxShadow = baseBoxShadow;

    if (s === 'concave') {
      background = `linear-gradient(145deg, ${p.gradientDark}, ${p.gradientLight})`;
    } else if (s === 'convex') {
      background = `linear-gradient(145deg, ${p.gradientLight}, ${p.gradientDark})`;
    } else if (s === 'pressed') {
      boxShadow = insetBoxShadow;
    }

    return {
      backgroundColor: p.baseColor,
      background,
      boxShadow,
      borderRadius: `${r}px`,
      border: 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  const currentGeneratedCSS = `background: ${
    shape === 'concave'
      ? `linear-gradient(145deg, ${p.gradientDark}, ${p.gradientLight})`
      : shape === 'convex'
      ? `linear-gradient(145deg, ${p.gradientLight}, ${p.gradientDark})`
      : p.baseColor
  };
border-radius: ${radius}px;
box-shadow: ${
    shape === 'pressed'
      ? `inset ${Math.round(distance * 0.75)}px ${Math.round(distance * 0.75)}px ${Math.round(blur * 0.6)}px ${p.darkShadow}, inset -${Math.round(distance * 0.75)}px -${Math.round(distance * 0.75)}px ${Math.round(blur * 0.6)}px ${p.lightShadow}`
      : `${distance}px ${distance}px ${blur}px ${p.darkShadow}, -${distance}px -${distance}px ${blur}px ${p.lightShadow}`
  };`;

  const copyCSS = () => {
    navigator.clipboard.writeText(currentGeneratedCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        backgroundColor: p.baseColor,
        minHeight: '100vh',
        color: p.textColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '32px 24px 80px',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* ── TOP HEADER ── */}
        <header
          style={{
            ...getNeumorphicStyle('flat', 18),
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '36px',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                ...getNeumorphicStyle('convex', 12),
                width: '44px',
                height: '44px',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.4rem',
              }}
            >
              🦜
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1.3rem', fontWeight: 900, color: p.textColor }}>
                  GUAKI SOFT UI
                </strong>
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: p.accentColor,
                    color: p.mode === 'dark' ? '#000000' : '#FFFFFF',
                  }}
                >
                  NEUMORPHISM.IO ENGINE
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: p.mutedColor }}>
                Inspirado en el generador de Adam Giebl (adamgiebl/neumorphism)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/admin/dashboard"
              style={{
                ...getNeumorphicStyle('flat', 10),
                padding: '10px 18px',
                color: p.textColor,
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <LayoutGrid size={14} /> Panel Administrador
            </Link>
            <Link
              href="/"
              style={{
                ...getNeumorphicStyle('flat', 10),
                padding: '10px 18px',
                color: p.accentColor,
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              Ver Marketplace <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* ── ADAM GIEBL GENERATOR CONTROLLER ── */}
        <section
          style={{
            ...getNeumorphicStyle('flat', 24),
            padding: '28px',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders size={20} color={p.accentColor} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: p.textColor, margin: 0 }}>
                Controlador Táctil de Neumorfismo (Soft UI Generator)
              </h2>
            </div>
            <button
              type="button"
              onClick={copyCSS}
              style={{
                ...getNeumorphicStyle(copied ? 'pressed' : 'convex', 10),
                padding: '8px 16px',
                color: copied ? p.accentColor : p.textColor,
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'CSS Copiado!' : 'Copiar CSS'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* Presets Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                1. Selecciona Paleta Soft UI
              </label>
              <div style={{ display: 'grid', gap: '8px' }}>
                {PRESETS.map((preset) => {
                  const isSel = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      style={{
                        ...getNeumorphicStyle(isSel ? 'pressed' : 'flat', 12),
                        padding: '12px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: preset.baseColor, border: `2px solid ${preset.accentColor}` }} />
                        <strong style={{ fontSize: '0.84rem', color: isSel ? p.accentColor : p.textColor }}>
                          {preset.name}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: p.mutedColor, textTransform: 'uppercase' }}>
                        {preset.mode}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shape Selectors */}
            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Forma & Relieve Físico
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { id: 'flat', label: 'Flat (Plano Relieve)' },
                  { id: 'concave', label: 'Concave (Cóncavo)' },
                  { id: 'convex', label: 'Convex (Domo Convexo)' },
                  { id: 'pressed', label: 'Pressed (Hundido Inset)' },
                ].map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => setShape(sh.id as ShapeType)}
                    style={{
                      ...getNeumorphicStyle(shape === sh.id ? 'pressed' : 'convex', 12),
                      padding: '14px 10px',
                      color: shape === sh.id ? p.accentColor : p.textColor,
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>

              {/* Sliders: Distance, Blur, Radius */}
              <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: p.mutedColor, marginBottom: '4px' }}>
                    <span>Elevación / Distancia:</span>
                    <strong style={{ color: p.textColor }}>{distance}px</strong>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    style={{ width: '100%', accentColor: p.accentColor }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: p.mutedColor, marginBottom: '4px' }}>
                    <span>Desenfoque (Blur):</span>
                    <strong style={{ color: p.textColor }}>{blur}px</strong>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="50"
                    value={blur}
                    onChange={(e) => setBlur(Number(e.target.value))}
                    style={{ width: '100%', accentColor: p.accentColor }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: p.mutedColor, marginBottom: '4px' }}>
                    <span>Radio de Esquinas:</span>
                    <strong style={{ color: p.textColor }}>{radius}px</strong>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="50"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{ width: '100%', accentColor: p.accentColor }}
                  />
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Tile */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', width: '100%' }}>
                3. Objeto Renderizado en Vivo
              </label>
              
              <div
                style={{
                  ...getNeumorphicStyle(),
                  width: '180px',
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '12px 0 16px',
                }}
              >
                <div
                  style={{
                    ...getNeumorphicStyle('convex', 50),
                    width: '48px',
                    height: '48px',
                    display: 'grid',
                    placeItems: 'center',
                    color: p.accentColor,
                    marginBottom: '8px',
                  }}
                >
                  <Zap size={22} />
                </div>
                <strong style={{ fontSize: '0.84rem', color: p.textColor }}>Soft UI Surface</strong>
                <span style={{ fontSize: '0.7rem', color: p.mutedColor }}>{shape.toUpperCase()}</span>
              </div>

              {/* CSS Snippet Display */}
              <pre
                style={{
                  ...getNeumorphicStyle('pressed', 10),
                  padding: '10px 14px',
                  fontSize: '0.68rem',
                  fontFamily: 'monospace',
                  color: p.mutedColor,
                  maxWidth: '100%',
                  overflowX: 'auto',
                  lineHeight: 1.4,
                }}
              >
                {currentGeneratedCSS}
              </pre>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE NEUMORPHIC MARKETPLACE SHOWCASE ── */}
        <section style={{ marginBottom: '40px' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: p.textColor, letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Directorio Guaki con Estilo Neumórfico
            </h2>
            <p style={{ fontSize: '0.94rem', color: p.mutedColor, lineHeight: 1.5, margin: 0 }}>
              Botones con profundidad táctil, interruptores analógicos y tarjetas con sombras duales calculadas.
            </p>
          </div>

          {/* Search Bar Inset */}
          <div
            style={{
              ...getNeumorphicStyle('pressed', 20),
              maxWidth: '680px',
              margin: '0 auto 24px',
              padding: '6px 8px 6px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Search size={18} color={p.accentColor} />
            <input
              type="text"
              placeholder="Buscar servicio (Ej. Clínica dental, Spa, Abogados)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: p.textColor,
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                ...getNeumorphicStyle('convex', 14),
                padding: '10px 20px',
                color: p.accentColor,
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              Explorar
            </button>
          </div>

          {/* Segmented Category Pill Track (Inset track + Raised Buttons) */}
          <div
            style={{
              ...getNeumorphicStyle('pressed', 16),
              display: 'inline-flex',
              padding: '6px',
              gap: '6px',
              margin: '0 auto 36px',
              left: '50%',
              transform: 'translateX(-50%)',
              position: 'relative',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'todos', label: 'Todos los Servicios' },
              { id: 'odontologia', label: 'Odontología' },
              { id: 'spa', label: 'Spas & Belleza' },
              { id: 'legal', label: 'Servicios Legales' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  ...(activeTab === t.id ? getNeumorphicStyle('convex', 12) : { background: 'transparent', border: 'none' }),
                  padding: '8px 16px',
                  borderRadius: '12px',
                  color: activeTab === t.id ? p.accentColor : p.mutedColor,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Provider Cards with Dual Neumorphic Surfaces */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {SAMPLE_PROVIDERS.map((provider) => {
              const whatsappNumber = normalizeWhatsAppNumber(provider.phone);

              return (
              <div
                key={provider.id}
                style={{
                  ...getNeumorphicStyle('flat', 24),
                  padding: '26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div
                      style={{
                        ...getNeumorphicStyle('pressed', 8),
                        padding: '4px 10px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: p.accentColor,
                      }}
                    >
                      {provider.badge}
                    </div>

                    <div
                      style={{
                        ...getNeumorphicStyle('convex', 8),
                        padding: '4px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#FBBF24',
                      }}
                    >
                      <Star size={13} fill="#FBBF24" /> {provider.rating}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: p.textColor, margin: '0 0 6px' }}>
                    {provider.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: p.mutedColor, marginBottom: '14px' }}>
                    <MapPin size={13} color={p.accentColor} /> {provider.city}
                  </div>

                  <p style={{ fontSize: '0.84rem', color: p.textColor, lineHeight: 1.5, margin: '0 0 20px', opacity: 0.9 }}>
                    {provider.tagline}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: `1px solid ${p.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: p.mutedColor }}>
                    {provider.price}
                  </span>

                  {whatsappNumber && <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...getNeumorphicStyle('convex', 12),
                      padding: '10px 18px',
                      color: p.textColor,
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={15} color={p.accentColor} /> WhatsApp
                  </a>}
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* ── TACTILE HARDWARE CONTROLS SHOWCASE ── */}
        <section
          style={{
            ...getNeumorphicStyle('flat', 24),
            padding: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* Power Button */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              Botón de Encendido
            </span>
            <button
              type="button"
              onClick={() => setPowerActive(!powerActive)}
              style={{
                ...getNeumorphicStyle(powerActive ? 'pressed' : 'convex', 50),
                width: '64px',
                height: '64px',
                margin: '0 auto',
                display: 'grid',
                placeItems: 'center',
                color: powerActive ? p.accentColor : p.mutedColor,
                cursor: 'pointer',
                boxShadow: powerActive ? `inset 4px 4px 8px ${p.darkShadow}, inset -4px -4px 8px ${p.lightShadow}, 0 0 16px ${p.accentGlow}` : undefined,
              }}
            >
              <Power size={24} />
            </button>
            <small style={{ display: 'block', marginTop: '8px', color: powerActive ? p.accentColor : p.mutedColor, fontSize: '0.72rem', fontWeight: 800 }}>
              {powerActive ? 'ONLINE / ACTIVO' : 'STANDBY'}
            </small>
          </div>

          {/* Toggle Switch */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '12px' }}>
              Interruptor Físico
            </span>
            <div
              onClick={() => setToggleActive(!toggleActive)}
              style={{
                ...getNeumorphicStyle('pressed', 50),
                width: '74px',
                height: '38px',
                margin: '0 auto',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: toggleActive ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...getNeumorphicStyle('convex', 50),
                  width: '30px',
                  height: '30px',
                  backgroundColor: toggleActive ? p.accentColor : p.baseColor,
                  color: toggleActive ? '#000000' : p.mutedColor,
                  display: 'grid',
                  placeItems: 'center',
                }}
              />
            </div>
            <small style={{ display: 'block', marginTop: '8px', color: toggleActive ? p.accentColor : p.mutedColor, fontSize: '0.72rem', fontWeight: 800 }}>
              {toggleActive ? 'NOTIFICACIONES ACTIVAS' : 'SILENCIADO'}
            </small>
          </div>

          {/* Analog Slider Track */}
          <div>
            <span style={{ display: 'block', fontSize: '0.74rem', color: p.mutedColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              Control Deslizante (Volumen / Intensidad)
            </span>
            <div style={{ ...getNeumorphicStyle('pressed', 10), padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 size={16} color={p.accentColor} />
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                style={{ width: '100%', accentColor: p.accentColor }}
              />
              <strong style={{ fontSize: '0.8rem', color: p.textColor, minWidth: '35px' }}>{sliderValue}%</strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
