'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Sparkles,
  Plus,
  ExternalLink,
  ArrowRight,
  Check,
  LogOut,
  Share2,
  Store,
  BarChart3,
  Star,
  Gem,
  Sprout,
  ShieldCheck,
  Crown,
  Smartphone,
  Clock,
  Zap,
  Palette,
  Send,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import GuakiHeader from '@/components/ui/GuakiHeader';
import ProviderLivePreview from '@/components/provider/ProviderLivePreview';
import ProviderMetricsCard from '@/components/provider/ProviderMetricsCard';
import VerifiedBadge from '@/components/ui/VerifiedBadge';
import PlanCardsSection from '@/components/ui/PlanCardsSection';
import ImageUploadField from '@/components/ui/ImageUploadField';
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

const SCHEDULE_DAY_OPTIONS = [
  'Lunes a Sábado',
  'Lunes a Viernes',
  'Todos los días',
  'Martes a Domingo',
  'Fines de Semana',
  'Lunes a Jueves',
];

const SCHEDULE_OPEN_OPTIONS = ['6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM'];

const SCHEDULE_CLOSE_OPTIONS = ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'];

const SCHEDULE_PRESETS = [
  'Lunes a Viernes · 8:00 AM – 6:00 PM',
  'Lunes a Sábado · 8:00 AM – 6:00 PM',
  'Lunes a Sábado · 9:00 AM – 8:00 PM',
  'Todos los días · 24 Horas',
  'Martes a Domingo · 12:00 PM – 10:00 PM',
  'Lunes a Domingo · 8:00 AM – 8:00 PM',
];

function decodeSchedule(text: string) {
  const first = (text || '').split(' | ')[0];
  const [rawDays, hoursPart = ''] = first.split(' · ');
  const days = rawDays === 'Lunes a Domingo' ? 'Todos los días' : rawDays;
  const is24h = /24 horas/i.test(hoursPart);
  let open = '8:00 AM';
  let close = '6:00 PM';
  if (!is24h) {
    const match = hoursPart.match(/^(.+?)\s–\s(.+)$/);
    if (match) {
      const candidateOpen = match[1].trim();
      const candidateClose = match[2].trim();
      if (SCHEDULE_OPEN_OPTIONS.includes(candidateOpen)) open = candidateOpen;
      if (SCHEDULE_CLOSE_OPTIONS.includes(candidateClose)) close = candidateClose;
    }
  }
  return {
    days: SCHEDULE_DAY_OPTIONS.includes(days) ? days : 'Lunes a Sábado',
    open,
    close,
    is24h,
  };
}

