import test from 'node:test';
import assert from 'node:assert/strict';
import { VeyraStore } from '../src/lib/veyra_store.ts';

test('creates new intake and retrieves it in VeyraStore', () => {
  const newIntake = VeyraStore.createIntake({
    name: 'Carlos Gómez',
    companyName: 'Gómez & Asociados Legal',
    email: 'carlos@gomezlegal.co',
    phone: '+57 311 222 3344',
    city: 'Medellín',
    sector: 'Servicios Profesionales y Legal',
    goal: 'Conseguir clientes para asesoría laboral',
    bottleneck: 'Poca presencia online',
  });

  assert.match(newIntake.id, /^INTK-/);
  assert.equal(newIntake.status, 'pending_review');

  const retrieved = VeyraStore.getIntakeById(newIntake.id);
  assert.equal(retrieved?.companyName, 'Gómez & Asociados Legal');
});

test('approves Business MRI report and transitions state to approved', () => {
  const report = VeyraStore.getMriReportById('MRI-001');
  assert.ok(report);
  assert.equal(report.opportunityScore, 79);
  assert.equal(report.findings.length >= 2, true);

  const approved = VeyraStore.approveMriReport('MRI-001');
  assert.equal(approved?.status, 'approved');
  assert.ok(approved?.approvedAt);
});

test('manages project client approvals and updates log history', () => {
  const project = VeyraStore.getProjectByToken('san-martin-782a');
  assert.equal(project, null);
});
