'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { NM_DARK as NM } from './neumorphism-styles';

type InboxIntent = {
  reply_intent: string | null;
  confidence: number | null;
  summary: string | null;
  suggested_stage: string | null;
  reply_points: string[];
  source: string | null;
  reviewed: boolean;
  is_confident: boolean;
};

type InboxConversation = {
  id: string;
  lead_id: string;
  contact_id: string | null;
  channel: string;
  subject: string | null;
  status: string;
  is_unread: boolean;
  message_count: number;
  last_message_at: string | null;
  last_direction: 'OUTBOUND' | 'INBOUND' | null;
  company_name: string;
  contact_name: string | null;
  stage_name: string | null;
  stage_type: string | null;
  reply_intent: InboxIntent | null;
};

type InboxPayload = {
  status: 'PASS' | 'BLOCKED';
  filter: string;
  source: string;
  items: InboxConversation[];
  total: number;
  page: number;
  size: number;
  pages: number;
  message?: string;
};

const FILTERS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'answered', label: 'Entrantes' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'unanswered', label: 'Sin respuesta' },
  { id: 'closed', label: 'Cerradas' },
];

const CHANNEL_LABEL: Record<string, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  LINKEDIN: 'LinkedIn',
  PHONE: 'Teléfono',
  MANUAL: 'Manual',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusMeta(status: string) {
  switch (status) {
    case 'NEEDS_REPLY':
      return { label: 'NECESITA RESPUESTA', tone: 'amber' as const };
    case 'OPEN':
      return { label: 'ABIERTA', tone: 'green' as const };
    case 'CLOSED':
      return { label: 'CERRADA', tone: 'slate' as const };
    default:
      return { label: status || '—', tone: 'slate' as const };
  }
}

