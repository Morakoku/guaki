import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPublicInventory, buildInventoryApiContract } from '../src/lib/public_inventory_contract.mjs';
import { mapPublicBusinessToAfiche } from '../src/lib/public_card_mapper.mjs';

const publicRecord = {
  id: 'provider-1',
  slug: 'taller-real',
  name: 'Taller Real',
  source: 'provider-submission',
  status: 'published',
  city: 'Medellín',
  category: 'carpintería',
};

test('anonymous API behavior exposes only eligible published inventory', () => {
  const items = filterPublicInventory([
    publicRecord,
    { ...publicRecord, id: 'fixture-1', source: 'local-qa' },
    { ...publicRecord, id: 'draft-1', status: 'draft' },
  ]);
  const contract = buildInventoryApiContract({ items, publicInventoryTotal: items.length });
  assert.deepEqual(contract.body.items, [publicRecord]);
  assert.equal(contract.headers['Cache-Control'], 'public, s-maxage=30, stale-while-revalidate=300');
});

test('public card behavior does not invent contacts or media', () => {
  const card = mapPublicBusinessToAfiche(publicRecord);
  assert.equal(card.phone, undefined);
  assert.equal(card.whatsapp, undefined);
  assert.equal(card.imageUrl, undefined);
  assert.equal(card.fallbackImageUrl, undefined);
});
