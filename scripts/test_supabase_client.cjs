// Prueba con el MISMO cliente que usa el site (supabase-js) + el anon key.
// Si devuelve el enrichment → el page debería; si no → el cliente se comporta distinto al REST crudo.
const { createClient } = require('@supabase/supabase-js');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
function loadEnvFile(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const [k, ...rest] = t.split('=');
    out[k.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
  return out;
}
const env = { ...loadEnvFile(path.join(__dirname, '..', '.env.local')), ...process.env };
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
console.log('URL:', URL);
console.log('ANON (prefijo):', (ANON || '').slice(0, 20));

const client = createClient(URL, ANON, { auth: { persistSession: false } });

(async () => {
  // EXACTAMENTE la query del getBusinessById
  const { data, error } = await client
    .from('businesses')
    .select('*')
    .or('id.eq.GKI-3f20592d-e4d1-4371-bec0-178a940b08bb,slug.eq.xiluet-cirugia-plastica')
    .maybeSingle();
  console.log('error:', error ? error.message : 'ninguno');
  if (data) {
    console.log('slug:', data.slug);
    console.log('schedule:', JSON.stringify(data.schedule).slice(0, 120));
    console.log('services:', JSON.stringify(data.services).slice(0, 140));
    console.log('images:', JSON.stringify(data.images).slice(0, 140));
  } else {
    console.log('SIN DATA (null!) — el getBusinessById de verdad devuelve null');
  }
})();
