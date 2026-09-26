// Prueba decisiva: el MISMO cliente del site (supabase-js) + la publishable
// de producción + la query EXACTA del getBusinessById.
const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://ppxlkpuxhjuyhaifcfwk.supabase.co',
  'sb_publishable_16R3UvsppW-Sqw-ZLdfxlw_8GgW5dZd',
  { auth: { persistSession: false } }
);

(async () => {
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
    console.log('SIN DATA — el getBusinessById devuelve null de verdad');
  }
})();
