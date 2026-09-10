import type { MetadataRoute } from 'next';
import { getPublishedProviders } from '@/lib/published_providers';
import { SITE_URL, slugify } from '@/lib/site';

// Published records can change through the local persistence layer. Do not
// freeze a build-time sitemap that can advertise profiles no longer available
// at request time.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${base}/directorio`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/nosotros`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/recursos-marca`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const providers = await getPublishedProviders();
  const dynamicMap = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const provider of providers) {
    // REGLA DE PLAN GRATIS: sin ficha pública — no se anuncia en el sitemap.
    const plan = String((provider as any).plan || '').toLowerCase();
    if (['free', 'gratis', 'basico'].includes(plan)) continue;

    const providerPath = `/proveedores/${provider.slug}`;
    dynamicMap.set(providerPath, {
      url: `${base}${providerPath}`,
      changeFrequency: 'weekly',
      priority: 0.85,
    });

    const catCityPath = `/servicios/${slugify(provider.category)}/${slugify(provider.city)}`;
    dynamicMap.set(catCityPath, {
      url: `${base}${catCityPath}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  return [...staticRoutes, ...Array.from(dynamicMap.values())];
}
