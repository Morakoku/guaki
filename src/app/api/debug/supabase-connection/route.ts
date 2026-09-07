export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dns from 'dns/promises';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Type for detailed connection diagnostics
interface ConnectionDiagnostics {
  timestamp: string;
  environment: string;
  vercelRegion: string | undefined;
  dnsResolution: {
    supabaseUrl: string | undefined;
    hostname: string | undefined;
    resolvedIPs: string[];
    dnsError: string | null;
    dnsResolutionTimeMs: number;
  };
  connectionParams: {
    url: string | undefined;
    hasAnonKey: boolean;
    anonKeyPrefix: string | undefined;
    serviceRoleKeyPresent: boolean;
    poolingEnabled: boolean;
    poolerPort: number | undefined;
    directPort: number | undefined;
  };
  connectionAttempt: {
    attemptNumber: number;
    timestamp: string;
    connectionTimeMs: number;
    success: boolean;
    error: string | null;
    errorCode: string | undefined;
    errorDetails: unknown;
    stackTrace: string | undefined;
  }[];
  poolState: {
    initialized: boolean;
    activeConnections: number | undefined;
    idleConnections: number | undefined;
    waitingRequests: number | undefined;
    totalConnections: number | undefined;
    poolError: string | null;
  };
  clientHealth: {
    authConfig: {
      persistSession: boolean;
      autoRefreshToken: boolean;
    };
    globalHeaders: Record<string, string> | undefined;
  };
  networkInfo: {
    httpProxy: string | undefined;
    httpsProxy: string | undefined;
    noProxy: string | undefined;
    fetchAvailable: boolean;
  };
  summary: {
    overallStatus: 'PASS' | 'FAIL' | 'PARTIAL';
    issues: string[];
    recommendations: string[];
  };
}

function extractHostname(url: string): string | null {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return null;
  }
}

function extractPortFromUrl(url: string): number | undefined {
  try {
    const u = new URL(url);
    if (u.port) return parseInt(u.port, 10);
    return u.protocol === 'https:' ? 443 : u.protocol === 'http:' ? 80 : undefined;
  } catch {
    return undefined;
  }
}

function detectPoolerConfig(url: string): { poolingEnabled: boolean; poolerPort: number | undefined; directPort: number | undefined } {
  const hostname = extractHostname(url) || '';
  const port = extractPortFromUrl(url);
  
  // Supabase pooler typically uses port 6543 (transaction) or 5432 (session)
  // Direct connections use 5432
  const isPooler = hostname.includes('pooler') || port === 6543 || port === 6542;
  
  return {
    poolingEnabled: isPooler,
    poolerPort: isPooler ? port : undefined,
    directPort: !isPooler ? port : undefined,
  };
}

async function attemptDnsResolution(hostname: string): Promise<{ ips: string[]; error: string | null; durationMs: number }> {
  const start = Date.now();
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    const ips = addresses.map(a => a.address);
    return { ips, error: null, durationMs: Date.now() - start };
  } catch (err) {
    return { ips: [], error: err instanceof Error ? err.message : String(err), durationMs: Date.now() - start };
  }
}

async function testConnection(url: string, anonKey: string, attemptNumber: number): Promise<ConnectionDiagnostics['connectionAttempt'][0]> {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Create a client with minimal config to test raw connection
    const client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        fetch: fetch.bind(globalThis),
      },
    });

    // Test with a simple query that doesn't require auth
    const { data, error } = await client.from('businesses').select('id').limit(1);
    
    const durationMs = Date.now() - start;
    
    if (error) {
      return {
        attemptNumber,
        timestamp,
        connectionTimeMs: durationMs,
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details || error.hint || null,
        stackTrace: new Error().stack,
      };
    }

    return {
      attemptNumber,
      timestamp,
      connectionTimeMs: durationMs,
      success: true,
      error: null,
      errorCode: undefined,
      errorDetails: null,
      stackTrace: undefined,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      attemptNumber,
      timestamp,
      connectionTimeMs: durationMs,
      success: false,
      error: error.message,
      errorCode: (err as any)?.code,
      errorDetails: (err as any)?.details || (err as any)?.hint || null,
      stackTrace: error.stack,
    };
  }
}

