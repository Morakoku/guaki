import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScriptModule } from './typescript-module-helper.mjs';

const geo = await loadTypeScriptModule('src/lib/geo.ts');
const loadPlans = () => loadTypeScriptModule('src/lib/plans.ts', { './geo': geo });
const plans = await loadPlans();
const settings = {
  priceVerificado: 60000,
  priceVip: 180000,
  flashDiscountEnabled: false,
  flashDiscountPercent: 20,
};
const amounts = (pricing) => pricing.plans.map((plan) => plan.priceAmount);

// Every reader is an in-memory stub: no environment files or network access.
test('saved settings replace COP constants, preserving the free plan and metadata', () => {
  const result = plans.resolvePublicPricing({ value: { ...settings, privateField: 'not-public' } });
  assert.equal(result.status, 'configured');
  assert.deepEqual(amounts(result), [0, 60000, 180000]);
  assert.equal(result.plans[1].priceFormatted, '$60.000');
  assert.equal(result.plans[2].priceFormatted, '$180.000');
  assert.equal(result.plans[1].period, 'COP / mes');
  assert.deepEqual(result.plans[1].features, plans.GUAKI_PLANS[1].features);
  assert.equal(JSON.stringify(result).includes('privateField'), false);
});

test('flash discount applies only when enabled and rounds displayed COP consistently', () => {
  const result = plans.resolvePublicPricing({ value: {
    ...settings, priceVerificado: 49901, flashDiscountEnabled: true,
  } });
  assert.deepEqual(amounts(result), [0, 39921, 144000]);
  assert.equal(result.plans[1].priceFormatted, '$39.921');
  assert.equal(result.flashDiscountPercent, 20);
  assert.equal(plans.resolvePublicPricing({ value: settings }).flashDiscountPercent, 0);
  assert.deepEqual(amounts(plans.resolvePublicPricing({ value: {
    ...settings, flashDiscountEnabled: true, flashDiscountPercent: 90,
  } })), [0, 6000, 18000]);
});

test('missing settings explicitly fall back to existing constants', () => {
  const result = plans.resolvePublicPricing(null);
  assert.equal(result.status, 'missing');
  assert.deepEqual(result.plans, plans.GUAKI_PLANS);
  assert.equal(result.flashDiscountPercent, 0);
});

test('malformed settings fall back atomically, without accidental free prices or discounts', () => {
  const invalid = [
    undefined, null, {}, [], 'invalid',
    { ...settings, priceVerificado: null },
    { ...settings, priceVip: -1 },
    { ...settings, priceVip: Infinity },
    { ...settings, priceVip: NaN },
    { ...settings, priceVip: Number.MAX_SAFE_INTEGER + 1 },
    { ...settings, priceVerificado: '' },
    { ...settings, priceVerificado: '60000' },
    { ...settings, flashDiscountEnabled: 'false' },
    { ...settings, flashDiscountPercent: 91 },
    { ...settings, flashDiscountPercent: -1 },
    { ...settings, flashDiscountPercent: undefined },
  ];
  for (const value of invalid) {
    assert.equal(plans.parsePricingSettings(value), null);
    const result = plans.resolvePublicPricing({ value });
    assert.equal(result.status, 'invalid');
    assert.deepEqual(result.plans, plans.GUAKI_PLANS);
    assert.equal(result.flashDiscountPercent, 0);
  }
});

test('zero prices and zero flash discount are valid; country constants are unchanged', () => {
  const original = structuredClone(plans.GUAKI_PLANS);
  const result = plans.resolvePublicPricing({ value: {
    ...settings, priceVerificado: 0, flashDiscountEnabled: true, flashDiscountPercent: 0,
  } });
  assert.equal(result.status, 'configured');
  assert.deepEqual(amounts(result), [0, 0, 180000]);
  assert.deepEqual(plans.GUAKI_PLANS, original);
  assert.deepEqual(plans.getPlansForCountry('VE').map((plan) => plan.priceAmount), [0, 12.9, 39.9]);
});

test('reader handles persisted settings, absent row and malformed row as distinct states', async () => {
  const model = await loadPlans();
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    const saved = await model.loadPublicPricing(async () => ({ data: { value: settings }, error: null }));
    assert.equal(saved.status, 'configured');
    assert.deepEqual(amounts(saved), [0, 60000, 180000]);
    const absent = await model.loadPublicPricing(async () => ({ data: null, error: null }));
    assert.equal(absent.status, 'missing');
    const malformed = await model.loadPublicPricing(async () => ({ data: { value: null }, error: null }));
    assert.equal(malformed.status, 'invalid');
  } finally {
    console.warn = originalWarn;
  }
});

test('pending table/column migration yields read-error fallback and warns once, without raw errors', async () => {
  const model = await loadPlans();
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  try {
    for (const code of ['42P01', '42703', 'PGRST205', 'PGRST204', '42501']) {
      const result = await model.loadPublicPricing(async () => ({
        data: null, error: { code, message: 'sensitive-error-detail' },
      }));
      assert.equal(result.status, 'read-error');
      assert.deepEqual(result.plans, model.GUAKI_PLANS);
      assert.equal(result.flashDiscountPercent, 0);
    }
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /migration 20260914000000/);
    assert.equal(warnings[0].includes('sensitive-error-detail'), false);
  } finally {
    console.warn = originalWarn;
  }
});

test('rejected reads and unavailable server client cannot break the page', async () => {
  const model = await loadPlans();
  const originalWarn = console.warn;
  console.warn = () => {};
  try {
    for (const reader of [
      () => { throw new Error('client unavailable'); },
      async () => { throw new Error('network failure'); },
      async () => ({ data: { value: settings }, error: { code: '42501' } }),
    ]) {
      const result = await model.loadPublicPricing(reader);
      assert.equal(result.status, 'read-error');
      assert.deepEqual(result.plans, model.GUAKI_PLANS);
    }
  } finally {
    console.warn = originalWarn;
  }
});
