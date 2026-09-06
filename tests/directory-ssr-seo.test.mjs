import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../src/app/directorio/page.tsx', import.meta.url), 'utf8');

test('directory emits one SEO H1 outside the client Suspense boundary', () => {
  assert.match(page, /function DirectorySeoHeading\(/);
  assert.equal((page.match(/<h1\b/g) || []).length, 1);
  assert.ok(page.indexOf('<DirectorySeoHeading />') < page.indexOf('<Suspense'));
});