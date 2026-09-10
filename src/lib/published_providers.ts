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
  };
  return isPubliclyEligibleProvider(candidate) ? candidate : null;
}

export async function getPublishedProviders(): Promise<PublishedProviderRecord[]> {
  let supabaseRecords: PublishedProviderRecord[] = [];
  try {
    const records = await GuakiDataService.getPublishedProviders(500);
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
