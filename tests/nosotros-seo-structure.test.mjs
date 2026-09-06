import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await readFile(
  new URL('../src/components/GuakiCorporateIdentity.tsx', import.meta.url),
  'utf8',
);

test('nosotros corporate identity exposes exactly one semantic h1', () => {
  assert.equal((identity.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((identity.match(/<\/h1>/g) ?? []).length, 1);
  assert.match(identity, /<h1[^>]*>[\s\S]*¿Qué es[\s\S]*GUAKI[\s\S]*<\/h1>/);
});
