'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  MapPin,
  Star,
  MessageCircle,
  Palette,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

interface MeshTheme {
  id: string;
  name: string;
  badge: string;
  description: string;
  colors: {
    bg: string;
    orb1: string;
    orb2: string;
    orb3: string;
    orb4: string;
    accent: string;
    accentGlow: string;
  };
}

const MESH_THEMES: MeshTheme[] = [
  {
    id: 'guaki-tropical',
    name: 'Guaki Aguacate Velvet Mesh',
    badge: 'OFICIAL GUAKI',
    description: 'Fusión botánica inspirada en el Aguacate Hass colombiano: Piel Esmeralda oscura, Pulpa cremosa Sage, Tono Lima fresco y Pepa Ámbar dorado.',
    colors: {
      bg: '#070A0F',
      orb1: 'rgba(23, 56, 45, 0.65)',   // Esmeralda piel
      orb2: 'rgba(175, 200, 173, 0.45)', // Sage pulpa
      orb3: 'rgba(220, 233, 213, 0.40)', // Lima cremosa
      orb4: 'rgba(217, 119, 6, 0.35)',   // Ámbar pepa
      accent: '#5F8F67',
      accentGlow: 'rgba(95, 143, 103, 0.35)',
    },
  },
  {
    id: 'aurora-obsidian',
    name: 'Aurora Obsidian',
    badge: 'CYBER EXECUTIVE',
    description: 'Mesh oscuro ultra-profundo con luminiscencia cian, púrpura eléctrico y verde neón.',
    colors: {
      bg: '#05070B',
      orb1: 'rgba(6, 182, 212, 0.45)',  // Cian
      orb2: 'rgba(139, 92, 246, 0.40)', // Violeta
      orb3: 'rgba(16, 185, 129, 0.35)', // Neón Mint
      orb4: 'rgba(30, 58, 138, 0.50)',  // Azul Abisal
      accent: '#06B6D4',
      accentGlow: 'rgba(6, 182, 212, 0.3)',
    },
  },
  {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    badge: 'WARM PREMIUM',
    description: 'Tonos cálidos de atardecer latinoamericano: Coral solar, Magenta terciopelo y Dorado miel.',
    colors: {
      bg: '#0A070B',
      orb1: 'rgba(244, 63, 94, 0.45)',  // Coral
      orb2: 'rgba(249, 115, 22, 0.40)', // Naranja solar
      orb3: 'rgba(217, 70, 239, 0.35)', // Magenta
      orb4: 'rgba(234, 179, 8, 0.30)',  // Oro
      accent: '#F43F5E',
      accentGlow: 'rgba(244, 63, 94, 0.3)',
    },
  },
  {
    id: 'selva-esmeralda',
    name: 'Selva Esmeralda',
    badge: 'BIO-NATURE',
    description: 'Inmersión botánica pura con esmeralda colombiana, jade amazónico y menta bio-luminiscente.',
    colors: {
      bg: '#040A07',
      orb1: 'rgba(16, 185, 129, 0.55)', // Esmeralda
      orb2: 'rgba(5, 150, 105, 0.45)',  // Jade
      orb3: 'rgba(52, 211, 153, 0.35)', // Menta brillante
      orb4: 'rgba(20, 83, 45, 0.60)',   // Verde Selva profunda
      accent: '#34D399',
      accentGlow: 'rgba(52, 211, 153, 0.3)',
    },
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

export default function GradientMeshShowcase() {
  const [selectedTheme, setSelectedTheme] = useState<MeshTheme>(MESH_THEMES[0]);
  const [blurIntensity, setBlurIntensity] = useState<number>(60);
  const [meshAnimation, setMeshAnimation] = useState<boolean>(true);
  const [meshOpacity] = useState<number>(0.85);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const t = selectedTheme.colors;

  return (
    <div
      style={{
        backgroundColor: t.bg,
        minHeight: '100vh',
        color: '#F9FAFB',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.6s ease',
      }}
    >
      {/* ── GRADIENT MESH BACKGROUND ENGINE ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
          opacity: meshOpacity,
          transition: 'opacity 0.3s ease',
        }}
      >
        {/* Orb 1: Top Left / Mouse follower */}
        <div
          style={{
            position: 'absolute',
            width: '55vw',
            height: '55vw',
            borderRadius: '50%',
            top: `${-15 + (mousePos.y - 50) * 0.15}%`,
            left: `${-10 + (mousePos.x - 50) * 0.15}%`,
            background: `radial-gradient(circle, ${t.orb1} 0%, rgba(0,0,0,0) 70%)`,
            filter: `blur(${blurIntensity}px)`,
            animation: meshAnimation ? 'meshFloat1 18s ease-in-out infinite alternate' : 'none',
            transition: 'background 0.6s ease',
          }}
        />

        {/* Orb 2: Top Right */}
        <div
          style={{
            position: 'absolute',
            width: '50vw',
            height: '50vw',
            borderRadius: '50%',
            top: `${-10 + (50 - mousePos.y) * 0.1}%`,
            right: `${-10 + (50 - mousePos.x) * 0.1}%`,
            background: `radial-gradient(circle, ${t.orb2} 0%, rgba(0,0,0,0) 70%)`,
            filter: `blur(${blurIntensity + 10}px)`,
            animation: meshAnimation ? 'meshFloat2 22s ease-in-out infinite alternate' : 'none',
            transition: 'background 0.6s ease',
          }}
        />

        {/* Orb 3: Center Bottom */}
        <div
          style={{
            position: 'absolute',
            width: '60vw',
            height: '60vw',
            borderRadius: '50%',
            bottom: `${-20 + (mousePos.y - 50) * 0.1}%`,
            left: `${20 + (mousePos.x - 50) * 0.1}%`,
            background: `radial-gradient(circle, ${t.orb3} 0%, rgba(0,0,0,0) 70%)`,
            filter: `blur(${blurIntensity + 20}px)`,
            animation: meshAnimation ? 'meshFloat3 26s ease-in-out infinite alternate' : 'none',
            transition: 'background 0.6s ease',
          }}
        />

        {/* Orb 4: Accent / Flare */}
        <div
          style={{
            position: 'absolute',
            width: '40vw',
            height: '40vw',
            borderRadius: '50%',
            top: `${35 + (mousePos.y - 50) * 0.2}%`,
            right: `${15 + (mousePos.x - 50) * 0.2}%`,
            background: `radial-gradient(circle, ${t.orb4} 0%, rgba(0,0,0,0) 75%)`,
            filter: `blur(${blurIntensity}px)`,
            animation: meshAnimation ? 'meshFloat4 14s ease-in-out infinite alternate' : 'none',
            transition: 'background 0.6s ease',
          }}
        />

        {/* Micro-dot grid texture for hyper-modern finish */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            opacity: 0.6,
          }}
        />
      </div>

      {/* ── CSS KEYFRAMES INJECTED INLINE ── */}
      <style>{`
        @keyframes meshFloat1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(80px, 60px) scale(1.15); }
          100% { transform: translate(-40px, 90px) scale(0.95); }
        }
        @keyframes meshFloat2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-70px, 80px) scale(1.1); }
          100% { transform: translate(50px, -40px) scale(1.05); }
        }
        @keyframes meshFloat3 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-60px, -70px) scale(1.12); }
          100% { transform: translate(80px, 40px) scale(0.9); }
        }
        @keyframes meshFloat4 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(50px, -50px) scale(1.2); }
          100% { transform: translate(-50px, 50px) scale(0.9); }
        }
        .glass-card {
          background: rgba(18, 23, 34, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .glass-card-interactive {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card-interactive:hover {
          background: rgba(24, 31, 46, 0.85);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.6);
        }
        .glass-card-interactive:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

      {/* ── CONTENT CONTAINER ── */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 80px' }}>
        
        {/* Navigation Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderRadius: '16px', marginBottom: '32px' }} className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>🦜</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#F9FAFB' }}>GUAKI</strong>
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '9999px', backgroundColor: t.accentGlow, color: t.accent, fontWeight: 800, border: `1px solid ${t.accent}` }}>
                  GRADIENT MESH v2.0
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Directorio & Ecosistema de Crecimiento</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/admin/dashboard"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#F9FAFB',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <LayoutGrid size={14} /> Panel Administrador
            </Link>
            <Link
              href="/"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: t.accent,
                color: '#070A0F',
                fontSize: '0.82rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 0 20px ${t.accentGlow}`,
              }}
            >
              Explorar Directorio <ArrowRight size={14} />
            </Link>
          </div>
        </header>

        {/* ── THEME CONTROLLER & LIVE CUSTOMIZER TOOLBAR ── */}
        <section
          className="glass-card"
          style={{
            padding: '20px 24px',
            borderRadius: '18px',
            marginBottom: '36px',
            border: `1px solid rgba(255, 255, 255, 0.12)`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={18} color={t.accent} />
              <strong style={{ fontSize: '0.94rem', fontWeight: 800, color: '#F9FAFB' }}>
                Estilos Visuales Gradient Mesh en Vivo
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: '#94A3B8' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={meshAnimation}
                  onChange={(e) => setMeshAnimation(e.target.checked)}
                  style={{ accentColor: t.accent }}
                />
                Animación Fluida (Orbs flotantes)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Difusión:</span>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={blurIntensity}
                  onChange={(e) => setBlurIntensity(Number(e.target.value))}
                  style={{ width: '80px', accentColor: t.accent }}
                />
                <span style={{ fontFamily: 'monospace', color: t.accent }}>{blurIntensity}px</span>
              </div>
            </div>
          </div>

          {/* Theme Presets Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {MESH_THEMES.map((theme) => {
              const isSelected = selectedTheme.id === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.3)',
                    border: isSelected ? `2px solid ${theme.colors.accent}` : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.9rem', color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                      {theme.name}
                    </strong>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? theme.colors.accent : 'rgba(255, 255, 255, 0.1)',
                        color: isSelected ? '#000000' : '#94A3B8',
                        fontWeight: 800,
                      }}
                    >
                      {theme.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.74rem', color: '#94A3B8', margin: '0 0 10px', lineHeight: 1.35 }}>
                    {theme.description}
                  </p>

                  {/* Orb Color Palette Preview Dots */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: theme.colors.orb1, border: '1px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: theme.colors.orb2, border: '1px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: theme.colors.orb3, border: '1px solid rgba(255,255,255,0.3)' }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: theme.colors.orb4, border: '1px solid rgba(255,255,255,0.3)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HERO SECTION EN MESH ── */}
        <section style={{ textAlign: 'center', padding: '40px 16px 50px', maxWidth: '840px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              marginBottom: '20px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Sparkles size={14} color={t.accent} />
            <span style={{ fontSize: '0.78rem', color: '#F9FAFB', fontWeight: 700 }}>
              Más de 355 proveedores y clínicas reales verificadas
            </span>
          </div>

          <h1
            style={{
              fontSize: '3.2rem',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '18px',
              background: `linear-gradient(135deg, #FFFFFF 30%, ${t.accent} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Encuentra y Conecta con Servicios Verificados en Colombia
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94A3B8', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: '640px' }}>
            Odontología especializada, spas, firmas legales y gastronomía con contacto directo por WhatsApp y cotizaciones instantáneas.
          </p>

          {/* Glowing Search Engine Bar */}
          <div
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 10px 8px 18px',
              borderRadius: '16px',
              boxShadow: `0 0 35px ${t.accentGlow}`,
              border: `1px solid rgba(255, 255, 255, 0.18)`,
              gap: '10px',
              maxWidth: '680px',
              margin: '0 auto 20px',
            }}
          >
            <Search size={20} color={t.accent} />
            <input
              type="text"
              placeholder="¿Qué servicio buscas? (Ej. Implantes dentales, Masaje relajante, Abogado laboral)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#F9FAFB',
                fontSize: '0.94rem',
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                padding: '12px 22px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: t.accent,
                color: '#070A0F',
                fontSize: '0.88rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              Buscar
            </button>
          </div>

          {/* Quick Categories Capsules */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Todos', 'Odontología', 'Belleza & Spas', 'Servicios Legales', 'Gastronomía', 'Automotriz'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  border: selectedCategory === cat ? `1px solid ${t.accent}` : '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: selectedCategory === cat ? t.accentGlow : 'rgba(255, 255, 255, 0.04)',
                  color: selectedCategory === cat ? t.accent : '#94A3B8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── FEATURED PROVIDERS IN GLASS GRID ── */}
        <section style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>
                Proveedores Destacados en Vivo
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Auditados y con respuesta comercial verificada</span>
            </div>
            <Link
              href="/"
              style={{ fontSize: '0.82rem', color: t.accent, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Ver todos (355) <ChevronRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {SAMPLE_PROVIDERS.map((provider) => {
              const whatsappNumber = normalizeWhatsAppNumber(provider.phone);

              return (
              <div
                key={provider.id}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '24px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.25s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: t.accentGlow,
                        color: t.accent,
                        fontWeight: 800,
                        border: `1px solid ${t.accent}`,
                      }}
                    >
                      {provider.badge}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontSize: '0.82rem', fontWeight: 800 }}>
                      <Star size={14} fill="#FBBF24" /> {provider.rating} <span style={{ color: '#64748B', fontWeight: 400 }}>({provider.reviews})</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#F9FAFB', margin: '0 0 6px' }}>
                    {provider.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '12px' }}>
                    <MapPin size={13} color={t.accent} /> {provider.city}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: '0 0 16px' }}>
                    {provider.tagline}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>{provider.price}</span>
                  {whatsappNumber && <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      color: '#F9FAFB',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <MessageCircle size={14} color="#34D399" /> Contactar
                  </a>}
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* ── HOLDING VALUE PROPOSITION TILES ── */}
        <section style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '22px', borderRadius: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: t.accentGlow, display: 'grid', placeItems: 'center', color: t.accent, marginBottom: '12px' }}>
              <ShieldCheck size={22} />
            </div>
            <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block', marginBottom: '4px' }}>Auditoría Forense 100% Real</strong>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
              Cada negocio listado cuenta con dirección física geolocalizada, reseñas verificadas y teléfono comercial activo.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '22px', borderRadius: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.15)', display: 'grid', placeItems: 'center', color: '#60A5FA', marginBottom: '12px' }}>
              <Zap size={22} />
            </div>
            <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block', marginBottom: '4px' }}>La Trinidad Comercial</strong>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
              Sinergia entre LANZA (SaaS express), GUAKI (Directorio PYME) y VEYRA (Enterprise AI) para potenciar tu negocio.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '22px', borderRadius: '18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'grid', placeItems: 'center', color: '#FBBF24', marginBottom: '12px' }}>
              <Globe size={22} />
            </div>
            <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block', marginBottom: '4px' }}>Cero Intermediarios</strong>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
              Conexión directa por WhatsApp oficial y pasarela de pago sin comisiones abusivas para el prestador de servicio.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
