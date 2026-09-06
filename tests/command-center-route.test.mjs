import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('the visible command center route reuses the audited dashboard component', () => {
  const route = 'src/app/command-center/page.tsx';
  assert.equal(fs.existsSync(route), true, 'command center route is missing');
  const source = fs.readFileSync(route, 'utf8');
  assert.match(source, /components\/command-center\/AdminDashboard/);
});
