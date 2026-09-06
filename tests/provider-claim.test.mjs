import test from 'node:test';
import assert from 'node:assert/strict';
import { claimBusiness, canEditBusiness, transitionBusinessStatus } from '../src/lib/provider_claim.mjs';

test('a provider can claim an unclaimed business into pending verification', () => {
  const business = { id: 'GKI-TEST-001', status: 'published', ownerId: null, claimStatus: 'unclaimed' };

  const result = claimBusiness(business, { userId: 'user-1', email: 'owner@example.com' });

  assert.equal(result.ok, true);
  assert.equal(result.business.ownerId, 'user-1');
  assert.equal(result.business.claimStatus, 'pending');
  assert.equal(result.business.status, 'in_audit');
});

test('a claimed business cannot be claimed by another provider', () => {
  const business = { id: 'GKI-TEST-002', ownerId: 'user-1', claimStatus: 'verified', status: 'published' };

  const result = claimBusiness(business, { userId: 'user-2', email: 'other@example.com' });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'BUSINESS_ALREADY_CLAIMED');
});

test('only the owner or admin can edit a claimed business', () => {
  const business = { ownerId: 'user-1', claimStatus: 'pending' };

  assert.equal(canEditBusiness(business, { id: 'user-1', role: 'provider' }), true);
  assert.equal(canEditBusiness(business, { id: 'user-2', role: 'provider' }), false);
  assert.equal(canEditBusiness(business, { id: 'admin-1', role: 'admin' }), true);
});

test('publishing requires an approved claim', () => {
  assert.equal(transitionBusinessStatus({ claimStatus: 'pending', status: 'in_audit' }, 'published').ok, false);
  assert.equal(transitionBusinessStatus({ claimStatus: 'verified', status: 'in_audit' }, 'published').ok, true);
});
