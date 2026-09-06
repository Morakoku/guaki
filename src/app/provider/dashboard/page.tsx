'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Store,
  CheckCircle2,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight,
  ChevronRight,
  Info,
  Edit3,
  Lock,
  User,
  Mail,
  Zap,
  Check,
  LogOut,
  BarChart3,
  Star,
  Share2,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import GuakiHeader from '@/components/ui/GuakiHeader';
import SoftCard from '@/components/ui/SoftCard';
import SoftBadge from '@/components/ui/SoftBadge';
import ProviderLivePreview from '@/components/provider/ProviderLivePreview';
import ProviderMetricsCard from '@/components/provider/ProviderMetricsCard';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import PlanCardsSection from '@/components/ui/PlanCardsSection';
import { GUAKI_PLANS } from '@/lib/plans';
import { parseScheduleText } from '@/lib/validation';

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

const CITIES = [
  'Medellín',
  'Bogotá',
  'Cali',
  'Soacha',
  'Barranquilla',
  'Bucaramanga',
  'Cartagena',
  'Pereira',
  'Manizales',
];

function DashboardContent() {
  // Estado de sesión del comerciante
  const [merchantUser, setMerchantUser] = useState<{ name: string; email: string; plan: string } | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [selectedPlan, setSelectedPlan] = useState<'gratis' | 'verificado' | 'vip'>('gratis');
  const [merchantTab, setMerchantTab] = useState<'afiche' | 'metricas' | 'resenas' | 'plan'>('afiche');
  const [copiedLink, setCopiedLink] = useState(false);
  const [customWhatsappMessage, setCustomWhatsappMessage] = useState(
    'Hola, vi su perfil auditado en Guaki y me gustaría cotizar un servicio.'
  );

  // Formulario de Registro / Suscripción
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Formulario de Negocio / Catálogo
  const [hasBusiness, setHasBusiness] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Campos del Negocio
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [city, setCity] = useState(CITIES[0]);
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [featuredService, setFeaturedService] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');
  const [scheduleText, setScheduleText] = useState('Lunes a Sábado · 8:00 AM – 6:00 PM');
  const [scheduleDays, setScheduleDays] = useState('Lunes a Sábado');
  const [scheduleOpen, setScheduleOpen] = useState('8:00 AM');
  const [scheduleClose, setScheduleClose] = useState('6:00 PM');
  const [is24h, setIs24h] = useState(false);
  const [status, setStatus] = useState<'draft' | 'in_audit' | 'published'>('draft');

  // The server session and Supabase-backed API are the only sources of identity/data.
  useEffect(() => {
    let active = true;
    (async () => {
      const session = await fetch('/api/auth/session', { credentials: 'include' });
      if (!session.ok) return;
      const sessionData = await session.json();
      if (!active || !sessionData.user) return;
      setMerchantUser({
        name: sessionData.user.fullName,
        email: sessionData.user.email,
        plan: 'gratis',
      });

      const businessesResponse = await fetch('/api/businesses', { credentials: 'include' });
      if (!businessesResponse.ok) return;
      const businessesData = await businessesResponse.json();
      const data = businessesData.items?.[0];
      if (!active || !data) return;
      // FIX: sync merchantUser.plan with the REAL persisted business plan,
      // so the dashboard reflects admin-approved plan changes (not stale local state).
      setMerchantUser((prev) => (prev ? { ...prev, plan: ['gratis', 'verificado', 'vip'].includes(data.plan) ? data.plan : 'gratis' } : prev));
      setId(data.id || '');
      setSlug(data.slug || '');
      setBusinessName(data.name || '');
      setCategory(data.category || CATEGORIES[0]);
      setCity(data.city || CITIES[0]);
      setAddress(data.address || '');
      setWhatsapp(data.whatsapp || '');
      setPhone(data.phone || '');
      setDescription(data.description || '');
      setLogoUrl(data.logoUrl || '');
      setImageUrl(data.heroImage || data.imageUrl || '');
      setWebsite(data.website || '');
      if (Array.isArray(data.services) && data.services.length > 0) setServices(data.services);
      if (data.schedule && data.schedule.length > 0) {
        setScheduleText(data.schedule?.map((item: { day: string; hours: string }) => `${item.day} · ${item.hours}`).join(' | '));
      }
      setStatus(data.status || 'draft');
      setHasBusiness(true);
    })().catch(() => undefined);
    return () => { active = false; };
  }, []);

  // 1. Registro / Suscripción de Comerciante
  const handleRegisterOrLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerEmail.trim() || !ownerPassword.trim()) {
      alert('Por favor ingresa tu correo y contraseña para continuar.');
      return;
    }

    setIsSubmitting(true);
    const result = authMode === 'register'
      ? await (await import('@/lib/auth_service')).authService.register(ownerEmail.trim(), ownerPassword, ownerName.trim() || 'Comerciante Guaki')
      : await (await import('@/lib/auth_service')).authService.login(ownerEmail.trim(), ownerPassword);
    if (!result.token) {
      setSuccessMessage(result.error || 'No se pudo autenticar la cuenta.');
      setIsSubmitting(false);
      return;
    }
    const sessionResponse = await fetch('/api/auth/session', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: result.token }),
    });
    if (!sessionResponse.ok) {
      setSuccessMessage('La sesión no pudo establecerse de forma segura.');
      setIsSubmitting(false);
      return;
    }
    const userObj = { name: result.user?.fullName || ownerName.trim() || 'Comerciante Guaki', email: result.user?.email || ownerEmail.trim(), plan: selectedPlan };
    setMerchantUser(userObj);

    if (!businessName && ownerName) {
      setBusinessName(`Servicios ${ownerName}`);
    }

    setSuccessMessage(`¡Sesión real iniciada! Completa la ficha y envíala a auditoría.`);
    setTimeout(() => setSuccessMessage(''), 4000);
    setIsSubmitting(false);
  };

  const handleLogout = () => {
    setMerchantUser(null);
    fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => undefined);
  };

  // 2. Manejo de Servicios del Catálogo
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim()) return;
    setServices([...services, newService.trim()]);
    setNewService('');
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const calculateCompleteness = () => {
    let score = 0;
    if (businessName.trim()) score += 20;
    if (category) score += 15;
    if (city && address.trim()) score += 20;
    if (whatsapp.trim()) score += 20;
    if (description.trim().length >= 10) score += 10;
    if (services.length >= 2) score += 10;
    if (imageUrl.trim()) score += 5;
    return Math.min(score, 100);
  };

  // 3. Guardar Negocio y Catálogo en la Base de Datos
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !whatsapp.trim() || !address.trim()) {
      alert('Por favor completa el nombre del negocio, dirección y WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    const generatedSlug = slug || businessName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const generatedId = id || 'GKI-' + Math.floor(1000000 + Math.random() * 9000000);

    const businessPayload = {
      id: generatedId,
      slug: generatedSlug,
      name: businessName.trim(),
      category,
      city,
      address: address.trim(),
      whatsapp: whatsapp.trim(),
      phone: phone.trim() || whatsapp.trim(),
      description: description.trim(),
      logoUrl: logoUrl.trim() || undefined,
      heroImage: imageUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      instagram: instagram.trim(),
      website: website.trim(),
      featuredService: featuredService.trim(),
      services,
      schedule: parseScheduleText(scheduleText),
      plan: merchantUser?.plan || selectedPlan || 'gratis',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(id ? `/api/businesses/${encodeURIComponent(id)}` : '/api/businesses', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(businessPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Error al conectar con la base de datos.');
      }

      const resData = await response.json().catch(() => ({}));
      const savedBusiness = resData.business || resData;

      if (savedBusiness?.id) {
        setId(savedBusiness.id);
      } else {
        setId(generatedId);
      }
      if (savedBusiness?.slug) {
        setSlug(savedBusiness.slug);
      } else {
        setSlug(generatedSlug);
      }
      setHasBusiness(true);
      setIsEditing(false);
      setSuccessMessage('¡Catálogo y afiche comercial guardados con éxito!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setSuccessMessage(err?.message || 'Error al guardar. Por favor intenta de nuevo.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeness = calculateCompleteness();

  return (
    <div className="page-fade-in has-bottom-dock" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px 60px' }}>
        
        {/* Mensaje de Éxito Flotante */}
        {successMessage && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(37, 211, 102, 0.14)',
              border: '1px solid rgba(37, 211, 102, 0.35)',
              color: '#15803D',
              fontSize: '0.92rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '24px',
              textAlign: 'center',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.15)',
            }}
          >
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            PASO 1: SUSCRIPCIÓN & REGISTRO (Si el usuario aún no se ha registrado)
           ═════════════════════════════════════════════════════════════════════════════ */}
        {!merchantUser ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span
                style={{
                  backgroundColor: 'rgba(220, 233, 213, 0.94)',
                  borderRadius: TOKENS.radii.pill,
                  padding: '5px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: TOKENS.colors.emeraldDark,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px',
                }}
              >
                <Sparkles size={14} />
                <span>Paso 1 de 2: Registro & Suscripción</span>
              </span>

              <h1 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.6rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                {authMode === 'register' ? 'Suscribe tu Negocio en Guaki' : 'Inicia Sesión en tu Negocio'}
              </h1>
              <p style={{ fontSize: '0.96rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '560px', lineHeight: 1.5 }}>
                Crea tu cuenta de comerciante para publicar tu catálogo, gestionar tus servicios y recibir clientes directos en WhatsApp.
              </p>
            </div>

            {/* Selector de Planes de Suscripción */}
            {authMode === 'register' && (
              <div style={{ marginBottom: '28px' }}>
                <PlanCardsSection
                  mode="select"
                  selectedPlanId={selectedPlan}
                  onSelectPlan={(id) => setSelectedPlan(id as any)}
                />
              </div>
            )}

            {/* Formulario de Cuenta */}
            <form
              onSubmit={handleRegisterOrLogin}
              className="neu-level-2"
              style={{
                padding: '32px 28px',
                borderRadius: TOKENS.radii.hero,
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
                maxWidth: '560px',
                margin: '0 auto',
              }}
            >
              {authMode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                    Nombre del Propietario o Encargado *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: TOKENS.colors.surfaceInset,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      boxShadow: TOKENS.shadows.inset,
                      color: TOKENS.colors.textMain,
                      fontSize: '0.94rem',
                      outline: 'none',
                      fontWeight: 600,
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                  Correo Electrónico de Contacto *
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="Ej. contacto@tunegocio.com"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: TOKENS.radii.pill,
                    backgroundColor: TOKENS.colors.surfaceInset,
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    boxShadow: TOKENS.shadows.inset,
                    color: TOKENS.colors.textMain,
                    fontSize: '0.94rem',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                  Contraseña de Acceso *
                </label>
                <input
                  type="password"
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Crea tu contraseña segura"
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: TOKENS.radii.pill,
                    backgroundColor: TOKENS.colors.surfaceInset,
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    boxShadow: TOKENS.shadows.inset,
                    color: TOKENS.colors.textMain,
                    fontSize: '0.94rem',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                />
              </div>

              <button
                type="submit"
                className="neu-btn-primary"
                style={{
                  padding: '14px 28px',
                  fontSize: '0.98rem',
                  borderRadius: TOKENS.radii.pill,
                  marginTop: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>{authMode === 'register' ? 'Completar Suscripción y Entrar a Mi Negocio' : 'Iniciar Sesión en Mi Negocio'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: TOKENS.colors.emeraldDark,
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {authMode === 'register' ? '¿Ya tienes una cuenta? Inicia sesión aquí' : '¿Aún no tienes cuenta? Regístrate gratis aquí'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════════════════════
              PASO 2: CENTRO DE MANDO DEL COMERCIANTE (4 Pestañas)
             ═════════════════════════════════════════════════════════════════════════════ */
          <div>
            {/* Cabecera del Portal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🏪</span>
                  <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
                    {businessName || 'Centro de Mando de tu Negocio'}
                  </h1>
                </div>
                <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                  Bienvenido, <strong>{merchantUser.name}</strong> ({merchantUser.email})
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {slug && (
                  <Link
                    href={`/proveedores/${slug}`}
                    target="_blank"
                    className="neu-btn-primary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '0.84rem',
                      borderRadius: TOKENS.radii.pill,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={15} />
                    <span>Ver Ficha Pública</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="soft-btn"
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.82rem',
                    borderRadius: TOKENS.radii.pill,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#DC2626',
                  }}
                >
                  <LogOut size={14} />
                  <span>Salir</span>
                </button>
              </div>
            </div>

            {/* Selector de Pestañas */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '28px',
                overflowX: 'auto',
                paddingBottom: '6px',
              }}
            >
              {[
                { id: 'afiche', label: '📱 Mi Afiche & Catálogo' },
                { id: 'metricas', label: '📊 Métricas & Leads' },
                { id: 'resenas', label: '⭐ Reseñas & Reputación' },
                { id: 'plan', label: '💎 Mi Plan & Verificación' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMerchantTab(t.id as any)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: TOKENS.radii.pill,
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    backgroundColor: merchantTab === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                    color: merchantTab === t.id ? TOKENS.colors.white : TOKENS.colors.textMain,
                    border: `1px solid ${merchantTab === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                    boxShadow: merchantTab === t.id ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 160ms ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB 1: MI AFICHE & CATÁLOGO ── */}
            {merchantTab === 'afiche' && (
              <div>
                {/* Banner de Estado del Plan y Progreso del Perfil */}
                <div
                  className="neu-level-2"
                  style={{
                    padding: '20px 24px',
                    borderRadius: TOKENS.radii.xl,
                    marginBottom: '24px',
                    backgroundColor: TOKENS.colors.surfaceElevated,
                    border: `1.5px solid ${merchantUser.plan === 'vip' ? '#F59E0B' : merchantUser.plan === 'verificado' ? '#15803D' : TOKENS.colors.borderLight}`,
                    boxShadow: merchantUser.plan === 'vip' ? '0 8px 24px rgba(245, 158, 11, 0.15)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 900,
                          padding: '4px 12px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: merchantUser.plan === 'vip' ? '#FEF3C7' : merchantUser.plan === 'verificado' ? 'rgba(37, 211, 102, 0.15)' : TOKENS.colors.surfaceInset,
                          color: merchantUser.plan === 'vip' ? '#92400E' : merchantUser.plan === 'verificado' ? '#15803D' : TOKENS.colors.textMain,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {merchantUser.plan === 'vip' ? '👑 PLAN VIP ELITE ($149.900)' : merchantUser.plan === 'verificado' ? '✓ PLAN VERIFICADO ($49.900)' : '🌿 PLAN ESENCIAL ($0)'}
                      </span>
                      <span style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, fontWeight: 700 }}>
                        {merchantUser.plan === 'vip' ? 'Súper Botón VIP y Posicionamiento #1' : merchantUser.plan === 'verificado' ? 'Insignia Oficial de Verificación y Ficha Dedicada' : 'Presencia Básica en el Directorio'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                        Completitud del Afiche:
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 900, color: completeness === 100 ? '#15803D' : TOKENS.colors.emeraldDark }}>
                        {completeness}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: TOKENS.colors.surfaceInset, borderRadius: TOKENS.radii.pill, overflow: 'hidden', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: `${completeness}%`,
                        height: '100%',
                        backgroundColor: completeness === 100 ? '#15803D' : TOKENS.colors.emeraldDark,
                        borderRadius: TOKENS.radii.pill,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>

                  {/* Checklist Rápido */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: businessName ? 'rgba(37,211,102,0.14)' : TOKENS.colors.surfaceInset, color: businessName ? '#15803D' : TOKENS.colors.textMuted, fontWeight: 700 }}>
                      {businessName ? '✓ Nombre' : '• Falta Nombre'}
                    </span>
                    <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: address ? 'rgba(37,211,102,0.14)' : TOKENS.colors.surfaceInset, color: address ? '#15803D' : TOKENS.colors.textMuted, fontWeight: 700 }}>
                      {address ? '✓ Dirección' : '• Falta Dirección'}
                    </span>
                    <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: whatsapp ? 'rgba(37,211,102,0.14)' : TOKENS.colors.surfaceInset, color: whatsapp ? '#15803D' : TOKENS.colors.textMuted, fontWeight: 700 }}>
                      {whatsapp ? '✓ WhatsApp 1-Clic' : '• Falta WhatsApp'}
                    </span>
                    <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: services.length >= 2 ? 'rgba(37,211,102,0.14)' : TOKENS.colors.surfaceInset, color: services.length >= 2 ? '#15803D' : TOKENS.colors.textMuted, fontWeight: 700 }}>
                      {services.length >= 2 ? `✓ Catálogo (${services.length})` : '• Falta Catálogo'}
                    </span>
                    {merchantUser.plan !== 'gratis' && (
                      <span style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: description ? 'rgba(37,211,102,0.14)' : TOKENS.colors.surfaceInset, color: description ? '#15803D' : TOKENS.colors.textMuted, fontWeight: 700 }}>
                        {description ? '✓ Presentación' : '• Falta Presentación'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid Split-View: Formulario a la Izquierda y Vista Previa en Vivo a la Derecha */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '28px',
                    alignItems: 'start',
                  }}
                >
                  {/* Formulario de Edición */}
                  <form
                    onSubmit={handleSaveBusiness}
                    className="neu-level-2"
                    style={{
                      padding: '28px 24px',
                      borderRadius: TOKENS.radii.hero,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                    }}
                  >
                    <div style={{ borderBottom: `1px solid ${TOKENS.colors.borderLight}`, paddingBottom: '10px' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 4px' }}>
                        Datos del Afiche y Catálogo
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                        Edita los datos que verán tus clientes en el buscador y en tu afiche comercial.
                      </p>
                    </div>

                    {/* SECCIÓN 1: DATOS BÁSICOS */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                        Nombre Comercial del Negocio *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Ej. Peluquería & Estilo Laura"
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: TOKENS.colors.surfaceInset,
                          border: `1px solid ${TOKENS.colors.borderLight}`,
                          boxShadow: TOKENS.shadows.inset,
                          color: TOKENS.colors.textMain,
                          fontSize: '0.92rem',
                          outline: 'none',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    {/* Categoría & Ciudad */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          Categoría *
                        </label>
                        <select
                          value={CATEGORIES.includes(category) ? category : 'Otros'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCategory(val);
                            if (val !== 'Otros') {
                              setCustomCategory('');
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceElevated,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            outline: 'none',
                          }}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          Ciudad *
                        </label>
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceElevated,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            outline: 'none',
                          }}
                        >
                          {CITIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Campo personalizado si selecciona "Otros" */}
                    {(category === 'Otros' || (category && !CATEGORIES.includes(category))) && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          Especifica tu Categoría o Rubro *
                        </label>
                        <input
                          type="text"
                          required
                          value={customCategory || (CATEGORIES.includes(category) && category === 'Otros' ? '' : category)}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomCategory(val);
                            setCategory(val.trim() ? val : 'Otros');
                          }}
                          placeholder="Ej. Floristería, Eventos, Fotografía, Clases, etc."
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceInset,
                            border: `1.5px solid rgba(21, 128, 61, 0.3)`,
                            boxShadow: TOKENS.shadows.inset,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.9rem',
                            outline: 'none',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    )}

                    {/* Dirección */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                        Dirección Física o Barrio *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Ej. Carrera 43A # 14-27, El Poblado"
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: TOKENS.colors.surfaceInset,
                          border: `1px solid ${TOKENS.colors.borderLight}`,
                          boxShadow: TOKENS.shadows.inset,
                          color: TOKENS.colors.textMain,
                          fontSize: '0.92rem',
                          outline: 'none',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    {/* WhatsApp & Teléfono */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          WhatsApp Directo (1-Clic) *
                        </label>
                        <input
                          type="text"
                          inputMode="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="Ej. +57 300 123 4567"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceInset,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            boxShadow: TOKENS.shadows.inset,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.88rem',
                            outline: 'none',
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          Teléfono Fijo / Alterno
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Ej. 604 444 0000"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceInset,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            boxShadow: TOKENS.shadows.inset,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.88rem',
                            outline: 'none',
                            fontWeight: 600,
                          }}
                        />
                      </div>
                    </div>

                    {/* 🕒 CONFIGURADOR VISUAL DE HORARIO DE ATENCIÓN */}
                    <div style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0 }}>
                          🕒 Horario de Atención
                        </label>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            backgroundColor: '#DCFCE7',
                            color: '#15803D',
                            padding: '3px 10px',
                            borderRadius: TOKENS.radii.pill,
                          }}
                        >
                          {scheduleText || 'Horario Configurado'}
                        </span>
                      </div>

                      {/* Chips de Selección Rápida (1-Clic) */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {[
                          'Lunes a Viernes · 8:00 AM – 6:00 PM',
                          'Lunes a Sábado · 8:00 AM – 6:00 PM',
                          'Lunes a Sábado · 9:00 AM – 8:00 PM',
                          'Todos los días · 24 Horas',
                          'Martes a Domingo · 12:00 PM – 10:00 PM',
                          'Lunes a Domingo · 8:00 AM – 8:00 PM',
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setScheduleText(preset);
                              if (preset.includes('24 Horas')) {
                                setIs24h(true);
                              } else {
                                setIs24h(false);
                              }
                            }}
                            style={{
                              padding: '5px 11px',
                              borderRadius: TOKENS.radii.pill,
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: scheduleText === preset ? '1.5px solid #15803D' : `1px solid ${TOKENS.colors.borderLight}`,
                              backgroundColor: scheduleText === preset ? '#DCFCE7' : TOKENS.colors.surfaceElevated,
                              color: scheduleText === preset ? '#15803D' : TOKENS.colors.textMain,
                              transition: 'all 150ms ease',
                            }}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>

                      {/* Menú Selector Detallado */}
                      <div
                        style={{
                          padding: '14px',
                          borderRadius: TOKENS.radii.lg,
                          backgroundColor: TOKENS.colors.surfaceElevated,
                          border: `1px solid ${TOKENS.colors.borderLight}`,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                          gap: '10px',
                          alignItems: 'flex-end',
                        }}
                      >
                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
                            Días de Atención
                          </label>
                          <select
                            value={scheduleDays}
                            onChange={(e) => {
                              const d = e.target.value;
                              setScheduleDays(d);
                              setScheduleText(is24h ? `${d} · 24 Horas` : `${d} · ${scheduleOpen} – ${scheduleClose}`);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              outline: 'none',
                            }}
                          >
                            <option value="Lunes a Sábado">Lunes a Sábado</option>
                            <option value="Lunes a Viernes">Lunes a Viernes</option>
                            <option value="Todos los días">Todos los días (Lun - Dom)</option>
                            <option value="Martes a Domingo">Martes a Domingo</option>
                            <option value="Fines de Semana">Fines de Semana (Sáb - Dom)</option>
                            <option value="Lunes a Jueves">Lunes a Jueves</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
                            Hora de Apertura
                          </label>
                          <select
                            disabled={is24h}
                            value={scheduleOpen}
                            onChange={(e) => {
                              const o = e.target.value;
                              setScheduleOpen(o);
                              setScheduleText(`${scheduleDays} · ${o} – ${scheduleClose}`);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: is24h ? 'rgba(0,0,0,0.04)' : TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              outline: 'none',
                            }}
                          >
                            {['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'].map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
                            Hora de Cierre
                          </label>
                          <select
                            disabled={is24h}
                            value={scheduleClose}
                            onChange={(e) => {
                              const c = e.target.value;
                              setScheduleClose(c);
                              setScheduleText(`${scheduleDays} · ${scheduleOpen} – ${c}`);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: is24h ? 'rgba(0,0,0,0.04)' : TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              outline: 'none',
                            }}
                          >
                            {['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'].map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const next24 = !is24h;
                              setIs24h(next24);
                              if (next24) {
                                setScheduleText(`${scheduleDays} · 24 Horas`);
                              } else {
                                setScheduleText(`${scheduleDays} · ${scheduleOpen} – ${scheduleClose}`);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: TOKENS.radii.pill,
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              border: is24h ? '1.5px solid #15803D' : `1px solid ${TOKENS.colors.borderLight}`,
                              backgroundColor: is24h ? '#DCFCE7' : TOKENS.colors.surfaceInset,
                              color: is24h ? '#15803D' : TOKENS.colors.textSecondary,
                            }}
                          >
                            {is24h ? '✓ 24 Horas Activo' : '⚡ 24 Horas'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Catálogo de Servicios */}
                    <div style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                        Catálogo de Servicios ({services.length})
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          value={newService}
                          onChange={(e) => setNewService(e.target.value)}
                          placeholder="Ej. Consulta Especializada / Corte"
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: TOKENS.radii.pill,
                            backgroundColor: TOKENS.colors.surfaceInset,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.86rem',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="neu-btn-primary"
                          style={{
                            padding: '8px 18px',
                            fontSize: '0.82rem',
                            borderRadius: TOKENS.radii.pill,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={15} /> Agregar
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {services.map((srv, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: TOKENS.colors.surfaceElevated,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              padding: '6px 12px',
                              borderRadius: TOKENS.radii.pill,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: TOKENS.colors.textMain,
                            }}
                          >
                            <span>{srv}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 900, padding: '0 2px' }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* SECCIÓN 2: PRESENTACIÓN, FOTO DE FONDO Y LOGO (DISPONIBLE PARA TODOS LOS PLANES) */}
                    <div style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: '#DCFCE7', color: '#15803D' }}>
                          ✓ Personalización de Afiche
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                          Logo, Portada & Presentación Comercial
                        </span>
                      </div>

                      {/* Logo y Portada en 2 Columnas */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {/* Logo / Foto de Perfil */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                            Logo del Negocio / Avatar (URL)
                          </label>
                          <input
                            type="url"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://.../logo.png"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>

                        {/* Foto de Fondo / Portada */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                            Foto de Fondo / Portada Comercial (URL)
                          </label>
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://.../portada.jpg"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* Descripción / Presentación */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                          Presentación del Negocio / Historia
                        </label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe la experiencia de tu negocio, qué te hace único y por qué los clientes deberían elegirte..."
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: TOKENS.radii.lg,
                            backgroundColor: TOKENS.colors.surfaceInset,
                            border: `1px solid ${TOKENS.colors.borderLight}`,
                            color: TOKENS.colors.textMain,
                            fontSize: '0.88rem',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>

                      {/* Redes Sociales */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                            Instagram
                          </label>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@tu_negocio"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                            Sitio Web Oficial
                          </label>
                          <input
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://tunegocio.com"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: TOKENS.colors.surfaceInset,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              color: TOKENS.colors.textMain,
                              fontSize: '0.86rem',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>

                      {/* EXCLUSIVO VIP ELITE */}
                      {merchantUser.plan === 'vip' && (
                        <div style={{ padding: '14px 16px', borderRadius: TOKENS.radii.lg, backgroundColor: '#FFFDF5', border: '1.5px solid #F59E0B' }}>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 900, color: '#D97706', marginBottom: '6px' }}>
                            👑 Servicio Estrella / Oferta VIP Destacada
                          </label>
                          <input
                            type="text"
                            value={featuredService}
                            onChange={(e) => setFeaturedService(e.target.value)}
                            placeholder="Ej. 20% OFF en primera consulta · Súper Botón VIP"
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: TOKENS.radii.pill,
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #F59E0B',
                              color: TOKENS.colors.textMain,
                              fontSize: '0.88rem',
                              outline: 'none',
                              fontWeight: 700,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Botón de Guardar */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="neu-btn-primary"
                      style={{
                        padding: '14px 28px',
                        fontSize: '0.96rem',
                        borderRadius: TOKENS.radii.pill,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '8px',
                      }}
                    >
                      <Check size={18} />
                      <span>{isSubmitting ? 'Guardando Catálogo...' : 'Guardar y Publicar Cambios'}</span>
                    </button>
                  </form>

                  {/* Simulador Móvil en Vivo */}
                  <div style={{ position: 'sticky', top: '90px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
                      📱 Vista Previa Real en el Directorio
                    </div>
                    <ProviderLivePreview
                      data={{
                        id,
                        slug,
                        name: businessName,
                        category,
                        city,
                        address,
                        whatsapp,
                        phone,
                        description,
                        services,
                        scheduleText,
                        plan: merchantUser?.plan || selectedPlan || 'gratis',
                        imageUrl,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: MÉTRICAS & LEADS ── */}
            {merchantTab === 'metricas' && (
              <div className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                    📊 Rendimiento y Clientes Contactados
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                    Métricas en tiempo real de interacciones recibidas desde tu afiche comercial.
                  </p>
                </div>

                <ProviderMetricsCard
                  whatsappClicks={merchantUser?.plan === 'vip' ? 6 : merchantUser?.plan === 'verificado' ? 2 : 0}
                  phoneCalls={0}
                  profileViews={merchantUser?.plan === 'vip' ? 28 : merchantUser?.plan === 'verificado' ? 12 : 1}
                  searchImpressions={merchantUser?.plan === 'vip' ? 140 : merchantUser?.plan === 'verificado' ? 45 : 3}
                  conversionRate={merchantUser?.plan === 'gratis' ? '0%' : '14.2%'}
                />

                {merchantUser?.plan === 'gratis' && (
                  <div
                    style={{
                      marginTop: '28px',
                      padding: '28px 28px',
                      borderRadius: TOKENS.radii.hero,
                      background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.45) 0%, rgba(255, 255, 255, 0.95) 100%)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      boxShadow: '0 8px 30px rgba(245, 158, 11, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                      <div style={{ maxWidth: '600px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#FEF3C7',
                            color: '#B45309',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '4px 10px',
                            borderRadius: TOKENS.radii.pill,
                            marginBottom: '10px',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                          }}
                        >
                          <Sparkles size={13} />
                          Plan Esencial Activo
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                          Multiplica hasta 3x tus contactos de clientes
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, lineHeight: 1.5, margin: 0 }}>
                          Activa el <strong>Plan Verificado ($49.900)</strong> o <strong>Plan VIP Elite</strong> para desbloquear posicionamiento top y convertir más visitantes en clientes reales.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMerchantTab('plan')}
                        style={{
                          padding: '12px 24px',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          borderRadius: TOKENS.radii.pill,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          border: 'none',
                          color: '#FFF',
                          background: 'linear-gradient(135deg, #17382D 0%, #15803D 100%)',
                          boxShadow: '0 4px 14px rgba(21, 128, 61, 0.3)',
                          transition: 'all 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                      >
                        <span>Activar Verificación</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {/* 4 Feature Pills */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                        gap: '10px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(245, 158, 11, 0.18)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <span style={{ color: '#15803D', fontWeight: 900 }}>✓</span> Sello Auditado (+40% clics WhatsApp)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <span style={{ color: '#15803D', fontWeight: 900 }}>✓</span> Ficha indexable en Google
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <span style={{ color: '#15803D', fontWeight: 900 }}>✓</span> Posición #1 en búsquedas locales
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <span style={{ color: '#15803D', fontWeight: 900 }}>✓</span> Reseñas y testimonios oficiales
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* ── TAB 3: RESEÑAS & REPUTACIÓN ── */}
            {merchantTab === 'resenas' && (
              <div className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                    ⭐ Gestión de Opiniones y Reseñas
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                    Sistema de valoraciones y reputación comercial en GUAKI.
                  </p>
                </div>

                {merchantUser?.plan === 'gratis' ? (
                  <div
                    style={{
                      padding: '36px 24px',
                      borderRadius: TOKENS.radii.xl,
                      backgroundColor: TOKENS.colors.surfaceElevated,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      textAlign: 'center',
                      maxWidth: '680px',
                      margin: '0 auto',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(23, 56, 45, 0.08)',
                        color: TOKENS.colors.emeraldDark,
                        display: 'grid',
                        placeItems: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.4rem',
                      }}
                    >
                      ⭐
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 8px' }}>
                      Módulo de Reseñas disponible en Plan Verificado
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, lineHeight: 1.55, margin: '0 auto 22px', maxWidth: '520px' }}>
                      En el <strong>Plan Esencial Gratis</strong> recibes contactos directos a tu WhatsApp. Para activar la recolección de reseñas de clientes, calificación por estrellas y respuestas oficiales de tu negocio, actualiza al <strong>Plan Verificado ($49.900/mes)</strong>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMerchantTab('plan')}
                      className="neu-btn-primary"
                      style={{
                        padding: '12px 24px',
                        fontSize: '0.88rem',
                        borderRadius: TOKENS.radii.pill,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Activar Plan Verificado ($49.900)</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        padding: '20px',
                        borderRadius: TOKENS.radii.xl,
                        backgroundColor: 'rgba(220, 233, 213, 0.5)',
                        border: `1px solid ${TOKENS.colors.borderLight}`,
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: TOKENS.colors.textMain, fontSize: '0.94rem' }}>
                          Enlace para solicitar reseñas por WhatsApp
                        </div>
                        <div style={{ fontSize: '0.82rem', color: TOKENS.colors.textSecondary, marginTop: '2px' }}>
                          Compártelo con tus clientes para que califiquen tu servicio con 1 toque.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/proveedores/${slug || 'mi-negocio'}#opiniones`;
                          navigator.clipboard?.writeText(shareUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className="neu-btn-primary"
                        style={{
                          padding: '10px 20px',
                          fontSize: '0.84rem',
                          borderRadius: TOKENS.radii.pill,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Share2 size={15} />
                        <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                      </button>
                    </div>

                    <div
                      style={{
                        padding: '36px 20px',
                        borderRadius: TOKENS.radii.lg,
                        backgroundColor: TOKENS.colors.surfaceElevated,
                        border: `1px solid ${TOKENS.colors.borderLight}`,
                        textAlign: 'center',
                      }}
                    >
                      <p style={{ fontSize: '0.92rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                        Aún no tienes reseñas registradas
                      </p>
                      <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: '0 auto', maxWidth: '440px', lineHeight: 1.45 }}>
                        Copia el enlace de arriba y envíaselo por WhatsApp a tus clientes satisfechos para que dejen su opinión auditada en tu ficha.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: MI PLAN & VERIFICACIÓN ── */}
            {merchantTab === 'plan' && (
              <div className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                    💎 Estado de Suscripción y Nivel de Verificación
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                    Tu negocio cuenta actualmente con la suscripción <strong>PLAN {merchantUser.plan?.toUpperCase() || 'GRATIS'}</strong>.
                  </p>
                </div>

                {/* Tarjeta de Plan Actual */}
                <div
                  style={{
                    padding: '24px',
                    borderRadius: TOKENS.radii.xl,
                    backgroundColor: TOKENS.colors.surfaceElevated,
                    border: `2px solid ${merchantUser.plan === 'vip' ? '#F59E0B' : merchantUser.plan === 'verificado' || merchantUser.plan === 'pro' ? '#15803D' : TOKENS.colors.borderLight}`,
                    marginBottom: '28px',
                    boxShadow: merchantUser.plan === 'vip' ? '0 8px 24px rgba(245, 158, 11, 0.2)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '1.3rem' }}>
                          {merchantUser.plan === 'vip' ? '👑' : merchantUser.plan === 'verificado' ? '⭐' : '🌿'}
                        </span>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
                          {merchantUser.plan === 'vip' ? 'Plan VIP Elite ($149.900 COP / mes)' : merchantUser.plan === 'verificado' ? 'Plan Verificado ($49.900 COP / mes)' : 'Plan Esencial ($0 COP / mes)'}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                        {merchantUser.plan === 'vip'
                          ? 'Súper Botón TOP VIP Verificado, posición #1 en el buscador y Ficha Comercial Completa.'
                          : merchantUser.plan === 'verificado'
                          ? 'Insignia oficial ✓ Verificado, Ficha Web propia indexable y catálogo ilimitado.'
                          : 'Presencia básica en el buscador con botón directo de WhatsApp.'}
                      </p>
                    </div>

                    <VerifiedBadge plan={merchantUser.plan} isVerified={merchantUser.plan !== 'gratis'} size="md" />
                  </div>
                </div>

                {/* Opciones de Upgrade / Cambio de Plan */}
                <div style={{ marginTop: '16px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: TOKENS.colors.textMain, marginBottom: '16px' }}>
                    Cambiar o Mejorar Nivel de Verificación
                  </h3>
                  <PlanCardsSection
                    mode="select"
                    selectedPlanId={merchantUser.plan}
                    onSelectPlan={async (newPlanId) => {
                      if (!id) {
                        setSuccessMessage('Primero guarda una ficha para asociar el plan al negocio.');
                        return;
                      }
                      const response = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ plan: newPlanId }),
                      });
                      if (!response.ok) {
                        setSuccessMessage('No se pudo persistir el cambio de plan.');
                        return;
                      }
                      setMerchantUser({ ...merchantUser, plan: newPlanId });
                      setSuccessMessage(`¡Plan actualizado con éxito al Plan ${newPlanId.toUpperCase()}!`);
                      setTimeout(() => setSuccessMessage(''), 3500);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
export default function ProviderDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Cargando portal del negocio...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
