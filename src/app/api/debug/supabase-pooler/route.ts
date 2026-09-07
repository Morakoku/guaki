export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface PoolerTestResult {
  connectionType: 'pooler' | 'direct' | 'unknown';
  url: string;
  hostname: string;
  port: number | undefined;
  attempt: {
    success: boolean;
    durationMs: number;
    error: string | null;
    errorCode: string | undefined;
    details: unknown;
  };
  poolInfo: {
    maxConnections: number | null;
    activeConnections: number | null;
    idleConnections: number | null;
    poolMode: string | null;
    error: string | null;
  };
}

async function testConnectionType(url: string, anonKey: string): Promise<PoolerTestResult> {
  const hostname = new URL(url).hostname;
  const port = new URL(url).port ? parseInt(new URL(url).port) : (url.startsWith('https://') ? 443 : 80);
  
  // Detect connection type
  const isPooler = hostname.includes('pooler') || port === 6543 || port === 6542;
  const connectionType = isPooler ? 'pooler' : 'direct';

  const start = Date.now();
  let error: string | null = null;
  let errorCode: string | undefined;
  let details: unknown = null;
  let success = false;

  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Test basic query
    const { data, error: queryError } = await client.from('businesses').select('id').limit(1);
    
    if (queryError) {
      error = queryError.message;
      errorCode = queryError.code;
      details = { hint: queryError.hint, details: queryError.details };
    } else {
      success = true;
      details = { rowCount: data?.length ?? 0 };
    }
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    errorCode = (err as any)?.code;
    details = { stack: err instanceof Error ? err.stack : undefined };
  }

  // Try to get pool info
  let poolInfo = {
    maxConnections: null as number | null,
    activeConnections: null as number | null,
    idleConnections: null as number | null,
    poolMode: null as string | null,
    error: null as string | null,
  };

  if (success) {
    try {
      const client = createClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      
      // Try to query pooler stats if available
      const { data, error: poolError } = await client.rpc('get_pool_stats');
      
      if (!poolError && data) {
        poolInfo = {
          maxConnections: data.max_connections ?? null,
          activeConnections: data.active_connections ?? null,
          idleConnections: data.idle_connections ?? null,
          poolMode: data.pool_mode ?? null,
          error: null,
        };
      } else {
        // Fallback: try to get connection count from pg_stat_activity
        const { data: activityData, error: activityError } = await client
          .from('pg_stat_activity')
          .select('state')
          .neq('state', 'idle');
        
        if (!activityError && activityData) {
          poolInfo.activeConnections = activityData.length;
          poolInfo.error = 'Limited pool info (pg_stat_activity fallback)';
        } else {
          poolInfo.error = 'Pool stats not available via RPC or pg_stat_activity';
        }
      }
    } catch (err) {
      poolInfo.error = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    connectionType,
    url,
    hostname,
    port,
    attempt: {
      success,
      durationMs: Date.now() - start,
      error,
      errorCode,
      details,
    },
    poolInfo,
  };
}

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey || anonKey === 'your-anon-key-here') {
    return NextResponse.json({
      error: 'Supabase not configured',
      config: {
        hasUrl: Boolean(supabaseUrl),
        hasValidAnonKey: Boolean(anonKey && anonKey !== 'your-anon-key-here'),
      },
    }, { status: 400 });
  }

  // Test the configured URL
  const primaryResult = await testConnectionType(supabaseUrl, anonKey);

  // Also test alternative connection if it's a pooler URL
  let alternativeResult: PoolerTestResult | null = null;
  
  if (primaryResult.connectionType === 'pooler') {
    // Try direct connection (port 5432)
    const directUrl = supabaseUrl.replace(/:6543(\/|$)/, ':5432$1').replace(/:6542(\/|$)/, ':5432$1');
    if (directUrl !== supabaseUrl) {
      alternativeResult = await testConnectionType(directUrl, anonKey);
    }
  } else if (primaryResult.connectionType === 'direct') {
    // Try pooler connection (port 6543)
    const poolerUrl = supabaseUrl.replace(/:5432(\/|$)/, ':6543$1');
    if (poolerUrl !== supabaseUrl) {
      alternativeResult = await testConnectionType(poolerUrl, anonKey);
    }
  }

  const results = {
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION,
    primary: primaryResult,
    alternative: alternativeResult,
    comparison: {
      primaryWorks: primaryResult.attempt.success,
      alternativeWorks: alternativeResult?.attempt.success ?? null,
      primaryFaster: alternativeResult 
        ? primaryResult.attempt.durationMs < alternativeResult.attempt.durationMs 
        : null,
      recommendation: '' as string,
    },
  };

  // Generate recommendation
  if (primaryResult.attempt.success && !alternativeResult?.attempt.success) {
    results.comparison.recommendation = `Primary ${primaryResult.connectionType} connection works. Alternative failed.`;
  } else if (!primaryResult.attempt.success && alternativeResult?.attempt.success) {
    results.comparison.recommendation = `Primary ${primaryResult.connectionType} FAILED but ${alternativeResult.connectionType} works. Switch to ${alternativeResult.connectionType} URL (port ${alternativeResult.port}).`;
  } else if (primaryResult.attempt.success && alternativeResult?.attempt.success) {
    const faster = results.comparison.primaryFaster ? 'primary' : 'alternative';
    results.comparison.recommendation = `Both work. ${faster} is faster (${faster === 'primary' ? primaryResult.attempt.durationMs : alternativeResult?.attempt.durationMs}ms).`;
  } else {
    results.comparison.recommendation = `BOTH FAILED. Check Supabase dashboard: project status, IP allowlist, connection limits, and pooler configuration.`;
  }

  const statusCode = primaryResult.attempt.success ? 200 : 503;

  return NextResponse.json(results, { 
    status: statusCode,
    headers: { 'Cache-Control': 'no-store' },
  });
}