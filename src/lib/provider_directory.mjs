const REQUIRED_FIELDS = ['id', 'slug', 'name', 'source', 'status', 'city', 'category'];
// These are server-controlled provenance values discovered in the local fixture inventory.
// Never classify a human-facing name, id, or slug as fixture data.
const RESERVED_FIXTURE_SOURCES = new Set([
  'local-qa',
  'e2e',
  'e2e-provider-seed',
  'test-fixture',
  'fixture-local',
]);

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function hasEvidence(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'string' && item.trim());
}

export function isPublishedProvider(record) {
  if (!record || typeof record !== 'object') return false;
  if (!REQUIRED_FIELDS.every((field) => field in record)) return false;
  if (record.status !== 'published') return false;
  // Only the human-facing identity fields must be non-empty strings. We do NOT
  // reject records for optional NULL-mapped fields (lat/lng/logo/hero) — those
  // legitimately arrive as undefined from Supabase NULL columns and previously
  // made every business without coordinates invisible to the public directory.
  return [record.id, record.slug, record.name, record.source, record.city, record.category].every(
    (value) => typeof value === 'string' && value.trim()
  );
}

export function isPubliclyEligibleProvider(record) {
  if (!isPublishedProvider(record)) return false;
  return !RESERVED_FIXTURE_SOURCES.has(normalize(record.source));
}

export function filterPublishedProviders(records) {
  return (Array.isArray(records) ? records : []).filter(isPubliclyEligibleProvider);
}

export function searchPublishedProviders(records, { city = '', category = '' } = {}) {
  const published = filterPublishedProviders(records);
  const results = published.filter((record) => (
    (!city || normalize(record.city) === normalize(city))
    && (!category || normalize(record.category) === normalize(category))
  ));
  return {
    results,
    total: results.length,
    ...(results.length ? {} : { message: 'Sin datos todavía' }),
  };
}

export function findPublicProviderBySlug(records, slug) {
  const normalized = String(slug ?? '').toLowerCase().replace(/-and-/g, '-');
  return filterPublishedProviders(records).find(
    (provider) =>
      provider.slug === slug ||
      provider.slug === normalized,
  ) ?? null;
}
