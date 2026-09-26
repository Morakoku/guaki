/**
 * Bloque 2 — Resumen de MOVIMIENTO diario por correo (decisión Edwin 24/09:
 * "avisarme por correo cuando lleguen clientes o haya movimiento").
 *
 * Corre diario (18:00). SOLO envía si hubo movimiento desde el último
 * resumen (nuevos fichas, claims, concesiones, emails) — si nada cambió,
 * no manda nada (cero ruido).
 *
 * Uso: node scripts/movimiento_diario.mjs          (compara y envía si hay movimiento)
 *      node scripts/movimiento_diario.mjs --force  (envía aunque no haya movimiento)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

const env = {
  ...loadEnvFile(path.join(__dirname, '..', '.env.local')),
  ...loadEnvFile('C:\\Users\\edwin\\Documents\\Trinidad\\mapache\\backend\\.env'),
  ...process.env,
};
const URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = env.RESEND_API_KEY;
const FROM = env.RESEND_FROM || 'contacto@veyrasoluciones.com';
const TO = env.RESEND_TO || 'mbmbrochero510@gmail.com';
const STATE_FILE = path.join(__dirname, 'movimiento_state.json');

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function count(params = '') {
  // Prefer: count=exact — sin él PostgREST devuelve "0-0/*" (total desconocido)
  // y el parse daba 0. Con él: "0-0/2291".
  const r = await fetch(`${URL}/rest/v1/businesses?select=id&${params}&limit=1`, {
    headers: { ...H, Prefer: 'count=exact' },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const cr = r.headers.get('content-range') || '*/0';
  const parsed = parseInt(cr.split('/').pop(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

(async () => {
  const force = process.argv.includes('--force');
  const hoy = new Date().toISOString();
  const ayer24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // Estado del funnnel (cifras reales)
  const total = await count();
  const nuevosHoy = await count(`created_at=gte.${ayer24h}`);
  const claimsPendientes = await count(`claim_status=eq.pending`);
  const enAudit = await count(`claim_status=eq.in_audit`);
  const verificados = await count(`claim_status=eq.verified`);
  const concesiones = await count(`plan_source=eq.launch_promo`);

  // Campaña email (el ledger de warmup_guaki)
  let emailsEnviados = 0, bounces = 0, d3Enviados = 0, d7Enviados = 0;
  try {
    // 2026-09-24 (fix): el warmup_guaki escribe su ledger en mapache/backend/scripts/
    const st = JSON.parse(readFileSync('C:\\Users\\edwin\\Documents\\Trinidad\\mapache\\backend\\scripts\\warmup_state_guaki.json', 'utf-8'));
    const envios = st.envios || {};
    emailsEnviados = Object.values(envios).filter((e) => e.status === 'SENT').length;
    bounces = Object.values(envios).filter((e) => e.status === 'BOUNCED').length;
    d3Enviados = Object.values(envios).filter((e) => e.d3_sent).length;
    d7Enviados = Object.values(envios).filter((e) => e.d7_sent).length;
  } catch {}

  const estado = { total, nuevosHoy, claimsPendientes, enAudit, verificados, concesiones, emailsEnviados, bounces, d3Enviados, d7Enviados, ts: hoy };

  // Comparar con el último resumen: ¿hubo movimiento?
  let previo = null;
  try { previo = JSON.parse(readFileSync(STATE_FILE, 'utf-8')); } catch {}
  const claves = ['total', 'claimsPendientes', 'enAudit', 'verificados', 'concesiones', 'emailsEnviados', 'bounces', 'd3Enviados', 'd7Enviados'];
  const cambios = [];
  if (previo) {
    for (const k of claves) {
      if ((estado[k] || 0) !== (previo[k] || 0)) {
        const delta = (estado[k] || 0) - (previo[k] || 0);
        cambios.push(`${k}: ${delta > 0 ? '+' : ''}${delta}`);
      }
    }
  }

  if (!force && previo && cambios.length === 0) {
    console.log('sin movimiento — no se envía correo');
    process.exit(0);
  }

  // Armar el correo del movimiento
  const fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  const lineas = [
    previo ? `Movimiento desde el último resumen: ${cambios.join(' · ') || '—'}` : 'Primer resumen del sistema.',
    '',
    `📈 Fichas publicadas: ${total} (${nuevosHoy} en las últimas 24h)`,
    `⏳ Claims pendientes de auditoría: ${claimsPendientes}`,
    `🔍 En auditoría: ${enAudit}`,
    `✅ Verificados: ${verificados}`,
    `🎁 Concesiones de apertura (Verificado gratis 12m): ${concesiones} de 100`,
    `📧 Emails de la campaña: ${emailsEnviados} enviados (${bounces} rebotes)`,
    `🔁 Secuencia: ${d3Enviados} d3 · ${d7Enviados} d7`,
  ];
  const text = `MOVIMIENTO GUAKI — ${fecha}\n\n${lineas.join('\n')}\n\n— Resumen automático (solo cuando hay movimiento)`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      subject: `📈 Movimiento Guaki: ${cambios.length ? cambios.slice(0, 3).join(' · ') : 'resumen'} (${new Date().toLocaleDateString('es-CO')})`,
      text,
    }),
  });
  if (!r.ok) {
    console.error('envío fallo:', r.status, (await r.text()).slice(0, 150));
    process.exit(1);
  }
  writeFileSync(STATE_FILE, JSON.stringify(estado, null, 2));
  console.log('RESUMEN ENVIADO a ' + TO);
  console.log(text);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
