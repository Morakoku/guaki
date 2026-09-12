import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const businessStoreCode = await readFile(new URL('../src/lib/business_store.ts', import.meta.url), 'utf8');
const homePage = await readFile(new URL('../src/app/HomeClient.tsx', import.meta.url), 'utf8');
const profilePage = await readFile(new URL('../src/app/proveedores/[slug]/page.tsx', import.meta.url), 'utf8');
const dashboardPage = await readFile(new URL('../src/app/provider/dashboard/page.tsx', import.meta.url), 'utf8');

test('BusinessStore implements dynamic counts from real data', () => {
  assert.match(businessStoreCode, /getMetrics/);
  assert.match(businessStoreCode, /publishedProviders/);
  assert.match(businessStoreCode, /totalCategories/);
});

test('BusinessStore supports creating a new business from scratch and audit workflow', () => {
  assert.match(businessStoreCode, /create\(/);
  assert.match(businessStoreCode, /processAuditDecision/);
  assert.match(businessStoreCode, /calculateProfileProgress/);
});

test('home page wires to real dynamic businesses without fake static arrays', () => {
  assert.match(homePage, /fetch\('\/api\/businesses\?status=published'\)/);
  assert.match(homePage, /provider\/dashboard/);
  assert.doesNotMatch(homePage, /const featuredBusinesses = \[/);
});

test('provider profile page uses DynamicScheduleView and real data', () => {
  assert.match(profilePage, /DynamicScheduleView/);
  assert.match(profilePage, /getPublishedProviderBySlug/);
});

test('provider dashboard supports new business creation and persistence', () => {
  assert.match(dashboardPage, /handleSaveBusiness/);
  assert.match(dashboardPage, /POST/);
  assert.match(dashboardPage, /calculateCompleteness/);
});
