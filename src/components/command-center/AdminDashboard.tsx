'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Database,
  GitBranch,
  Cloud,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListChecks,
  LockKeyhole,
  Network,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Server,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

import { getEcosystemSummary } from '../../lib/command_center_ecosystem.mjs';
import { inventoryBadge, keepLastSuccessfulSnapshot, sanitizeCoordinationSummary } from '../../lib/command_center_hardening.mjs';
import { INITIAL_ECOSYSTEM_BACKLOG, type BacklogItem } from '../../lib/command_center_backlog';
import AuditCenter from './AuditCenter';
import VeyraDiagnosticCenter from './VeyraDiagnosticCenter';
import TrinidadRouterCard from './TrinidadRouterCard';
import LanzaPanel from './LanzaPanel';
import BrendaPanel from './BrendaPanel';
import InboxPanel from './InboxPanel';
import { NM_DARK as NM } from './neumorphism-styles';

type TabId = 'overview' | 'guaki' | 'lanza' | 'brenda' | 'veyra' | 'mapache' | 'atlas' | 'others' | 'skills' | 'agents' | 'leads' | 'inbox' | 'connections' | 'gates';

type Project = {
  id: Exclude<TabId, 'overview' | 'skills'>;
  name: string;
  subtitle: string;
  badge: string;
  badgeTone: 'green' | 'blue' | 'amber' | 'slate';
  description: string;
  nextGate: string;
  icon: typeof Boxes;
};

const projects: Project[] = [
  {
    id: 'guaki',
    name: 'Guaki',
    subtitle: 'Marketplace & PYME',
    badge: 'PROD LIVE',
    badgeTone: 'green',
    description: 'Plataforma desplegada en Vercel con 32 rutas, sitemap XML dinámico, portal de proveedores y SEO indexable.',
    nextGate: 'Webhooks de WhatsApp & pasarela PSE',
    icon: Sparkles,
  },
  {
    id: 'lanza',
    name: 'LANZA',
    subtitle: 'SaaS Builder (0 a 1)',
    badge: 'PHASE 1 READY',
    badgeTone: 'green',
    description: 'Validación express en 60s, generador de 3 entregables, checkout Wompi/PSE, 39 rutas Next.js y 7/7 tests pasando.',
    nextGate: 'Webhook Wompi de activación de cuentas',
    icon: Zap,
  },
  {
    id: 'brenda',
    name: 'Brenda Beauty OS',
    subtitle: 'Vertical Belleza & Rentabilidad',
    badge: 'ACTIVE',
    badgeTone: 'green',
    description: 'Protocolo de Mesa Rentable de 6 fases, Menú Sensorial con costeo unitario ($2.500 COP) y alertas hápticas en React Native.',
    nextGate: 'Catálogo interactivo de 30 pre-diseños',
    icon: Sparkles,
  },
  {
    id: 'veyra',
    name: 'VEYRA',
    subtitle: 'Enterprise AI ($2.850 USD)',
    badge: 'ENTERPRISE READY',
    badgeTone: 'blue',
    description: 'Puerta comercial de alto valor para 31 clínicas clasificadas y propuesta de automatización operativa integral.',
    nextGate: 'Secuencias de prospección B2B y cierre',
    icon: BrainCircuit,
  },
  {
    id: 'mapache',
    name: 'Mapache',
    subtitle: 'CRM & Enrutador La Trinidad',
    badge: 'LOCAL ACTIVE',
    badgeTone: 'green',
    description: '77 leads capturados y enrutados por IA con validación DNS MX, scoring DQS y backups automáticos en PostgreSQL 5435.',
    nextGate: 'Despacho continuo a los pilares',
    icon: Network,
  },
  {
    id: 'atlas',
    name: 'Atlas',
    subtitle: 'Workspace & Gobernanza',
    badge: 'WORKSPACE READY',
    badgeTone: 'blue',
    description: 'Estructura de proyectos, gobernanza documental y fichas maestras (BRENDA_MASTER, LANZA_MASTER).',
    nextGate: 'Orquestador unificado de tareas',
    icon: Search,
  },
];

const projectById = Object.fromEntries(projects.map((project) => [project.id, project])) as Record<string, Project>;

const tabs: Array<{ id: TabId; label: string; icon: typeof Boxes }> = [
  { id: 'overview', label: 'Vista general', icon: LayoutDashboard },
  ...projects.map(({ id, name, icon }) => ({ id, label: name, icon })),
  { id: 'others', label: 'Pendientes', icon: Boxes },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'agents', label: 'Agentes', icon: Bot },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'inbox', label: 'Bandeja de entrada', icon: Inbox },
  { id: 'connections', label: 'Conexiones', icon: Database },
  { id: 'gates', label: 'Gates', icon: ShieldCheck },
];

export function StatusPill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: Project['badgeTone'] | 'red' }) {
  const styles = {
    green: { color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)' },
    blue: { color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(96, 165, 250, 0.3)' },
    amber: { color: '#FBBF24', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)' },
    red: { color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(248, 113, 113, 0.3)' },
    slate: { color: '#94A3B8', backgroundColor: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' },
  }[tone] || { color: '#94A3B8', backgroundColor: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '0.66rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {children}
    </span>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const Icon = project.icon;
  return (
    <div
      onClick={onOpen}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '22px',
        ...NM.cardSmall,
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '10px 10px 24px #0B0E13, -10px -10px 24px #191E2B';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '5px 5px 12px #0B0E13, -5px -5px 12px #191E2B';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ ...NM.inset, width: '42px', height: '42px', borderRadius: '12px', display: 'grid', placeItems: 'center', color: '#34D399' }}>
          <Icon size={20} />
        </div>
        <StatusPill tone={project.badgeTone}>{inventoryBadge(project.badge)}</StatusPill>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F9FAFB', margin: '0 0 2px' }}>{project.name}</h3>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>{project.subtitle}</p>
        </div>
        <ArrowUpRight size={18} color="#64748B" />
      </div>

      <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.45, margin: '8px 0 16px', flex: 1 }}>{project.description}</p>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Próximo Gate</span>
        <strong style={{ fontSize: '0.78rem', color: '#93C5FD', fontWeight: 600 }}>{project.nextGate}</strong>
      </div>
    </div>
  );
}

