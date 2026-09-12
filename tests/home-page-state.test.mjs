import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const page = await readFile(new URL('../src/app/HomeClient.tsx', import.meta.url), 'utf8');
const homeServer = await readFile(new URL('../src/app/page.tsx', import.meta.url), 'utf8');
const searchBar = await readFile(new URL('../src/components/ui/SearchBar.tsx', import.meta.url), 'utf8');
const locationBtn = await readFile(new URL('../src/components/ui/LocationButton.tsx', import.meta.url), 'utf8');
const demoAfiche = await readFile(new URL('../src/lib/demo_afiche.ts', import.meta.url), 'utf8');
const nav = await readFile(new URL('../src/components/ui/SoftBottomNav.tsx', import.meta.url), 'utf8');

test('Guaki Home has clean hero without unnecessary badge text', () => {
  assert.doesNotMatch(page, /Directorio 100% verificado en Colombia/i);
  assert.match(page, /Encuentra lo que necesitas/);
  assert.match(page, /LocationButton/);
  assert.match(page, /SearchBar/);
  assert.match(page, /¿Cómo funciona Guaki\?/);
  assert.match(page, /Busca o Habla/);
  assert.match(page, /Compara Opciones/);
  assert.match(page, /Contacta al Instante/);
});

test('Home server wrapper declares the root canonical', () => {
  assert.match(homeServer, /alternates:\s*\{\s*canonical:\s*absoluteUrl\('\/'\)/);
  assert.match(homeServer, /<HomeClient \/>/);
});

test('LocationButton implements real browser geolocation API', () => {
  assert.match(locationBtn, /navigator\.geolocation/);
  assert.match(locationBtn, /getCurrentPosition/);
  assert.match(locationBtn, /Saber mi ubicación/);
  assert.match(locationBtn, /Intentar nuevamente/);
});

test('SearchBar has 12 rotating phrases and integrated submit button', () => {
  assert.match(searchBar, /¿Qué servicio necesitas hoy\?/);
  assert.match(searchBar, /¿Qué negocio estás buscando\?/);
  assert.match(searchBar, /¿Necesitas un profesional cerca\?/);
  assert.match(searchBar, /¿Buscas dónde comer\?/);
  assert.match(searchBar, /¿Quieres encontrar un servicio\?/);
  assert.match(searchBar, /¿Qué necesitas resolver hoy\?/);
  assert.match(searchBar, /¿Buscas un negocio en tu zona\?/);
  assert.match(searchBar, /¿Necesitas ayuda con algo\?/);
  assert.match(searchBar, /¿Qué estás buscando cerca de ti\?/);
  assert.match(searchBar, /¿Quieres descubrir negocios locales\?/);
  assert.match(searchBar, /¿Buscas un profesional específico\?/);
  assert.match(searchBar, /¿Qué necesitas encontrar\?/);
  assert.match(searchBar, /search-bar-btn/);
});

test('SearchBar keeps the outer search field visually flat', () => {
  assert.match(searchBar, /boxShadow:\s*'none'/);
});

test('Home controls keep search semantics and a clickable talk-now fallback', () => {
  assert.match(searchBar, /role="search"/);
  assert.match(searchBar, /typeof window === 'undefined'/);
  assert.match(nav, /onClick=\{\(\) => setIsVoiceOpen\(true\)\}/);
  assert.match(nav, /aria-label="Abrir buscador por voz"/);
});

test('Demo data remains explicit and contains no obsolete Café Aurora fixture', () => {
  assert.doesNotMatch(demoAfiche, /Café Aurora|cafe-aurora/i);
  assert.match(demoAfiche, /IS_DEMO_DATA\s*=\s*true/);
});
