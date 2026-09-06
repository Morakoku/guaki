import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const route = await readFile(new URL('../src/app/api/search/route.ts', import.meta.url), 'utf8');

test('search route parses intent and never forces Bogotá', () => {
  assert.match(route, /parseSearchIntent/);
  assert.doesNotMatch(route, /city=Bogot/);
  assert.match(route, /needsCity/);
  assert.match(route, /Sin datos todavía/);
});
