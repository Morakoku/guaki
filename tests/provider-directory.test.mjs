import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPublishedProviders, isPubliclyEligibleProvider, searchPublishedProviders } from '../src/lib/provider_directory.mjs';
import { readFile } from 'node:fs/promises';
import { loadTypeScriptModule } from './typescript-module-helper.mjs';

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

async function loadProviderService(response) {
  const calls = [];
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    async limit(limit) { calls.push(['limit', limit]); return response; },
  };
  const { GuakiDataService } = await loadTypeScriptModule('src/lib/supabase.ts', {
    '@supabase/supabase-js': { createClient: () => ({ from: () => query }) },
  });
  const publicModule = await loadTypeScriptModule('src/lib/published_providers.ts', {
    '@/lib/supabase': { GuakiDataService },
    '@/lib/provider_directory.mjs': { filterPublishedProviders },
  });
  return { ...publicModule, calls };
}

test('admin inventory includes published and suspended businesses without changing the moderation queue', async () => {
  const businesses = [
    { ...published, pinned: true, suspended: false },
    { ...published, id: 'suspended', pinned: false, suspended: true },
    ...['draft', 'in_audit', 'approved', 'rejected'].map(status => ({ ...published, id: status, status })),
  ];
  const { GET } = await loadTypeScriptModule('src/app/api/admin/audit/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/supabase': {
      isSupabaseConfigured: () => true,
      getSupabaseClient: () => ({ auth: { getUser: async () => ({ data: { user: { app_metadata: { role: 'admin' } } }, error: null }) } }),
      GuakiDataService: { getBusinessesWithToken: async () => businesses },
    },
  });
  const response = await GET({ cookies: { get: () => ({ value: 'unit-test-session' }) } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
  const payload = await response.json();
  assert.deepEqual(payload.inventory, businesses);
  assert.deepEqual(payload.summary, { pendingCount: 1, inReviewCount: 1, approvedCount: 1, rejectedCount: 1 });
  assert.deepEqual(Object.values(payload.queue).flat().map(b => b.status), ['draft', 'in_audit', 'approved', 'rejected']);

  const dashboard = await readFile(new URL('../src/app/admin/dashboard/page.tsx', import.meta.url), 'utf8');
  assert.match(dashboard, /payload\.inventory\.map\(mapApiBusiness\)/);
  assert.doesNotMatch(dashboard, /payload\.queue/);
  assert.match(dashboard, /pinned: Boolean\(business\.pinned\)/);
  assert.match(dashboard, /suspended: Boolean\(business\.suspended\)/);
});

test('provider query failures never retry without moderation flags or become an empty directory', async () => {
  for (const error of [
    { code: '42501', message: 'permission denied' },
    { code: 'PGRST301', message: 'JWT expired' },
    { code: '57014', message: 'statement timeout' },
    { code: '', message: 'fetch failed' },
    { code: '42703', message: 'column businesses.pinned does not exist' },
    { code: 'PGRST204', message: "Could not find the suspended column in the schema cache" },
  ]) {
    const { getPublishedProviders, calls } = await loadProviderService({ data: null, error });
    await assert.rejects(getPublishedProviders(), cause => {
      assert.ok(cause instanceof Error);
      assert.equal(cause.message, 'GUAKI_DATA_UNAVAILABLE');
      assert.equal(cause.cause, error);
      return true;
    });
    assert.equal(calls.filter(([method]) => method === 'select').length, 1);
    assert.match(calls[0][1], /,pinned,suspended$/);
  }
});

test('published provider service preserves PIN and hides suspended records', async () => {
  const pinned = { ...published, pinned: true, suspended: false };
  const { getPublishedProviders, calls } = await loadProviderService({
    data: [pinned, { ...published, id: 'hidden', pinned: true, suspended: true }], error: null,
  });
  assert.deepEqual(await getPublishedProviders(), [pinned]);
  assert.deepEqual(calls.slice(1), [['eq', 'status', 'published'], ['limit', 500]]);
});

test('directory uses stable PIN-first order after public eligibility and city filters', () => {
  const records = [
    { ...published, id: 'normal' },
    { ...published, id: 'pin-a', pinned: true },
    { ...published, id: 'suspended', suspended: true, pinned: true },
    { ...published, id: 'other-city', city: 'Cali', pinned: true },
    { ...published, id: 'pin-b', pinned: true },
  ];
  assert.deepEqual(searchPublishedProviders(records, { city: 'Medellín' }).results.map(p => p.id), ['pin-a', 'pin-b', 'normal']);
});

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
