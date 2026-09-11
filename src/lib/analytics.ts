// Telemetría anónima de producto — cliente.
// Registra eventos de uso en public.events vía la API route interna.
// Sin PII: solo slug/business_id/contexto de navegación.

export interface AnalyticsEvent {
  event_name: string;
  metadata?: Record<string, unknown>;
  business_id?: string;
}

const DISABLED = process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === 'true';

function isQaBusiness(id?: string | null, name?: string | null): boolean {
  if (id && /^GKI-QA/i.test(id)) return true;
  if (name && /\(QA/i.test(name)) return true;
  return false;
}

export function trackEvent(event: AnalyticsEvent): void {
  if (DISABLED) return;
  if (typeof window === 'undefined') return;

  const payload = {
    event_name: event.event_name,
    business_id: event.business_id,
    metadata: {
      ...(event.metadata || {}),
      ...(isQaBusiness(event.business_id, typeof event.metadata?.name === 'string' ? (event.metadata.name as string) : null)
        ? { is_qa: true }
        : {}),
      page: window.location.pathname,
      ts_client: new Date().toISOString(),
    },
  };

  try {
    const body = JSON.stringify(payload);

    // sendBeacon sobrevive a navegaciones (clicks a WhatsApp/ficha)
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/analytics/event', blob)) return;
    }

    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* la telemetría nunca debe romper la UI */
  }
}
