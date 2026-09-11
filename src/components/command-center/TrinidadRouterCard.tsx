'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Building2,
  Store,
  Rocket,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StatusPill } from './AdminDashboard';
import { NM_DARK as NM } from './neumorphism-styles';

type LeadDestination = 'VEYRA' | 'GUAKI' | 'LANZA';

interface RoutedLead {
  lead_id: string;
  company_name: string;
  destination: LeadDestination;
  score: number;
  reason: string;
  suggested_offer: string;
  city?: string;
  phone?: string;
  email?: string;
}

interface PillarSummary {
  pillar: string;
  count: number;
  percentage: number;
  target_profile: string;
  leads: RoutedLead[];
}

interface TrinidadRoutingData {
  status: string;
  total_leads: number;
  timestamp: string;
  distribution: {
    VEYRA: PillarSummary;
    GUAKI: PillarSummary;
    LANZA: PillarSummary;
  };
  financial_projections: {
    veyra_usd_pipeline: number;
    guaki_mrr_cop: number;
    lanza_mrr_cop: number;
    total_mrr_cop: number;
  };
}

export default function TrinidadRouterCard() {
  const [data, setData] = useState<TrinidadRoutingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState<LeadDestination | null>(null);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<LeadDestination | 'ALL'>('ALL');

  const fetchRouting = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/command-center/trinidad/routing', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const json = await res.json().catch(() => null);
        setError(json?.message || 'El enrutador no está disponible.');
      }
    } catch {
      setError('No se pudo conectar con el enrutador La Trinidad (Mapache en 127.0.0.1:8000).');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouting();
  }, []);

  const handleDispatch = async (pillar: LeadDestination, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatching(pillar);
    setDispatchResult(null);

    try {
      const res = await fetch('/api/command-center/trinidad/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pillar, limit: 10 }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDispatchResult(`✔ ${json.dispatched_count} prospectos despachados al pipeline de ${pillar}.`);
        await fetchRouting();
      } else {
        setDispatchResult(`ℹ ${json.message || 'Sin prospectos nuevos para despachar.'}`);
      }
    } catch {
      setDispatchResult('Error al conectar con el enrutador.');
    } finally {
      setDispatching(null);
    }
  };

  if (!data) {
    if (error) {
      return (
        <div style={{ ...NM.card, padding: '36px', textAlign: 'center' }}>
          <AlertCircle size={26} color="#FBBF24" style={{ margin: '0 auto 12px' }} />
          <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.94rem', marginBottom: '4px' }}>
            Enrutador no disponible
          </strong>
          <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 auto 18px', maxWidth: '420px', lineHeight: 1.45 }}>{error}</p>
          <button
            type="button"
            onClick={fetchRouting}
            disabled={loading}
            style={{ ...NM.buttonEmerald, padding: '10px 18px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Reintentar
          </button>
        </div>
      );
    }
    return (
      <div style={{ ...NM.card, padding: '36px', textAlign: 'center' }}>
        <RefreshCw size={24} className="animate-spin" color="#10B981" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0 }}>Cargando Enrutador La Trinidad...</p>
      </div>
    );
  }

  const dist = data.distribution;

  const leadsToShow: RoutedLead[] =
    selectedPillar === 'ALL'
      ? [...(dist.VEYRA.leads || []), ...(dist.GUAKI.leads || []), ...(dist.LANZA.leads || [])]
      : dist[selectedPillar]?.leads || [];

  return (
    <div style={{ ...NM.card, padding: '28px', margin: '24px 0' }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...NM.inset, width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#10B981' }}>
              <GitBranch size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>
                Enrutador Comercial La Trinidad
              </h2>
              <span style={{ fontSize: '0.74rem', color: '#60A5FA', fontWeight: 800 }}>
                3 PUERTAS COMERCIALES · {data.total_leads} PROSPECTOS CLASIFICADOS
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '8px 0 0', lineHeight: 1.45 }}>
            Clasificación automática por volumen de reseñas, presencia web e infraestructura de cada prospecto.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRouting}
          disabled={loading}
          style={{
            ...NM.buttonConvex,
            padding: '10px 16px',
            color: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar clasificación
        </button>
      </div>

      {/* 3 Pillars Summary Cards with Dispatch Triggers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', margin: '20px 0' }}>
        {/* VEYRA CARD */}
        <div
          style={{
            padding: '20px',
            ...(selectedPillar === 'VEYRA' ? NM.buttonPressed : NM.cardSmall),
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={() => setSelectedPillar(selectedPillar === 'VEYRA' ? 'ALL' : 'VEYRA')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...NM.inset, width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#60A5FA' }}>
                <Building2 size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block' }}>Puerta VEYRA</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Enterprise AI ($2.850 USD)</span>
              </div>
            </div>
            <StatusPill tone="blue">{dist.VEYRA.count} LEADS ({dist.VEYRA.percentage}%)</StatusPill>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '8px 0 14px', lineHeight: 1.4 }}>{dist.VEYRA.target_profile}</p>
          <button
            type="button"
            onClick={(e) => handleDispatch('VEYRA', e)}
            disabled={dispatching === 'VEYRA'}
            style={{
              ...NM.buttonConvex,
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#3B82F6',
              color: '#FFFFFF',
              fontSize: '0.8rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Send size={13} /> {dispatching === 'VEYRA' ? 'Despachando...' : 'Despachar 31 Leads a Veyra'}
          </button>
        </div>

        {/* GUAKI CARD */}
        <div
          style={{
            padding: '20px',
            ...(selectedPillar === 'GUAKI' ? NM.buttonPressed : NM.cardSmall),
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={() => setSelectedPillar(selectedPillar === 'GUAKI' ? 'ALL' : 'GUAKI')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...NM.inset, width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#10B981' }}>
                <Store size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block' }}>Puerta GUAKI</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Directorio ($190k COP/mes)</span>
              </div>
            </div>
            <StatusPill tone="green">{dist.GUAKI.count} LEADS ({dist.GUAKI.percentage}%)</StatusPill>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '8px 0 14px', lineHeight: 1.4 }}>{dist.GUAKI.target_profile}</p>
          <button
            type="button"
            onClick={(e) => handleDispatch('GUAKI', e)}
            disabled={dispatching === 'GUAKI'}
            style={{
              ...NM.buttonConvex,
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#10B981',
              color: '#0A0D14',
              fontSize: '0.8rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Send size={13} /> {dispatching === 'GUAKI' ? 'Despachando...' : 'Despachar 7 Leads a Guaki'}
          </button>
        </div>

        {/* LANZA CARD */}
        <div
          style={{
            padding: '20px',
            ...(selectedPillar === 'LANZA' ? NM.buttonPressed : NM.cardSmall),
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={() => setSelectedPillar(selectedPillar === 'LANZA' ? 'ALL' : 'LANZA')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...NM.inset, width: '36px', height: '36px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#FBBF24' }}>
                <Rocket size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '1rem', color: '#F9FAFB', display: 'block' }}>Puerta LANZA</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>SaaS Builder ($49k COP/mes)</span>
              </div>
            </div>
            <StatusPill tone="amber">{dist.LANZA.count} LEADS ({dist.LANZA.percentage}%)</StatusPill>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '8px 0 14px', lineHeight: 1.4 }}>{dist.LANZA.target_profile}</p>
          <button
            type="button"
            onClick={(e) => handleDispatch('LANZA', e)}
            disabled={dispatching === 'LANZA'}
            style={{
              ...NM.buttonConvex,
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#F59E0B',
              color: '#0A0D14',
              fontSize: '0.8rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Send size={13} /> {dispatching === 'LANZA' ? 'Despachando...' : 'Despachar 39 Leads a Lanza'}
          </button>
        </div>
      </div>

      {dispatchResult && (
        <div style={{ padding: '12px 16px', ...NM.inset, color: '#34D399', fontSize: '0.84rem', margin: '16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {dispatchResult}
        </div>
      )}

      {/* Leads Breakdown Table */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
            Prospectos Asignados ({leadsToShow.length})
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
            Filtrando por: {selectedPillar}
          </span>
        </div>

        <div style={{ overflowX: 'auto', ...NM.inset, padding: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}>
                <th style={{ padding: '12px 14px' }}>Empresa</th>
                <th style={{ padding: '12px 14px' }}>Destino</th>
                <th style={{ padding: '12px 14px' }}>Oferta Sugerida</th>
                <th style={{ padding: '12px 14px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {leadsToShow.map((l) => (
                <tr key={l.lead_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px', color: '#F9FAFB', fontWeight: 700 }}>
                    {l.company_name}
                    <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>{l.city || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusPill tone={l.destination === 'VEYRA' ? 'blue' : l.destination === 'GUAKI' ? 'green' : 'amber'}>
                      {l.destination}
                    </StatusPill>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94A3B8' }}>{l.suggested_offer}</td>
                  <td style={{ padding: '12px 14px', color: '#34D399', fontWeight: 800 }}>{l.score}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
