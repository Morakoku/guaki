import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const migration = read('supabase/migrations/20260824200014_harden_advisor_warnings.sql');

test('advisor hardening migration fixes the trigger function search path', () => {
  assert.match(
    migration,
    /ALTER FUNCTION public\.protect_business_workflow_fields\(\)\s+SET search_path = pg_catalog, auth;/i,
  );
});

test('advisor hardening preserves the 11 affected policies while using scalar auth initplans', () => {
  const policies = [
    'businesses_public_read',
    'businesses_owner_insert',
    'businesses_owner_update',
    'businesses_owner_delete',
    'inquiries_participant_read',
    'inquiries_provider_update',
    'inquiries_owner_delete',
    'events_actor_read',
    'events_actor_insert',
    'reviews_author_update',
    'reviews_author_delete',
  ];

  for (const policy of policies) {
    assert.match(migration, new RegExp(`DROP POLICY IF EXISTS ${policy} ON public\\.`));
    assert.match(migration, new RegExp(`CREATE POLICY ${policy}\\s+ON public\\.`, 'i'));
  }

  assert.equal((migration.match(/CREATE POLICY /gi) ?? []).length, policies.length);
  assert.doesNotMatch(migration, /COALESCE\(auth\.jwt\(\)/i);
  assert.match(migration, /COALESCE\(\(SELECT auth\.jwt\(\)\) -> 'app_metadata' ->> 'role', ''\)/i);
  assert.match(migration, /= \(SELECT auth\.uid\(\)\)/i);
});
