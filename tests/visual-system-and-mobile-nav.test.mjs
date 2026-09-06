import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { TOKENS } from '../src/lib/design-tokens.ts';

const layoutContent = await readFile(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
const navContent = await readFile(new URL('../src/components/ui/SoftBottomNav.tsx', import.meta.url), 'utf8');
const profileContent = await readFile(new URL('../src/app/proveedores/[slug]/page.tsx', import.meta.url), 'utf8');
const reviewFormContent = await readFile(new URL('../src/components/ProviderReviewForm.tsx', import.meta.url), 'utf8');
const storeContent = await readFile(new URL('../src/lib/business_store.ts', import.meta.url), 'utf8');
const globalStyles = await readFile(new URL('../src/styles/globals.css', import.meta.url), 'utf8');
const voiceModalContent = await readFile(new URL('../src/components/ui/VoiceSearchModal.tsx', import.meta.url), 'utf8');

test('1. Design Tokens: Contains 3-level Neumorphism, colors and editorial typography', () => {
  // Level 1: Surface
  assert.ok(TOKENS.colors.bgMain);
  assert.equal(TOKENS.colors.bgMain, '#E7ECE7');
  assert.ok(TOKENS.colors.surface);

  // Level 2: Cards
  assert.ok(TOKENS.shadows.card);
  assert.ok(TOKENS.shadows.card.includes('rgba'));

  // Level 3: Actions
  assert.ok(TOKENS.shadows.btnConvex);
  assert.ok(TOKENS.shadows.btnPrimary);
  assert.ok(TOKENS.colors.emeraldDark);
  assert.equal(TOKENS.colors.emeraldDark, '#17382D');

  // Radii
  assert.equal(TOKENS.radii.pill, '9999px');
  assert.ok(TOKENS.radii.lg);

  // Typography scale
  assert.ok(TOKENS.typography.display);
  assert.ok(TOKENS.typography.h1);
  assert.ok(TOKENS.typography.body);
});

test('1a. Global typography preserves the approved Inter and Outfit brand fonts', () => {
  assert.match(globalStyles, /--font-family-main:\s*'Inter',\s*system-ui,\s*-apple-system,\s*sans-serif;/);
  assert.match(globalStyles, /--font-family-heading:\s*'Outfit',\s*system-ui,\s*-apple-system,\s*sans-serif;/);
});

test('1b. Plan selector keeps the three plans side by side on compact desktop widths', () => {
  assert.match(globalStyles, /@media \(min-width: 760px\)[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test('1c. Talk-now fallback remains actionable when browser speech is unavailable', () => {
  assert.doesNotMatch(voiceModalContent, /disabled=\{!speechSupported\}/);
  assert.match(voiceModalContent, /Escribe tu búsqueda abajo/);
});

test('2. Mobile Navigation: RootLayout integrates SoftBottomNav and safe area container', () => {
  assert.ok(layoutContent.includes('SoftBottomNav'), 'layout.tsx must import and render SoftBottomNav');
  assert.ok(layoutContent.includes('has-bottom-dock'), 'layout.tsx must wrap content in has-bottom-dock');
});

test('3. Mobile Navigation: SoftBottomNav contains 4 core routes + Central Voice button', () => {
  assert.ok(navContent.includes('href="/"'));
  assert.ok(navContent.includes('href="/directorio"'));
  assert.ok(navContent.includes('href="/provider/dashboard"'));
  assert.ok(navContent.includes('href="/nosotros"'));
  assert.ok(navContent.includes('Hablar ahora') || navContent.includes('Habla ahora'));
  assert.ok(navContent.includes('soft-bottom-dock'));
});

test('4. Real Demo Provider: Veterinaria Pets & Care Poblado exists with 4 local verified photos', () => {
  assert.match(storeContent, /Veterinaria Pets & Care Poblado/);
  assert.match(storeContent, /veterinaria-pets-care-poblado/);
  assert.match(storeContent, /Carrera 43A # 14-27, El Poblado, Medellín, Colombia/);

  // Verify all 4 images exist physically on disk
  const expectedImages = [
    'public/images/veterinaria/hero.jpg',
    'public/images/veterinaria/foto1.jpg',
    'public/images/veterinaria/foto2.jpg',
    'public/images/veterinaria/foto3.jpg',
  ];

  for (const img of expectedImages) {
    const diskPath = path.join(process.cwd(), img);
    assert.ok(fs.existsSync(diskPath), `Image ${img} must exist on disk at ${diskPath}`);
  }
});

test('5. Business Profile Page: Implements 10 required architectural sections without admin clutter', () => {
  // Header
  assert.ok(profileContent.includes('← Directorio'));
  assert.ok(profileContent.includes('ProviderShareButton'));

  // Hero & CTA
  assert.ok(profileContent.includes('Hablar por WhatsApp'));
  // Quick metrics & reviews section
  assert.ok(profileContent.includes('Ver Opiniones'));
  assert.ok(profileContent.includes('Garantía de Comercio Auditado'));

  // Gallery, Services, Schedule, About, Reviews
  assert.ok(profileContent.includes('ProviderPhotoCarousel'));
  assert.ok(profileContent.includes('ProviderServicesView'));
  assert.ok(profileContent.includes('Horarios de Atención'));
  assert.ok(profileContent.includes('Sobre'));
  assert.ok(profileContent.includes('ProviderReviewForm'));
});

test('6. Review Form: Implements rating, author, comment and Publicar mi experiencia button', () => {
  assert.ok(reviewFormContent.includes('Publicar mi experiencia'));
  assert.ok(reviewFormContent.includes('review-author'));
  assert.ok(reviewFormContent.includes('review-comment'));
  assert.ok(reviewFormContent.includes('Calificación general'));
});

test('7. Central Voice Button & Natural Language Intent: Parsed accurately', async () => {
  const { parseSearchIntent } = await import('../src/lib/search_intent.mjs');
  
  // Example from user request: "necesito una peluqueria cerca disponible"
  const intent1 = parseSearchIntent('necesito una peluqueria cerca disponible');
  assert.equal(intent1.categoryHint, 'peluqueria');
  assert.equal(intent1.nearby, true);
  assert.equal(intent1.availability, 'today');

  // Example: "veterinaria 24 horas en el poblado"
  const intent2 = parseSearchIntent('veterinaria 24 horas en el poblado');
  assert.equal(intent2.categoryHint, 'veterinaria');
  assert.equal(intent2.city, 'Medellín');
  assert.equal(intent2.availability, 'today');
});
