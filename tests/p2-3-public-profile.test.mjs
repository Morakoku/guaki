import test from 'node:test';
import assert from 'node:assert/strict';
import { filterPublishedProviders } from '../src/lib/provider_directory.mjs';

test('QA lifecycle records remain available to local workflows but are excluded from public discovery', () => {
  const record = {
    id: 'GKI-qa-public-1',
    slug: 'guaki-qa-p2-3',
    name: 'GUAKI QA P2.3',
    source: 'local-qa',
    status: 'published',
    city: 'Medellín',
    category: 'Servicios QA',
    website: '',
    evidence: [],
    description: 'Registro local exclusivo de prueba.',
    short_description: 'Registro QA',
    address: 'Dirección QA',
    phone: '',
    whatsapp: '+573000000000',
  };
  assert.deepEqual(filterPublishedProviders([record]), []);
});
