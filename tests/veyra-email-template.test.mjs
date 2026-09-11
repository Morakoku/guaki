import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import test from 'node:test';

const templatePath = 'E:/Proyectos IA/AI_STUDIO/DOCS/EMAIL/VEYRA_FIRST_CONTACT_DRAFT.html';
const allowedTokens = new Set(['first_name', 'company_name', 'sender_name', 'unsubscribe_url']);

test('Veyra template has explicit CTAs and only approved personalization variables', async (t) => {
  // El archivo vive fuera del repo (carpeta de docs de otra máquina/entorno):
  // si no está disponible, el test se omite en lugar de fallar el pipeline.
  try {
    await access(templatePath);
  } catch {
    t.skip('Veyra email template not available in this environment');
    return;
  }
  const html = await readFile(templatePath, 'utf8');
  const tokens = [...html.matchAll(/\{\{([^}]+)\}\}/g)].map((match) => match[1]);

  assert.match(html, /ESCRIBIR UN MENSAJE/);
  assert.match(html, /CONOCER VEYRA SOLUCIONES/);
  assert.match(html, /https:\/\/veyrasoluciones\.com\//);
  assert.match(html, /\{\{first_name\}\}/);
  assert.match(html, /\{\{company_name\}\}/);
  assert.match(html, /\{\{sender_name\}\}/);
  assert.match(html, /\{\{unsubscribe_url\}\}/);
  assert.deepEqual([...new Set(tokens)].sort(), [...allowedTokens].sort());
  assert.match(html, /Soy \{\{sender_name\}\}, de Veyra Soluciones\./);
  assert.match(html, /No lo tomo como un diagn[oó]stico/);
  assert.match(html, /[¿?]Qué proceso te gustaría que funcionara mejor hoy[?]/);
  assert.doesNotMatch(html, /Ã|Â|â€|â„/);
});
