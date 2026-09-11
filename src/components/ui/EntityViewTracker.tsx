'use client';

import { useEffect } from 'react';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';

/**
 * Dispara un evento de vista al montar (ficha, página, etc.).
 * Se usa desde server components pasando el evento como objeto plano.
 */
export default function EntityViewTracker({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    trackEvent(event);
    // Solo una vez al montar: el evento se construye por render del servidor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
