export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

type RelayTask = {
  id: string;
  title: string;
  instruction: string;
  project: string;
  operation: string;
  status: string;
  received_at?: string;
  updated_at?: string;
  status_note?: string;
};

type RelayResult = {
  task_id: string;
  status: string;
  message?: string;
  recorded_at?: string;
  evidence?: Record<string, unknown>;
};

const inbox = process.env.HERMES_CODEX_INBOX_DIR
  ? path.resolve(process.env.HERMES_CODEX_INBOX_DIR)
  : path.resolve(process.cwd(), '..', 'TASK_INBOX');

async function readJsonFiles<T>(directory: string): Promise<T[]> {
  try {
    const names = await readdir(directory);
    const files = names.filter((name) => name.endsWith('.json'));
    const values: T[] = [];
    await Promise.all(files.map(async (name) => {
      try {
        values.push(JSON.parse(await readFile(path.join(directory, name), 'utf8')) as T);
      } catch {
        // Ignore a file while another task is being written atomically.
      }
    }));
    return values;
  } catch {
    return [];
  }
}

function safeTask(task: RelayTask): RelayTask {
  return {
    id: task.id,
    title: task.title,
    instruction: task.instruction,
    project: task.project,
    operation: task.operation,
    status: task.status,
    received_at: task.received_at,
    updated_at: task.updated_at,
    status_note: task.status_note,
  };
}

function safeResult(result: RelayResult): RelayResult {
  return {
    task_id: result.task_id,
    status: result.status,
    message: result.message,
    recorded_at: result.recorded_at,
    evidence: result.evidence,
  };
}

export async function GET() {
  const [pending, inReview, accepted, blocked, done, results] = await Promise.all([
    readJsonFiles<RelayTask>(path.join(inbox, 'pending')),
    readJsonFiles<RelayTask>(path.join(inbox, 'in_review')),
    readJsonFiles<RelayTask>(path.join(inbox, 'accepted')),
    readJsonFiles<RelayTask>(path.join(inbox, 'blocked')),
    readJsonFiles<RelayTask>(path.join(inbox, 'done')),
    readJsonFiles<RelayResult>(path.join(inbox, 'results')),
  ]);
  const available = [pending, inReview, accepted, blocked, done].flat().map(safeTask);
  return NextResponse.json({
    status: 'PASS',
    source: 'LOCAL_TASK_INBOX',
    inbox,
    pending: pending.map(safeTask),
    review: inReview.map(safeTask),
    active: accepted.map(safeTask),
    blocked: blocked.map(safeTask),
    completed: done.map(safeTask),
    results: results.map(safeResult),
    counts: {
      pending: pending.length,
      review: inReview.length,
      active: accepted.length,
      blocked: blocked.length,
      completed: done.length,
      results: results.length,
      knownTasks: available.length,
    },
    checkedAt: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
