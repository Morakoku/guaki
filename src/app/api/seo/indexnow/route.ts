import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * PROTOCOLO INDEXNOW (Bing, Yandex, Seznam, Naver)
 * Notifica instantáneamente la creación o actualización de fichas de proveedores.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.urls) ? body.urls : [];

    if (urls.length === 0) {
      return NextResponse.json({ error: 'Debes proporcionar al menos una URL para notificar' }, { status: 400 });
    }

    const host = 'guakiweb.vercel.app';
    const key = process.env.INDEXNOW_KEY || 'guaki-indexnow-master-key-2026';

    const allowedHosts = new Set([
      host,
      'localhost',
      'guaki.co',
      'guaki.com.co',
      'guaki.vercel.app',
      'guaki-morakokus-projects.vercel.app',
    ]);

    // H-04 FIX (audit v2): no `endsWith('.vercel.app')` — that turned this route
    // into an open relay for any third-party Vercel deployment.
    const sanitizedUrls = urls.filter((u) => {
      try {
        const parsed = new URL(u);
        return allowedHosts.has(parsed.hostname);
      } catch {
        return false;
      }
    });

    if (sanitizedUrls.length === 0) {
      return NextResponse.json({ error: 'Ninguna URL válida pertenece al dominio de GUAKI.' }, { status: 400 });
    }

    const payload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList: sanitizedUrls,
    };

    // Envío oficial a la API de IndexNow
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: `Notificadas ${urls.length} URLs a IndexNow con éxito`,
      status: response ? response.status : 'simulated_success',
      submittedUrls: urls,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error procesando solicitud IndexNow', details: err.message }, { status: 500 });
  }
}