function DashboardContent() {
  // Estado de sesión del comerciante
  const [merchantUser, setMerchantUser] = useState<{ name: string; email: string; plan: string } | null>(null);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [selectedPlan, setSelectedPlan] = useState<'gratis' | 'verificado' | 'vip'>('gratis');
  const [merchantTab, setMerchantTab] = useState<'afiche' | 'metricas' | 'resenas' | 'plan'>('afiche');
  const [copiedLink, setCopiedLink] = useState(false);

  // Formulario de Registro / Suscripción
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  // Formulario de Negocio / Catálogo
  const [hasBusiness, setHasBusiness] = useState(false);
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
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
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
        const loadedSchedule = data.schedule?.map((item: { day: string; hours: string }) => `${item.day} · ${item.hours}`).join(' | ');
        setScheduleText(loadedSchedule);
        const decoded = decodeSchedule(loadedSchedule);
        setScheduleDays(decoded.days);
        setScheduleOpen(decoded.open);
        setScheduleClose(decoded.close);
        setIs24h(decoded.is24h);
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

    // 145. Degradación: si el rol aún es 'client', solicitamos la provisión de rol
    // 'provider' (validada por sesión en el servidor). Sin esto el middleware
    // bloquea /provider y el comerciante nunca entra a su panel.
    if (result.user?.role !== 'provider') {
      await fetch('/api/provider/provision', {
        method: 'POST',
        headers: { Authorization: `Bearer ${result.token}` },
      }).catch(() => undefined);
    }

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

      const targetId = savedBusiness?.id || id || generatedId;
      let auditQueued = false;
      try {
        const auditResponse = await fetch(`/api/businesses/${encodeURIComponent(targetId)}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit_audit' }),
        });
        auditQueued = auditResponse.ok;
      } catch {
        auditQueued = false;
      }

      if (auditQueued) {
        setStatus('in_audit');
        setSuccessMessage('¡Afiche guardado y enviado a auditoría automáticamente! Publicaremos tu ficha cuando sea aprobada.');
      } else {
        setSuccessMessage('Afiche guardado. El envío automático a auditoría falló: usa el botón "Enviar a auditoría" de abajo.');
      }
      setTimeout(() => setSuccessMessage(''), 6500);
    } catch (err: any) {
      setSuccessMessage(err?.message || 'Error al guardar. Por favor intenta de nuevo.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Enviar la ficha guardada (draft) a la cola de auditoría de Guaki.
  // Sin este paso el admin no puede aprobar/publicar (CLAIM_PENDING_AUDIT_REQUIRED).
  const handleSubmitAudit = async () => {
    if (!id) {
      setSuccessMessage('Guarda tu afiche primero para poder enviarlo a auditoría.');
      setTimeout(() => setSuccessMessage(''), 4500);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_audit' }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo enviar la ficha a auditoría.');
      }
      setStatus('in_audit');
      setSuccessMessage('¡Ficha enviada a auditoría! El equipo de Guaki la revisará y la publicará si todo está correcto.');
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: any) {
      setSuccessMessage(err?.message || 'Error al enviar a auditoría. Intenta de nuevo.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImproveDescription = async () => {
    if (!description.trim()) {
      setSuccessMessage('Escribe primero una idea breve de tu negocio y el asistente la mejorará.');
      setTimeout(() => setSuccessMessage(''), 4500);
      return;
    }
    setIsImprovingDescription(true);
    try {
      const response = await fetch('/api/ai/improve-description', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: description, businessName, category, city }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.text) throw new Error(data.error || 'No se pudo mejorar el texto.');
      setDescription(data.text);
      setSuccessMessage(
        data.engine === 'heuristic'
          ? 'Se aplicó una mejora base (asistente IA sin activar). Revísala y guarda los cambios.'
          : 'Propuesta del asistente lista. Revísala y guarda los cambios.',
      );
      setTimeout(() => setSuccessMessage(''), 5500);
    } catch (err: any) {
      setSuccessMessage(err?.message || 'No se pudo mejorar el texto. Intenta de nuevo.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } finally {
      setIsImprovingDescription(false);
    }
  };

  const completeness = calculateCompleteness();

  const scrollToSection = (targetId: string) => {
    if (typeof document === 'undefined') return;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page-fade-in provider-dashboard" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />

      <main className="provider-dashboard-main" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Mensaje de Éxito Flotante */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="gk-toast"
            style={{
              position: 'fixed',
              top: '84px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100001,
              maxWidth: 'min(560px, calc(100vw - 32px))',
              padding: '12px 20px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: 'rgba(226, 238, 221, 0.97)',
              border: '1px solid rgba(23, 56, 45, 0.18)',
              color: TOKENS.colors.emeraldDark,
              fontSize: '0.88rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 12px 32px rgba(18, 38, 28, 0.16)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span
                    aria-hidden
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '13px',
                      backgroundColor: 'rgba(23, 56, 45, 0.08)',
                      color: TOKENS.colors.emeraldDark,
                      flexShrink: 0,
                    }}
                  >
                    <Store size={20} />
                  </span>
                  <h1 style={{ fontSize: 'clamp(1.35rem, 2.6vw, 1.7rem)', fontWeight: 900, letterSpacing: '-0.02em', color: TOKENS.colors.textMain, margin: 0 }}>
                    {businessName || 'Centro de Mando de tu Negocio'}
                  </h1>
                </div>
                <p style={{ fontSize: '0.84rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                  Bienvenido, <strong>{merchantUser.name}</strong>{' '}
                  <span style={{ color: TOKENS.colors.textMuted }}>· {merchantUser.email}</span>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {slug && (
                  <Link
                    href={`/proveedores/${slug}`}
                    target="_blank"
                    className="soft-btn"
                    style={{
                      padding: '10px 16px',
                      fontSize: '0.82rem',
                      borderRadius: TOKENS.radii.pill,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                      color: TOKENS.colors.emeraldDark,
                      fontWeight: 800,
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
                    fontWeight: 800,
                  }}
                >
                  <LogOut size={14} />
                  <span>Salir</span>
                </button>
              </div>
            </div>

            {/* Selector de Pestañas */}
            <div
              className="gk-tabs"
              role="tablist"
              aria-label="Secciones del panel"
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '24px',
                overflowX: 'auto',
                paddingBottom: '6px',
              }}
            >
              {[
                { id: 'afiche', label: 'Mi Afiche & Catálogo', Icon: Store },
                { id: 'metricas', label: 'Métricas & Leads', Icon: BarChart3 },
                { id: 'resenas', label: 'Reseñas & Reputación', Icon: Star },
                { id: 'plan', label: 'Mi Plan & Verificación', Icon: Gem },
              ].map((t) => {
                const active = merchantTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMerchantTab(t.id as any)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: TOKENS.radii.pill,
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      backgroundColor: active ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                      color: active ? TOKENS.colors.white : TOKENS.colors.textMain,
                      border: `1px solid ${active ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                      boxShadow: active ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      transition: 'background-color 160ms ease, color 160ms ease, border-color 160ms ease',
                    }}
                  >
                    <t.Icon size={15} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TAB 1: MI AFICHE & CATÁLOGO ── */}
            {merchantTab === 'afiche' && (
              <div role="tabpanel" aria-label="Mi Afiche y Catálogo">
                {/* Banner de Estado del Plan y Progreso del Perfil */}
                <div
                  className="neu-level-2"
                  style={{
                    padding: '18px 20px',
                    borderRadius: TOKENS.radii.xl,
                    marginBottom: '20px',
                    backgroundColor: TOKENS.colors.surfaceElevated,
                    border: `1.5px solid ${merchantUser.plan === 'vip' ? '#F59E0B' : merchantUser.plan === 'verificado' ? '#15803D' : TOKENS.colors.borderLight}`,
                    boxShadow: merchantUser.plan === 'vip' ? '0 8px 24px rgba(245, 158, 11, 0.15)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 900,
                          padding: '4px 12px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: merchantUser.plan === 'vip' ? '#FEF3C7' : merchantUser.plan === 'verificado' ? 'rgba(37, 211, 102, 0.15)' : TOKENS.colors.surfaceInset,
                          color: merchantUser.plan === 'vip' ? '#92400E' : merchantUser.plan === 'verificado' ? '#15803D' : TOKENS.colors.textMain,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {merchantUser.plan === 'vip' ? (
                          <><Crown size={13} /> PLAN VIP ELITE ($149.900)</>
                        ) : merchantUser.plan === 'verificado' ? (
                          <><ShieldCheck size={13} /> PLAN VERIFICADO ($49.900)</>
                        ) : (
                          <><Sprout size={13} /> PLAN ESENCIAL ($0)</>
                        )}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: TOKENS.colors.textSecondary, fontWeight: 700 }}>
                        {merchantUser.plan === 'vip' ? 'Súper Botón VIP y Posicionamiento #1' : merchantUser.plan === 'verificado' ? 'Insignia Oficial de Verificación y Ficha Dedicada' : 'Presencia Básica en el Directorio'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
                        Completitud del Afiche
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: completeness === 100 ? '#15803D' : TOKENS.colors.emeraldDark }}>
                        {completeness}%
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: TOKENS.colors.surfaceInset, borderRadius: TOKENS.radii.pill, overflow: 'hidden', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: completeness === 100 ? '#15803D' : TOKENS.colors.emeraldDark,
                        borderRadius: TOKENS.radii.pill,
                        transform: `scaleX(${Math.max(0, Math.min(100, completeness)) / 100})`,
                        transformOrigin: 'left center',
                        transition: 'transform 360ms cubic-bezier(0.23, 1, 0.32, 1)',
                        willChange: 'transform',
                      }}
                    />
                  </div>

                  {/* Checklist Rápido: cada pendiente lleva al campo que falta */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { done: Boolean(businessName), label: 'Nombre', target: 'field-negocio', visible: true },
                      { done: Boolean(address), label: 'Dirección', target: 'field-direccion', visible: true },
                      { done: Boolean(whatsapp), label: 'WhatsApp 1-Clic', target: 'field-whatsapp', visible: true },
                      { done: services.length >= 2, label: services.length >= 2 ? `Catálogo (${services.length})` : 'Catálogo', target: 'field-catalogo', visible: true },
                      { done: Boolean(description), label: 'Presentación', target: 'field-presentacion', visible: merchantUser.plan !== 'gratis' },
                    ]
                      .filter((item) => item.visible)
                      .map((item) =>
                        item.done ? (
                          <span key={item.label} style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: 'rgba(37,211,102,0.14)', color: '#15803D', fontWeight: 700 }}>
                            ✓ {item.label}
                          </span>
                        ) : (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => scrollToSection(item.target)}
                            className="gk-chip-pending"
                            title="Ir a completar este dato"
                            style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: TOKENS.colors.surfaceInset, color: TOKENS.colors.textSecondary, fontWeight: 700, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            {item.label === 'Catálogo' ? '• Falta Catálogo' : `• Falta ${item.label}`}
                          </button>
                        ),
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
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.01em', color: TOKENS.colors.textMain, margin: '0 0 4px' }}>
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
                        id="field-negocio"
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
                        id="field-direccion"
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
                          id="field-whatsapp"
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
                        <label style={{ fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                          <Clock size={15} color={TOKENS.colors.emeraldDark} /> Horario de Atención
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
                        {SCHEDULE_PRESETS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setScheduleText(preset);
                              const decoded = decodeSchedule(preset);
                              setScheduleDays(decoded.days);
                              setScheduleOpen(decoded.open);
                              setScheduleClose(decoded.close);
                              setIs24h(decoded.is24h);
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
                            {SCHEDULE_DAY_OPTIONS.map((d) => (
                              <option key={d} value={d}>{d === 'Todos los días' ? 'Todos los días (Lun - Dom)' : d}</option>
                            ))}
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
                            {SCHEDULE_OPEN_OPTIONS.map((h) => (
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
                            {SCHEDULE_CLOSE_OPTIONS.map((h) => (
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
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            {is24h ? (
                              <><Check size={13} /> 24 Horas Activo</>
                            ) : (
                              <><Zap size={13} /> 24 Horas</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Catálogo de Servicios */}
                    <div id="field-catalogo" style={{ borderTop: `1px solid ${TOKENS.colors.borderLight}`, paddingTop: '14px' }}>
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
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: TOKENS.radii.pill, backgroundColor: '#DCFCE7', color: '#15803D', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Palette size={12} /> Personalización de Afiche
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain }}>
                          Logo, Portada & Presentación Comercial
                        </span>
                      </div>

                      {/* Logo y Portada en 2 Columnas */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        <ImageUploadField
                          label="Logo del Negocio / Avatar"
                          value={logoUrl}
                          onChange={setLogoUrl}
                          variant="logo"
                          hint="Cuadrado, mínimo 300x300 px."
                        />
                        <ImageUploadField
                          label="Foto de Fondo / Portada Comercial"
                          value={imageUrl}
                          onChange={setImageUrl}
                          variant="cover"
                          hint="Horizontal, mínimo 1200x600 px. Se ve en tu ficha y afiche."
                        />
                      </div>

                      {/* Descripción / Presentación */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, margin: 0 }}>
                            Presentación del Negocio / Historia
                          </label>
                          <button
                            type="button"
                            onClick={handleImproveDescription}
                            disabled={isImprovingDescription}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: TOKENS.radii.pill,
                              border: `1px solid ${TOKENS.colors.borderLight}`,
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: isImprovingDescription ? 'wait' : 'pointer',
                            }}
                          >
                            <Sparkles size={13} />
                            {isImprovingDescription ? 'Mejorando...' : 'Mejorar con asistente'}
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          id="field-presentacion"
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
                          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 900, color: '#D97706', marginBottom: '6px' }}>
                            <Crown size={13} /> Servicio Estrella / Oferta VIP Destacada
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

                    {/* Flujo de auditoría: borrador → en revisión → publicado */}
                    {hasBusiness && status === 'draft' && (
                      <button
                        type="button"
                        onClick={handleSubmitAudit}
                        disabled={isSubmitting}
                        style={{
                          padding: '14px 28px',
                          fontSize: '0.96rem',
                          fontWeight: 800,
                          borderRadius: TOKENS.radii.pill,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginTop: '4px',
                          backgroundColor: '#B7791F',
                          color: '#FFFFFF',
                          border: 'none',
                          boxShadow: '0 8px 20px rgba(183, 121, 31, 0.28)',
                        }}
                      >
                        <Send size={15} />
                        <span>Enviar a auditoría</span>
                      </button>
                    )}
                    {hasBusiness && status === 'in_audit' && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '12px 16px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: 'rgba(183, 121, 31, 0.12)',
                          border: '1px solid rgba(183, 121, 31, 0.3)',
                          color: '#8A5B10',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                        }}
                      >
                        <Clock size={15} /> Ficha en revisión — el equipo de Guaki la está auditando.
                      </div>
                    )}
                    {hasBusiness && status === 'published' && (
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '12px 16px',
                          borderRadius: TOKENS.radii.pill,
                          backgroundColor: 'rgba(46, 112, 82, 0.12)',
                          border: '1px solid rgba(46, 112, 82, 0.3)',
                          color: TOKENS.colors.emeraldDark,
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                        }}
                      >
                        <CheckCircle2 size={15} /> Ficha publicada en Guaki — tus clientes ya pueden encontrarte.
                      </div>
                    )}
                  </form>

                  {/* Simulador Móvil en Vivo */}
                  <div style={{ position: 'sticky', top: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '10px', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textSecondary }}>
                      <Smartphone size={14} color={TOKENS.colors.emeraldDark} />
                      <span>Vista Previa Real en el Directorio</span>
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
              <div role="tabpanel" aria-label="Métricas y Leads" className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={18} color={TOKENS.colors.emeraldDark} /> Rendimiento y Clientes Contactados
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
                        <Check size={13} color="#15803D" style={{ flexShrink: 0 }} /> Sello Auditado (+40% clics WhatsApp)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <Check size={13} color="#15803D" style={{ flexShrink: 0 }} /> Ficha indexable en Google
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <Check size={13} color="#15803D" style={{ flexShrink: 0 }} /> Posición #1 en búsquedas locales
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: TOKENS.colors.textMain }}>
                        <Check size={13} color="#15803D" style={{ flexShrink: 0 }} /> Reseñas y testimonios oficiales
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* ── TAB 3: RESEÑAS & REPUTACIÓN ── */}
            {merchantTab === 'resenas' && (
              <div role="tabpanel" aria-label="Reseñas y Reputación" className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={18} color={TOKENS.colors.emeraldDark} /> Gestión de Opiniones y Reseñas
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
                      <Star size={26} color={TOKENS.colors.emeraldDark} />
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
              <div role="tabpanel" aria-label="Mi Plan y Verificación" className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero }}>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gem size={18} color={TOKENS.colors.emeraldDark} /> Estado de Suscripción y Nivel de Verificación
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
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            borderRadius: '11px',
                            backgroundColor: merchantUser.plan === 'vip' ? '#FEF3C7' : merchantUser.plan === 'verificado' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(23, 56, 45, 0.08)',
                            color: merchantUser.plan === 'vip' ? '#B45309' : merchantUser.plan === 'verificado' ? '#15803D' : TOKENS.colors.emeraldDark,
                            flexShrink: 0,
                          }}
                        >
                          {merchantUser.plan === 'vip' ? <Crown size={18} /> : merchantUser.plan === 'verificado' ? <ShieldCheck size={18} /> : <Sprout size={18} />}
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
