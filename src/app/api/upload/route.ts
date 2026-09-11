import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BUCKET = 'business-photos';
const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'UPLOAD_NOT_CONFIGURED' }, { status: 503 });
    }

    const session = request.cookies.get('guaki_session')?.value;
    if (!session || session.startsWith('dev-') || session.startsWith('usr_local_')) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }
    const { data: actor, error: actorError } = await getSupabaseClient().auth.getUser(session);
    if (actorError || !actor.user) {
      return NextResponse.json({ error: 'SESSION_INVALID' }, { status: 401 });
    }
    if (actor.user.app_metadata?.role === 'client') {
      return NextResponse.json({ error: 'PROVIDER_WRITE_REQUIRED' }, { status: 403 });
    }

    const formData = await request.formData().catch(() => null);
    const file = formData?.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'FILE_REQUIRED' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG o WebP.' }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La imagen supera 6 MB.' }, { status: 413 });
    }

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SERVICE_ROLE_KEY?.trim() || '';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
    if (!serviceKey || !/^https:\/\/[a-z0-9-]+\.supabase\.co/.test(supabaseUrl)) {
      return NextResponse.json({ error: 'UPLOAD_NOT_CONFIGURED' }, { status: 503 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const extension =
      file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : file.type === 'image/gif' ? 'gif'
      : 'jpg';
    const path = `${actor.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    });
    if (uploadError) {
      console.error('[upload] storage error', uploadError.message);
      return NextResponse.json({ error: 'UPLOAD_FAILED', detail: uploadError.message }, { status: 502 });
    }

    const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: publicUrlData.publicUrl, path, bucket: BUCKET });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error subiendo imagen.' },
      { status: 500 },
    );
  }
}
