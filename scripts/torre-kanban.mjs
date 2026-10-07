import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const STATUSES = ['pendiente', 'en_curso', 'bloqueado', 'revision', 'terminado'];
const BRANDS = ['Mapache', 'Torre', 'Resend', 'Guaki', 'Veyra', 'Brenda', 'Trinidad'];
export function createStore(file, seed) {
  function read() {
    if (!fs.existsSync(file)) return { revision: 0, tasks: JSON.parse(fs.readFileSync(seed, 'utf8')) };
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Number.isInteger(data.revision) || !Array.isArray(data.tasks)) throw new Error('Tablero inválido; conservar archivo y revisar respaldo');
    return data;
  }
  function save(body) {
    const current = read();
    if (body.revision !== current.revision) return { status: 409, error: 'Otro operador cambió el tablero. Recarga antes de guardar.' };
    if (!Array.isArray(body.tasks) || body.tasks.length > 500) return { status: 400, error: 'Lista de tareas inválida' };
    const ids = new Set();
    const tasks = [];
    for (const input of body.tasks) {
      const task = {};
      for (const key of ['id', 'title', 'brand', 'country', 'status', 'priority', 'owner', 'next', 'evidence', 'due']) {
        if (typeof input?.[key] !== 'string' || input[key].length > (['next', 'evidence'].includes(key) ? 2000 : 200)) return { status: 400, error: 'Campos inválidos' };
        task[key] = input[key].trim();
      }
      if (!task.id || ids.has(task.id) || !task.title || !STATUSES.includes(task.status) || !BRANDS.includes(task.brand) || !['CO', 'VE', 'CO/VE', 'General'].includes(task.country) || !['Alta', 'Media', 'Baja'].includes(task.priority) || (task.due && !/^\d{4}-\d{2}-\d{2}$/.test(task.due))) return { status: 400, error: 'Tarea inválida' };
      if (task.status === 'terminado' && !task.evidence) return { status: 400, error: 'Para terminar una tarea, registra evidencia de verificación.' };
      ids.add(task.id);
      tasks.push(task);
    }
    // No deletion endpoint: retain every task and its evidence.
    if (current.tasks.some(t => !ids.has(t.id))) return { status: 400, error: 'No se permite eliminar tareas del historial.' };
    const data = { revision: current.revision + 1, updatedAt: new Date().toISOString(), tasks };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.' + crypto.randomUUID() + '.tmp';
    try {
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
      if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
      fs.renameSync(tmp, file);
    } finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
    return { status: 200, data };
  }
  return { read, save };
}

export function createKanbanHandler({ file, seed, page, guard, readBody }) {
  const store = createStore(file, seed);
  return async (req, res, url) => {
    if (!['/torre-control/kanban', '/torre-control/kanban/data'].includes(url)) return false;
    const reply = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(value)); };
    if (url.endsWith('/data')) {
      if (!guard(req, res)) return true;
      try {
        if (req.method === 'GET') reply(200, store.read());
        else if (req.method === 'PUT') {
          const result = store.save(JSON.parse((await readBody(req)).toString('utf8')));
          reply(result.status, result.data || { error: result.error });
        } else reply(405, { error: 'Método no permitido' });
      } catch (error) { reply(error instanceof SyntaxError ? 400 : 500, { error: 'No se pudo leer o guardar el tablero. El archivo existente se conserva.' }); }
    } else if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(page, 'utf8'));
    } else reply(405, { error: 'Método no permitido' });
    return true;
  };
}
