import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('E:/Proyectos IA/AI_STUDIO/GUAKI/.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim().replace(/"/g, '');
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim().replace(/"/g, '');

const client = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await client.from('businesses').select('*').eq('status', 'published').order('created_at', { ascending: false });
if (error) { console.error('ERR:', error.message); process.exit(1); }
console.log('rows:', data.length);

// Reproduce EXACTLY the old mapper (without my fix) on each row
const REQUIRED_FIELDS = ['id', 'slug', 'name', 'source', 'status', 'city', 'category'];
for (const row of data) {
  const mapped = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description || '',
    city: row.city,
    address: row.address || '',
    lat: row.lat ? Number(row.lat) : undefined,
    lng: row.lng ? Number(row.lng) : undefined,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    website: row.website || '',
    plan: row.plan || undefined,
    status: row.status || 'draft',
    source: row.source || undefined,
  };
  const hasUndefined = Object.values(mapped).some((v) => v === undefined);
  const requiredOk = REQUIRED_FIELDS.every((f) => f in mapped);
  console.log(row.id, '| requiredOk:', requiredOk, '| hasUndefined:', hasUndefined);
}
