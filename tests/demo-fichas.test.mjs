import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const demoFichas = await readFile(new URL('../src/lib/demo_fichas.ts', import.meta.url), 'utf8');
const home = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
const directory = await readFile(new URL('../src/app/directorio/page.tsx', import.meta.url), 'utf8');
const card = await readFile(new URL('../src/components/ui/AficheCard.tsx', import.meta.url), 'utf8');

test('demo fichas are derived from local records and distributed across three plans', () => {
  assert.match(demoFichas, /slice\(0, 9\)/);
  assert.match(demoFichas, /free[\s\S]*verificado[\s\S]*vip/);
  assert.match(demoFichas, /vip/);
  assert.match(demoFichas, /isDemo: true/);
});

test('public home and directory render persisted records without demo projections', () => {
  assert.doesNotMatch(home, /DEMO_AFICHE/);
  assert.doesNotMatch(directory, /DEMO_AFICHE/);
  assert.doesNotMatch(home, /createDemoFichas/);
  assert.doesNotMatch(directory, /createDemoFichas/);
});

test('demo cards link to their real local ficha instead of a fake WhatsApp contact', () => {
  assert.match(card, /afiche\.isDemo/);
  assert.match(card, /Ver Ficha Demo/);
});

test('free plan cards do not fabricate a WhatsApp CTA without persisted contact', () => {
  assert.match(card, /normalizeWhatsAppNumber\(afiche\.whatsapp\)/);
  assert.match(card, /afiche\.plan === 'free' && whatsappNumber/);
});
