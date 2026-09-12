import { COUNTRY_META, CountryCode } from './geo';

export interface GuakiPlan {
  id: 'gratis' | 'verificado' | 'vip';
  name: string;
  badgeText: string;
  priceFormatted: string;
  priceAmount: number;
  period: string;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlight?: boolean;
  vip?: boolean;
  ctaText: string;
}

export function getPlansForCountry(country: CountryCode = 'CO'): GuakiPlan[] {
  const meta = COUNTRY_META[country];
  return GUAKI_PLANS.map((plan) => {
    if (plan.id === 'gratis') {
      return { ...plan, period: `${meta.currency} / mes` };
    }
    const price = meta.plans[plan.id];
    return { ...plan, priceFormatted: price.formatted, priceAmount: price.amount, period: `${meta.currency} / mes` };
  });
}

export const GUAKI_PLANS: GuakiPlan[] = [
  {
    id: 'gratis',
    name: 'Plan Esencial',
    badgeText: 'Para Siempre',
    priceFormatted: '$0',
    priceAmount: 0,
    period: 'COP / mes',
    description: 'Presencia básica en el directorio para recibir contactos directos a tu WhatsApp.',
    features: [
      'Aparición en el buscador por categoría y ciudad',
      'Botón directo a tu WhatsApp 1-clic',
      'Catálogo de servicios editable',
      'Información básica de contacto y teléfono',
    ],
    notIncluded: [
      'Sin insignia ✓ Verificado (disponible al mejorar de plan)',
      'Posicionamiento estándar',
    ],
    ctaText: 'Registrar Negocio Gratis',
  },
  {
    id: 'verificado',
    name: 'Plan Verificado',
    badgeText: '✓ Verificado',
    priceFormatted: '$49.900',
    priceAmount: 49900,
    period: 'COP / mes',
    description: 'Insignia oficial de auditoría ✓ Verificado por Guaki para generar máxima confianza y aumentar contactos.',
    features: [
      'Todo lo del Plan Esencial',
      'Insignia oficial ✓ Verificado por Guaki',
      'Ficha Web propia dedicada (ej. /proveedores/tu-negocio)',
      'Contactos directos por WhatsApp desde tu ficha web',
      'Horarios dinámicos y módulo de reseñas',
      'Prioridad en los resultados del directorio',
    ],
    highlight: true,
    ctaText: 'Activar Plan Verificado',
  },
  {
    id: 'vip',
    name: 'Plan VIP Elite',
    badgeText: '👑 TOP VIP DESTACADO',
    priceFormatted: '$149.900',
    priceAmount: 149900,
    period: 'COP / mes',
    description: 'Súper Botón VIP dorado, posicionamiento #1 absoluto y máxima exposición comercial.',
    features: [
      'Todo lo incluido en Plan Verificado',
      'Súper Botón / Badge 👑 TOP VIP VERIFICADO',
      'Posicionamiento #1 Absoluto en búsquedas de tu ciudad',
      'Panel de métricas y leads en tiempo real',
      'Soporte prioritario y atención personalizada 24/7',
    ],
    vip: true,
    ctaText: 'Activar Plan VIP Elite',
  },
];