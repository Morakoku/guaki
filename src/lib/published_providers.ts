import { GuakiDataService, type PublishedProviderRecord } from '@/lib/supabase';
import { filterPublishedProviders, findPublicProviderBySlug, isPubliclyEligibleProvider } from '@/lib/provider_directory.mjs';

function readString(record: Record<string, unknown>, field: string): string {
  return typeof record[field] === 'string' ? record[field] : '';
}

function toPublicProvider(record: unknown): PublishedProviderRecord | null {
  if (!record || typeof record !== 'object') return null;
  const source = record as Record<string, unknown>;
  const candidate: PublishedProviderRecord = {
    id: readString(source, 'id'),
    slug: readString(source, 'slug'),
    name: readString(source, 'name'),
    source: readString(source, 'source'),
    status: 'published',
    city: readString(source, 'city'),
    category: readString(source, 'category'),
    website: readString(source, 'website'),
    evidence: Array.isArray(source.evidence) ? source.evidence.filter((item): item is string => typeof item === 'string') : [],
    description: readString(source, 'description') || readString(source, 'shortDescription'),
    short_description: readString(source, 'short_description') || readString(source, 'shortDescription') || readString(source, 'description'),
    address: readString(source, 'address'),
    phone: readString(source, 'phone'),
    whatsapp: readString(source, 'whatsapp'),
    rating: typeof source.rating === 'number' ? source.rating : null,
    review_count: typeof source.review_count === 'number' ? source.review_count : typeof source.reviewCount === 'number' ? source.reviewCount : 0,
    plan: readString(source, 'plan') || readString(source, 'planName') || undefined,
    // 2026-09-25 (QoL-S #3): pasar schedule/coords — el whitelist anterior las
    // descartaba y el filtro "solo abierto" + orden por cercanía nunca veían datos.
    schedule: source.schedule !== null && source.schedule !== undefined
      ? (source.schedule as PublishedProviderRecord['schedule'])
      : undefined,
    lat: typeof source.lat === 'number' ? source.lat : undefined,
    lng: typeof source.lng === 'number' ? source.lng : undefined,
    // Admin panel flags. `=== true` in the public guards keeps pre-migration
    // behavior unchanged (absent column ⇒ not pinned / not suspended).
    pinned: source.pinned === true,
    suspended: source.suspended === true,
    plan_source: readString(source, 'plan_source'),
    plan_expires_at: readString(source, 'plan_expires_at'),
    payment_method: readString(source, 'payment_method'),
    updatedAt: readString(source, 'updated_at') || readString(source, 'updatedAt'),
  };
  return isPubliclyEligibleProvider(candidate) ? candidate : null;
}

export async function getPublishedProviders(): Promise<PublishedProviderRecord[]> {
  let supabaseRecords: PublishedProviderRecord[] = [];
  try {
    // 2026-09-23 (explorer: CRÍTICO): 500 truncaba el directorio al azar con
// 2.291 fichas — ahora todas (el orden determinista hace el subconjunto
// best-first y el render pagina client-side).
const records = await GuakiDataService.getPublishedProviders(2500);
    supabaseRecords = filterPublishedProviders(records) as PublishedProviderRecord[];
  } catch (cause) {
    if (cause instanceof Error && cause.message !== 'GUAKI_SUPABASE_NOT_CONFIGURED') {
      throw cause;
    }
  }

  return GuakiDataService.isConfigured() ? supabaseRecords : [];
}

export async function getPublishedProviderBySlug(slug: string): Promise<PublishedProviderRecord | null> {
  if (GuakiDataService.isConfigured()) {
    const direct = await GuakiDataService.getBusinessById(slug);
    if (direct?.status === 'published') {
      const publicProvider = toPublicProvider(direct);
      if (publicProvider) return publicProvider;
    }
  }
  const providers = await getPublishedProviders();
  return findPublicProviderBySlug(providers, slug) as PublishedProviderRecord | null;
}
