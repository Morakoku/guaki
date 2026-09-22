import fs from 'node:fs';
import http from 'node:http';

const PORT = Number(process.env.TORRE_PORT || 7788);
const FILE = 'C:/Users/edwin/Documents/Trinidad/TORRE.json';
// Registro de contactos CVELIZ: mismo directorio del lote canónico del pipeline.
const REG_FILE = 'D:/Proyectos IA/01_PROYECTOS/CVELIZ/prospeccion/registro_contactos.json';
const ESTADOS = new Set(['contactado', 'respondio', 'pendiente']);

const readReg = () => {
  try { return JSON.parse(fs.readFileSync(REG_FILE, 'utf8')); }
  catch { return { contactos: {} }; }
};
const writeReg = (reg) => fs.writeFileSync(REG_FILE, JSON.stringify(reg, null, 2), 'utf8');

const normCel = (s) => String(s || '').replace(/\D/g, '');

const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Preflight (por si el navegador lo exige; el frontend usa text/plain para evitarlo).
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Private-Network': 'true',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  if (url === '/cveliz/contactos' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(readReg()));
  }

  if (url === '/cveliz/contactos' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const cel = normCel(payload.celular);
        const estado = String(payload.estado || '');
        if (!cel || cel.length < 7 || !ESTADOS.has(estado)) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          return res.end(JSON.stringify({ ok: false, error: 'celular o estado invalido' }));
        }
        const reg = readReg();
        if (estado === 'pendiente') {
          delete reg.contactos[cel]; // desmarcar
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
        writeReg(reg);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, total: Object.keys(reg.contactos).length }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'JSON invalido' }));
      }
    });
    return;
  }

  if (url === '/torre.json' || url === '/') {
    try {
      const body = fs.readFileSync(FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(body);
    } catch {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'TORRE.json no existe. Corre: node C:/Users/edwin/Documents/Trinidad/guaki/scripts/torre.mjs' }));
    }
    return;
  }

  if (url === '/health') {
    let generatedAt = null;
    let regCount = 0;
    try {
      generatedAt = JSON.parse(fs.readFileSync(FILE, 'utf8')).generated_at;
    } catch {}
    try {
      regCount = Object.keys(readReg().contactos || {}).length;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, generatedAt, cvelizContactos: regCount }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Torre server en http://127.0.0.1:${PORT}/torre.json · registro CVELIZ en ${REG_FILE}`);
});
