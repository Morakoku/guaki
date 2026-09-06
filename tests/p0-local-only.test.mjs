import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootPath = fileURLToPath(new URL('../', import.meta.url));
const tscEntry = path.join(rootPath, 'node_modules', 'typescript', 'bin', 'tsc');
const compiledModules = new Map();

function findCompiledFile(directory, filename) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const nested = findCompiledFile(candidate, filename);
      if (nested) return nested;
    } else if (entry.name === filename) {
      return candidate;
    }
  }
  return null;
}

function loadTypeScriptModule(relativePath) {
  if (compiledModules.has(relativePath)) return compiledModules.get(relativePath);

  const outputDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'guaki-p0-'));
  try {
    execFileSync(process.execPath, [tscEntry,
      path.join(rootPath, relativePath),
      '--target', 'ES2020',
      '--module', 'commonjs',
      '--moduleResolution', 'node',
      '--esModuleInterop',
      '--skipLibCheck',
      '--outDir', outputDirectory,
    ], { cwd: rootPath, stdio: 'pipe' });

    const compiledFile = findCompiledFile(outputDirectory, path.basename(relativePath).replace(/\.ts$/, '.js'));
    assert.ok(compiledFile, `Expected ${relativePath} to compile`);
    const loaded = require(compiledFile);
    compiledModules.set(relativePath, loaded);
    return loaded;
  } finally {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
  }
}

test('production site URL resolution rejects localhost and accepts only a public HTTPS URL', () => {
  const { resolveSiteUrl } = loadTypeScriptModule('src/lib/site.ts');

  assert.throws(
    () => resolveSiteUrl({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'http://localhost:3100' }),
    /SITE_URL_REQUIRED_IN_PRODUCTION/
  );
  assert.throws(
    () => resolveSiteUrl({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://localhost:3100' }),
    /SITE_URL_REQUIRED_IN_PRODUCTION/
  );
  assert.throws(
    () => resolveSiteUrl({ NODE_ENV: 'production', VERCEL_URL: 'localhost:3000' }),
    /SITE_URL_REQUIRED_IN_PRODUCTION/
  );
  assert.equal(
    resolveSiteUrl({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://guaki.example.co/' }),
    'https://guaki.example.co'
  );
  assert.equal(
    resolveSiteUrl({ NODE_ENV: 'production', VERCEL_URL: 'guaki.vercel.app' }),
    'https://guaki.vercel.app'
  );
  assert.equal(resolveSiteUrl({ NODE_ENV: 'test' }), 'http://localhost:3100');
});

test('map projection uses persisted coordinates and rejects locations outside visible bounds', () => {
  const { projectCoordinateToPercent } = loadTypeScriptModule('src/lib/map-projection.ts');
  const bounds = { north: 6.30, south: 6.10, east: -75.40, west: -75.70 };

  const center = projectCoordinateToPercent({ lat: 6.20, lng: -75.55 }, bounds);
  assert.ok(center);
  assert.ok(Math.abs(center.left - 50) < 0.0001);
  assert.ok(Math.abs(center.top - 50) < 0.0001);
  assert.equal(projectCoordinateToPercent({ lat: 6.35, lng: -75.55 }, bounds), null);
  assert.equal(projectCoordinateToPercent({ lat: Number.NaN, lng: -75.55 }, bounds), null);
});

test('WhatsApp normalization accepts only digit-based national or international numbers', () => {
  const { normalizeWhatsAppNumber } = loadTypeScriptModule('src/lib/whatsapp.ts');

  assert.equal(normalizeWhatsAppNumber('+57 304-333-8899'), '573043338899');
  assert.equal(normalizeWhatsAppNumber('3043338899'), '3043338899');
  assert.equal(normalizeWhatsAppNumber('call 304 333 8899'), null);
  assert.equal(normalizeWhatsAppNumber('573043338899 ext 2'), null);
});

test('public contact CTAs use the shared strict WhatsApp validator instead of stripping arbitrary characters', () => {
  const publicCtaFiles = [
    'src/app/proveedores/[slug]/page.tsx',
    'src/components/ui/AficheCard.tsx',
    'src/components/ui/BusinessListItem.tsx',
    'src/components/ui/RelatedProvidersSection.tsx',
    'src/components/ui/VoiceSearchModal.tsx',
    'src/app/gradient-mesh/page.tsx',
    'src/app/neumorphism/page.tsx',
  ];

  for (const relativePath of publicCtaFiles) {
    const source = fs.readFileSync(path.join(rootPath, relativePath), 'utf8');
    assert.match(source, /normalizeWhatsAppNumber/);
    assert.doesNotMatch(source, /wa\.me\/\$\{[\s\S]{0,160}\.replace\(/);
  }
});

test('public inventory fallback is unavailable and never exposes BusinessStore demo records', () => {
  const route = fs.readFileSync(path.join(rootPath, 'src/app/api/businesses/route.ts'), 'utf8');
  const businessByIdRoute = fs.readFileSync(path.join(rootPath, 'src/app/api/businesses/[id]/route.ts'), 'utf8');
  const publicGetHandler = businessByIdRoute.split('export async function POST')[0];

  assert.match(route, /GUAKI_PUBLIC_INVENTORY_UNAVAILABLE/);
  assert.doesNotMatch(route, /else\s*\{\s*items\s*=\s*access\.authorized\s*\?/s);
  assert.doesNotMatch(route, /BusinessStore\.getByStatus\('published'\)/);
  assert.match(businessByIdRoute, /GUAKI_PUBLIC_INVENTORY_UNAVAILABLE/);
  assert.match(publicGetHandler, /access\.authorized/);
  assert.doesNotMatch(publicGetHandler, /else\s*\{\s*business\s*=\s*BusinessStore/s);
});
