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
        trackEvent(event);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
