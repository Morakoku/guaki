# AUDITORIA CODIGO v2 — Rutas criticas de Guaki
Fecha: 2026-09-11
Asignado: ai-code-auditor
Read-only. NO modificaciones de codigo ni despliegue.

## Alcance auditado
- src/middleware.ts
- src/lib/supabase.ts
- src/lib/analytics.ts
- src/lib/notifications.ts
- src/lib/validation.ts
- src/lib/provider_faq.ts
- src/lib/authorization.ts
- src/lib/business_store.ts
- src/lib/provider_directory.mjs
- src/lib/public_inventory_contract.mjs
- src/lib/event_bus.ts
- src/lib/mapacheClient.ts
- src/lib/veyra_store.ts
- src/lib/veyra_enterprise_leads.ts
- src/lib/search_intent.mjs
- src/lib/mapache_activation.mjs
- src/lib/mapache_discovery_readiness.mjs
- src/lib/command_center_hardening.mjs
- src/lib/command_center_pending.mjs
- src/app/api/** (todas las rutas)

## Hallazgos (15 maximo, ordenados por severidad)

### 1. CRITICO — SQL Injection por string interpolation en getBusinessById/getBusinessByIdWithToken
- **Tipo:** Correctness / Seguridad
- **Archivo:** src/lib/supabase.ts:300, 341
- **Evidencia:** Las funciones `getBusinessById` (linea 300) y `getBusinessByIdWithToken` (linea 341) construyen consultas con template literals interpolando directamente el parametro `id` del usuario sin sanitizacion:
  ```ts
  .or(`id.eq.${id},slug.eq.${id}`)
  ```
  El parametro `id` proviene de `params.id` en src/app/api/businesses/[id]/route.ts (linea 57, 180, etc.) y puede contener caracteres especiales de Supabase PostgREST. Un atacante puede inyectar `id=123,or,slug.eq.xxx` u otros operadores PostgREST para manipular la consulta, potencialmente accediendo a registros que no deberia o causando errores de logica.
- **Fix propuesto:** Usar parametros de consulta con `.in()` o construir el filtro con `or()` pasando un array, o validar `id` contra un regex de slug/ID antes de interpolar. En PostgRST, usar `.or('id.eq.xxx,slug.eq.xxx')` con valores escapados o usar `.match()` con objeto.

### 2. CRITICO — IDOR en PATCH /api/businesses/[id]: acceso a negocios ajenos cuando ownerId es NULL
- **Tipo:** Seguridad / Permisos
- **Archivo:** src/app/api/businesses/[id]/route.ts:184-191
- **Evidencia:** La logica de control de acceso en el handler PATCH (lineas 184-191) es:
  ```ts
  if (
    actor.user.app_metadata?.role !== 'admin' &&
    accessibleBusiness.ownerId &&        // <-- short-circuit: si ownerId es null/undefined, esta condicion es FALSE
    accessibleBusiness.ownerId !== actor.user.id &&
    accessibleBusiness.ownerEmail !== actor.user.email
  ) { return 403; }
  ```
  Si un negocio tiene `ownerId` en NULL (no reclamado o sin propietario), la condicion `accessibleBusiness.ownerId &&` corta la evaluacion a `false`, permitiendo que CUALQUIER proveedor autenticado modifique el negocio. Esto es una violacion de acceso (IDOR) critica.
- **Fix propuesto:** Cambiar la logica a: `if (role !== 'admin' && (ownerId === null || (ownerId !== userId && ownerEmail !== userEmail)))` — es decir, negar el acceso tambien cuando ownerId es NULL, requiriendo que el proveedor sea el owner verdadero.

### 3. ALTO — Cualquier usuario autenticado puede convertirse en provider sin verificacion
- **Tipo:** Seguridad / Autorizacion
- **Archivo:** src/app/api/provider/provision/route.ts:12-58
- **Evidencia:** La ruta POST `/api/provider/provision` asigna el rol `provider` a CUALQUIER usuario autenticado que tenga rol `client`, usando la `SUPABASE_SERVICE_ROLE_KEY`. No hay verificacion de que el usuario haya pasado un proceso de validacion, verificacion de email, o que posea un negocio reclamado. Un atacante con una cuenta de cliente puede elevar privilegios a provider y acceder a rutas protegidas como `/provider` y `/mi-negocio`.
- **Fix propuesto:** Agregar una verificacion previa: el usuario debe haber validado su email y/o tener al menos un negocio reclamado (claim_status='pending' o 'verified') antes de permitir el provisionamiento del rol.

### 4. ALTO — Filtrado de URLs en IndexNow permite subdominios arbitrarios de .vercel.app
- **Tipo:** Seguridad / Open Relay
- **Archivo:** src/app/api/seo/indexnow/route.ts:27
- **Evidencia:** La validacion de URLs permite cualquier hostname que termine en `.vercel.app`:
  ```ts
  return parsed.hostname === host || parsed.hostname === 'localhost' || 
         parsed.hostname === 'guaki.co' || parsed.hostname.endsWith('.vercel.app');
  ```
  Un atacante puede usar URLs de terceros desplegados en Vercel (`.vercel.app` de otros proyectos) para notificar URLs ajenas a Bing/Yandex IndexNow, potencialmente usando la reputacion de Guaki para indexar contenido ajeno.
- **Fix propuesto:** Restringir a `guakiweb.vercel.app` exactamente, o a un conjunto explicito de hostnames permitidos (guaki.co, guakiweb.vercel.app). No usar `endsWith('.vercel.app')`.

### 5. ALTO — Credenciales SMTP enviadas al proxy Mapache sin encriptacion de canal verificada
- **Tipo:** Seguridad / Fugas de credenciales
- **Archivo:** src/app/api/command-center/email-account/route.ts:33-57
- **Evidencia:** La ruta recibe `smtp_password` en el cuerpo del request (linea 33) y lo reenvia directamente al proxy Mapache API via `JSON.stringify(payload)` (linea 53). Aunque Mapache debe estar en localhost (verificado en linea 13 con `safeMapacheUrl()`), si `MAPACHE_API_URL` se configura con un hostname remoto que no sea localhost (la funcion `safeMapacheUrl` lo banea, pero `MAPACHE_API` se usa directamente en algunos lugares), las credenciales SMTP se exponian. Adicionalmente, la ruta no valida el origen ni requiere autenticacion admin.
- **Fix propuesto:** Requerir autenticacion admin, validar HTTPS, y no aceptar `smtp_password` como texto plano en el request — usar un flujo de redireccion a Mapache directamente desde el cliente.

### 6. ALTO — Fugas de PII en respuestas de la API de negocios (admin) sin Cache-Control privado
- **Tipo:** Seguridad / Fugas de datos
- **Archivo:** src/app/api/admin/audit/route.ts:30-34
- **Evidencia:** La ruta GET `/api/admin/audit` retorna la lista completa de negocios con todos los campos incluyendo `ownerEmail`, `ownerId`, `auditNotes` (linea 30-34 en `getBusinessesWithToken` → `mapSupabaseRowToBusiness` mapea todos los campos). La respuesta NO incluye header `Cache-Control: private, no-store`, lo que podria permitir que un proxy intermedio cachee datos sensibles.
- **Fix propuesto:** Agregar `Cache-Control: no-store, private` a todas las respuestas de rutas admin y de negocios autenticadas.

### 7. ALTO — Datos de pipeline comercial y valores de negocio expuestos en /api/command-center/trinidad/routing
- **Tipo:** Seguridad / Fugas de datos
- **Archivo:** src/app/api/command-center/trinidad/routing/route.ts:27-171
- **Evidencia:** La ruta GET retorna `dealValue` (valores de negocio en USD) y datos de leads enterprise (nombre, email, telefono) en el fallback cuando Mapache no responde (lineas 27-40, 143-156). Aunque la ruta esta bloqueada en produccion por el middleware (devuelve 404), el codigo contiene hardcoded datos sensibles de clientes reales (empleados, clinicas) que podrian exponerse si el bloqueo falla.
- **Fix propuesto:** No incluir datos sensibles en el codigo fuente. Usar datos mock sin PII para fallbacks.

### 8. MEDIO — Inyeccion de metadatos en /api/analytics/event sin esquema
- **Tipo:** Seguridad / Integridad de datos
- **Archivo:** src/app/api/analytics/event/route.ts:32-51
- **Evidencia:** El campo `metadata` es un objeto libre (`Record<string, any>`) que se persiste directamente en `public.events` sin validacion de esquema. Aunque hay un limite de 4096 bytes (linea 38), no hay validacion de profundidad, tipos anidados, o propiedades peligrosas. Un atacante podria inyectar objetos muy profundos (ReDoS en JSON.stringify) o claves como `__proto__` o `constructor`.
- **Fix propyesto:** Definir un esquema estricto para metadata (whitelist de keys, profundidad maxima, sanitizar claves `__proto__`/`constructor`).

### 9. MEDIO — Sin Cache-Control en rutas que retornan datos sensivos (session, veyra)
- **Tipo:** Seguridad / Privacidad
- **Archivo:** src/app/api/auth/session/route.ts, src/app/api/veyra/intake/route.ts, src/app/api/veyra/diagnostics/[id]/route.ts, src/app/api/veyra/projects/[token]/route.ts
- **Evidencia:** Estas rutas retornan datos sensibles (emails, tokens, reportes de diagnostico) pero no establecen `Cache-Control: no-store`, lo que podria permitir que proxies o CDNs cacheen respuestas con PII.
- **Fix propuesto:** Agregar `Cache-Control: no-store` a todas las respuestas de estas rutas.

### 10. MEDIO — Token de Veyra proyectos predecible (UUID como token de acceso)
- **Tipo:** Seguridad / Autenticacion
- **Archivo:** src/lib/veyra_store.ts:223-228
- **Evidencia:** Los tokens de proyecto (`/api/veyra/projects/[token]`) son comparados por igualdad exacta contra `p.token === token`. Si estos tokens son generados con UUIDs predecibles o incrementalmente (los IDs de intake usan `INTK-001`, `INTK-002`, etc. — linea 116), un atacante podria adivinar tokens. Ademas, el endpoint PATCH `/approve` no requiere autenticacion admin (solo el token del proyecto).
- **Fix propuesto:** Usar UUIDs criptograficamente aleatorios para tokens, y requerir autenticacion admin para mutaciones (POST/PATCH).

### 11. MEDIO — Duplicacion de llamadas getUser en endpoints de negocios
- **Tipo:** Rendimiento / Deuda tecnica
- **Archivo:** src/app/api/businesses/[id]/route.ts:55,80-81,175,218
- **Evidencia:** En el handler GET, `getSupabaseClient().auth.getUser(token)` se llama 3 veces: linea 55 (validacion), linea 80 (obtener userId para PII stripping), linea 81 (obtener role). En PATCH, se llama en linea 175 y nuevamente en linea 218 para `audit_decision`. Cada llamada es una request HTTP al servidor de auth de Supabase, triplicando la latencia.
- **Fix propuesto:** Reutilizar el objeto `actor` de la primera llamada; extraer `userId` y `role` de `actor.data.user` directamente.

### 12. MEDIO — Email de propietario derivado de token usado como fallback de identidad en claim
- **Tipo:** Seguridad / Logica de negocio
- **Archivo:** src/app/api/businesses/[id]/claim/route.ts:19,33
- **Evidencia:** En `resolveActor` (linea 19), `email: data.user.email || email` — si el usuario autenticado no tiene email, se usa el email proporcionado en el cuerpo del request. Esto permite que un proveedor sin email asocie cualquier email a un reclamo. Aunque la RPC `claim_business` usa el token del usuario para identidad, el email del cuerpo podria ser cualquiera.
- **Fix propuesto:** Exigir que `data.user.email` este presente (rechazar con 403 si el usuario autenticado no tiene email verificado).

### 13. BAJO — Validacion de email y telefono ausente en intake de Veyra
- **Tipo:** Correctness / Deuda tecnica
- **Archivo:** src/app/api/veyra/intake/route.ts:29,40
- **Evidencia:** La ruta POST solo valida `name`, `email`, `company_name` (linea 29) pero no valida formato de email, telefono, ni sanitiza los campos. El telefono se almacena directamente (linea 40: `phone: payload.phone || ''`). No hay limite de longitud en campos como `goal`, `bottleneck`, `systems`.
- **Fix propuesto:** Agregar validacion de formato de email (regex), sanitizacion de string, y limites de longitud.

### 14. BAJO — Regex de amenazas perimetrales incompleto (middleware)
- **Tipo:** Seguridad / Deuda tecnica
- **Archivo:** src/middleware.ts:17
- **Evidencia:** El THREAT_REGEX detecta patrones comunes pero no bloquea XSS sin `<script` (ej. `<img onerror=...>`, `<iframe>`, event handlers `onload=`/`onerror=`), ni SQLi clasico sin UNION (ej. `OR 1=1`, `SELECT...FROM`), ni `data:text/html` URIs, ni `.php` probes. La deteccion es pura defensa en profundidad.
- **Fix propuesto:** Ampliar el regex o usar una libreria de deteccion de amenazas mas robusta.

### 15. BAJO — Cliente Supabase cacheado con singletons en serverless (SSR)
- **Tipo:** Correctness / Deuda tecnica
- **Archivo:** src/lib/supabase.ts:8,27-36
- **Evidencia:** `getSupabaseClient()` cachea el cliente en `cachedClient` (linea 28). En entornos serverless (Vercel), el singleton persiste entre invocaciones, lo cual puede causar problemas con tokens de acceso expirados si se reutiliza el cliente con un token antiguo. Aunque `getSupabaseClientForAccessToken` crea un cliente nuevo por token (correcto), `getSupabaseClient()` reutiliza el cliente anon cached, lo cual es seguro para lecturas pero podria enmascarar problemas de configuracion entre invocaciones.
- **Fix propuesto:** Considerar no cachear el cliente anon en serverless, o invalidar el cache cuando cambian las env vars.
