import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

// Wrapper al memory vectorial de Ruflo (AgentDB) para el ecosistema Trinidad.
// La DB vive en C:\Users\edwin\Documents\Trinidad\BRIDGE_RUFLO\.swarm\memory.db
// Uso: node scripts/mem.mjs store <namespace> <clave> "<texto>"
//       node scripts/mem.mjs search <namespace> "<consulta>"
//       node scripts/mem.mjs list <namespace>
const BRIDGE = 'C:\\Users\\edwin\\Documents\\Trinidad\\BRIDGE_RUFLO';
const [action, ns, a, b] = process.argv.slice(2);

if (!action || !ns) {
  console.error('uso: mem.mjs store|search|list <namespace> [clave] [texto]');
  process.exit(1);
}

const args = ['-y', 'ruflo@latest', 'memory', action, '--namespace', ns];
const quote = (s) => '"' + String(s).replace(/"/g, '') + '"';
if (action === 'store') args.push('--key', a, '--value', quote(b));
if (action === 'search') args.push('--query', quote(a));

try {
  // Windows: el bridge nativo de AgentDB esta roto (#3024) y sus sidecars -wal/-shm
  // bloquean el write sql.js. Nadie mas escribe esta DB (mono-estacion, baja frecuencia),
  // asi que se limpian sidecars huerfanos antes de cada escritura.
  if (action === 'store') {
    for (const side of ['memory.db-wal', 'memory.db-shm']) {
      try { fs.unlinkSync(`${BRIDGE}\\.swarm\\${side}`); } catch {}
    }
  }
  const out = execFileSync('npx.cmd', args, {
    cwd: BRIDGE,
    encoding: 'utf8',
    timeout: 180000,
    windowsHide: true,
    shell: true,
  });
  console.log(out.trim().split('\n').slice(-14).join('\n'));
} catch (err) {
  console.error((err.stdout || '') + (err.stderr || err.message));
  process.exit(1);
}
