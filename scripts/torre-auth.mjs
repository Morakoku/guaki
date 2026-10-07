import fs from 'node:fs';

export function createLocalKanbanGuard(port) {
  const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
  const origins = new Set([...hosts].map(host => `http://${host}`));
  return (req, res) => {
    const local = ['127.0.0.1', '::ffff:127.0.0.1'].includes(req.socket?.remoteAddress);
    const origin = req.headers.origin;
    if (!local || !hosts.has(req.headers.host) || (origin && !origins.has(origin)) || req.headers['sec-fetch-site'] === 'cross-site') {
      res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'El tablero solo admite acceso desde este PC y el origen local de la Torre.' }));
      return false;
    }
    if (req.method === 'PUT' && req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      res.writeHead(415, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'El tablero requiere JSON para guardar.' }));
      return false;
    }
    return true;
  };
}

export function readOpsToken(file) {
  // Read current configuration: a local edit must not leave a stale token in RAM.
  try {
    const line = fs.readFileSync(file, 'utf8').match(/^\s*(?:export\s+)?VEYRA_ADMIN_TOKEN\s*=\s*([^\r\n]*)/m)?.[1].trim();
    if (!line) return null;
    if (line.startsWith('"') || line.startsWith("'")) {
      const end = line.indexOf(line[0], 1);
      return end > 1 ? line.slice(1, end) : null;
    }
    return line.split(/\s+#/)[0].trim() || null;
  } catch { return null; }
}
