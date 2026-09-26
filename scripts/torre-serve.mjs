import fs from 'node:fs';
import http from 'node:http';

// Torre de control local. TRES responsabilidades:
// 1) Servir la PAGINA de la torre desde el repo local (fuente unica de verdad: el
//    DASHBOARD_HTML embebido en torre_control.py). La copia publica en Vercel se retiro.
// 2) Datos del escritorio (TORRE.json + registros de contactos por marca).
// 3) Proxy del backend de mapache (APIs) hacia el backend local — mismo origen, sin CORS ni PNA.
const PORT = Number(process.env.TORRE_PORT || 7788);
const FILE = 'C:/Users/edwin/Documents/Trinidad/TORRE.json';
const TORRE_PY = 'C:/Users/edwin/Documents/Trinidad/mapache/backend/app/routers/torre_dashboard_html.py';
// Nota (P2 janitor 2026-09-25): la pagina de la torre vive en su propio modulo
// torre_dashboard_html.py; el patron regex DASHBOARD_HTML = """...""" se mantiene.
const UPSTREAM = 'http://localhost:8000';

// Pagina de la torre: extraida del Python del repo, cacheada por mtime.
let pageCache = { mtime: 0, html: null };
const torrePage = () => {
  try {
    const st = fs.statSync(TORRE_PY);
    if (pageCache.html && st.mtimeMs === pageCache.mtime) return pageCache.html;
    const src = fs.readFileSync(TORRE_PY, 'utf8');
    const m = src.match(/DASHBOARD_HTML\s*=\s*"""([\s\S]*?)"""/);
    if (!m) throw new Error('DASHBOARD_HTML no encontrado en torre_control.py');
    pageCache = { mtime: st.mtimeMs, html: m[1] };
    return m[1];
  } catch (e) {
    return '<!DOCTYPE html><html><body style="font-family:system-ui;background:#0a0a0a;color:#eee;padding:40px"><h2>No pude leer la pagina de la torre</h2><pre>' + e.message + '</pre><p>Revisa que exista: ' + TORRE_PY + '</p></body></html>';
  }
};

// Registro de contactos por marca (junto al lote canonico de cada pipeline).
const BRANDS = {
  cveliz: 'D:/Proyectos IA/01_PROYECTOS/CVELIZ/prospeccion/registro_contactos.json',
  guaki: 'D:/Proyectos IA/01_PROYECTOS/GUAKI/prospeccion/registro_contactos.json',
  veyra: 'D:/Proyectos IA/01_PROYECTOS/VEYRA/prospeccion/registro_contactos.json'
};
const ESTADOS = new Set(['contactado', 'respondio', 'pendiente']);

