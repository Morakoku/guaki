// Verificación #26: ¿dónde viven las fotos y cuál es el contraste REAL de inquiries?
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
  // 1) Muestra de columnas de foto reales
  const sample = await api('businesses?select=id,slug,hero_image,logo_url,photos,image_url,status&status=eq.published&limit=5');
  console.log('SAMPLE:', JSON.stringify(sample, null, 1).slice(0, 900));

  // 2) Conteos no-null de cada posible columna de foto (limit 1000 -> head count)
  for (const col of ['hero_image', 'logo_url', 'photos', 'image_url']) {
    const c = await api(`businesses?select=id&status=eq.published&${col}=not.is.null&limit=1`);
    const all = await api(`businesses?select=id&status=eq.published&limit=10000`);
    console.log(col, '->', Array.isArray(c) ? c.length : c, '(muestra de', Array.isArray(all) ? all.length : '?', ')');
    break; // el head count es caro; hacemos el real abajo
  }

  // 3) Conteos exactos con count=head
  const head = async (qs) => {
    const r = await fetch(U + '/rest/v1/' + qs, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } });
    const m = (r.headers.get('content-range') || '').split('/');
    return m[1] || '?';
  };
  const total = await head('businesses?select=id&status=eq.published');
  console.log('total published:', total);
  for (const col of ['hero_image', 'logo_url', 'photos', 'image_url']) {
    console.log('con', col + ':', await head(`businesses?select=id&status=eq.published&${col}=not.is.null`));
  }

  // 4) Tabla inquiries: ¿existe y cómo se relaciona?
  const cols = await api('businesses?select=*&limit=1');
  if (Array.isArray(cols) && cols[0]) {
    console.log('columnas businesses:', Object.keys(cols[0]).join(','));
  }
  const inq = await head('inquiries?select=id');
  console.log('inquiries total:', inq);
})().catch((e) => console.log('ERR', e.message));