async function getPoolState(url: string, anonKey: string): Promise<ConnectionDiagnostics['poolState']> {
  try {
    const client = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Try to get pool info via pg_stat_activity or similar
    let rpcData: any = null;
    let rpcError: any = null;
    try {
      const result = await client.rpc('get_pool_stats');
      rpcData = result.data;
      rpcError = result.error;
    } catch {
      rpcError = new Error('RPC not available');
    }
    
    if (!rpcError && rpcData) {
      return {
        initialized: true,
        activeConnections: rpcData.active_connections,
        idleConnections: rpcData.idle_connections,
        waitingRequests: rpcData.waiting_requests,
        totalConnections: rpcData.total_connections,
        poolError: null,
      };
    }

    // Fallback: try direct query
    let poolData: any = null;
    let poolError: any = null;
    try {
      const result = await client
        .from('pg_stat_activity')
        .select('state', { count: 'exact', head: true });
      poolData = result.data;
      poolError = result.error;
    } catch {
      poolError = new Error('pg_stat_activity not accessible');
    }

    return {
      initialized: true,
      activeConnections: poolData ?? undefined,
      idleConnections: undefined,
      waitingRequests: undefined,
      totalConnections: undefined,
      poolError: poolError ? poolError.message : 'Pool state not available via standard queries',
    };
  } catch (err) {
    return {
      initialized: false,
      activeConnections: undefined,
      idleConnections: undefined,
      waitingRequests: undefined,
      totalConnections: undefined,
      poolError: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET(request: Request) {
  const diagnostics: ConnectionDiagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercelRegion: process.env.VERCEL_REGION,
    dnsResolution: {
      supabaseUrl: undefined,
      hostname: undefined,
      resolvedIPs: [],
      dnsError: null,
      dnsResolutionTimeMs: 0,
    },
    connectionParams: {
      url: undefined,
      hasAnonKey: false,
      anonKeyPrefix: undefined,
      serviceRoleKeyPresent: false,
      poolingEnabled: false,
      poolerPort: undefined,
      directPort: undefined,
    },
    connectionAttempt: [],
    poolState: {
      initialized: false,
      activeConnections: undefined,
      idleConnections: undefined,
      waitingRequests: undefined,
      totalConnections: undefined,
      poolError: null,
    },
    clientHealth: {
      authConfig: {
        persistSession: false,
        autoRefreshToken: false,
      },
      globalHeaders: undefined,
    },
    networkInfo: {
      httpProxy: process.env.HTTP_PROXY,
      httpsProxy: process.env.HTTPS_PROXY,
      noProxy: process.env.NO_PROXY,
      fetchAvailable: typeof fetch !== 'undefined',
    },
    summary: {
      overallStatus: 'FAIL',
      issues: [],
      recommendations: [],
    },
  };

  // 1. Capture connection parameters
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  diagnostics.connectionParams = {
    url: supabaseUrl,
    hasAnonKey: Boolean(anonKey && anonKey !== 'your-anon-key-here'),
    anonKeyPrefix: anonKey ? `${anonKey.substring(0, 20)}...` : undefined,
    serviceRoleKeyPresent: Boolean(serviceRoleKey),
    ...detectPoolerConfig(supabaseUrl || ''),
  };

  // 2. DNS Resolution
  if (supabaseUrl) {
    const hostname = extractHostname(supabaseUrl);
    diagnostics.dnsResolution.hostname = hostname || undefined;
    diagnostics.dnsResolution.supabaseUrl = supabaseUrl;
    
    if (hostname) {
      const dnsResult = await attemptDnsResolution(hostname);
      diagnostics.dnsResolution.resolvedIPs = dnsResult.ips;
      diagnostics.dnsResolution.dnsError = dnsResult.error;
      diagnostics.dnsResolution.dnsResolutionTimeMs = dnsResult.durationMs;
    }
  }

  // 3. Connection Attempts (multiple attempts to detect transient issues)
  if (supabaseUrl && anonKey && anonKey !== 'your-anon-key-here') {
    for (let i = 1; i <= 3; i++) {
      const attempt = await testConnection(supabaseUrl, anonKey, i);
      diagnostics.connectionAttempt.push(attempt);
      
      // Small delay between attempts
      if (i < 3) await new Promise(r => setTimeout(r, 100));
    }
  } else {
    diagnostics.connectionAttempt.push({
      attemptNumber: 0,
      timestamp: new Date().toISOString(),
      connectionTimeMs: 0,
      success: false,
      error: 'Missing or invalid Supabase configuration',
      errorCode: 'CONFIG_MISSING',
      errorDetails: {
        hasUrl: Boolean(supabaseUrl),
        hasAnonKey: Boolean(anonKey && anonKey !== 'your-anon-key-here'),
        urlValid: supabaseUrl?.startsWith('https://') ?? false,
      },
      stackTrace: new Error().stack,
    });
  }

  // 4. Pool State
  if (supabaseUrl && anonKey && anonKey !== 'your-anon-key-here') {
    diagnostics.poolState = await getPoolState(supabaseUrl, anonKey);
  }

  // 5. Client Health
  if (supabaseUrl && anonKey) {
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    diagnostics.clientHealth = {
      authConfig: {
        persistSession: false,
        autoRefreshToken: false,
      },
      globalHeaders: (client as any)._globalHeaders,
    };
  }

  // 6. Generate Summary
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check DNS
  if (diagnostics.dnsResolution.dnsError) {
    issues.push(`DNS resolution failed: ${diagnostics.dnsResolution.dnsError}`);
    recommendations.push('Check if Supabase hostname is correct and DNS is accessible from Vercel');
  } else if (diagnostics.dnsResolution.resolvedIPs.length === 0) {
    issues.push('DNS resolved but returned no IPs');
    recommendations.push('Verify Supabase project is active and not paused');
  }

  // Check config
  if (!diagnostics.connectionParams.hasAnonKey) {
    issues.push('Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY');
    recommendations.push('Add NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables');
  }
  if (!diagnostics.connectionParams.url?.startsWith('https://')) {
    issues.push('Invalid or missing NEXT_PUBLIC_SUPABASE_URL');
    recommendations.push('Ensure NEXT_PUBLIC_SUPABASE_URL is set to https://your-project.supabase.co');
  }

  // Check connection attempts
  const successfulAttempts = diagnostics.connectionAttempt.filter(a => a.success).length;
  const failedAttempts = diagnostics.connectionAttempt.filter(a => !a.success).length;
  
  if (failedAttempts > 0 && successfulAttempts === 0) {
    const firstError = diagnostics.connectionAttempt.find(a => !a.success);
    issues.push(`All connection attempts failed: ${firstError?.error}`);
    
    if (firstError?.errorCode === 'PGRST301' || firstError?.error?.includes('JWT')) {
      recommendations.push('Check if anon key is valid and not expired');
    } else if (firstError?.error?.includes('ECONNREFUSED') || firstError?.error?.includes('ENOTFOUND')) {
      recommendations.push('Network connectivity issue - check Vercel firewall/region restrictions');
    } else if (firstError?.error?.includes('pool') || firstError?.error?.includes('pooler')) {
      recommendations.push('Connection pooler issue - try direct connection on port 5432 or check pooler config');
    } else if (firstError?.error?.includes('SSL') || firstError?.error?.includes('TLS')) {
      recommendations.push('SSL/TLS issue - ensure Supabase requires SSL and Vercel supports it');
    } else {
      recommendations.push('Check Supabase dashboard for connection limits, IP allowlist, and project status');
    }
  } else if (failedAttempts > 0 && successfulAttempts > 0) {
    issues.push(`Intermittent connection failures (${failedAttempts}/${diagnostics.connectionAttempt.length} failed)`);
    recommendations.push('Transient network issues - consider retry logic or connection pooling');
  }

  // Check pool state
  if (diagnostics.poolState.poolError && !diagnostics.poolState.initialized) {
    issues.push(`Pool state check failed: ${diagnostics.poolState.poolError}`);
  }

  // Determine overall status
  if (issues.length === 0 && successfulAttempts > 0) {
    diagnostics.summary.overallStatus = 'PASS';
  } else if (successfulAttempts > 0) {
    diagnostics.summary.overallStatus = 'PARTIAL';
  } else {
    diagnostics.summary.overallStatus = 'FAIL';
  }

  diagnostics.summary.issues = issues;
  diagnostics.summary.recommendations = recommendations;

  // Return appropriate status code
  const statusCode = diagnostics.summary.overallStatus === 'PASS' ? 200 : 
                     diagnostics.summary.overallStatus === 'PARTIAL' ? 206 : 503;

  return NextResponse.json(diagnostics, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}

// Also support POST for more detailed testing with custom params
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { testQuery, customHeaders, attempts = 3 } = body;

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

    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: customHeaders },
    });

    const results = [];
    for (let i = 1; i <= attempts; i++) {
      const start = Date.now();
      try {
        let query = client.from('businesses').select(testQuery || 'id').limit(1);
        const { data, error } = await query;
        
        results.push({
          attempt: i,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - start,
          success: !error,
          error: error?.message,
          errorCode: error?.code,
          rowCount: data?.length ?? 0,
        });
      } catch (err) {
        results.push({
          attempt: i,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - start,
          success: false,
          error: err instanceof Error ? err.message : String(err),
          errorCode: (err as any)?.code,
        });
      }
      if (i < attempts) await new Promise(r => setTimeout(r, 50));
    }

    return NextResponse.json({
      summary: {
        totalAttempts: attempts,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        avgDurationMs: results.reduce((a, b) => a + b.durationMs, 0) / results.length,
      },
      results,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}