function StatusBadge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'blue' | 'amber' | 'red' | 'slate' }) {
  const styles = {
    green: { color: '#34D399', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)' },
    blue: { color: '#60A5FA', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(96, 165, 250, 0.3)' },
    amber: { color: '#FBBF24', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(251, 191, 36, 0.3)' },
    red: { color: '#F87171', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(248, 113, 113, 0.3)' },
    slate: { color: '#94A3B8', backgroundColor: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' },
  }[tone];

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

function ConversationCard({ conversation }: { conversation: InboxConversation }) {
  const needsAttention = conversation.status === 'NEEDS_REPLY' || conversation.is_unread;
  const meta = statusMeta(conversation.status);
  const intent = conversation.reply_intent;

  return (
    <div
      style={{
        backgroundColor: '#0A0D14',
        border: needsAttention ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid #242C3D',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '0.94rem', color: '#F9FAFB', fontWeight: 800 }}>
              {conversation.company_name || 'Empresa sin nombre'}
            </strong>
            {needsAttention && <StatusBadge tone="amber">Necesita atención</StatusBadge>}
          </div>
          {conversation.contact_name && (
            <span style={{ fontSize: '0.78rem', color: '#60A5FA', display: 'block', marginTop: '2px' }}>
              {conversation.contact_name}
            </span>
          )}
          {conversation.subject && (
            <span
              style={{
                fontSize: '0.76rem',
                color: '#94A3B8',
                display: 'block',
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {conversation.subject}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          {conversation.is_unread && <StatusBadge tone="red">No leída</StatusBadge>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B', flexWrap: 'wrap' }}>
        <StatusBadge tone="blue">{CHANNEL_LABEL[conversation.channel] ?? conversation.channel}</StatusBadge>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          {formatDate(conversation.last_message_at)}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <MessageSquare size={12} />
          {conversation.message_count} msgs
        </span>
        {conversation.stage_name && <span>{conversation.stage_name}</span>}
      </div>

      {intent && intent.reply_intent && (
        <div
          style={{
            ...NM.inset,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '0.76rem',
            color: '#94A3B8',
          }}
        >
          <Zap size={14} color={intent.is_confident ? '#34D399' : '#FBBF24'} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            <strong style={{ color: '#F9FAFB' }}>Intención detectada: </strong>
            {intent.reply_intent}
            {intent.is_confident && <StatusBadge tone="green">Confianza alta</StatusBadge>}
            {intent.summary && <span style={{ display: 'block', marginTop: '2px' }}>{intent.summary}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

export default function InboxPanel() {
  const [filter, setFilter] = useState('answered');
  const [data, setData] = useState<InboxPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/command-center/inbox?filter=${filter}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null) as InboxPayload | null;
      setData(payload);
    } catch {
      setData({
        status: 'BLOCKED',
        filter,
        source: 'unknown',
        items: [],
        total: 0,
        page: 1,
        size: 50,
        pages: 0,
        message: 'No se pudo consultar la bandeja de entrada.',
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(refresh, 15_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const blocked = Boolean(data && data.status === 'BLOCKED');
  const needsAttention = useMemo(
    () => (data?.items ?? []).filter((c) => c.status === 'NEEDS_REPLY' || c.is_unread).length,
    [data],
  );

  const total = data?.total ?? 0;

  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div style={{ backgroundColor: '#121722', border: '1px solid #242C3D', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Inbox size={22} color="#34D399" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F9FAFB', margin: 0 }}>Bandeja de Entrada</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {needsAttention > 0 && <StatusBadge tone="amber">{needsAttention} requieren atención</StatusBadge>}
            <StatusBadge tone={blocked ? 'red' : total > 0 ? 'green' : 'slate'}>
              {loading && !data ? 'CONSULTANDO...' : blocked ? 'LOCAL CAÍDO' : total > 0 ? `${total} CONVERSACIONES` : 'SIN RESPUESTAS'}
            </StatusBadge>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              style={{ ...NM.buttonConvex, padding: '8px 12px', fontSize: '0.76rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F9FAFB' }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Actualizar
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: '0 0 16px', lineHeight: 1.45 }}>
          Respuestas entrantes de prospectos sincronizadas por Mapache. Solo se muestran datos reales del motor; no se inventan métricas.
        </p>

        {blocked && (
          <div style={{ ...NM.inset, padding: '14px 16px', color: '#FBBF24', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <AlertCircle size={16} />
            <span style={{ flex: 1, minWidth: '200px' }}>
              Mapache local no responde. Verifica que el servidor en 127.0.0.1:8000 esté activo; se reintenta automáticamente cada 15s.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0A0D14', padding: '4px', borderRadius: '8px', border: '1px solid #242C3D', overflowX: 'auto', marginBottom: '18px' }}>
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              style={{
                padding: '6px 10px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                backgroundColor: filter === option.id ? '#10B981' : 'transparent',
                color: filter === option.id ? '#0A0D14' : '#64748B',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: '#0A0D14', border: '1px solid #242C3D', borderRadius: '12px', padding: '16px' }}>
                <div className="skeleton" style={{ width: '45%', height: '16px', marginBottom: '10px' }} />
                <div className="skeleton" style={{ width: '80%', height: '12px' }} />
              </div>
            ))}
          </div>
        ) : blocked ? (
          <div style={{ ...NM.inset, padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
            <AlertCircle size={26} color="#FBBF24" style={{ margin: '0 auto 10px' }} />
            <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.92rem', marginBottom: '4px' }}>Sin acceso a la bandeja de entrada</strong>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45 }}>Conecta Mapache (127.0.0.1:8000) para ver las conversaciones en tiempo real.</p>
          </div>
        ) : total === 0 ? (
          <div style={{ ...NM.inset, padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
            <CheckCircle2 size={26} color="#34D399" style={{ margin: '0 auto 10px' }} />
            <strong style={{ display: 'block', color: '#F9FAFB', fontSize: '0.92rem', marginBottom: '4px' }}>
              {filter === 'answered' ? 'Sin respuestas aún' : 'Sin conversaciones en esta vista'}
            </strong>
            <p style={{ fontSize: '0.8rem', margin: 0, lineHeight: 1.45 }}>
              Las respuestas entrantes de los prospectos aparecerán aquí en cuanto Mapache las sincronice.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {(data?.items ?? []).map((conversation) => (
              <ConversationCard key={conversation.id} conversation={conversation} />
            ))}
          </div>
        )}

        {!blocked && total > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748B' }}>
            <Sparkles size={12} color="#60A5FA" />
            Vista {FILTERS.find((f) => f.id === filter)?.label.toLowerCase() ?? filter} · Fuente: {data?.source ?? 'Mapache'}
          </div>
        )}
      </div>
    </div>
  );
}
