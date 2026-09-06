import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findPublicProviderBySlug,
  isPubliclyEligibleProvider,
} from '../src/lib/provider_directory.mjs';
import {
  buildInventoryApiContract,
  resolveInventoryAccess,
} from '../src/lib/public_inventory_contract.mjs';
import { mapPublicBusinessToAfiche } from '../src/lib/public_card_mapper.mjs';

const published = {
  id: 'provider-1',
  slug: 'taller-real',
  name: 'Taller Real',
  source: 'provider-submission',
  status: 'published',
  city: 'Medellín',
  category: 'carpintería',
};

test('fixture eligibility only uses inventoried server-controlled sources and preserves legitimate names', () => {
  for (const name of ['Test Kitchen Medellin', 'QA Solutions', 'Fixture Design Studio']) {
    assert.equal(isPubliclyEligibleProvider({ ...published, name }), true, name);
  }
  assert.equal(isPubliclyEligibleProvider({ ...published, source: 'local-qa' }), false);
  assert.equal(isPubliclyEligibleProvider({ ...published, source: 'provider-test-data' }), true);
});

test('direct lookup never returns a fixture record but returns an eligible published record', () => {
  assert.equal(
    findPublicProviderBySlug([{ ...published, source: 'local-qa' }], 'taller-real'),
    null,
  );
  assert.deepEqual(findPublicProviderBySlug([published], 'taller-real'), published);
});

test('inventory access denies anonymous and forged-cookie requests, permits only the approved test boundary and authenticated actors', () => {
  assert.deepEqual(resolveInventoryAccess({ nodeEnv: 'production', localTestToken: 'secret', presentedLocalTestToken: 'secret' }), { authorized: false, kind: 'anonymous' });
  assert.deepEqual(resolveInventoryAccess({ nodeEnv: 'test', localTestToken: 'secret', presentedLocalTestToken: 'dev-forged' }), { authorized: false, kind: 'anonymous' });
  assert.deepEqual(resolveInventoryAccess({ nodeEnv: 'test', localTestToken: 'secret', presentedLocalTestToken: 'secret' }), { authorized: true, kind: 'local-test' });
  assert.deepEqual(resolveInventoryAccess({ actor: { id: 'owner-1', role: 'owner' } }), { authorized: true, kind: 'owner' });
  assert.deepEqual(resolveInventoryAccess({ actor: { id: 'admin-1', role: 'admin' } }), { authorized: true, kind: 'admin' });
});

test('anonymous API contract fails closed and reports a truthful unfiltered empty state', () => {
  const empty = buildInventoryApiContract({ items: [], publicInventoryTotal: 0, filters: {} });
  assert.equal(empty.headers['Cache-Control'], 'public, s-maxage=30, stale-while-revalidate=300');
  assert.deepEqual(empty.body, { items: [], total: 0, emptyState: 'public_inventory_empty', message: 'Sin datos todavía' });

  const filtered = buildInventoryApiContract({ items: [], publicInventoryTotal: 1, filters: { city: 'Bogotá' } });
  assert.deepEqual(filtered.body, { items: [], total: 0, emptyState: 'filtered_no_results' });
});

test('authorized API contract is private and never shared-cacheable', () => {
  const contract = buildInventoryApiContract({ items: [published], publicInventoryTotal: 1, filters: {}, access: { authorized: true, kind: 'admin' } });
  assert.equal(contract.headers['Cache-Control'], 'private, no-store');
  assert.deepEqual(contract.body.items, [published]);
});

test('public card mapping preserves absent contacts and media while retaining persisted facts', () => {
  const absent = mapPublicBusinessToAfiche(published);
  assert.equal(absent.phone, undefined);
  assert.equal(absent.whatsapp, undefined);
  assert.equal(absent.imageUrl, undefined);
  assert.equal(absent.fallbackImageUrl, undefined);
  assert.equal(absent.rating, undefined);
  assert.equal(absent.isVerified, undefined);
  assert.equal(absent.plan, undefined);

  const present = mapPublicBusinessToAfiche({
    ...published,
    phone: '+57 300 123 4567',
    whatsapp: '+57 301 987 6543',
    images: ['https://cdn.example/provider.jpg'],
    rating: 4.8,
    reviewCount: 12,
    isVerified: true,
    isOpenNow: true,
    plan: 'pro',
  });
  assert.equal(present.phone, '+57 300 123 4567');
  assert.equal(present.whatsapp, '+57 301 987 6543');
  assert.equal(present.imageUrl, 'https://cdn.example/provider.jpg');
  assert.equal(present.rating, 4.8);
  assert.equal(present.reviewCount, 12);
  assert.equal(present.isVerified, true);
  assert.equal(present.isOpenNow, true);
  assert.equal(present.plan, 'pro');
});
