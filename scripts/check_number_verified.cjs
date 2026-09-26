// Check BD: ¿existe la columna number_verified en published_providers? (soporte #38)
const fs = require('fs');
const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach((l) => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^"|"$/g, '');
});
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = env.NEXT_PUBLIC_SUPABASE_URL;
console.log('anon key len:', key.length, 'jwt:', key.startsWith('eyJ'));

fetch(url + '/rest/v1/businesses?select=number_verified&limit=1', {
  headers: { apikey: key, Authorization: 'Bearer ' + key },
})
  .then(async (r) => {
    console.log('status:', r.status);
    console.log('body:', (await r.text()).slice(0, 300));
  })
  .catch((e) => console.log('error:', e.message));
