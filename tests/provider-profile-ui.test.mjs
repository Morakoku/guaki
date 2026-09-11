import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSearchIntent } from '../src/lib/search_intent.mjs';
import { readFile } from 'node:fs/promises';

test('expanded category hints detect clinics, lawyers, real estate, and vet services', () => {
  const clinic = parseSearchIntent('Necesito una clínica médica con atención hoy', 'Medellín');
  assert.equal(clinic.categoryHint, 'clinica');
  assert.equal(clinic.availability, 'today');

  const lawyer = parseSearchIntent('Busco asesoría legal y abogados en Medellín', 'Medellín');
  assert.equal(lawyer.categoryHint, 'abogados');

  const realEstate = parseSearchIntent('Inmobiliaria para arriendo de apartamentos', 'Bogotá');
  assert.equal(realEstate.categoryHint, 'inmobiliaria');

  const vet = parseSearchIntent('Veterinaria para mi perro urgente', 'Cali');
  assert.equal(vet.categoryHint, 'veterinaria');
});

test('profile page includes Schema.org LocalBusiness structured data', async () => {
  const profilePage = await readFile('src/app/proveedores/[slug]/page.tsx', 'utf8');
  assert.match(profilePage, /@type': 'LocalBusiness/);
  assert.match(profilePage, /getPublishedProviderBySlug/);
  assert.match(profilePage, /notFound/);
});

test('profile renders an installations and patients gallery only for provider-backed images', async () => {
  const profilePage = await readFile('src/app/proveedores/[slug]/page.tsx', 'utf8');
  assert.doesNotMatch(profilePage, /function getCategoryImages/);
  assert.match(profilePage, /providerImages/);
  assert.match(profilePage, /providerImages\.length > 0 &&/);
  assert.match(profilePage, /Fotos de las Instalaciones & Pacientes/);
});

test('profile page exposes only the approved Google Maps transport action', async () => {
  const profilePage = await readFile('src/app/proveedores/[slug]/page.tsx', 'utf8');
  assert.match(profilePage, /google\.com\/maps\/search/);
  assert.match(profilePage, /Google Maps/);
  assert.doesNotMatch(profilePage, /Pedir inDrive|Pedir Uber|Waze/);
});

test('category city hub includes Schema.org ItemList structured data', async () => {
  const hubPage = await readFile('src/app/servicios/[category]/[city]/page.tsx', 'utf8');
  assert.match(hubPage, /@type': 'ItemList/);
  assert.match(hubPage, /getPublishedProviders/);
  assert.match(hubPage, /notFound/);
});

test('provider schedule avoids time-dependent server/client initial markup', async () => {
  const schedule = await readFile('src/components/ui/DynamicScheduleView.tsx', 'utf8');
  assert.match(schedule, /useEffect/);
  assert.match(schedule, /setNow/);
});
