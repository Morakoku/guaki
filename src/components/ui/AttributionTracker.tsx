'use client';

import { useEffect } from 'react';

const ATTR_COOKIE = 'guaki_attr';
const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'] as const;

export default function AttributionTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      for (const key of ATTR_KEYS) {
        const value = params.get(key);
        if (value) found[key] = value.slice(0, 80);
      }
      if (Object.keys(found).length === 0) return;
      const encoded = encodeURIComponent(JSON.stringify({ ...found, ts: Date.now() }));
      document.cookie = `${ATTR_COOKIE}=${encoded}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    } catch {
      /* la atribución nunca debe romper la UI */
    }
  }, []);

  return null;
}
