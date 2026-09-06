import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const businessStoreCode = await readFile(new URL('../src/lib/business_store.ts', import.meta.url), 'utf8');

test('BusinessStore implements complete profile progress logic', () => {
  assert.match(businessStoreCode, /function calculateProfileProgress/);
  assert.match(businessStoreCode, /b\.name && b\.name\.trim\(\)\.length >= 2/);
  assert.match(businessStoreCode, /b\.category && b\.category\.trim\(\)\.length > 0/);
  assert.match(businessStoreCode, /b\.phone \|\| b\.whatsapp/);
  assert.match(businessStoreCode, /b\.services && b\.services\.length >= 2/);
});

test('BusinessStore implements audit decision and submission workflow', () => {
  assert.match(businessStoreCode, /submitForAudit/);
  assert.match(businessStoreCode, /processAuditDecision/);
  assert.match(businessStoreCode, /status\s*=\s*'in_audit'/);
  assert.match(businessStoreCode, /status\s*=\s*'published'/);
});
