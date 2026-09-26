// Recon #35: ¿tienen precios los servicios? Muestra cruda de services en businesses.
const fs = require('fs');
const env = {};
fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).forEach((l) => {
  const i = l.indexOf('=');
  if (i > 0) env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^"|"$/g, '');
});
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const url = env.NEXT_PUBLIC_SUPABASE_URL;

fetch(url + '/rest/v1/businesses?select=id,services&services=not.is.null&limit=5', {
  headers: { apikey: key, Authorization: 'Bearer ' + key },
})
  .then(async (r) => {
    console.log('status:', r.status);
    console.log((await r.text()).slice(0, 900));
  })
  .catch((e) => console.log('error:', e.message));
