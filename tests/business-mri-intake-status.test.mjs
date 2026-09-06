import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Command Center renders only aggregate Business MRI intake status with the required empty state', () => {
  const page = fs.readFileSync(new URL('../src/components/command-center/AdminDashboard.tsx', import.meta.url), 'utf8');
  const proxy = fs.readFileSync(new URL('../src/app/api/command-center/prospects/route.ts', import.meta.url), 'utf8');

  assert.match(proxy, /businessMriIntake/);
  assert.match(proxy, /businessMriIntake:/);
  assert.match(page, /businessMriIntake/);
  for (const label of ['received', 'pendingReview', 'approved', 'reportSent', 'interested', 'meeting', 'proposal', 'won', 'lost', 'intakeReview']) {
    assert.match(proxy, new RegExp(label));
    assert.match(page, new RegExp(label));
  }
  assert.match(proxy, /received: 0/);
  assert.doesNotMatch(page, /company_process/);
});
