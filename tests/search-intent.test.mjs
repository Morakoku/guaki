import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSearchIntent } from '../src/lib/search_intent.mjs';

test('requires a city instead of inventing one', () => {
  const intent = parseSearchIntent('Necesito una peluquería cerca que atienda hoy', '');
  assert.equal(intent.needsCity, true);
  assert.equal(intent.city, '');
  assert.equal(intent.categoryHint, 'peluqueria');
  assert.equal(intent.availability, 'today');
  assert.equal(intent.nearby, true);
});

test('extracts a controlled category and today availability with a confirmed city', () => {
  const intent = parseSearchIntent('Necesito una peluquería cerca que atienda hoy', 'Medellín');
  assert.equal(intent.needsCity, false);
  assert.equal(intent.city, 'Medellín');
  assert.equal(intent.categoryHint, 'peluqueria');
  assert.equal(intent.availability, 'today');
});

test('keeps unknown requests unclassified', () => {
  const intent = parseSearchIntent('Necesito ayuda para mi negocio', 'Cali');
  assert.equal(intent.categoryHint, null);
  assert.equal(intent.availability, null);
  assert.equal(intent.nearby, false);
});
