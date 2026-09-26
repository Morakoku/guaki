// Chequeo rápido QoL-S: ¿las fichas publicadas tienen lat/lng en la BD?
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const g = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};
const U = (g('SUPABASE_URL') || g('NEXT_PUBLIC_SUPABASE_URL')).replace(/\/+$/, '');
const K = g('SUPABASE_SERVICE_ROLE_KEY') || g('SUPABASE_KEY');
const H = { apikey: K, Authorization: 'Bearer ' + K };

(async () => {
  const r1 = await fetch(U + '/rest/v1/businesses?select=id,slug,lat,lng,schedule&status=eq.published&lat=not.is.null&limit=3', { headers: H });
  const rows = await r1.json();
  const r2 = await fetch(U + '/rest/v1/businesses?select=id&status=eq.published&lat=not.is.null&limit=10000', { headers: H });
  const all = await r2.json();
  const r3 = await fetch(U + '/rest/v1/businesses?select=id&status=eq.published&schedule=not.is.null&limit=10000', { headers: H });
  const sched = await r3.json();
  console.log('muestra CON lat:', JSON.stringify(rows).slice(0, 400));
  console.log('total CON lat:', Array.isArray(all) ? all.length : JSON.stringify(all).slice(0, 200));
  console.log('total CON schedule:', Array.isArray(sched) ? sched.length : JSON.stringify(sched).slice(0, 200));
})().catch((e) => console.log('ERR', e.message));

