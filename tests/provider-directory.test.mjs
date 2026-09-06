import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPublishedProviders, isPubliclyEligibleProvider, searchPublishedProviders } from '../src/lib/provider_directory.mjs';
import { readFile } from 'node:fs/promises';

const published = {
  id: 'provider-1',
  slug: 'taller-real',
  name: 'Taller Real',
  source: 'provider-submission',
  status: 'published',
  city: 'Medellín',
  category: 'carpintería',
  website: 'https://taller-real.example',
  evidence: ['https://taller-real.example/contacto'],
};

test('published provider records require provenance and verified directory fields', () => {
  assert.deepEqual(filterPublishedProviders([published]), [published]);
  assert.deepEqual(filterPublishedProviders([{ ...published, status: 'draft' }]), []);
  assert.deepEqual(filterPublishedProviders([{ ...published, source: '' }]), []);
  assert.deepEqual(filterPublishedProviders([{ ...published, category: '' }]), []);
});

test('public eligibility excludes QA, E2E, test, and fixture sources while retaining real published records', () => {
  assert.equal(isPubliclyEligibleProvider(published), true);
  for (const source of ['local-qa', 'e2e', 'e2e-provider-seed', 'test-fixture', 'fixture-local']) {
    assert.equal(isPubliclyEligibleProvider({ ...published, source }), false, source);
  }
  assert.deepEqual(
    filterPublishedProviders([{ ...published, source: 'local-qa' }, { ...published, source: 'provider-submission' }]),
    [published],
  );
});

test('search returns only published records and tells the truth when none exist', () => {
  assert.equal(searchPublishedProviders([published], { city: 'Medellín', category: 'carpintería' }).total, 1);
  const empty = searchPublishedProviders([{ ...published, status: 'pending' }], { city: 'Medellín' });
  assert.deepEqual(empty.results, []);
  assert.equal(empty.message, 'Sin datos todavía');
});

test('SEO directory and profile routes are wired to published records', async () => {
  const categoryCity = await readFile('src/app/servicios/[category]/[city]/page.tsx', 'utf8');
  const profile = await readFile('src/app/proveedores/[slug]/page.tsx', 'utf8');
  const sitemap = await readFile('src/app/sitemap.ts', 'utf8');
  const robots = await readFile('src/app/robots.ts', 'utf8');
  assert.match(categoryCity, /getPublishedProviders/);
  assert.match(categoryCity, /robots: \{ index: false/);
  assert.match(categoryCity, /notFound/);
  assert.match(profile, /getPublishedProviderBySlug/);
  assert.match(profile, /notFound/);
  assert.match(sitemap, /getPublishedProviders/);
  assert.match(robots, /sitemap/);
  assert.match(robots, /admin|provider|mi-negocio/);
});

test('published profile lookup has a live direct Supabase path for newly published slugs', async () => {
  const source = await readFile('src/lib/published_providers.ts', 'utf8');
  assert.match(source, /GuakiDataService\.getBusinessById\(slug\)/);
  assert.match(source, /toPublicProvider\(direct\)/);
  assert.match(source, /findPublicProviderBySlug\(providers, slug\)/);
  assert.doesNotMatch(source, /publicProvider && isPubliclyEligibleProvider\(publicProvider\)/);
});
