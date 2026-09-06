import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Guaki data service reads the verified Supabase businesses contract', () => {
  const source = fs.readFileSync('src/lib/supabase.ts', 'utf8');
  assert.match(source, /from\('businesses'\)/);
  assert.doesNotMatch(source, /from\('providers'\)/);
});
