// Verificación #26 v4: contraste REAL usando events (whatsapp_clicked/call_clicked)
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
const head = async (qs) => {
  const r = await fetch(U + '/rest/v1/' + qs, { headers: { ...H, Prefer: 'count=exact', Range: '0-0' } });
  const m = (r.headers.get('content-range') || '').split('/');
  return Number(m[1]) || 0;
};

(async () => {
  // 1) Conteos por tipo de evento
  for (const e of ['whatsapp_clicked', 'call_clicked', 'ficha_vista', 'search_result_clicked', 'afiche_vista']) {
    console.log('event', e, ':', await head(`events?select=id&event_name=eq.${e}`));
  }

  // 2) Contactos por negocio (whatsapp+call), business_id not null
  const evRows = await api(`events?select=event_name,business_id&event_name=in.(whatsapp_clicked,call_clicked)&business_id=not.is.null&limit=10000`);
  const perBiz = {};
  for (const r of evRows) perBiz[r.business_id] = (perBiz[r.business_id] || 0) + 1;
  const bizWithContacts = Object.keys(perBiz).length;
  console.log('negocios con >=1 contacto:', bizWithContacts, 'de', evRows.length, 'eventos');

  // 3) Fichas: servicios con precio >=3 vs <3
  const biz = await api('businesses?select=id,services,status&status=eq.published&limit=10000');
  const withPrice = (s) => (Array.isArray(s) ? s.filter(x => /\$|USD|Bs\.?\s*\d|€\s*\d|\d/.test(String(x)) && /\d/.test(String(x).replace(/[^\d]/g, ''))) : []);
  const hasPriceTag = (s) => (Array.isArray(s) ? s.some(x => /\$\s?\d|USD\s?\d|\d{2,}/.test(String(x)) && /[¥$€]|USD|Bs/.test(String(x))) : false);

  const grp = { a: { n: 0, contacts: 0 }, b: { n: 0, contacts: 0 } };
  for (const b of biz) {
    const priced = Array.isArray(b.services) ? b.services.filter(s => /[¥$€]|USD|Bs/.test(String(s)) && /\d/.test(String(s))) : [];
    const key = priced.length >= 3 ? 'a' : 'b';
    grp[key].n++;
    grp[key].contacts += perBiz[b.id] || 0;
  }
  const avg = (g) => g.n ? (g.contacts / g.n) : 0;
  console.log('GRUPO A (>=3 servicios con precio):', grp.a.n, 'fichas,', grp.a.contacts, 'contactos, avg', avg(grp.a).toFixed(3));
  console.log('GRUPO B (<3 con precio):', grp.b.n, 'fichas,', grp.b.contacts, 'contactos, avg', avg(grp.b).toFixed(3));
  if (avg(grp.b) > 0) console.log('RATIO real (A/B):', (avg(grp.a) / avg(grp.b)).toFixed(2) + 'x');

  // 4) Contraste alternativo: plan (gratis vs pagado)
  const biz2 = await api('businesses?select=id,plan,status&status=eq.published&limit=10000');
  const pg = { free: { n: 0, c: 0 }, paid: { n: 0, c: 0 } };
  for (const b of biz2) {
    const k = (!b.plan || b.plan === 'gratis') ? 'free' : 'paid';
    pg[k].n++; pg[k].c += perBiz[b.id] || 0;
  }
  console.log('GRATIS:', pg.free.n, 'fichas,', pg.free.c, 'contactos, avg', (pg.free.c / (pg.free.n || 1)).toFixed(3));
  console.log('PAGADO:', pg.paid.n, 'fichas,', pg.paid.c, 'contactos, avg', (pg.paid.c / (pg.paid.n || 1)).toFixed(3));
  if (pg.free.n && pg.paid.n) console.log('RATIO pagado/gratis:', ((pg.paid.c / pg.paid.n) / (pg.free.c / (pg.free.n || 1) || 1)).toFixed(2) + 'x');
})().catch((e) => console.log('ERR', e.message));
