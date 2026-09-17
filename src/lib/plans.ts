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

export interface PricingSettings {
  priceVerificado: number;
  priceVip: number;
  flashDiscountEnabled: boolean;
  flashDiscountPercent: number;
}

export interface PublicPricing {
  plans: GuakiPlan[];
  status: 'configured' | 'missing' | 'invalid' | 'read-error';
  flashDiscountPercent: number;
}

export function parsePricingSettings(raw: unknown): PricingSettings | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const validAmount = (amount: unknown): amount is number =>
    typeof amount === 'number' && Number.isFinite(amount) && amount >= 0 && amount <= Number.MAX_SAFE_INTEGER;
  if (
    !validAmount(value.priceVerificado) ||
    !validAmount(value.priceVip) ||
    typeof value.flashDiscountEnabled !== 'boolean' ||
    !validAmount(value.flashDiscountPercent) ||
    value.flashDiscountPercent > 90
  ) return null;

  return {
    priceVerificado: Math.round(value.priceVerificado),
    priceVip: Math.round(value.priceVip),
    flashDiscountEnabled: value.flashDiscountEnabled,
    flashDiscountPercent: Math.round(value.flashDiscountPercent),
  };
}

function defaultPublicPricing(status: PublicPricing['status']): PublicPricing {
  return { plans: getPlansForCountry('CO'), status, flashDiscountPercent: 0 };
}

// The persisted admin contract is COP-only; never reinterpret these amounts as USD.
export function resolvePublicPricing(row: { value: unknown } | null): PublicPricing {
  if (!row) return defaultPublicPricing('missing');
  const pricing = parsePricingSettings(row.value);
  if (!pricing) return defaultPublicPricing('invalid');
  const discount = pricing.flashDiscountEnabled ? pricing.flashDiscountPercent : 0;
  return {
    status: 'configured',
    flashDiscountPercent: discount,
    plans: getPlansForCountry('CO').map((plan) => {
      if (plan.id === 'gratis') return plan;
      const base = plan.id === 'verificado' ? pricing.priceVerificado : pricing.priceVip;
      const amount = Math.round(base * (100 - discount) / 100);
      return { ...plan, priceAmount: amount, priceFormatted: `$${amount.toLocaleString('es-CO')}` };
    }),
  };
}

let pricingFallbackWarned = false;
function warnPricingFallback(reason: string): void {
  if (pricingFallbackWarned) return;
  pricingFallbackWarned = true;
  // Only fixed reasons/codes are logged, never raw database errors or credentials.
  console.warn(`[public-pricing] Using default COP prices: ${reason}`);
}

function pricingReadFailureReason(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  if (code === '42P01' || code === '42703' || code === 'PGRST205' || code === 'PGRST204') {
    return 'schema unavailable; migration 20260914000000_admin_panel_fields_and_settings.sql may be pending';
  }
  if (code === '42501') return 'settings read permission denied';
  return 'settings read failed or server client unavailable';
}

// Called by the server component with a server-only reader. Dependency injection
// keeps credentials/client creation out of this shared module and tests offline.
export async function loadPublicPricing(
  readPricing: () => PromiseLike<{ data: { value: unknown } | null; error: unknown }>,
): Promise<PublicPricing> {
  try {
    const { data, error } = await readPricing();
    if (error) throw error;
    const pricing = resolvePublicPricing(data);
    if (pricing.status === 'missing') warnPricingFallback('pricing row absent');
    if (pricing.status === 'invalid') warnPricingFallback('pricing settings malformed');
    return pricing;
  } catch (error) {
    warnPricingFallback(pricingReadFailureReason(error));
    return defaultPublicPricing('read-error');
  }
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
    description: 'Súper Botón VIP dorado, prioridad en los resultados del directorio y máxima exposición comercial.',
    features: [
      'Todo lo incluido en Plan Verificado',
      'Súper Botón / Badge 👑 TOP VIP VERIFICADO',
      'Prioridad en los resultados del directorio',
      'Panel de métricas y leads en tiempo real',
      'Soporte prioritario y atención personalizada 24/7',
    ],
    vip: true,
    ctaText: 'Activar Plan VIP Elite',
  },
];