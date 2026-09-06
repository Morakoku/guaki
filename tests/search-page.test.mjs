import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../src/app/search/page.tsx', import.meta.url), 'utf8');

test('search page redirects cleanly to directorio with search parameters', () => {
  assert.match(page, /router\.replace\(`\/directorio\?\${params\.toString\(\)}`\)/);
  assert.match(page, /searchParams\.get\('q'\)/);
  assert.match(page, /searchParams\.get\('city'\)/);
});
