export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

const METRIC_EVENTS = ['ficha_vista', 'afiche_vista', 'whatsapp_clicked', 'call_clicked', 'search_result_clicked'] as const;
const WINDOW_DAYS = 30;

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'METRICS_NOT_CONFIGURED' }, { status: 503 });
    }

    const session = request.cookies.get('guaki_session')?.value;
    if (!session || session.startsWith('dev-') || session.startsWith('usr_local_')) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
    if (actorError || !actor.user) {
      return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
    }

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SERVICE_ROLE_KEY?.trim() || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    if (!serviceKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co/.test(supabaseUrl)) {
      return NextResponse.json({ error: 'METRICS_NOT_CONFIGURED' }, { status: 503 });
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: business } = await admin
      .from('businesses')
      .select('id, name')
      .eq('owner_id', actor.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const emptyMetrics = {
      whatsappClicks: 0,
      phoneCalls: 0,
      profileViews: 0,
      searchImpressions: 0,
      conversionRate: '0%',
    };

    if (!business?.id) {
      return NextResponse.json({ ok: true, businessId: null, metrics: emptyMetrics });
    }

    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const counts: Record<string, number> = {};

    for (const eventName of METRIC_EVENTS) {
      const { count } = await admin
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('event_name', eventName)
        .gte('timestamp', since);
      counts[eventName] = count || 0;
    }

    const profileViews = counts['ficha_vista'] + counts['afiche_vista'];
    const conversions = counts['whatsapp_clicked'] + counts['call_clicked'];
    const conversionRate = profileViews > 0 ? `${Math.round((conversions / profileViews) * 1000) / 10}%` : '0%';

    return NextResponse.json({
      ok: true,
      businessId: business.id,
      windowDays: WINDOW_DAYS,
      metrics: {
        whatsappClicks: counts['whatsapp_clicked'],
        phoneCalls: counts['call_clicked'],
        profileViews,
        searchImpressions: counts['search_result_clicked'],
        conversionRate,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error obteniendo métricas.' },
      { status: 500 },
    );
  }
}
