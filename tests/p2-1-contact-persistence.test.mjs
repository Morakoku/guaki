import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = decodeURIComponent(new URL('../', import.meta.url).pathname).replace(/^\//, '').replaceAll('/', '\\');
const read = (relative) => fs.readFileSync(`${root}${relative}`, 'utf8');

test('provider save sends the editable contact and schedule fields using the persistence schema', () => {
  const dashboard = read('src/app/provider/dashboard/page.tsx');
  assert.match(dashboard, /whatsapp:\s*whatsapp\.trim\(\)/);
  assert.match(dashboard, /phone:\s*phone\.trim\(\) \|\| whatsapp\.trim\(\)/);
  assert.match(dashboard, /schedule:\s*parseScheduleText\(scheduleText\)/);
});

test('provider persistence does not fabricate contact or schedule values when fields are absent', () => {
  const preview = read('src/components/provider/ProviderLivePreview.tsx');
  assert.doesNotMatch(preview, /\+57 300 000 0000/);
  assert.doesNotMatch(preview, /Lunes a Sábado · 8:00 AM – 6:00 PM/);
});

test('Supabase row mapping preserves unknown evidence instead of inventing published metrics', () => {
  const supabase = read('src/lib/supabase.ts');
  assert.doesNotMatch(supabase, /rating: row\.rating \? Number\(row\.rating\) : 5\.0/);
  assert.doesNotMatch(supabase, /status: row\.status \|\| 'published'/);
  assert.doesNotMatch(supabase, /updatedAt: row\.updated_at \|\| new Date\(\)\.toISOString\(\)/);
});
