import test from 'node:test';
import assert from 'node:assert/strict';

const hardening = await import('../src/lib/command_center_hardening.mjs');

test('removes phone and email values from coordination rows without changing operational context', () => {
  const summary = hardening.sanitizeCoordinationSummary({
    captured: 2,
    contactable: 1,
    recent: [{
      id: 'company-1',
      name: 'Acme',
      city: 'Bogotá',
      phone: '+57 300 555 0101',
      email: 'contact@acme.test',
      contactable: true,
      capturedAt: '2026-08-15T00:00:00.000Z',
    }],
  });

  assert.deepEqual(summary, {
    captured: 2,
    contactable: 1,
    businessMriIntake: {
      received: 0,
      pendingReview: 0,
      approved: 0,
      reportSent: 0,
      interested: 0,
      meeting: 0,
      proposal: 0,
      won: 0,
      lost: 0,
      intakeReview: { total: 0, pending: 0, completed: 0 },
    },
    recent: [{
      id: 'company-1',
      name: 'Acme',
      city: 'Bogotá',
      contactable: true,
      capturedAt: '2026-08-15T00:00:00.000Z',
    }],
  });
  assert.equal(JSON.stringify(summary).includes('@acme.test'), false);
  assert.equal(JSON.stringify(summary).includes('555 0101'), false);
});

test('normalizes a PASS prospects summary without Business MRI data so panel consumers can read zero aggregates', () => {
  const summary = hardening.sanitizeCoordinationSummary({
    status: 'PASS',
    captured: 2,
    recent: [],
  });

  assert.deepEqual(summary.businessMriIntake, {
    received: 0,
    pendingReview: 0,
    approved: 0,
    reportSent: 0,
    interested: 0,
    meeting: 0,
    proposal: 0,
    won: 0,
    lost: 0,
    intakeReview: { total: 0, pending: 0, completed: 0 },
  });
  assert.equal(summary.businessMriIntake.received, 0);
  assert.equal(summary.businessMriIntake.pendingReview, 0);
});

test('preserves the last successful snapshot and marks it stale after a transient failure', () => {
  const prior = { status: 'PASS', captured: 7, refreshedAt: '2026-08-15T00:00:00.000Z' };

  assert.deepEqual(hardening.keepLastSuccessfulSnapshot(prior, null), {
    ...prior,
    stale: true,
    staleReason: 'Unable to refresh live data. Showing the last successful snapshot.',
  });
});

test('reports dependency health truthfully without returning configured URLs or secrets', () => {
  const health = hardening.buildDependencyHealth({
    mapache: true,
    hermesBridge: false,
    hermesDashboard: null,
    relay: false,
    checkedAt: '2026-08-15T00:00:00.000Z',
  });

  assert.deepEqual(health, {
    status: 'PARTIAL',
    checkedAt: '2026-08-15T00:00:00.000Z',
    dependencies: {
      mapache: 'PASS',
      hermesBridge: 'BLOCKED',
      hermesDashboard: 'UNKNOWN',
      relay: 'BLOCKED',
    },
  });
  assert.equal(JSON.stringify(health).includes('http'), false);
});

test('distinguishes documented inventory from live runtime labels', () => {
  assert.equal(hardening.inventoryBadge('ACTIVE'), 'DOCUMENTED: ACTIVE');
  assert.equal(hardening.liveStatusLabel('PASS', true), 'PASS');
  assert.equal(hardening.liveStatusLabel('PASS', false), 'DOCUMENTED: PASS');
  assert.equal(hardening.liveStatusLabel(null, false), 'UNKNOWN');
});

test('labels static coordination facts as documented inventory instead of runtime health', () => {
  assert.equal(hardening.inventoryBadge('PASS local'), 'DOCUMENTED: PASS local');
  assert.equal(hardening.inventoryBadge('ACTIVE'), 'DOCUMENTED: ACTIVE');
});

test('provides a clear recovery message for a Command Center render failure', () => {
  assert.match(hardening.lastKnownStateMessage(), /Retry restores the UI/);
  assert.match(hardening.lastKnownStateMessage(), /may be stale/);
});
