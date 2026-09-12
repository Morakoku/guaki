import fs from 'node:fs';
import http from 'node:http';

const PORT = Number(process.env.TORRE_PORT || 7788);
const FILE = 'C:/Users/edwin/Documents/Trinidad/TORRE.json';

const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

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
    try {
      generatedAt = JSON.parse(fs.readFileSync(FILE, 'utf8')).generated_at;
    } catch {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, generatedAt }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Torre server en http://127.0.0.1:${PORT}/torre.json`);
});
