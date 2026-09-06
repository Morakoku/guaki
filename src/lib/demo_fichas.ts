import type { AficheBusinessData } from './demo_afiche';

/**
 * Local-only visual fixtures built from records that already have a real ficha.
 * No contact, address, rating, or business data is invented here.
 */
const DEMO_PLAN_SEQUENCE: Array<NonNullable<AficheBusinessData['plan']>> = [
  'free', 'free', 'free',
  'verificado', 'verificado', 'verificado',
  'vip', 'vip', 'vip',
];

export function createDemoFichas(records: AficheBusinessData[]): AficheBusinessData[] {
  return records.slice(0, 9).map((record, index) => ({
    ...record,
    id: `DEMO-${record.id}`,
    isDemo: true,
    plan: DEMO_PLAN_SEQUENCE[index],
  }));
}
