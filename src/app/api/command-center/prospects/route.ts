export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { sanitizeCoordinationSummary } from '../../../../lib/command_center_hardening.mjs';

const MAPACHE_API = (process.env.MAPACHE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function GET() {
  try {
    const response = await fetch(`${MAPACHE_API}/api/v1/command-center/summary`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`MAPACHE_${response.status}`);
    const payload = await response.json() as Record<string, any>;
    return NextResponse.json({
      ...sanitizeCoordinationSummary(payload),
      source: MAPACHE_API,
      error: undefined,
    });
  } catch {
    return NextResponse.json(
      {
        status: 'BLOCKED',
        source: MAPACHE_API,
        captured: 0,
        contactable: 0,
        uncontactable: 0,
        leads: 0,
        emails: 0,
        sent: 0,
        businessMriIntake: {
          received: 0,
          pendingReview: 0,
          approved: 0,
          reportSent: 0,
          interested: 0,
          meeting: 0,
          proposal: 0,
          won: 0,
          lost: 0,
          intakeReview: { total: 0, pending: 0, completed: 0 },
        },
        lastInboxSync: null,
        recent: [],
        activeJob: null,
        refreshedAt: new Date().toISOString(),
        message: 'Mapache local no responde',
      },
      { status: 503 },
    );
  }
}
