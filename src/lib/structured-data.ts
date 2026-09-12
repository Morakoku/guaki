import { GUAKI_PLANS } from './plans';
import { absoluteUrl } from './site';

// Schema Product/Offer para los 3 planes de proveedor de Guaki.
// Los precios salen de la única fuente de verdad (GUAKI_PLANS): Esencial $0,
// Verificado $49.900 COP/mes y VIP Elite $149.900 COP/mes. No se inventan
// cifras ni valoraciones agregadas.
export function buildPlansStructuredData() {
  const plansUrl = absoluteUrl('/unete');
  return GUAKI_PLANS.map((plan) => ({
    '@type': 'Product',
    '@id': `${plansUrl}#plan-${plan.id}`,
    name: `Guaki ${plan.name}`,
    description: plan.description,
    category: 'Directorio local y presencia digital para negocios',
    brand: { '@type': 'Brand', name: 'Guaki' },
    offers: {
      '@type': 'Offer',
      price: plan.priceAmount,
      priceCurrency: 'COP',
      availability: 'https://schema.org/InStock',
      url: plansUrl,
    },
  }));
}
