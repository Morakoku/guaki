export const dynamic = 'force-dynamic';
import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

const RELAY_URL = (process.env.HERMES_CODEX_RELAY_URL ?? 'http://127.0.0.1:9122/api/v1/codex/tasks').replace(/\/$/, '');
const KEY_FILE = process.env.HERMES_RELAY_SENDER_KEY_FILE ?? path.resolve(process.cwd(), '..', 'TASK_INBOX', '.hermes-relay-key');

function cleanText(value: unknown, maximum: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maximum);
}

export async function POST(request: Request) {
  try {
    const input = await request.json() as Record<string, unknown>;
    const title = cleanText(input.title, 200);
    const instruction = cleanText(input.instruction, 20_000);
    const project = cleanText(input.project, 80) || 'VEYRA';
    const correlationId = cleanText(input.correlation_id, 200);
    if (!title || instruction.length < 20) {
      return NextResponse.json({ status: 'BLOCKED', message: 'El título y el prompt profesional son obligatorios.' }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      instruction,
      project,
      priority: 'normal',
      requested_by: 'command-center',
      source: 'command-center-pending',
      operation: 'REVIEW',
      ...(correlationId ? { correlation_id: correlationId } : {}),
    });
    const key = (await readFile(KEY_FILE, 'utf8')).trim();
    if (!key) throw new Error('relay sender key is empty');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', key).update(`${timestamp}.${payload}`, 'utf8').digest('hex');
    const response = await fetch(RELAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hermes-Timestamp': timestamp,
        'X-Hermes-Signature': signature,
      },
      body: payload,
      cache: 'no-store',
    });
    const result = await response.json().catch(() => ({})) as { task?: { id?: string; status?: string }; error?: string };
    if (!response.ok) return NextResponse.json({ status: 'BLOCKED', message: 'El relay local rechazó la misión.', detail: result.error ?? 'Respuesta no disponible.' }, { status: 502 });
    return NextResponse.json({ status: 'PASS', message: 'Prompt enviado al relay local para revisión de Codex.', task: { id: result.task?.id ?? null, status: result.task?.status ?? 'PENDING' } });
  } catch {
    return NextResponse.json({ status: 'BLOCKED', message: 'No se pudo conectar con el relay local de Codex.' }, { status: 503 });
  }
}
