export type CountryCode = 'CO' | 'VE';

export interface GuakiCountryMeta {
  code: CountryCode;
  name: string;
  currency: string;
  phonePrefix: string;
  addressPlaceholder: string;
  phonePlaceholder: string;
  landlinePlaceholder: string;
  dataLaw: string;
  flagGradient: string;
  plans: Record<'verificado' | 'vip', { formatted: string; amount: number }>;
}

export const COUNTRY_META: Record<CountryCode, GuakiCountryMeta> = {
  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: 'COP',
    phonePrefix: '+57',
    addressPlaceholder: 'Ej. Carrera 43A # 14-27, El Poblado',
    phonePlaceholder: 'Ej. +57 300 123 4567',
    landlinePlaceholder: 'Ej. 604 444 0000',
    dataLaw: 'Ley 1581 de 2012 (Habeas Data)',
    flagGradient: 'linear-gradient(to bottom, #FCD116 0 50%, #003893 50% 75%, #CE1126 75% 100%)',
    plans: {
      verificado: { formatted: '$49.900', amount: 49900 },
      vip: { formatted: '$149.900', amount: 149900 },
    },
  },
  VE: {
    code: 'VE',
    name: 'Venezuela',
    currency: 'USD',
    phonePrefix: '+58',
    addressPlaceholder: 'Ej. Av. Libertador, Chacao, Caracas',
    phonePlaceholder: 'Ej. +58 412 123 4567',
    landlinePlaceholder: 'Ej. +58 212 555 1234',
    dataLaw: 'Ley de Infogobierno',
    flagGradient: 'linear-gradient(to bottom, #FFCE00 0 33.3%, #00247D 33.3% 66.6%, #CF142B 66.6% 100%)',
    plans: {
      verificado: { formatted: '$12.9', amount: 12.9 },
      vip: { formatted: '$39.9', amount: 39.9 },
    },
  },
};

export interface CityEntry {
  name: string;
  country: CountryCode;
  zone?: string;
  role?: string;
}

export const CITY_CATALOG: CityEntry[] = [
  { name: 'Medellín', country: 'CO', zone: 'El Poblado & Laureles', role: 'Sede Principal' },
  { name: 'Bogotá', country: 'CO', zone: 'Chicó, Usaquén & Chapinero', role: 'Operación Central' },
  { name: 'Cali', country: 'CO', zone: 'Granada & Ciudad Jardín', role: 'Cobertura Activa' },
  { name: 'Barranquilla', country: 'CO', zone: 'Alto Prado & El Golf', role: 'Cobertura Caribe' },
  { name: 'Cartagena', country: 'CO', zone: 'Bocagrande & Centro', role: 'Cobertura Activa' },
  { name: 'Bucaramanga', country: 'CO', zone: 'Cabecera & Cañaveral', role: 'Cobertura Activa' },
  { name: 'Soacha', country: 'CO', zone: 'Ciudad Verde & Centro', role: 'Cobertura Activa' },
  { name: 'Pereira', country: 'CO', zone: 'Circunvalar & Pinares', role: 'Próxima Sede' },
  { name: 'Manizales', country: 'CO', zone: 'Cable & Palermo', role: 'Próxima Sede' },
  { name: 'Santa Marta', country: 'CO', zone: 'Rodadero & Centro Histórico', role: 'Próxima Sede' },
  { name: 'Caracas', country: 'VE', zone: 'Chacao, Las Mercedes & Altamira', role: 'Sede Venezuela' },
  { name: 'Valencia', country: 'VE', zone: 'El Viñedo & Prebo', role: 'Cobertura Activa' },
  { name: 'Maracaibo', country: 'VE', zone: 'Bella Vista & Av. 5 de Julio', role: 'Cobertura Activa' },
  { name: 'Barquisimeto', country: 'VE', zone: 'Este & Centro', role: 'Cobertura Activa' },
  { name: 'Maracay', country: 'VE', zone: 'Las Delicias & Centro', role: 'Próxima Sede' },
  { name: 'Ciudad Guayana', country: 'VE', zone: 'Alta Vista & Puerto Ordaz', role: 'Próxima Sede' },
  { name: 'Mérida', country: 'VE', zone: 'Centro & La Hechicera', role: 'Próxima Sede' },
  { name: 'San Cristóbal', country: 'VE', zone: 'Centro & Pirineos', role: 'Próxima Sede' },
];

function normalizeCity(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function findCity(city?: string | null): CityEntry | undefined {
  const target = normalizeCity(city);
  if (!target) return undefined;
  return CITY_CATALOG.find((entry) => normalizeCity(entry.name) === target);
}

export function countryOfCity(city?: string | null): CountryCode {
  return findCity(city)?.country ?? 'CO';
}

export function getCountryMeta(city?: string | null): GuakiCountryMeta {
  return COUNTRY_META[countryOfCity(city)];
}

export function cityNames(country?: CountryCode): string[] {
  return CITY_CATALOG.filter((entry) => !country || entry.country === country).map((entry) => entry.name);
}

export function citiesByCountry(): { country: CountryCode; meta: GuakiCountryMeta; cities: CityEntry[] }[] {
  return (['CO', 'VE'] as CountryCode[]).map((country) => ({
    country,
    meta: COUNTRY_META[country],
    cities: CITY_CATALOG.filter((entry) => entry.country === country),
  }));
}

export function planPrice(
  planId: 'gratis' | 'verificado' | 'vip',
  country: CountryCode,
): { formatted: string; amount: number; period: string } {
  const meta = COUNTRY_META[country];
  if (planId === 'gratis') {
    return { formatted: '$0', amount: 0, period: `${meta.currency} / mes` };
  }
  return { formatted: meta.plans[planId].formatted, amount: meta.plans[planId].amount, period: `${meta.currency} / mes` };
}

export function planLabel(planId: 'gratis' | 'verificado' | 'vip', country: CountryCode): string {
  const meta = COUNTRY_META[country];
  const name = planId === 'vip' ? 'PLAN VIP ELITE' : planId === 'verificado' ? 'PLAN VERIFICADO' : 'PLAN ESENCIAL';
  const price = planId === 'gratis' ? '$0' : meta.plans[planId].formatted;
  const suffix = planId === 'gratis' || meta.currency === 'COP' ? '' : ` ${meta.currency}`;
  return `${name} (${price}${suffix})`;
}

export function planName(planId: 'gratis' | 'verificado' | 'vip'): string {
  return planId === 'vip' ? 'Plan VIP Elite' : planId === 'verificado' ? 'Plan Verificado' : 'Plan Esencial';
}
