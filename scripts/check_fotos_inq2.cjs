// Verificación #26 v2: fotos en columna 'images' + proxy real de contactos via events
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const g = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
};
const U = (g('SUPABASE_URL') || g('NEXT_PUBLIC_SUPABASE_URL')).replace(/\/+$/, '');
const K = g('SUPABASE_SERVICE_ROLE_KEY') || g('SUPABASE_KEY');
const H = { apikey: K, Authorization: 'Bearer ' + K };
const head = async (qs) => {
  const r = await fetch(U + '/rest/v1/' + qs, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } });
  const m = (r.headers.get('content-range') || '').split('/');
  return m[1] || '?';
};

(async () => {
  console.log('con images:', await head('businesses?select=id&status=eq.published&images=not.is.null'));
  console.log('con logo_url:', await head('businesses?select=id&status=eq.published&logo_url=not.is.null'));
  console.log('con hero_image:', await head('businesses?select=id&status=eq.published&hero_image=not.is.null'));
  console.log('profile_completion=100:', await head('businesses?select=id&status=eq.published&profile_completion=eq.100'));

  // Muestra de images (¿array de URLs?)
  const r = await fetch(U + '/rest/v1/businesses?select=id,slug,images,services&status=eq.published&images=not.is.null&limit=3', { headers: H });
  const rows = await r.json();
  console.log('SAMPLE images:', JSON.stringify(rows, null, 1).slice(0, 800));

  // events: qué tipos de contacto hay por negocio
  const evTypes = ['whatsapp_clicked', 'call_clicked', 'ficha_vista', 'search_result_clicked'];
  for (const e of evTypes) {
    console.log('event', e, ':', await head(`events?select=id&event=eq.${e}`));
  }

  // ¿hay inquiry con otro nombre?
  const tables = ['inquiries', 'contactos', 'leads', 'mensajes'];
  for (const t of tables) {
    const n = await head(`${t}?select=id`);
    console.log('tabla', t, ':', n);
  }

  // Muestra de events con business_id para ver el contraste posible
  const er = await fetch(U + '/rest/v1/events?select=event,business_id&limit=5', { headers: H });
  console.log('SAMPLE events:', JSON.stringify(await er.json()).slice(0, 400));
})().catch((e) => console.log('ERR', e.message));
