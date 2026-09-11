'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Store,
  Edit3,
  Search,
  CheckCircle2,
  DollarSign,
  Download,
  Check,
  Eye,
  MessageCircle,
  Pin,
} from 'lucide-react';
import { TOKENS } from '@/lib/design-tokens';
import GuakiHeader from '@/components/ui/GuakiHeader';

interface BusinessAdminRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  phone: string;
  plan: 'gratis' | 'verificado' | 'vip';
  isPinned?: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  services: string[];
  imageUrl?: string;
  status: 'published' | 'suspended';
  workflowStatus: string;
  claimStatus: string;
}

const CATEGORIES = [
  'Todas las categorías',
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

const CITIES = ['Todas las ciudades', 'Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto'];

export default function AdminGodModeDashboard() {
  const [businesses, setBusinesses] = useState<BusinessAdminRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');
  const [selectedCity, setSelectedCity] = useState('Todas las ciudades');
  const [adminTab, setAdminTab] = useState<'comercios' | 'precios' | 'exportar'>('comercios');

  // Precios Maestros del Sistema
  const [priceVerificado, setPriceVerificado] = useState('49900');
  const [priceVip, setPriceVip] = useState('149900');
  const [flashDiscountEnabled, setFlashDiscountEnabled] = useState(false);
  const [flashDiscountPercent, setFlashDiscountPercent] = useState('20');

  // Modal de Edición en Caliente
  const [editingBusiness, setEditingBusiness] = useState<BusinessAdminRecord | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const mapApiBusiness = useCallback((business: any): BusinessAdminRecord => ({
    id: business.id,
    slug: business.slug,
    name: business.name || '',
    category: business.category || '',
    city: business.city || '',
    address: business.address || '',
    whatsapp: business.whatsapp || '',
    phone: business.phone || '',
    plan: ['gratis', 'verificado', 'vip'].includes(business.plan) ? business.plan : 'gratis',
    isPinned: false,
    rating: Number(business.rating || 0),
    reviewCount: Number(business.reviewCount || 0),
    description: business.description || '',
    services: Array.isArray(business.services) ? business.services : [],
    imageUrl: business.heroImage || business.logoUrl || '',
    status: business.status === 'published' ? 'published' : 'suspended',
    workflowStatus: business.status || 'draft',
    claimStatus: business.claimStatus || 'unclaimed',
  }), []);

  const refreshBusinesses = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/audit', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error('ADMIN_AUDIT_UNAVAILABLE');
      const payload = await response.json();
      const records = [
        ...(payload.queue?.pending || []),
        ...(payload.queue?.inReview || []),
        ...(payload.queue?.approved || []),
        ...(payload.queue?.rejected || []),
      ].map(mapApiBusiness);
      setBusinesses(records);
    } catch {
      setBusinesses([]);
      showToast('No se pudieron cargar comercios persistidos. Revisa la sesión administrativa.');
    }
  }, [mapApiBusiness, showToast]);

  useEffect(() => {
    void refreshBusinesses();
  }, [refreshBusinesses]);

  const persistBusinessUpdate = async (id: string, patch: Record<string, unknown>) => {
    const response = await fetch('/api/businesses/' + encodeURIComponent(id), {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!response.ok) throw new Error('BUSINESS_UPDATE_FAILED');
    await refreshBusinesses();
  };

  // Plan and profile edits persist through the admin-authenticated API.
  const handleQuickPlanChange = async (id: string, newPlan: 'gratis' | 'verificado' | 'vip') => {
    try {
      await persistBusinessUpdate(id, { plan: newPlan });
      showToast('✓ Plan e insignia actualizados a [' + newPlan.toUpperCase() + ']');
    } catch {
      showToast('No se pudo persistir el plan en Supabase.');
    }
  };

  // Pinning has no persisted field in the current schema; never simulate it locally.
  const handleTogglePin = (_id: string) => {
    showToast('PIN no está disponible: falta un campo persistente en el modelo.');
  };

  const handleToggleStatus = async (id: string) => {
    const business = businesses.find((item) => item.id === id);
    if (!business) return;
    if (business.workflowStatus === 'published') {
      showToast('Suspensión no está disponible todavía en el modelo persistente.');
      return;
    }
    try {
      const decision = async (value: 'approved' | 'published') => {
        const response = await fetch('/api/admin/audit/' + encodeURIComponent(id) + '/decision', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: value, notes: 'Decisión administrativa local registrada.' }),
        });
        if (!response.ok) throw new Error('AUDIT_DECISION_FAILED');
      };
      if (business.workflowStatus !== 'approved' || business.claimStatus !== 'verified') await decision('approved');
      await decision('published');
      await refreshBusinesses();
      showToast('✓ Comercio aprobado y publicado en Supabase');
    } catch {
      showToast('No se pudo completar la decisión de auditoría.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    try {
      await persistBusinessUpdate(editingBusiness.id, {
        name: editingBusiness.name,
        city: editingBusiness.city,
        address: editingBusiness.address,
        whatsapp: editingBusiness.whatsapp,
        phone: editingBusiness.phone,
        plan: editingBusiness.plan,
        description: editingBusiness.description,
      });
      setEditingBusiness(null);
      showToast('✓ Comercio guardado en Supabase');
    } catch {
      showToast('No se pudo guardar el comercio en Supabase.');
    }
  };

  // Pricing has no persisted backend table in P1.2; keep the form explicit rather than writing localStorage.
  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Precios pendientes de un modelo persistente; no se guardaron localmente.');
  };

  // 6. Exportar a Excel / CSV con formato BOM
  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoria', 'Ciudad', 'Direccion', 'WhatsApp', 'Telefono', 'Plan', 'Destacado_Top', 'Calificacion', 'Resenas', 'Estado'];
    const rows = businesses.map((b) => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.city}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.whatsapp}"`,
      `"${b.phone}"`,
      b.plan.toUpperCase(),
      b.isPinned ? 'SI' : 'NO',
      b.rating,
      b.reviewCount,
      b.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GUAKI_Directorio_Comercios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Archivo CSV descargado exitosamente');
  };

  // Filtrado de Comercios
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.whatsapp.includes(searchTerm);
      const matchCategory = selectedCategory === 'Todas las categorías' || b.category === selectedCategory;
      const matchCity = selectedCity === 'Todas las ciudades' || b.city === selectedCity;
      return matchSearch && matchCategory && matchCity;
    });
  }, [businesses, searchTerm, selectedCategory, selectedCity]);

  // Telemetría rápida
  const stats = useMemo(() => {
    const total = businesses.length;
    const verified = businesses.filter((b) => b.plan === 'verificado').length;
    const vip = businesses.filter((b) => b.plan === 'vip').length;
    const gratis = businesses.filter((b) => b.plan === 'gratis').length;
    const mrr = verified * Number(priceVerificado || 49900) + vip * Number(priceVip || 149900);
    return { total, verified, vip, gratis, mrr };
  }, [businesses, priceVerificado, priceVip]);

  return (
    <div className="page-fade-in" style={{ minHeight: '100vh', backgroundColor: 'transparent' }}>
      <GuakiHeader />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px 80px' }}>
        
        {/* Toast Notificación */}
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              padding: '14px 22px',
              borderRadius: TOKENS.radii.pill,
              backgroundColor: '#17382D',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            <CheckCircle2 size={18} color="#25D366" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cabecera Modo Dios */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.6rem' }}>👑</span>
              <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
                Panel de Control Maestro (Modo Dios)
              </h1>
            </div>
            <p style={{ fontSize: '0.9rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
              Edición en vivo de cualquier comercio, control de insignias, precios y catálogo general.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/directorio"
              className="soft-btn"
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
              <Eye size={15} />
              <span>Ver Directorio Público</span>
            </Link>
          </div>
        </div>

        {/* Tarjetas de Métricas MRR & Negocios */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <div className="neu-level-1" style={{ padding: '20px', borderRadius: TOKENS.radii.xl }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
              MRR ESTIMADO (MENSUAL)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803D' }}>
              ${stats.mrr.toLocaleString('es-CO')} <span style={{ fontSize: '0.8rem', color: TOKENS.colors.textMuted }}>COP</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, marginTop: '4px' }}>
              {stats.vip} VIP (${Number(priceVip).toLocaleString('es-CO')}) + {stats.verified} Verificados (${Number(priceVerificado).toLocaleString('es-CO')})
            </div>
          </div>

          <div className="neu-level-1" style={{ padding: '20px', borderRadius: TOKENS.radii.xl }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
              TOTAL COMERCIOS
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: TOKENS.colors.textMain }}>
              {stats.total} <span style={{ fontSize: '0.8rem', color: TOKENS.colors.textMuted }}>registrados</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, marginTop: '4px' }}>
              {stats.gratis} en Plan Gratis ($0)
            </div>
          </div>

          <div className="neu-level-1" style={{ padding: '20px', borderRadius: TOKENS.radii.xl }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: TOKENS.colors.textSecondary, marginBottom: '4px' }}>
              INSIGNIAS ACTIVAS
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706' }}>
              {stats.verified + stats.vip} <span style={{ fontSize: '0.8rem', color: TOKENS.colors.textMuted }}>auditados</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: TOKENS.colors.textSecondary, marginTop: '4px' }}>
              100% visibilidad garantizada
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'comercios', label: '🏪 Gestor Universal de Comercios', icon: Store },
            { id: 'precios', label: '💰 Control de Precios & Ofertas', icon: DollarSign },
            { id: 'exportar', label: '📊 Exportador Excel / CSV', icon: Download },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAdminTab(t.id as any)}
                style={{
                  padding: '10px 20px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  backgroundColor: adminTab === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.surfaceElevated,
                  color: adminTab === t.id ? TOKENS.colors.white : TOKENS.colors.textMain,
                  border: `1px solid ${adminTab === t.id ? TOKENS.colors.emeraldDark : TOKENS.colors.borderLight}`,
                  boxShadow: adminTab === t.id ? TOKENS.shadows.btnPrimary : TOKENS.shadows.btnConvex,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════════
            TAB 1: GESTOR UNIVERSAL DE COMERCIOS (Hot CRUD & Overrides)
           ═════════════════════════════════════════════════════════════════════════════ */}
        {adminTab === 'comercios' && (
          <div className="neu-level-2" style={{ padding: '28px', borderRadius: TOKENS.radii.hero }}>
            {/* Barra de Filtros */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Buscar por nombre, dirección o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 16px 10px 38px',
                    borderRadius: TOKENS.radii.pill,
                    backgroundColor: TOKENS.colors.surfaceInset,
                    border: `1px solid ${TOKENS.colors.borderLight}`,
                    color: TOKENS.colors.textMain,
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: TOKENS.colors.textMuted }} />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: TOKENS.radii.pill,
                  backgroundColor: TOKENS.colors.surfaceElevated,
                  border: `1px solid ${TOKENS.colors.borderLight}`,
                  color: TOKENS.colors.textMain,
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  padding: '10px 16px',
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

            {/* Tabla de Comercios en Caliente */}
            <div style={{ overflowX: 'auto', borderRadius: TOKENS.radii.lg, border: `1px solid ${TOKENS.colors.borderLight}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(23, 56, 45, 0.04)', borderBottom: `1px solid ${TOKENS.colors.borderLight}` }}>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Comercio</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Ubicación</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>WhatsApp / Tel</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800 }}>Plan e Insignia (1-Clic)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>#1 Pin Top</th>
                    <th style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBusinesses.map((b) => (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: `1px solid ${TOKENS.colors.borderLight}`,
                        backgroundColor: b.status === 'suspended' ? 'rgba(220, 38, 38, 0.03)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: TOKENS.colors.textMain, fontSize: '0.9rem' }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>
                          {b.category}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: TOKENS.colors.textMain }}>{b.city}</div>
                        <div style={{ fontSize: '0.76rem', color: TOKENS.colors.textSecondary }}>{b.address}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MessageCircle size={14} />
                          <span>{b.whatsapp}</span>
                        </div>
                        {b.phone && <div style={{ fontSize: '0.76rem', color: TOKENS.colors.textMuted }}>{b.phone}</div>}
                      </td>

                      {/* CONMUTADOR 1-CLIC DE PLAN E INSIGNIA */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'inline-flex', gap: '4px', backgroundColor: TOKENS.colors.surfaceInset, padding: '4px', borderRadius: TOKENS.radii.pill }}>
                          <button
                            type="button"
                            onClick={() => handleQuickPlanChange(b.id, 'gratis')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: TOKENS.radii.pill,
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              backgroundColor: b.plan === 'gratis' ? '#6B7280' : 'transparent',
                              color: b.plan === 'gratis' ? '#FFFFFF' : TOKENS.colors.textSecondary,
                            }}
                          >
                            Gratis
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickPlanChange(b.id, 'verificado')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: TOKENS.radii.pill,
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              backgroundColor: b.plan === 'verificado' ? '#15803D' : 'transparent',
                              color: b.plan === 'verificado' ? '#FFFFFF' : TOKENS.colors.textSecondary,
                            }}
                          >
                            ✓ Verificado
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickPlanChange(b.id, 'vip')}
                            style={{
                              padding: '4px 10px',
                              borderRadius: TOKENS.radii.pill,
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              backgroundColor: b.plan === 'vip' ? '#D97706' : 'transparent',
                              color: b.plan === 'vip' ? '#FFFFFF' : TOKENS.colors.textSecondary,
                            }}
                          >
                            👑 VIP Elite
                          </button>
                        </div>
                      </td>

                      {/* PIN TO TOP */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePin(b.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: TOKENS.radii.pill,
                            border: `1px solid ${b.isPinned ? '#D97706' : TOKENS.colors.borderLight}`,
                            backgroundColor: b.isPinned ? '#FEF3C7' : TOKENS.colors.surfaceElevated,
                            color: b.isPinned ? '#92400E' : TOKENS.colors.textMuted,
                            fontWeight: 800,
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Pin size={13} />
                          <span>{b.isPinned ? 'PIN #1' : 'Normal'}</span>
                        </button>
                      </td>

                      {/* ACCIONES DE EDICIÓN */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setEditingBusiness(b)}
                            className="neu-btn-primary"
                            style={{
                              padding: '6px 12px',
                              borderRadius: TOKENS.radii.pill,
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(b.id)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: TOKENS.radii.pill,
                              border: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor: b.status === 'published' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(37, 211, 102, 0.1)',
                              color: b.status === 'published' ? '#DC2626' : '#15803D',
                            }}
                          >
                            {b.status === 'published' ? 'Suspender' : 'Publicar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            TAB 2: CONTROL DE PRECIOS & OFERTAS
           ═════════════════════════════════════════════════════════════════════════════ */}
        {adminTab === 'precios' && (
          <div className="neu-level-2" style={{ padding: '32px 28px', borderRadius: TOKENS.radii.hero, maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 6px' }}>
                💰 Tarifas Base y Promociones Flash
              </h2>
              <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, margin: 0 }}>
                Modifica los precios de suscripción que se muestran en toda la web sin tocar código.
              </p>
            </div>

            <form onSubmit={handleSavePricing} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                    Precio Plan Verificado ($ COP / mes)
                  </label>
                  <input
                    type="number"
                    value={priceVerificado}
                    onChange={(e) => setPriceVerificado(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: TOKENS.colors.surfaceInset,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      color: TOKENS.colors.textMain,
                      fontWeight: 800,
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                    Precio Plan VIP Elite ($ COP / mes)
                  </label>
                  <input
                    type="number"
                    value={priceVip}
                    onChange={(e) => setPriceVip(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: TOKENS.radii.pill,
                      backgroundColor: TOKENS.colors.surfaceInset,
                      border: `1px solid ${TOKENS.colors.borderLight}`,
                      color: TOKENS.colors.textMain,
                      fontWeight: 800,
                      fontSize: '1rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Ofertas Flash */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: TOKENS.radii.xl,
                  backgroundColor: TOKENS.colors.surfaceElevated,
                  border: `1px solid ${TOKENS.colors.borderLight}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: TOKENS.colors.textMain, fontSize: '0.92rem' }}>
                      🔥 Promoción Flash con Descuento Temporal
                    </div>
                    <div style={{ fontSize: '0.78rem', color: TOKENS.colors.textSecondary }}>
                      Activa un banner superior de cuenta regresiva y descuento automático en el registro.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFlashDiscountEnabled(!flashDiscountEnabled)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: TOKENS.radii.pill,
                      border: 'none',
                      backgroundColor: flashDiscountEnabled ? '#15803D' : TOKENS.colors.surfaceInset,
                      color: flashDiscountEnabled ? '#FFFFFF' : TOKENS.colors.textMuted,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {flashDiscountEnabled ? 'ACTIVADO' : 'APAGADO'}
                  </button>
                </div>

                {flashDiscountEnabled && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: TOKENS.colors.textMain, marginBottom: '6px' }}>
                      Porcentaje de Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={flashDiscountPercent}
                      onChange={(e) => setFlashDiscountPercent(e.target.value)}
                      placeholder="Ej. 20"
                      style={{
                        width: '140px',
                        padding: '10px 14px',
                        borderRadius: TOKENS.radii.pill,
                        backgroundColor: TOKENS.colors.surfaceInset,
                        border: `1px solid ${TOKENS.colors.borderLight}`,
                        color: TOKENS.colors.textMain,
                        fontWeight: 800,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="neu-btn-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: TOKENS.radii.pill,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Check size={18} />
                <span>Guardar Nuevas Tarifas</span>
              </button>
            </form>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            TAB 3: EXPORTADOR DE BASE DE DATOS
           ═════════════════════════════════════════════════════════════════════════════ */}
        {adminTab === 'exportar' && (
          <div className="neu-level-2" style={{ padding: '36px 28px', borderRadius: TOKENS.radii.hero, textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(23, 56, 45, 0.08)',
                color: TOKENS.colors.emeraldDark,
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Download size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: '0 0 8px' }}>
              Exportación Completa del Catálogo a Excel
            </h2>
            <p style={{ fontSize: '0.88rem', color: TOKENS.colors.textSecondary, lineHeight: 1.5, margin: '0 auto 24px', maxWidth: '480px' }}>
              Descarga un archivo <strong>.CSV con codificación UTF-8</strong> compatible con Microsoft Excel, Google Sheets y CRMs con todos los comercios, teléfonos de WhatsApp, direcciones y planes.
            </p>

            <button
              type="button"
              onClick={handleExportCSV}
              className="neu-btn-primary"
              style={{
                padding: '14px 32px',
                fontSize: '0.96rem',
                borderRadius: TOKENS.radii.pill,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Download size={18} />
              <span>Descargar Directorio en Excel / CSV</span>
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════════
            MODAL DE EDICIÓN EN CALIENTE
           ═════════════════════════════════════════════════════════════════════════════ */}
        {editingBusiness && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div
              className="neu-level-2"
              style={{
                width: '100%',
                maxWidth: '580px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                borderRadius: TOKENS.radii.hero,
                backgroundColor: '#F3F4F6',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: TOKENS.colors.textMain, margin: 0 }}>
                  ✏️ Edición en Vivo: {editingBusiness.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={editingBusiness.name}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.pill, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>Ciudad</label>
                    <input
                      type="text"
                      required
                      value={editingBusiness.city}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, city: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.pill, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>WhatsApp Directo</label>
                    <input
                      type="tel"
                      required
                      value={editingBusiness.whatsapp}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, whatsapp: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.pill, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>Dirección Física</label>
                  <input
                    type="text"
                    required
                    value={editingBusiness.address}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.pill, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>Plan Asignado</label>
                  <select
                    value={editingBusiness.plan}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, plan: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.pill, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none', fontWeight: 700 }}
                  >
                    <option value="gratis">Plan Gratis ($0)</option>
                    <option value="verificado">Plan Verificado ($49.900)</option>
                    <option value="vip">Plan VIP Elite ($149.900)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '4px' }}>Presentación del Negocio</label>
                  <textarea
                    rows={3}
                    value={editingBusiness.description}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, description: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: TOKENS.radii.lg, backgroundColor: '#FFFFFF', border: `1px solid ${TOKENS.colors.borderLight}`, outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="submit"
                    className="neu-btn-primary"
                    style={{ flex: 1, padding: '12px 20px', borderRadius: TOKENS.radii.pill, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Guardar Cambios en Vivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBusiness(null)}
                    className="soft-btn"
                    style={{ padding: '12px 20px', borderRadius: TOKENS.radii.pill, fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