// Puentes WhatsApp (Baileys) del ecosistema (#5): sondas server-side (sin CORS).
const BRIDGE_PORTS = { atlas: 3000, veyra: 3001, guaki: 3002, cveliz: 3004 };
const probeBridge = async (port) => {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/status`, { signal: AbortSignal.timeout(1500) });
    if (!r.ok) return { ok: false, status: r.status };
    let estado = null;
    try { const j = await r.json(); estado = j.status || j.state || null; } catch {}
    return { ok: true, status: r.status, estado };
  } catch { return { ok: false, status: 0 }; }
};

const readReg = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return { contactos: {} }; }
};
const writeReg = (file, reg) => {
  // H5: escritura atomica (tmp + rename; en Windows renameSync sobreescribe de
  // forma atomica) — un kill a mitad ya no deja el registro JSON corrupto.
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(reg, null, 2), 'utf8');
  fs.renameSync(tmp, file);
};
const normCel = (s) => String(s || '').replace(/\D/g, '');

const readBody = (req) => new Promise((resolve) => {
  let b = [];
  req.on('data', (c) => { b.push(c); if (b.reduce((n, x) => n + x.length, 0) > 1_000_000) req.destroy(); });
  req.on('end', () => resolve(Buffer.concat(b)));
  req.on('error', () => resolve(Buffer.concat(b)));
});

// Token de operador: misma fuente de verdad que el backend (backend/.env).
// /torre.json y /{brand}/contactos lo exigen (leen/escriben datos del
// escritorio: PII de leads). Sin .env o sin token configurado: fail-closed.
const OPS_TOKEN = (() => {
  try {
    const env = fs.readFileSync(TORRE_PY.split('/app/routers/')[0] + '/.env', 'utf8');
    const m = env.match(/^VEYRA_ADMIN_TOKEN=(.+)$/m);
    return m ? m[1].trim() : null;
  } catch { return null; }
})();
const ORIGINS_OK = new Set(['http://127.0.0.1:7788', 'http://localhost:7788']);
const tokenOk = (req) => !!OPS_TOKEN && req.headers['x-veyra-token'] === OPS_TOKEN;
const originOk = (req) => {
  const o = req.headers.origin;
  return !o || ORIGINS_OK.has(String(o));
};
const datosGuard = (req, res) => {
  if (!originOk(req) || !tokenOk(req)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'token de operador requerido' }));
    return false;
  }
  return true;
};

const server = http.createServer(async (req, res) => {
  const url = (req.url || '').split('?')[0];
  // Seguridad #H1 (auditoria 2026-09-25): SIN Access-Control-Allow-Origin ni
  // Access-Control-Allow-Private-Network. Escuchar en localhost NO protege:
  // cualquier web visitada en el navegador podia leer/escribir los registros
  // con un POST simple (text/plain no requiere preflight). Ahora /torre.json
  // y /{brand}/contactos exigen token de operador (el dashboard lo inyecta
  // en todas sus fetch) y se rechazan orígenes externos.
  res.setHeader('Cache-Control', 'no-store');

  // Preflight: la version local es same-origin y no necesita CORS. 204 sin
  // cabeceras CORS: un preflight de un origen externo no consigue nada.
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // ---- datos locales ----
  if (url === '/health') {
    let generatedAt = null;
    let regs = {};
    try { generatedAt = JSON.parse(fs.readFileSync(FILE, 'utf8')).generated_at; } catch {}
    for (const [k, f] of Object.entries(BRANDS)) {
      try { regs[k] = Object.keys(readReg(f).contactos || {}).length; } catch {}
    }
    // Sondas de puentes WhatsApp (:3000-:3004) + uptime del proceso (#4/#5).
    const bridgeEntries = await Promise.all(
      Object.entries(BRIDGE_PORTS).map(async ([k, p]) => [k, await probeBridge(p)])
    );
    const bridges = Object.fromEntries(bridgeEntries);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      ok: true, generatedAt, cvelizContactos: regs.cveliz || 0, registros: regs,
      uptime_seconds: Math.floor(process.uptime()),
      started_at: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      bridges
    }));
  }

  if (url === '/' || url === '/torre-control' || url === '/torre-control/') {
    const html = torrePage();
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  if (url === '/torre.json') {
    if (!datosGuard(req, res)) return;
    try {
      const body = fs.readFileSync(FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(body);
    } catch {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'TORRE.json no existe. Corre: node C:/Users/edwin/Documents/Trinidad/guaki/scripts/torre.mjs' }));
    }
  }

  const m = url.match(/^\/(cveliz|guaki|veyra)\/contactos$/);
  if (m) {
    if (!datosGuard(req, res)) return;
    const brand = m[1], regFile = BRANDS[brand];
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify(readReg(regFile)));
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      try {
        const payload = JSON.parse(body.toString('utf8') || '{}');
        const cel = normCel(payload.celular);
        const estado = String(payload.estado || '');
        if (!cel || cel.length < 7 || !ESTADOS.has(estado)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ ok: false, error: 'celular o estado invalido' }));
        }
        const reg = readReg(regFile);
        if (estado === 'pendiente') {
          delete reg.contactos[cel];
        } else {
          const prev = reg.contactos[cel] || {};
          reg.contactos[cel] = {
            estado,
            ts: new Date().toISOString(),
            ref: payload.ref || prev.ref || '',
            empresa: payload.empresa || prev.empresa || '',
            ciudad: payload.ciudad || prev.ciudad || ''
          };
        }
        writeReg(regFile, reg);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: true, total: Object.keys(reg.contactos).length }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, error: 'JSON invalido' }));
      }
    }
  }

  // ---- proxy del resto hacia la torre publicada ----
  try {
    const headers = { ...req.headers };
    delete headers.host; delete headers.connection; delete headers['accept-encoding'];
    delete headers['x-forwarded-for']; // H4: el backend decide confiar o no; el proxy no propaga XFF externo
    const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
    const up = await fetch(UPSTREAM + req.url, {
      method: req.method,
      headers,
      body: hasBody ? await readBody(req) : undefined,
      redirect: 'manual'
    });
    const buf = Buffer.from(await up.arrayBuffer());
    const h = {};
    up.headers.forEach((v, k) => {
      const kl = k.toLowerCase();
      if (['content-encoding', 'transfer-encoding', 'content-length', 'content-security-policy',
           'content-security-policy-report-only', 'strict-transport-security', 'host', 'connection'].includes(kl)) return;
      h[k] = v;
    });
    res.writeHead(up.status, h);
    return res.end(buf);
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ error: 'proxy hacia ' + UPSTREAM + ' fallo: ' + e.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Torre local en http://127.0.0.1:${PORT}/torre-control (proxy de ${UPSTREAM} + datos del escritorio)`);
});
