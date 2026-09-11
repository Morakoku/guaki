function stringOrUndefined(value) {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function numberOrUndefined(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function providerImage(record) {
  if (Array.isArray(record.images)) {
    const image = record.images.find((candidate) => typeof candidate === 'string' && candidate.trim());
    if (image) return image;
  }
  return stringOrUndefined(record.heroImage) ?? stringOrUndefined(record.logoUrl) ?? stringOrUndefined(record.featuredImage);
}

function planOrUndefined(value) {
  const v = String(value ?? '').toLowerCase().trim();
  if (['free', 'gratis', 'basico', 'básico'].includes(v)) return 'free';
  if (['verificado', 'verified'].includes(v)) return 'verificado';
  if (['pro', 'premium'].includes(v)) return 'pro';
  if (v === 'vip' || v === 'elite') return 'vip';
  return undefined;
}

export function mapPublicBusinessToAfiche(record) {
  const imageUrl = providerImage(record);
  const plan = planOrUndefined(record.plan);
  // REGLA DE PLAN GRATIS: sin reputación visible (rating/reseñas agregadas).
  // El puntaje solo existe para planes Verificado/VIP con reseñas reales auditadas.
  const isFreePlan = plan === 'free';
  return {
    id: String(record.id ?? ''),
    slug: String(record.slug ?? ''),
    name: String(record.name ?? ''),
    category: String(record.category ?? ''),
    categoryIcon: String(record.category ?? '').toLowerCase().includes('vet') ? '🐾' : '🏪',
    description: stringOrUndefined(record.description) ?? stringOrUndefined(record.shortDescription) ?? '',
    shortDescription: stringOrUndefined(record.shortDescription) ?? stringOrUndefined(record.description) ?? '',
    city: String(record.city ?? ''),
    lat: numberOrUndefined(record.lat),
    lng: numberOrUndefined(record.lng),
    address: stringOrUndefined(record.address),
    schedule: stringOrUndefined(record.schedule),
    phone: stringOrUndefined(record.phone),
    whatsapp: stringOrUndefined(record.whatsapp),
    services: Array.isArray(record.services) ? record.services.filter((service) => typeof service === 'string' && service.trim()) : [],
    imageUrl,
    fallbackImageUrl: undefined,
    rating: isFreePlan ? undefined : numberOrUndefined(record.rating),
    reviewCount: isFreePlan ? undefined : numberOrUndefined(record.reviewCount ?? record.review_count),
    isVerified: record.isVerified === true ? true : undefined,
    isDemo: false,
    isOpenNow: record.isOpenNow === true ? true : undefined,
    plan,
  };
}
