import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { parseSearchIntent } from '../src/lib/search_intent.mjs';
import { filterPublishedProviders } from '../src/lib/provider_directory.mjs';
import { loadTypeScriptModule } from './typescript-module-helper.mjs';

const route = await readFile(new URL('../src/app/api/search/route.ts', import.meta.url), 'utf8');

async function loadSearch(getPublishedProviders) {
  return loadTypeScriptModule('src/app/api/search/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/event_bus': { eventBus: { emit: async () => {} } },
    '@/lib/search_intent.mjs': { parseSearchIntent },
    '@/lib/published_providers': { getPublishedProviders },
  });
}

const provider = {
  id: 'high-score', slug: 'taller', name: 'Carpintería', source: 'provider-submission',
  status: 'published', city: 'Medellín', category: 'carpintería', rating: 5,
};

test('search ranks PIN before a higher relevance score, then score, then stable input order', async () => {
  const providers = [
    provider,
    { ...provider, id: 'normal-low', name: 'Taller', category: 'servicios', description: 'carpintería', rating: 0 },
    { ...provider, id: 'pin-low-a', name: 'Taller', category: 'servicios', description: 'carpintería', rating: 0, pinned: true },
    { ...provider, id: 'pin-high', pinned: true },
    { ...provider, id: 'pin-low-b', name: 'Taller', category: 'servicios', description: 'carpintería', rating: 0, pinned: true },
    { ...provider, id: 'high-score-tie' },
  ];
  const { GET } = await loadSearch(async () => providers);
  const response = await GET(new Request('https://guaki.invalid/api/search?q=carpinteria&city=Medellin'));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.deepEqual(payload.results.map(p => p.id), ['pin-high', 'pin-low-a', 'pin-low-b', 'high-score', 'high-score-tie', 'normal-low']);
  assert.equal(payload.total, 6);
});

test('PIN never bypasses relevance, city or public eligibility filters', async () => {
  const providers = [
    provider,
    { ...provider, id: 'irrelevant', name: 'Panadería', category: 'panadería', pinned: true },
    { ...provider, id: 'other-city', city: 'Cali', pinned: true },
    { ...provider, id: 'suspended', suspended: true, pinned: true },
    { ...provider, id: 'draft', status: 'draft', pinned: true },
  ];
  const { GET } = await loadSearch(async () => filterPublishedProviders(providers));
  const response = await GET(new Request('https://guaki.invalid/api/search?q=carpinteria&city=Medellin'));
  assert.deepEqual((await response.json()).results.map(p => p.id), ['high-score']);
});

test('search reports provider failures explicitly as 503, not an empty successful search', async () => {
  const { GET } = await loadSearch(async () => { throw new Error('GUAKI_DATA_UNAVAILABLE'); });
  const response = await GET(new Request('https://guaki.invalid/api/search?q=carpinteria'));
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.error, 'GUAKI_DATA_UNAVAILABLE');
  assert.deepEqual(payload.results, []);
  assert.equal(response.headers.get('cache-control'), null);
});

test('search route parses intent and never forces Bogotá', () => {
  assert.match(route, /parseSearchIntent/);
  assert.doesNotMatch(route, /city=Bogot/);
  assert.match(route, /needsCity/);
  assert.match(route, /Sin datos todavía/);
});
