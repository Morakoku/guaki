export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'scheduled', 'closed'] as const;

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'INQUIRIES_NOT_CONFIGURED' }, { status: 503 });
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
      return NextResponse.json({ error: 'INQUIRIES_NOT_CONFIGURED' }, { status: 503 });
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: business } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_id', actor.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!business?.id) {
      return NextResponse.json({ ok: true, businessId: null, inquiries: [] });
    }

    const { data: rows, error } = await admin
      .from('inquiries')
      .select('id,client_name,client_contact,email,message,service_requested,scheduled_date,status,created_at')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'INQUIRIES_QUERY_FAILED' }, { status: 500 });
    }

    const inquiries = (rows || []).map((inq: any) => ({
      id: inq.id,
      clientName: inq.client_name,
      clientContact: inq.client_contact,
      email: inq.email,
      message: inq.message,
      serviceRequested: inq.service_requested,
      scheduledDate: inq.scheduled_date,
      status: VALID_STATUSES.includes(inq.status) ? inq.status : 'new',
      createdAt: inq.created_at,
    }));

    return NextResponse.json({ ok: true, businessId: business.id, inquiries });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error obteniendo inquiries.' },
      { status: 500 },
    );
  }
}
