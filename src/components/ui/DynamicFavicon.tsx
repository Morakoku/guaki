'use client';

import { useEffect } from 'react';

export default function DynamicFavicon() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setFavicon = (emoji: string) => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setFavicon('✨'); // Sutil al cambiar de pestaña
      } else {
        setFavicon('🥑'); // Guaki original al volver
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return null;
}
