export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dns from 'dns/promises';

interface QuickDiagnostics {
  timestamp: string;
  vercelRegion: string | undefined;
  config: {
    supabaseUrl: boolean;
    supabaseUrlValue: string | undefined;
    anonKey: boolean;
    anonKeyPrefix: string | undefined;
    serviceRoleKey: boolean;
    urlValid: boolean;
  };
  dns: {
    hostname: string | undefined;
    resolvedIPs: string[];
    error: string | null;
    durationMs: number;
  };
  connection: {
    attempt: number;
    success: boolean;
    durationMs: number;
    error: string | null;
    errorCode: string | undefined;
    stackTrace: string | undefined;
  }[];
  env: {
    nodeEnv: string | undefined;
    hasFetch: boolean;
    hasProxy: boolean;
  };
}

export async function GET() {
  const diag: QuickDiagnostics = {
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION,
    config: {
      supabaseUrl: false,
      supabaseUrlValue: undefined,
      anonKey: false,
      anonKeyPrefix: undefined,
      serviceRoleKey: false,
      urlValid: false,
    },
    dns: {
      hostname: undefined,
      resolvedIPs: [],
      error: null,
      durationMs: 0,
    },
    connection: [],
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasFetch: typeof fetch !== 'undefined',
      hasProxy: Boolean(process.env.HTTP_PROXY || process.env.HTTPS_PROXY),
    },
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Config check
  diag.config = {
    supabaseUrl: Boolean(supabaseUrl),
    supabaseUrlValue: supabaseUrl,
    anonKey: Boolean(anonKey && anonKey !== 'your-anon-key-here'),
    anonKeyPrefix: anonKey ? `${anonKey.substring(0, 15)}...` : undefined,
    serviceRoleKey: Boolean(serviceRoleKey),
    urlValid: supabaseUrl?.startsWith('https://') ?? false,
  };

  // DNS resolution
  if (supabaseUrl) {
    try {
      const hostname = new URL(supabaseUrl).hostname;
      diag.dns.hostname = hostname;
      const start = Date.now();
      const addrs = await dns.lookup(hostname, { all: true });
      diag.dns.resolvedIPs = addrs.map(a => a.address);
      diag.dns.durationMs = Date.now() - start;
    } catch (err) {
      diag.dns.error = err instanceof Error ? err.message : String(err);
    }
  }

  // Connection test
  if (supabaseUrl && anonKey && anonKey !== 'your-anon-key-here') {
    for (let i = 1; i <= 3; i++) {
      const start = Date.now();
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const client = createClient(supabaseUrl, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error } = await client.from('businesses').select('id').limit(1);
        
        diag.connection.push({
          attempt: i,
          success: !error,
          durationMs: Date.now() - start,
          error: error?.message || null,
          errorCode: error?.code,
          stackTrace: error ? new Error().stack : undefined,
        });
      } catch (err) {
        diag.connection.push({
          attempt: i,
          success: false,
          durationMs: Date.now() - start,
          error: err instanceof Error ? err.message : String(err),
          errorCode: (err as any)?.code,
          stackTrace: err instanceof Error ? err.stack : undefined,
        });
      }
      if (i < 3) await new Promise(r => setTimeout(r, 100));
    }
  } else {
    diag.connection.push({
      attempt: 0,
      success: false,
      durationMs: 0,
      error: 'Missing Supabase config',
      errorCode: 'CONFIG_MISSING',
      stackTrace: new Error().stack,
    });
  }

  const hasSuccess = diag.connection.some(c => c.success);
  const statusCode = hasSuccess ? 200 : 503;

  return NextResponse.json(diag, { 
    status: statusCode,
    headers: { 'Cache-Control': 'no-store' },
  });
}