// Verificación #26 v3: esquema de leads y events para elegir contraste real
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const g = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};
const U = (g('SUPABASE_URL') || g('NEXT_PUBLIC_SUPABASE_URL')).replace(/\/+$/, '');
const K = g('SUPABASE_SERVICE_ROLE_KEY') || g('SUPABASE_KEY');
const H = { apikey: K, Authorization: 'Bearer ' + K };
const api = async (path) => {
  const r = await fetch(U + '/rest/v1/' + path, { headers: H });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t.slice(0, 300); }
};

(async () => {
  const lead = await api('leads?select=*&limit=3');
  console.log('LEADS cols:', Array.isArray(lead) && lead[0] ? Object.keys(lead[0]).join(',') : JSON.stringify(lead));
  console.log('LEADS sample:', JSON.stringify(lead, null, 1).slice(0, 700));

  const ev = await api('events?select=*&limit=3');
  console.log('EVENTS cols:', Array.isArray(ev) && ev[0] ? Object.keys(ev[0]).join(',') : JSON.stringify(ev));
  console.log('EVENTS sample:', JSON.stringify(ev, null, 1).slice(0, 500));
})().catch((e) => console.log('ERR', e.message));