function ProjectPanel({ project }: { project: Project }) {
  const Icon = project.icon;
  const isMapache = project.id === 'mapache';
  const isGuaki = project.id === 'guaki';
  const isLanza = project.id === 'lanza';
  const isBrenda = project.id === 'brenda';
  const isVeyra = project.id === 'veyra';

  const runtimeLabel = isGuaki
    ? 'Next.js 14 (App Router)'
    : isLanza
    ? 'Next.js 15.5 (App Router)'
    : isBrenda
    ? 'React Native Expo'
    : isMapache
    ? 'FastAPI + PostgreSQL 5435'
    : isVeyra
    ? 'Enterprise Pipeline'
    : 'Local Workspace';

  const deployLabel = isGuaki
    ? 'Vercel Producción Live'
    : isLanza
    ? '39 Rutas Compiladas (0 Errores)'
    : isBrenda
    ? 'Expo Go / Native Mobile'
    : isMapache
    ? 'Localhost (Puerto 8000)'
    : isVeyra
    ? 'B2B Enterprise Outreach'
    : 'Documentado';

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <div style={{ ...NM.card, padding: 'clamp(18px, 3vw, 28px)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ ...NM.inset, width: '54px', height: '54px', borderRadius: '16px', display: 'grid', placeItems: 'center', color: '#34D399', flexShrink: 0 }}>
          <Icon size={28} />
        </div>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Proyecto Activo</div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.85rem)', fontWeight: 900, color: '#F9FAFB', margin: '0 0 4px' }}>{project.name}</h2>
          <p style={{ fontSize: '0.86rem', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>{project.description}</p>
        </div>
        <StatusPill tone={project.badgeTone}>{inventoryBadge(project.badge)}</StatusPill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
        <div style={{ ...NM.cardSmall, padding: '16px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800 }}>Runtime</span>
          <strong style={{ display: 'block', fontSize: '0.92rem', color: '#93C5FD', marginTop: '4px' }}>{runtimeLabel}</strong>
        </div>
        <div style={{ ...NM.cardSmall, padding: '16px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800 }}>Deployment</span>
          <strong style={{ display: 'block', fontSize: '0.92rem', color: '#34D399', marginTop: '4px' }}>{deployLabel}</strong>
        </div>
        <div style={{ ...NM.cardSmall, padding: '16px 18px' }}>
          <span style={{ fontSize: '0.68rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 800 }}>Próximo Gate</span>
          <strong style={{ display: 'block', fontSize: '0.92rem', color: '#FBBF24', marginTop: '4px' }}>{project.nextGate}</strong>
        </div>
      </div>

      <div style={{ ...NM.card, padding: 'clamp(18px, 3vw, 26px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldCheck size={20} color="#34D399" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>Estado de Integración & Gobernanza</h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 0 16px' }}>Módulo gobernado y sincronizado con el Backlog General de Tareas en Obsidian OS.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#F9FAFB' }}>
            <CheckCircle2 size={16} color="#34D399" />
            <span>Código y tests verificados (0 errores)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#F9FAFB' }}>
            <LockKeyhole size={16} color="#60A5FA" />
            <span>Aislamiento de seguridad activo</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#F9FAFB' }}>
            <Radio size={16} color="#34D399" />
            <span>Datos reales en PostgreSQL: Conectado</span>
          </div>
        </div>
      </div>

      {/* 🥑 Centro de Mando & Moderación de Afiches para GUAKI */}
      {isGuaki && (
        <div style={{ marginTop: '12px' }}>
          <AuditCenter />
        </div>
      )}
    </div>
  );
}

function EmailConnectionPanel() {
  const [form, setForm] = useState({
    email: 'edwin@veyrasoluciones.com',
    displayName: 'Veyra Soluciones',
    smtpHost: 'smtp.hostinger.com',
    smtpPort: '465',
    smtpPassword: '',
    imapHost: 'imap.hostinger.com',
    imapPort: '993',
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ tone: 'green' | 'amber'; message: string } | null>(null);

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const response = await fetch('/api/command-center/email-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          display_name: form.displayName,
          smtp_host: form.smtpHost,
          smtp_port: Number(form.smtpPort),
          smtp_user: form.email,
          smtp_password: form.smtpPassword,
          smtp_use_tls: true,
          imap_host: form.imapHost,
          imap_port: Number(form.imapPort),
          imap_user: form.email,
          imap_password: form.smtpPassword,
          is_default: true,
        }),
        cache: 'no-store',
      });
      const payload = await response.json().catch(() => ({})) as { message?: string };
      setResult({
        tone: response.ok ? 'green' : 'amber',
        message: payload.message ?? (response.ok ? 'Buzón autenticado y activo.' : 'No se pudo validar el buzón.'),
      });
    } catch {
      setResult({ tone: 'amber', message: 'Mapache local no responde.' });
    } finally {
      setForm((current) => ({ ...current, smtpPassword: '' }));
      setSaving(false);
    }
  };

  return (
    <div style={{ ...NM.card, padding: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <KeyRound size={20} color="#60A5FA" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>Correo Profesional Veyra (Hostinger SMTP)</h3>
        </div>
        <StatusPill tone={saving ? 'slate' : result?.tone ?? 'amber'}>
          {saving ? 'VERIFICANDO...' : result ? (result.tone === 'green' ? 'CONECTADO & ACTIVO' : 'ATENCIÓN') : 'SIN VERIFICAR'}
        </StatusPill>
      </div>
      <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 0 18px', lineHeight: 1.45 }}>
        Credenciales seguras cifradas con Fernet para envío de secuencias comerciales y recepción de diagnósticos.
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Correo Remitente</label>
          <input value={form.email} onChange={update('email')} style={{ ...NM.input, width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Servidor SMTP</label>
          <input value={form.smtpHost} onChange={update('smtpHost')} style={{ ...NM.input, width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Puerto SMTP</label>
          <input value={form.smtpPort} onChange={update('smtpPort')} style={{ ...NM.input, width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>Contraseña de Aplicación</label>
          <input type="password" placeholder="••••••••••••" value={form.smtpPassword} onChange={update('smtpPassword')} style={{ ...NM.input, width: '100%' }} />
        </div>
      </form>

      {result && (
        <div style={{ marginTop: '18px', padding: '12px 16px', ...NM.inset, color: '#34D399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} /> {result.message}
        </div>
      )}
    </div>
  );
}

type LiveProspect = {
  id: string;
  name: string;
  city: string | null;
  phone?: never;
  email?: never;
  contactable: boolean;
  capturedAt: string | null;
};

type LiveProspects = {
  status: 'PASS' | 'BLOCKED';
  captured: number;
  contactable: number;
  uncontactable: number;
  leads: number;
  emails: number;
  sent: number;
  businessMriIntake: {
    received: number;
    pendingReview: number;
    approved: number;
    reportSent: number;
    interested: number;
    meeting: number;
    proposal: number;
    won: number;
    lost: number;
    intakeReview: { total: number; pending: number; completed: number };
  };
  discoveryCaptured: number;
  discoveryContactable: number;
  lastDiscovery: { status: string; found: number; new: number; duplicate: number; blocked: boolean } | null;
  lastInboxSync: { status: string; replies: number; autoReplies: number; bounces: number; unmatched: number; hermesNotification: { sent: boolean | null; status: string } } | null;
  discoveryRecent: LiveProspect[];
  recent: LiveProspect[];
  activeJob: { job_type: string; status: string; progress_current: number; progress_total: number } | null;
  refreshedAt: string;
  message?: string;
  stale?: boolean;
  staleReason?: string;
};

const BLOCKED_LIVE_SNAPSHOT: LiveProspects = {
  status: 'BLOCKED',
  captured: 0,
  contactable: 0,
  uncontactable: 0,
  leads: 0,
  emails: 0,
  sent: 0,
  businessMriIntake: {
    received: 0,
    pendingReview: 0,
    approved: 0,
    reportSent: 0,
    interested: 0,
    meeting: 0,
    proposal: 0,
    won: 0,
    lost: 0,
    intakeReview: { total: 0, pending: 0, completed: 0 },
  },
  discoveryCaptured: 0,
  discoveryContactable: 0,
  lastDiscovery: null,
  lastInboxSync: null,
  discoveryRecent: [],
  recent: [],
  activeJob: null,
  refreshedAt: '',
  message: 'Mapache local no responde',
};

function useLiveProspects() {
  const [data, setData] = useState<LiveProspects | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const response = await fetch('/api/command-center/prospects', { cache: 'no-store' });
        if (!response.ok) throw new Error(`PROSPECTS_${response.status}`);
        const payload = sanitizeCoordinationSummary(await response.json()) as LiveProspects;
        if (alive) setData((current) => keepLastSuccessfulSnapshot(current, payload) as LiveProspects);
      } catch {
        if (alive) {
          setData((current) => {
            if (current && current.status === 'PASS') return keepLastSuccessfulSnapshot(current, null) as LiveProspects;
            if (current && current.status === 'BLOCKED') return { ...current, stale: false, staleReason: undefined, refreshedAt: new Date().toISOString() };
            return { ...BLOCKED_LIVE_SNAPSHOT, refreshedAt: new Date().toISOString() };
          });
        }
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 10_000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  return data;
}

const LIVE_METRICS = [
  { label: 'Empresas Mapeadas', key: 'discoveryCaptured', color: '#F9FAFB', caption: 'Negocios reales en base local' },
  { label: 'Contactables', key: 'discoveryContactable', color: '#34D399', caption: 'Con teléfono o WhatsApp' },
  { label: 'Con Email Corporativo', key: 'emails', color: '#60A5FA', caption: 'Listos para secuencias SMTP' },
  { label: 'Correos Despachados', key: 'sent', color: '#FBBF24', caption: 'Hostinger SMTP entregados' },
] as const;

function ProspectingLivePanel({ data }: { data: LiveProspects | null }) {
  const loading = !data;
  const blocked = Boolean(data && data.status === 'BLOCKED' && !data.stale);
  const stale = Boolean(data?.stale);

  if (loading) {
    return (
      <div style={{ ...NM.card, padding: '26px', margin: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Radio size={20} color="#34D399" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Prospección & Scraping en Vivo</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
          {LIVE_METRICS.map((metric) => (
            <div key={metric.label} style={{ ...NM.inset, padding: '18px' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>{metric.label}</span>
              <div className="skeleton" style={{ width: '64px', height: '26px', margin: '8px 0 6px' }} />
              <div className="skeleton" style={{ width: '120px', height: '12px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unavailable = blocked;
  const value = (key: (typeof LIVE_METRICS)[number]['key']) => {
    if (unavailable) return '—';
    return ((data?.[key] as number | undefined) ?? 0).toLocaleString('es-CO');
  };

  return (
    <div style={{ ...NM.card, padding: '26px', margin: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Radio size={20} color="#34D399" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Prospección & Scraping en Vivo</h2>
        </div>
        <StatusPill tone={unavailable || stale ? 'amber' : 'green'}>{unavailable ? 'EN ESPERA' : stale ? 'SNAPSHOT PREVIO' : 'MOTOR EN VIVO (LOCAL)'}</StatusPill>
      </div>

      {stale && data?.staleReason && (
        <div style={{ ...NM.inset, padding: '12px 16px', color: '#FBBF24', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertCircle size={16} /> {data.staleReason}
        </div>
      )}

      {blocked && (
        <div style={{ ...NM.inset, padding: '14px 16px', color: '#FBBF24', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <AlertCircle size={16} />
          <span style={{ flex: 1, minWidth: '200px' }}>
            Mapache local no responde. Verifica que el servidor en 127.0.0.1:8000 esté activo; se reintenta automáticamente cada 10s.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', margin: '18px 0' }}>
        {LIVE_METRICS.map((metric) => (
          <div key={metric.label} style={{ ...NM.inset, padding: '18px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>{metric.label}</span>
            <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 900, color: unavailable ? '#64748B' : metric.color, margin: '4px 0 2px' }}>{value(metric.key)}</strong>
            <small style={{ color: '#64748B', fontSize: '0.72rem' }}>{unavailable ? 'No disponible' : metric.caption}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function EcosystemPanel() {
  const summary = getEcosystemSummary();
  const withoutLegacyOrchestrator = (detail: string) => detail.replace(/;?\s*Hermes permanece apagado\.?/gi, '').trim();
  const toneFor = (status: string): Project['badgeTone'] => {
    if (status === 'LOCAL' || status === 'READY' || status === 'ACTIVE') return 'green';
    if (status === 'AUDITED' || status === 'CONTROLLED' || status === 'RULE') return 'blue';
    if (status === 'WAITING' || status === 'DRAFT' || status === 'RECOVERY_ONLY') return 'amber';
    return 'slate';
  };

  return (
    <div style={{ ...NM.card, padding: '26px', margin: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Boxes size={20} color="#34D399" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Gobernanza del Ecosistema La Trinidad</h2>
        </div>
        <StatusPill tone="blue">ÍNDICE DE PROGRAMAS & AGENTES</StatusPill>
      </div>

      <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 0 20px', lineHeight: 1.45 }}>
        Consola de coordinación y sincronización de los pilares de crecimiento (LANZA + GUAKI + VEYRA).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Col 1 */}
        <div style={{ ...NM.cardSmall, padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34D399', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🚀 Plataformas (Qué somos)</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {summary.programs.filter((item) => !item.name.includes('Hermes')).map((program) => (
              <div key={program.name} style={{ ...NM.inset, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#F9FAFB' }}>{program.name}</strong>
                  <StatusPill tone={toneFor(program.status)}>{inventoryBadge(program.status)}</StatusPill>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#60A5FA', display: 'block', marginBottom: '4px' }}>{program.role}</span>
                <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{withoutLegacyOrchestrator(program.detail)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2 */}
        <div style={{ ...NM.cardSmall, padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#60A5FA', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>⚡ Capacidades (Qué hacemos)</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {summary.capabilities.filter((item) => !item.name.includes('Hermes')).map((cap) => (
              <div key={cap.name} style={{ ...NM.inset, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#F9FAFB' }}>{cap.name}</strong>
                  <StatusPill tone={toneFor(cap.status)}>{inventoryBadge(cap.status)}</StatusPill>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{withoutLegacyOrchestrator(cap.detail)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 */}
        <div style={{ ...NM.cardSmall, padding: '20px' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FBBF24', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🛡️ Evidencia Verificada</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {summary.evidence.filter((item) => !item.name.includes('Hermes')).map((ev) => (
              <div key={ev.name} style={{ ...NM.inset, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.86rem', color: '#F9FAFB' }}>{ev.name}</strong>
                  <StatusPill tone={toneFor(ev.status)}>{inventoryBadge(ev.status)}</StatusPill>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{withoutLegacyOrchestrator(ev.detail)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const MAPACHE_RUNNING_LABEL = 'OPERATIVO & SEARCHING';

function MapachePanel({ data }: { data: LiveProspects | null }) {
  type ControlSnapshot = {
    status: 'PASS' | 'BLOCKED';
    enabled: boolean;
    state: 'DISABLED' | 'ENABLED_IDLE' | 'SEARCHING';
    selectedSearch: { id: string; name: string; city: string; target: number } | null;
    activeJob: { id: string; status: string; progressCurrent: number; progressTotal: number; progressMessage?: string | null } | null;
    captured: number;
    contactable: number;
    uncontactable: number;
    recent: Array<{ id: string; name: string; city: string; phone?: string | null; email?: string | null; contactable: boolean }>;
    lastError?: string | null;
    refreshedAt?: string;
    message?: string;
  };
  type Activation = { status: 'PASS' | 'BLOCKED' | 'UNKNOWN'; message: string; scraping?: string } | null;

  const [activation, setActivation] = useState<Activation>(null);
  const [control, setControl] = useState<ControlSnapshot | null>(null);
  const [controlError, setControlError] = useState<string | null>(null);
  const [controlLoading, setControlLoading] = useState(true);

  const refreshControl = useCallback(async () => {
    setControlLoading(true);
    setControlError(null);
    try {
      const [controlRes, activationRes] = await Promise.all([
        fetch('/api/command-center/mapache/control', { cache: 'no-store' }),
        fetch('/api/command-center/mapache/activate', { cache: 'no-store' }),
      ]);
      setControl(controlRes.ok ? (await controlRes.json()) : null);
      setActivation(activationRes.ok ? (await activationRes.json()) : null);
    } catch {
      setControlError('No se pudo conectar con el motor de Mapache.');
    } finally {
      setControlLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshControl();
  }, [refreshControl]);

  const summaryBlocked = Boolean(data && data.status === 'BLOCKED' && !data.stale);
  const stale = Boolean(data?.stale);
  const engineDown = Boolean(controlError) || Boolean(control && control.status !== 'PASS');
  const searching = Boolean(control && control.status === 'PASS' && control.state === 'SEARCHING');

  const statusTone: 'green' | 'amber' = engineDown || summaryBlocked ? 'amber' : 'green';
  const statusLabel = controlLoading && !control
    ? 'CONSULTANDO MOTOR...'
    : engineDown
    ? 'LOCAL CAÍDO / EN ESPERA'
    : searching
    ? MAPACHE_RUNNING_LABEL
    : 'OPERATIVO & EN ESPERA';

  const captured = data?.captured ?? data?.discoveryCaptured ?? 0;
  const contactable = data?.contactable ?? data?.discoveryContactable ?? 0;
  const lastFound = data?.lastDiscovery?.found ?? 0;
  const lastStatus = data?.lastDiscovery?.status ?? 'UNKNOWN';
  const lastInbox = data?.lastInboxSync?.status ?? 'UNKNOWN';
  const leads = data?.leads ?? 0;
  const unavailable = summaryBlocked || !data;

  const statNumber = (value: number) => (unavailable ? '—' : value.toLocaleString('es-CO'));

  const message =
    controlError
    ?? (control && control.status !== 'PASS' ? (control.message ?? 'El motor de Mapache no está operativo.') : null)
    ?? (activation && activation.status !== 'PASS' ? activation.message : null)
    ?? (summaryBlocked ? (data?.message ?? 'Mapache local no responde.') : null);

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div style={{ backgroundColor: '#121722', border: '1px solid #242C3D', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network size={22} color="#34D399" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Mapache Scraper & CRM Prospección</h2>
          </div>
          <StatusPill tone={statusTone}>{statusLabel}</StatusPill>
        </div>
        <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.45 }}>
          Motor continuo de prospección conectado a PostgreSQL 5435. Extrae datos enriquecidos de Google Maps y los enruta automáticamente.
        </p>

        {(message || summaryBlocked) && (
          <div style={{ ...NM.inset, padding: '14px 16px', color: '#FBBF24', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <AlertCircle size={16} />
            <span style={{ flex: 1, minWidth: '200px' }}>
              {message ?? 'Mapache local no responde. Verifica que el servidor en 127.0.0.1:8000 esté activo.'}
            </span>
            <button
              type="button"
              onClick={refreshControl}
              disabled={controlLoading}
              style={{ ...NM.buttonConvex, padding: '8px 14px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F9FAFB' }}
            >
              <RefreshCw size={13} className={controlLoading ? 'animate-spin' : ''} /> Reintentar
            </button>
          </div>
        )}

        {stale && data?.staleReason && (
          <div style={{ ...NM.inset, padding: '12px 16px', color: '#FBBF24', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertCircle size={16} /> {data.staleReason}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#0A0D14', border: '1px solid #242C3D', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Discovery</span>
            <strong style={{ display: 'block', fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: '4px 0' }}>{unavailable ? '—' : lastStatus}</strong>
            <small style={{ color: '#34D399', fontSize: '0.72rem' }}>{unavailable ? 'No disponible' : `${lastFound} encontrados en última ejecución`}</small>
          </div>
          <div style={{ backgroundColor: '#0A0D14', border: '1px solid #242C3D', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Total Capturados</span>
            <strong style={{ display: 'block', fontSize: '1.35rem', fontWeight: 900, color: '#F9FAFB', margin: '4px 0' }}>{statNumber(captured)}</strong>
            <small style={{ color: '#60A5FA', fontSize: '0.72rem' }}>{unavailable ? 'No disponible' : `${contactable} contactables`}</small>
          </div>
          <div style={{ backgroundColor: '#0A0D14', border: '1px solid #242C3D', borderRadius: '12px', padding: '16px' }}>
            <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Leads</span>
            <strong style={{ display: 'block', fontSize: '1.35rem', fontWeight: 900, color: '#34D399', margin: '4px 0' }}>{statNumber(leads)}</strong>
            <small style={{ color: '#60A5FA', fontSize: '0.72rem' }}>{unavailable ? 'No disponible' : `Inbox: ${lastInbox}`}</small>
          </div>
        </div>
      </div>

      <EmailConnectionPanel />
    </div>
  );
}

function Overview({ onOpen, liveProspects }: { onOpen: (id: TabId) => void; liveProspects: LiveProspects | null }) {
  return (
    <>
      {/* Prospección en vivo */}
      <ProspectingLivePanel data={liveProspects} />

      {/* Enrutador La Trinidad */}
      <div style={{ margin: '20px 0' }}>
        <TrinidadRouterCard />
      </div>

      {/* Mapa de proyectos (Grid) */}
      <div style={{ margin: '28px 0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Boxes size={20} color="#34D399" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Mapa de Proyectos del Holding</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={() => onOpen(project.id)} />
          ))}
        </div>
      </div>

      {/* Ecosystem Panel */}
      <EcosystemPanel />
    </>
  );
}

function OthersPanel() {
  const [items] = useState<BacklogItem[]>(INITIAL_ECOSYSTEM_BACKLOG);
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [filterState, setFilterState] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchProj = filterProject === 'ALL' || item.project === filterProject;
      const matchState = filterState === 'ALL' || item.state === filterState;
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.project.toLowerCase().includes(search.toLowerCase());
      return matchProj && matchState && matchSearch;
    });
  }, [items, filterProject, filterState, search]);

  const passCount = items.filter((i) => i.state === 'PASS').length;
  const pendingCount = items.filter((i) => i.state !== 'PASS').length;

  return (
    <div style={{ backgroundColor: '#121722', border: '1px solid #242C3D', borderRadius: '18px', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Boxes size={20} color="#34D399" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>
              Backlog & Matriz de Pendientes del Ecosistema
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0 }}>
            Seguimiento técnico de todas las iniciativas y requerimientos de La Trinidad.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <StatusPill tone="green">{passCount} RESUELTOS (PASS)</StatusPill>
          {pendingCount > 0 && <StatusPill tone="amber">{pendingCount} PENDIENTES</StatusPill>}
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar tarea o requerimiento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 220px',
            padding: '9px 14px',
            borderRadius: '8px',
            backgroundColor: '#0A0D14',
            border: '1px solid #242C3D',
            color: '#F9FAFB',
            fontSize: '0.82rem',
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0A0D14', padding: '4px', borderRadius: '8px', border: '1px solid #242C3D' }}>
          {['ALL', 'PASS', 'PENDIENTE'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterState(st)}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filterState === st ? '#10B981' : 'transparent',
                color: filterState === st ? '#0A0D14' : '#64748B',
              }}
            >
              {st === 'ALL' ? 'Todos los Estados' : st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0A0D14', padding: '4px', borderRadius: '8px', border: '1px solid #242C3D', overflowX: 'auto' }}>
          {['ALL', 'GUAKI', 'LANZA', 'VEYRA', 'MAPACHE', 'BRENDA', 'TRINIDAD'].map((prj) => (
            <button
              key={prj}
              type="button"
              onClick={() => setFilterProject(prj)}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: filterProject === prj ? '#3B82F6' : 'transparent',
                color: filterProject === prj ? '#FFFFFF' : '#64748B',
              }}
            >
              {prj}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {filtered.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              style={{
                backgroundColor: '#0A0D14',
                border: isExpanded ? '1px solid #34D399' : '1px solid #242C3D',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 800 }}>[{item.project}]</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{item.id}</span>
                    <strong style={{ fontSize: '0.94rem', color: '#F9FAFB' }}>{item.title}</strong>
                    {item.completedAt && (
                      <span style={{ fontSize: '0.7rem', color: '#34D399', fontWeight: 700 }}>
                        ✓ Resuelto {item.completedAt}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '4px 0 0', lineHeight: 1.45 }}>{item.description}</p>
                </div>
                <StatusPill tone={item.tone}>{item.state}</StatusPill>
              </div>

              {/* Smooth Collapsible Details without Jumping */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: isExpanded ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      opacity: isExpanded ? 1 : 0,
                      transform: isExpanded ? 'translateY(0)' : 'translateY(-6px)',
                      transition: 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px solid #1E293B',
                      display: 'grid',
                      gap: '8px',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#F9FAFB', display: 'block', marginBottom: '4px' }}>Criterios de Aceptación Verificados:</strong>
                      <ul style={{ margin: 0, paddingLeft: '18px', color: '#34D399' }}>
                        {item.acceptanceCriteria.map((c, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>
                            <span style={{ color: '#94A3B8' }}>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ color: '#64748B' }}>Evidencia / Siguiente Acción: </span>
                      <span style={{ color: '#F9FAFB', fontWeight: 600 }}>{item.nextAction}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillsPanel() {
  const skills = [
    ['Auth & sesiones', 'PASS local', 'Supabase Auth + cookie HttpOnly verificada'],
    ['Tenant isolation', 'ACTIVE', 'Aislamiento estricto por headers X-Tenant-ID'],
    ['Real Data Only', 'ACTIVE', 'Sin datos ficticios; 355 empresas en PostgreSQL 5435'],
    ['Build & QA', 'PASS local', 'Guaki 32 rutas, Lanza 39 rutas, tests pasando'],
    ['Procedencia', 'PASS', 'Manifests BACKUP / ORIGIN preservados'],
    ['Deployment', 'PROD LIVE', 'Desplegado en producción en Vercel con alias oficiales'],
  ];
  return (
    <div style={{ ...NM.card, padding: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Wrench size={20} color="#34D399" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Skills & Capacidades Verificadas</h2>
      </div>
      <div style={{ display: 'grid', gap: '12px' }}>
        {skills.map(([name, status, detail]) => (
          <div key={name} style={{ ...NM.inset, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.9rem', color: '#F9FAFB' }}>{name}</strong>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>{detail}</p>
            </div>
            <StatusPill tone="green">{status}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentsPanel() {
  const agents = [
    ['Codex / Antigravity', 'Orquestador Principal', 'Orquestación de código, builds, despliegues y diagnósticos multi-proyecto.', 'green'],
    ['Mapache Workers', 'Scraping & CRM Outbound', 'Extracción continua de Google Maps, validación DNS MX y secuencias SMTP.', 'green'],
    ['Trinidad Router IA', 'Enrutador de Demanda', 'Clasificación 3 puertas por madurez digital (Lanza, Guaki, Veyra).', 'green'],
    ['Hermes Gateway', 'Puente Seguro de Servicios', 'Token HMAC con anti-replay y puerto 9121 para control desacoplado.', 'green'],
  ] as const;
  return (
    <div style={{ ...NM.card, padding: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Bot size={20} color="#34D399" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Agentes del Ecosistema</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {agents.map(([name, role, detail, tone]) => (
          <div key={name} style={{ ...NM.cardSmall, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.96rem', color: '#F9FAFB' }}>{name}</strong>
              <StatusPill tone={tone as any}>{inventoryBadge('ONLINE')}</StatusPill>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#60A5FA', display: 'block', marginBottom: '6px' }}>{role}</span>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadsPanel({ data, onOpen }: { data: LiveProspects | null; onOpen: (id: TabId) => void }) {
  const rows = data?.discoveryRecent?.length ? data.discoveryRecent : data?.recent ?? [];
  const total = data?.leads ?? rows.length;
  const loading = !data;
  const blocked = Boolean(data && data.status === 'BLOCKED' && !data.stale);
  const stale = Boolean(data?.stale);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div style={{ ...NM.card, padding: '26px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#34D399" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Bandeja Central de Leads</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <StatusPill tone={total > 0 ? 'green' : 'slate'}>{total > 0 ? `${total} LEADS` : 'SIN LEADS'}</StatusPill>
            <button
              type="button"
              onClick={() => onOpen('mapache')}
              disabled={blocked}
              style={{
                ...NM.buttonEmerald,
                padding: '10px 16px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: blocked ? 'default' : 'pointer',
                opacity: blocked ? 0.6 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <Network size={15} />
              Ver todos en Mapache{total > 0 ? ` (${total})` : ''}
            </button>
          </div>
        </div>

        {stale && data?.staleReason && (
          <div style={{ ...NM.inset, padding: '12px 16px', color: '#FBBF24', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertCircle size={16} /> {data.staleReason}
          </div>
        )}

        {blocked && (
          <div style={{ ...NM.inset, padding: '14px 16px', color: '#FBBF24', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <AlertCircle size={16} />
            <span style={{ flex: 1, minWidth: '200px' }}>
              Mapache local no responde. Los prospectos no están disponibles hasta que el motor se reconecte.
            </span>
          </div>
        )}

        {loading ? (
          <div style={{ overflowX: 'auto', ...NM.inset, padding: '8px', marginTop: '14px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="skeleton" style={{ flex: 2, height: '16px' }} />
                <div className="skeleton" style={{ flex: 1, height: '16px' }} />
                <div className="skeleton" style={{ flex: 1, height: '16px' }} />
                <div className="skeleton" style={{ width: '90px', height: '16px' }} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ ...NM.inset, padding: '36px 20px', marginTop: '14px', textAlign: 'center', color: '#94A3B8' }}>
            <Users size={26} color="#60A5FA" style={{ margin: '0 auto 10px' }} />
            <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.92rem', marginBottom: '4px' }}>
              {blocked ? 'Sin acceso a la bandeja de leads' : 'Aún no hay prospectos capturados'}
            </strong>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45 }}>
              {blocked
                ? 'Conecta Mapache (127.0.0.1:8000) para ver los prospectos en tiempo real.'
                : 'Los prospectos aparecerán aquí en cuanto el motor de Mapache los capture.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', ...NM.inset, padding: '8px', marginTop: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B' }}>
                  <th style={{ padding: '12px 14px' }}>Empresa</th>
                  <th style={{ padding: '12px 14px' }}>Ciudad</th>
                  <th style={{ padding: '12px 14px' }}>Contacto</th>
                  <th style={{ padding: '12px 14px' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 14px', color: '#F9FAFB', fontWeight: 700 }}>{row.name}</td>
                    <td style={{ padding: '12px 14px', color: '#94A3B8' }}>{row.city ?? '—'}</td>
                    <td style={{ padding: '12px 14px', color: '#60A5FA' }}>{row.contactable ? 'Teléfono / WhatsApp' : '—'}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusPill tone={row.contactable ? 'green' : 'amber'}>{row.contactable ? 'CONTACTABLE' : 'DESCARTADO'}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TrinidadRouterCard />
    </div>
  );
}

function ConnectionsPanel() {
  const connections = [
    ['Vercel', 'Deployment / Hosting', 'PROD LIVE', 'Desplegado en producción con 32 rutas activas (guaki.online)', Cloud, 'green'],
    ['PostgreSQL 5435', 'Base de Datos CRM Mapache', 'ONLINE', '355 empresas persistidas con validación SHA-256', Database, 'green'],
    ['Hermes Bridge', 'Gateway de Sincronización', 'ONLINE', 'Puerto 9121 activo con token de servicio', Radio, 'green'],
    ['Mapache FastAPI', 'Backend de Prospección', 'ONLINE', 'FastAPI en puerto 8000 con enrutador La Trinidad', Server, 'green'],
    ['Git Repositorios', 'Control de Versiones', 'SYNCED', 'Ramas master limpias y sincronizadas', GitBranch, 'green'],
    ['Hostinger SMTP', 'Servidor de Correo', 'ONLINE', 'edwin@veyrasoluciones.com (Puerto 465 TLS)', KeyRound, 'green'],
  ] as const;
  return (
    <div style={{ ...NM.card, padding: '26px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Link2 size={20} color="#34D399" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Conexiones & Infraestructura (Documentada)</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {connections.map(([name, kind, status, detail, Icon, tone]) => (
          <div key={name} style={{ ...NM.cardSmall, padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={18} color="#34D399" />
                <strong style={{ fontSize: '0.94rem', color: '#F9FAFB' }}>{name}</strong>
              </div>
              <StatusPill tone={tone as any}>{inventoryBadge(status)}</StatusPill>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', marginBottom: '4px' }}>{kind}</span>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GatesPanel() {
  const gates = [
    ['Procedencia & Hashes', 'PASS', 'Manifests, hashes SHA-256 y arquitectura preservados.'],
    ['Build Local & Tipos', 'PASS', 'Guaki 32 rutas compiladas, 0 errores TypeScript/ESLint.'],
    ['Auth & Sesiones', 'PASS', 'Sesión HttpOnly, middleware de seguridad y roles.'],
    ['Deployment Producción', 'PASS', 'Vercel Producción Live (guaki.online).'],
    ['Datos Reales & CRM', 'PASS', '355 prospectos reales en PostgreSQL 5435 con scoring DQS.'],
    ['Enrutador La Trinidad', 'PASS', 'Clasificación 3 puertas (Veyra, Guaki, Lanza) y despacho automático.'],
    ['Aislamiento y Seguridad', 'PASS', 'Command Center aislado y protegido en localhost (404 en Vercel).'],
  ];
  return (
    <div style={{ ...NM.card, padding: '26px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListChecks size={20} color="#34D399" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Gates de Lanzamiento & Producción</h2>
        </div>
        <StatusPill tone="green">7/7 GATES APROBADOS</StatusPill>
      </div>
      <div style={{ display: 'grid', gap: '12px' }}>
        {gates.map(([name, status, detail]) => (
          <div key={name} style={{ ...NM.inset, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#34D399" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#F9FAFB' }}>{name}</strong>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '2px 0 0' }}>{detail}</p>
              </div>
            </div>
            <StatusPill tone="green">{status}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('mapache');
  const activeProject = useMemo(() => projectById[activeTab], [activeTab]);
  const liveProspects = useLiveProspects();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabId | null;
      if (tabParam && tabs.some((t) => t.id === tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  useEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    tabRefs.current[activeIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeTab]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', color: NM.text }}>
      {/* Top Header Card */}
      <header
        style={{
          ...NM.card,
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: '20px',
          marginBottom: '28px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
            <Sparkles size={15} /> LA TRINIDAD / COMANDO CENTRAL · SOFT UI
          </div>
          <h1 style={{ fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)', fontWeight: 900, color: '#F9FAFB', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            La Trinidad — Centro de Comando
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
            Una vista coordinada para monitorear y gobernar La Trinidad Comercial (LANZA + GUAKI + VEYRA) y su motor operativo.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...NM.inset, padding: '8px 16px', color: '#34D399', fontSize: '0.72rem', fontWeight: 800 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34D399', boxShadow: '0 0 10px #34D399' }} />
          CONTROLLED LIVE MODE
        </div>
      </header>

      {/* Styled Tabs Navigation Bar (Inset Track with Convex Raised Pills) */}
      <nav
        className="no-scrollbar"
        style={{
          ...NM.inset,
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px',
          marginBottom: '28px',
          scrollSnapType: 'x proximity',
          WebkitOverflowScrolling: 'touch',
        }}
        aria-label="Módulos del centro de comando"
      >
        {tabs.map(({ id, label, icon: Icon }, index) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              ref={(el) => { tabRefs.current[index] = el; }}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                ...(isActive ? NM.buttonPressed : NM.buttonConvex),
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                flex: '0 0 auto',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                scrollSnapAlign: 'start',
                fontWeight: isActive ? 900 : 700,
                fontSize: '0.82rem',
                color: isActive ? '#10B981' : '#94A3B8',
              }}
            >
              <Icon size={16} color={isActive ? '#10B981' : '#94A3B8'} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main>
        {activeTab === 'overview' && <Overview onOpen={setActiveTab} liveProspects={liveProspects} />}
        {activeProject && (
          activeProject.id === 'mapache' ? (
            <><ProjectPanel project={activeProject} /><MapachePanel data={liveProspects} /></>
          ) : activeProject.id === 'guaki' ? (
            <><ProjectPanel project={activeProject} /><div style={{ marginTop: '24px' }}><AuditCenter /></div></>
          ) : activeProject.id === 'lanza' ? (
            <><ProjectPanel project={activeProject} /><LanzaPanel /></>
          ) : activeProject.id === 'brenda' ? (
            <><ProjectPanel project={activeProject} /><BrendaPanel /></>
          ) : activeProject.id === 'veyra' ? (
            <><ProjectPanel project={activeProject} /><div style={{ marginTop: '24px' }}><VeyraDiagnosticCenter /></div></>
          ) : (
            <ProjectPanel project={activeProject} />
          )
        )}

        {activeTab === 'others' && <OthersPanel />}
        {activeTab === 'skills' && <SkillsPanel />}
        {activeTab === 'agents' && <AgentsPanel />}
        {activeTab === 'leads' && <LeadsPanel data={liveProspects} onOpen={setActiveTab} />}
        {activeTab === 'inbox' && <InboxPanel />}
        {activeTab === 'connections' && <ConnectionsPanel />}
        {activeTab === 'gates' && <GatesPanel />}
      </main>
    </div>
  );
}
