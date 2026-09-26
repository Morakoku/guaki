'use client';

import React from 'react';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

interface TrackedLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  event: AnalyticsEvent;
  children: React.ReactNode;
}

/**
 * <a> que registra telemetría antes de navegar (WhatsApp, ficha, etc.).
 * Funciona en server components: el evento llega como objeto plano serializable.
 */
export default function TrackedLink({ event, children, onClick, ...rest }: TrackedLinkProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        // #39 tiempo-a-contacto: segundos desde abrir la página hasta tocar el link
        // (performance.now() = ms desde el time origin de la navegación; medido, no inventado).
        try {
          if (typeof performance !== 'undefined') {
            event.metadata = {
              ...(event.metadata || {}),
              time_to_contact_seconds: Math.round(performance.now() / 1000),
            };
          }
        } catch {}
        trackEvent(event);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
