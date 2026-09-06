import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

export default async function robots(): Promise<MetadataRoute.Robots> {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/provider/', '/mi-negocio/', '/api/', '/command-center/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
