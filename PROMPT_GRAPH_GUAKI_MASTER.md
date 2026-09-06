# GUAKI — PROMPT GRAPH ENGINEERING MASTER

Actúa como orquestador senior de GUAKI. Ejecuta este grafo de forma local, con evidencia real y sin inventar funcionalidades.

## Límites absolutos

- No tocar Vercel, producción, Supabase remoto, DNS, Git remoto, credenciales reales ni datos reales.
- No enviar WhatsApps, correos, campañas ni leads.
- No borrar datos.
- No declarar PASS por inspección o por tests unitarios aislados.
- `user_metadata.role` nunca es autoridad.
- Si falta evidencia: `NOT_VERIFIED`; si falla: `FAIL`; si falta dependencia: `BLOCKED`.

## Grafo

```text
G0 Baseline
 ├─ G1 Reproducibilidad
 ├─ G2 Supabase/RLS
 ├─ G3 Auth/Claim
 ├─ G4 Leads/Mapache
 ├─ G5 Public UX/Search/Map
 ├─ G6 Multi-country CO/VE
 ├─ G7 SEO/Analytics
 ├─ G8 Mobile/Desktop
 ├─ G9 Hermes/Strix
 └─ G10 Regression
          ↓
       G11 Local Runtime
          ↓
       G12 Local Release Gate
```

Las auditorías read-only pueden ejecutarse en paralelo. Las modificaciones deben tener un único escritor y alcance explícito. Ningún nodo dependiente avanza con un P0/P1 `FAIL` o `BLOCKED`.

## G0 — Baseline

Registrar HEAD, branch, status, diff, archivos rastreados/no rastreados, package.json, configuración sin revelar secretos, migrations, seeds, APIs, dashboards, búsqueda, mapa, WhatsApp, SEO, fallbacks y reportes históricos. La evidencia válida es HEAD + código + runtime + pruebas actuales.

## G1 — Reproducibilidad

Verificar que helpers de seguridad, migrations y tests críticos estén incluidos en el árbol versionado. Un cambio de seguridad que dependa de archivos no rastreados es `BLOCKED`.

## G2 — Supabase/RLS

Eliminar grants globales a `anon`/`authenticated`. Habilitar RLS y políticas explícitas para businesses, inquiries, reviews y events. Probar localmente Provider A/B, cliente, anónimo y admin con SELECT/INSERT/UPDATE/DELETE/RPC. No declarar PASS sin ejecutar Supabase local.

## G3 — Auth/Claim

Usar únicamente rol confiable server-side. Aplicar máquina canónica:

```text
UNCLAIMED → PENDING → CLAIMED → IN_AUDIT → APPROVED → PUBLISHED
```

Prohibir bypass administrativo sin ownership/evidencia. Mapear auth/RLS a 403 y estado inválido a 409. Ejecutar register/login/session/reload/logout/login-again en navegador fresco.

## G4 — Leads/Mapache

Mantener separado:

```text
Prospect / Provider / Business / Lead / Customer
```

Pipeline:

```text
RAW_LEAD → VALIDATED → NORMALIZED → DEDUPLICATED → COUNTRY_CLASSIFIED
→ CONTACT_VALIDATED → PROSPECT → CLAIM_INVITATION → VERIFIED_PROVIDER → PUBLISHED_BUSINESS
```

Los aproximadamente 1.200 leads de Venezuela nunca se publican automáticamente ni se envían automáticamente. Preservar fuente, hash, fecha, país, categoría, consentimiento y estado.

## G5 — UX pública

Probar HOME → SEARCH → RESULTS → FILTERS → PROFILE → PHONE → WHATSAPP → MAP → BACK → NEW SEARCH. Sin datos: `Sin datos todavía`. Sin persistencia: 503 honesto. Mapas solo con coordenadas reales. WhatsApp solo con contacto real del proveedor; nunca usar el contacto del fundador como fallback.

## G6 — Multi-country

Crear configuración estructurada para country, countryCode, currency, locale, timezone, phoneCountryCode, phoneFormat, addressFormat y language.

```text
CO: COP / es-CO / America-Bogota / +57
VE: VES / es-VE / America-Caracas / +58
```

No asumir que Colombia es el valor global. No convertir monedas sin fuente válida.

## G7 — SEO/Analytics

Verificar canonical, title, description, OG, Twitter, sitemap, robots, schema y URLs. Producción nunca puede apuntar a localhost. Solo mostrar métricas respaldadas por eventos reales; si no hay datos: `NO_DATA`.

## G8 — QA responsive

Auditar 360, 375, 390, 414, 768, 1280, 1440 y 1920. Registrar evidencia para loading, error, empty, focus, touch targets, teclado, safe areas, mapas, formularios, dashboards y overflow.

## G9 — Hermes/Strix

Hermes es auditor read-only: allowlist, working directory explícito, límites, logs sanitizados y sin deploy/borrado/migración remota. Si Strix no está disponible registrar `STRIX_NOT_AVAILABLE`; nunca fingir PASS.

## G10 — Regression

Ejecutar después de cada corrección:

```powershell
node --test tests/*.test.mjs
npx.cmd tsc --noEmit --incremental false
npm.cmd run lint
npm.cmd run build
```

Después ejecutar Supabase local, RLS, browser E2E, mobile, desktop y SEO. Tests unitarios no sustituyen runtime.

## Contrato de nodo

Cada nodo debe registrar:

```text
NODE_ID, OBJECTIVE, AGENT, SCOPE, INPUTS, FILES_READ, FILES_CHANGED,
COMMANDS_EXECUTED, TESTS_EXECUTED, EVIDENCE, STATUS, FINDINGS,
RISKS, BLOCKERS, NEXT_NODE
```

## Gate final

Estados permitidos:

```text
AUDIT_BLOCKED
REMEDIATION_REQUIRED
LOCAL_READY
STAGING_READY
PRODUCTION_READY
```

No declarar producción lista con P0/P1 abierto. Solo después de toda la evidencia:

```text
RELEASE_READY_PENDING_HUMAN_DEPLOY_AUTHORIZATION
```

Si algo crítico queda pendiente:

```text
BLOCKED — DO NOT DEPLOY
```

## Primera misión

Ejecuta ahora G0 y G1 read-only. Actualiza `GUAKI_GLOBAL_MASTER_AUDIT.md`, documenta evidencia actual y detente antes de modificar código si detectas P0/P1 no reproducible. No despliegues.
