# Supabase Connection Debug Endpoints

This directory contains three debug endpoints for diagnosing Vercel + Supabase connection issues.

## Endpoints

### 1. Full Diagnostics: `/api/debug/supabase-connection`
**Comprehensive connection analysis** with detailed logging.

**Returns:**
- DNS resolution (hostname, resolved IPs, resolution time, errors)
- Connection parameters (URL, keys, pooler detection)
- 3 connection attempts with timing, errors, stack traces
- Pool state (active/idle connections, pooler stats)
- Client health (auth config, headers)
- Network info (proxies, fetch availability)
- Summary with overall status (PASS/PARTIAL/FAIL), issues, and recommendations

**Use when:** You need full forensic detail for a failing connection.

---

### 2. Quick Check: `/api/debug/supabase-quick`
**Lightweight health check** for rapid iteration.

**Returns:**
- Config validation (URL format, key presence)
- Single DNS lookup
- 3 rapid connection attempts
- Environment info (NODE_ENV, fetch, proxies)

**Use when:** Quick verification during deployment or CI/CD.

---

### 3. Pooler vs Direct: `/api/debug/supabase-pooler`
**Compares pooler (port 6543) vs direct (port 5432) connections.**

**Returns:**
- Connection type detection
- Primary connection test with timing
- Alternative connection test (auto-detects opposite type)
- Pool info (max/active/idle connections, pool mode)
- Side-by-side comparison with recommendation

**Use when:** Suspecting pooler configuration issues or connection limits.

---

## Common Issues & What to Look For

### DNS Resolution Failures
```json
{
  "dnsResolution": {
    "error": "ENOTFOUND",
    "resolvedIPs": []
  }
}
```
**Causes:** Wrong hostname, Supabase project paused, DNS not propagating
**Fix:** Verify `NEXT_PUBLIC_SUPABASE_URL` matches Supabase dashboard exactly

### Connection Refused / Timeout
```json
{
  "connectionAttempt": [{
    "error": "ECONNREFUSED",
    "errorCode": "ECONNREFUSED"
  }]
}
```
**Causes:** Vercel IP not in Supabase allowlist, firewall, wrong port
**Fix:** Add Vercel IPs to Supabase IPv4 allowlist, try pooler port 6543

### JWT / Auth Errors
```json
{
  "connectionAttempt": [{
    "errorCode": "PGRST301",
    "error": "JWT expired"
  }]
}
```
**Causes:** Invalid/expired anon key, using service role key incorrectly
**Fix:** Regenerate anon key in Supabase dashboard, ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

### Pooler Issues
```json
{
  "pooler": {
    "connectionType": "pooler",
    "attempt": { "error": "pool timeout" },
    "poolInfo": { "activeConnections": 100, "maxConnections": 100 }
  }
}
```
**Causes:** Connection pool exhausted, pooler misconfigured
**Fix:** Switch to direct connection (port 5432), increase pool size, reduce concurrent connections

### Intermittent Failures
```json
{
  "connectionAttempt": [
    { "success": true, "durationMs": 45 },
    { "success": false, "error": "ETIMEDOUT" },
    { "success": true, "durationMs": 52 }
  ]
}
```
**Causes:** Network instability, cold starts, connection limits
**Fix:** Add retry logic, use connection pooling, warm up connections

---

## Deployment Checklist

1. **Set environment variables in Vercel:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (service role - server only!)

2. **Configure Supabase:**
   - Dashboard → Settings → Database → Connection Pooling → Enable
   - Dashboard → Settings → API → Allow client connections from: Add Vercel IPs
   - Dashboard → Settings → Database → Network Restrictions → Allow 0.0.0.0/0 (or specific Vercel IPs)

3. **Test after deploy:**
   ```
   GET https://your-app.vercel.app/api/debug/supabase-connection
   GET https://your-app.vercel.app/api/debug/supabase-pooler
   ```

4. **Monitor in production:**
   - Check `/api/debug/supabase-quick` periodically
   - Set up alerts on 503 responses
   - Log connectionAttempt.durationMs for latency tracking

---

## Response Format Guide

### Overall Status
| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| `PASS` | 200 | All checks healthy |
| `PARTIAL` | 206 | Connected but with warnings |
| `FAIL` | 503 | Cannot connect |

### Error Codes Reference
| Code | Meaning |
|------|---------|
| `CONFIG_MISSING` | Env vars not set |
| `ENOTFOUND` | DNS resolution failed |
| `ECONNREFUSED` | TCP connection refused |
| `ETIMEDOUT` | Connection timeout |
| `PGRST301` | JWT validation failed |
| `42P01` | Table doesn't exist |
| `28000` | Invalid authorization |
| `53300` | Too many connections |

---

## Adding Custom Tests

Extend the POST endpoint on `/api/debug/supabase-connection`:

```typescript
POST /api/debug/supabase-connection
{
  "testQuery": "id, name, city",
  "customHeaders": { "x-custom": "value" },
  "attempts": 5
}
```

Returns detailed per-attempt timing for custom queries.