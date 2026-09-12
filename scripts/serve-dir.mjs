import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const [, , rootDir, portArg] = process.argv;
const port = Number(portArg || 8899);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

const server = http.createServer((request, response) => {
  const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const filePath = path.join(rootDir, urlPath);
  if (!filePath.startsWith(path.resolve(rootDir))) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404).end('not found');
      return;
    }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    response.end(data);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${rootDir} on http://127.0.0.1:${port}`);
});
