const ecosystemSummary = {
  identity: {
    title: 'Holding Morakoku OS',
    strapline: 'Centro de Comando y Gobernanza para La Trinidad Comercial (LANZA + GUAKI + VEYRA) y Vertical Brenda Beauty OS.',
    summary: 'Consola operativa en tiempo real con evidencia verificable, métricas financieras y enrutamiento inteligente.',
  },
  programs: [
    { name: 'Guaki', role: 'Marketplace & Crecimiento PYME', status: 'PROD_LIVE', detail: 'Desplegado en Vercel Producción con 32 rutas, sitemap XML dinámico, SEO por ciudades y panel de proveedores.' },
    { name: 'LANZA', role: 'SaaS Builder (0 a 1)', status: 'PHASE_1_READY', detail: 'MVP de validación express en 60s, generador de ofertas con 3 entregables, checkout Wompi/PSE, 39 rutas Next.js y 7/7 tests pasando.' },
    { name: 'Brenda Beauty OS', role: 'Vertical Belleza & Academia', status: 'ACTIVE', detail: 'Protocolo de Mesa Rentable de 6 fases, Menú Sensorial con costeo unitario ($2.500 COP) y alertas hápticas en React Native Expo.' },
    { name: 'Veyra Enterprise', role: 'Enterprise AI Solutions', status: 'ENTERPRISE_READY', detail: 'Puerta comercial de alto valor ($2.850 USD / contrato) con 31 clínicas clasificadas y propuesta de automatización operativa.' },
    { name: 'Mapache CRM', role: 'Prospección & CRM Outbound', status: 'LOCAL_ACTIVE', detail: '77 prospectos clasificados con validación DNS MX, scoring DQS, anti-rebote y base de datos PostgreSQL 5435 con backups SHA-256.' },
    { name: 'Hermes Bridge', role: 'Sincronización y Gateway', status: 'LOCAL_ACTIVE', detail: 'Bridge activo en puerto 9121 con token de servicio y enrutamiento a Mapache backend.' },
  ],
  capabilities: [
    { name: 'Enrutador Inteligente La Trinidad', detail: 'Distribución automática de leads por madurez: Lanza (0 a 1), Guaki (1 a 10) y Veyra (10 a 100).', status: 'READY' },
    { name: 'Validación Express en 60s (Lanza)', detail: 'Generación instantánea de propuesta de valor, entregables y link de cobro digital.', status: 'READY' },
    { name: 'Protocolo de Mesa Rentable (Brenda)', detail: 'Optimización de tiempos de atención en 6 fases para maximizar margen por servicio.', status: 'READY' },
    { name: 'SEO Técnico Dinámico (Guaki)', detail: 'Sitemap XML por ciudades y categorías, metadata OpenGraph y robots.txt indexable.', status: 'READY' },
    { name: 'Scoring Multidimensional DQS (Mapache)', detail: 'Evaluación algorítmica de calidad digital, presencia web y reseñas en Google Maps.', status: 'ACTIVE' },
  ],
  evidence: [
    { name: 'Vercel Deployment (Guaki)', status: 'PROD_LIVE', detail: 'URL oficial: https://guakiweb-morakokus-projects.vercel.app' },
    { name: 'PostgreSQL 5435 (Mapache)', status: 'LOCAL_ACTIVE', detail: '77 leads clasificados y 109 empresas verificadas con SHA-256.' },
    { name: 'Next.js 15 Suite (Lanza)', status: 'PASS', detail: '39 rutas compiladas limpias y 7/7 tests unitarios pasando sin fallos.' },
    { name: 'React Native Suite (Brenda)', status: 'PASS', detail: 'Componentes TableTimer, SensoryMenuModal y navegación modular verificados.' },
    { name: 'Aislamiento de Seguridad', status: 'PASS', detail: 'Command Center protegido y accesible exclusivamente en localhost (404 en Vercel).' },
  ],
};

export function getEcosystemSummary() {
  return ecosystemSummary;
}
