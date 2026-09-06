import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guaki 🥑 — Directorio Local Inteligente & Servicios Verificados',
    short_name: 'Guaki 🥑',
    description: 'Encuentra y contacta directamente con negocios y profesionales verificados en Colombia. 100% fresco, directo y sin intermediarios.',
    start_url: '/',
    display: 'standalone',
    background_color: '#E7ECE7',
    theme_color: '#17382D',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
