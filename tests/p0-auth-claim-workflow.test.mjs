import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootPath = fileURLToPath(new URL('../', import.meta.url));
const tscEntry = path.join(rootPath, 'node_modules', 'typescript', 'bin', 'tsc');

function findCompiledFile(directory, filename) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = findCompiledFile(candidate, filename);
      if (nested) return nested;
    } else if (entry.name === filename) {
      return candidate;
    }
  }
  return null;
}

function loadTypeScriptModule(relativePath) {
  const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'guaki-p0-auth-'));
  try {
    execFileSync(process.execPath, [tscEntry,
      path.join(rootPath, relativePath),
      '--target', 'ES2020',
      '--module', 'commonjs',
      '--moduleResolution', 'node',
      '--esModuleInterop',
      '--skipLibCheck',
      '--outDir', outputDirectory,
    ], { cwd: rootPath, stdio: 'pipe' });

    const compiledFile = findCompiledFile(outputDirectory, path.basename(relativePath).replace(/\.ts$/, '.js'));
    assert.ok(compiledFile, `Expected ${relativePath} to compile`);
    return require(compiledFile);
  } finally {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }
}

test('authorization role ignores editable user metadata and fails closed to client', () => {
  const { getTrustedRole } = loadTypeScriptModule('src/lib/authorization.ts');

  assert.equal(getTrustedRole({ app_metadata: { role: 'provider' }, user_metadata: { role: 'admin' } }), 'provider');
  assert.equal(getTrustedRole({ app_metadata: { role: 'admin' }, user_metadata: { role: 'client' } }), 'admin');
  assert.equal(getTrustedRole({ user_metadata: { role: 'admin' } }), 'client');
  assert.equal(getTrustedRole({ app_metadata: { role: 'unknown' }, user_metadata: { role: 'provider' } }), 'client');
});

test('claim state machine permits only the canonical role and ownership transitions', () => {
  const { canTransitionClaimState } = loadTypeScriptModule('src/lib/claim-workflow.ts');

  assert.equal(canTransitionClaimState('PENDING', 'CLAIMED', 'provider', true), true);
  assert.equal(canTransitionClaimState('CLAIMED', 'IN_AUDIT', 'provider', true), true);
  assert.equal(canTransitionClaimState('IN_AUDIT', 'APPROVED', 'admin', false), true);
  assert.equal(canTransitionClaimState('APPROVED', 'PUBLISHED', 'admin', false), true);

  assert.equal(canTransitionClaimState('PENDING', 'PUBLISHED', 'admin', false), false);
  assert.equal(canTransitionClaimState('PENDING', 'APPROVED', 'admin', false), false);
  assert.equal(canTransitionClaimState('CLAIMED', 'IN_AUDIT', 'provider', false), false);
  assert.equal(canTransitionClaimState('PENDING', 'CLAIMED', 'client', true), false);
});

test('authorization failures are classified as forbidden instead of successful or missing data', () => {
  const { isAuthorizationFailure } = loadTypeScriptModule('src/lib/authorization.ts');

  assert.equal(isAuthorizationFailure({ code: '42501', message: 'new row violates row-level security policy' }), true);
  assert.equal(isAuthorizationFailure({ status: 403, message: 'forbidden' }), true);
  assert.equal(isAuthorizationFailure({ code: 'PGRST116', message: 'no rows found' }), false);
});

test('authorization surfaces use the trusted role helper and claim route rejects non-providers', () => {
  const protectedFiles = [
    'src/middleware.ts',
    'src/app/api/auth/session/route.ts',
    'src/lib/auth_service.ts',
  ];

  for (const relativePath of protectedFiles) {
    const source = fs.readFileSync(path.join(rootPath, relativePath), 'utf8');
    assert.doesNotMatch(source, /user_metadata\?\.role|user_metadata\.role/);
    assert.match(source, /getTrustedRole/);
  }

  const claimRoute = fs.readFileSync(path.join(rootPath, 'src/app/api/businesses/[id]/claim/route.ts'), 'utf8');
  assert.match(claimRoute, /getTrustedRole\(data\.user\)/);
  assert.match(claimRoute, /role !== 'provider'/);
  assert.match(claimRoute, /isAuthorizationFailure\(error\)/);
});

test('canonical claim migration protects only the proven local claim transition', () => {
  const migration = fs.readFileSync(
    path.join(rootPath, 'supabase/migrations/20260824092543_canonical_claim_state_machine.sql'),
    'utf8',
  );

  assert.ok(migration.trim(), 'canonical claim migration must be non-empty');
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.claim_business/);
  assert.match(migration, /auth\.jwt\(\) -> 'app_metadata' ->> 'role'/);
  assert.match(migration, /claim_status = 'unclaimed'/);
  assert.match(migration, /status = 'draft'/);
  assert.match(migration, /ERRCODE = '42501'/);
});
