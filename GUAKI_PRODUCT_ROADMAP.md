# GUAKI — Product Roadmap

This roadmap is derived from the local master audit. It prioritizes real product capability over visual completeness.

## NOW — unblock trust and core usage

1. Finish explicit development-only auth configuration and add route-level owner/role tests around the new production fail-closed behavior.
2. Finish wiring dashboard authentication plus edit → audit → publish to the locally proven Supabase persistence/RLS contract, then repeat the same evidence against the intended remote environment.
3. Finish claim → edit → audit → publish with owner-scoped authorization.
4. Run a local Strix scan after Docker and LLM prerequisites are configured.
5. Add reliable error/empty/loading feedback to search, provider, admin and Command Center actions.
6. Complete the mobile smoke matrix for search, profile and WhatsApp contact.

**Local P0 status:** RLS and ownership are implemented locally; provider create/claim persistence is wired at the API layer. Dashboard auth and edit/audit/publish remain open. Do not connect production until the application uses this contract end to end and the same matrix passes remotely.

## PERSISTENCE & AUTH MIGRATION

- **Simulated found:** `localStorage` identity/business records, `BusinessStore` memory, demo/static provider fallbacks and incomplete admin transitions.
- **Connected in this loop:** Supabase Auth session cookie, provider create/claim/edit/audit API paths, ownership mapping, draft enforcement and configured public profile reads.
- **Still pending:** browser lifecycle proof, reviews/inquiries/events, admin dashboard source and deletion of superseded fallback code.
- **Evidence:** `docs/PERSISTENCE_SIMULATION_INVENTORY.md`, `tests/real-auth-session.test.mjs`, 95 Node tests PASS, local RLS matrix, TypeScript PASS; lint remains BLOCKED by Windows `.next/cache/eslint` EPERM.

## NEXT — make the marketplace measurable

1. Store real profile/contact/review events with tenant and provider scope.
2. Connect provider metrics to those events; never show decorative counters.
3. Define consent-aware analytics events and UTM attribution.
4. Make domain/canonical/sitemap configuration environment-driven.
5. Validate indexable provider/category pages for unique content, canonical URLs and schema.
6. Add moderation and provenance for reviews, photos and business claims.

## LATER — competitive differentiation

1. Add booking only with a real availability/payment contract.
2. Add provider self-service profile blocks with mandatory-field protection.
3. Build category/city landing pages from verified supply, avoiding thin-content generation.
4. Improve ranking with transparent, evidence-backed signals.
5. Add benchmark dashboards and controlled experiments after event data is trustworthy.

## P1.1 latest execution status — 2026-08-22

- Docker/Supabase local: PASS.
- Local RLS matrix for businesses, inquiries, reviews and events: PASS.
- Auth demo removal from real login/session path: PASS.
- Token-aware inquiry/review/event persistence: PASS at service/API contract level.
- Real admin audit API: PASS at API contract level.
- Workflow protection trigger: PASS locally; non-admin publication/status tampering is rejected.
- Advisors: PASS with no local security findings.
- Node tests: 99/99 PASS; TypeScript PASS; lint PASS with three non-blocking image warnings.
- Browser E2E, dashboard UI source migration and production/remote verification: BLOCKED/PENDING.

The roadmap must not mark P1.1 complete until those remaining items have direct evidence.

## Definition of done for production

- Real authentication and authorization.
- Durable persistence and tested RLS in the application flows, not only through direct local PostgREST checks.
- Search → profile → contact works after reload.
- Provider cannot access another provider's data.
- Security scan has a completed run and remediated findings.
- Mobile smoke matrix passes.
- SEO domain, sitemap, metadata and schema are verified on the intended domain.
- Analytics events are consent-aware and backed by real data.

## P1.2 — E2E real y persistencia (2026-08-22)

- Estado local: PASS operativo con Docker/Supabase, Auth, persistencia, administración y publicación verificadas en navegador.
- Suite: 103/103 PASS; typecheck PASS; lint PASS con 3 warnings preexistentes de imágenes; advisors de Supabase local sin hallazgos.
- Admin ya no usa fixture ni localStorage como fuente de negocios; consume API/Supabase.
- Proveedor A persistió, sobrevivió reload/nueva sesión y fue aprobado/publicado por admin.
- Proveedor B no ve datos de A; cliente con rol `client` no entra al dashboard de proveedor.
- La variante incógnito y producción quedan `UNKNOWN/NOT_ASSESSED` por alcance.
- Evidencia completa: `GUAKI_P1_2_E2E_REPORT.md`.

## P1.1 — Revalidación del plan adjunto (2026-08-22)

**Estado:** `COMPLETE_LOCAL / PRODUCTION_NOT_ASSESSED`

La revalidación actual confirma:

- Docker/Supabase local: PASS; DB, Auth, REST, Kong y Studio activos.
- Auth real y cookies httpOnly: PASS; no se reintrodujeron usuarios demo en el flujo real.
- Persistencia de businesses, inquiries, reviews y events: PASS por contratos de servicio/API y matriz local previa.
- Ownership/RLS y workflow DB: PASS; proveedor A/B aislados, cliente limitado y admin separado.
- Estados críticos y claim duplicado: protegidos por API, RLS y trigger/RPC local.
- Suite Node: 103/103 PASS.
- TypeScript: PASS.
- Lint: PASS con 3 warnings preexistentes de `<img>`.
- `supabase db advisors --local --type security --level warn --fail-on none`: sin hallazgos.

El reporte histórico conserva el estado anterior de P1.1; la evidencia posterior de cierre E2E está en `GUAKI_P1_2_E2E_REPORT.md`. No se ejecutó producción, Vercel, Supabase remoto ni deploy. No se avanza automáticamente a una nueva fase.

## P2 — SEO, SEM y benchmark (2026-08-22)

**Estado:** `INCOMPLETE / LOCAL_READY_FOR_PRODUCTION_REVIEW`

Completado localmente: auditoría SEO, metadata configurable, canónicos, Open Graph/Twitter, sitemap y robots dinámicos, JSON-LD condicionado a evidencia, hubs de categoría/ciudad, mapa de enlaces internos, preparación SEM y benchmark de directorios.

Pendiente: smoke responsive y visual completo, build limpio sin procesos concurrentes, configuración verificable de dominio, GA4/GSC/Ads y cualquier campaña real. No se declara `PRODUCTION_READY` ni se ejecuta deploy hasta contar con esas evidencias.

## P2.1 / P2.2 — Cierre local (2026-08-22)

**Estado:** `P2_INCOMPLETE`

Build, tests, TypeScript, lint, rutas SEO, sitemap, robots, structured data base y responsive local fueron verificados. El sitemap quedó dinámico para no congelar perfiles antiguos. Sigue pendiente la verificación de un perfil realmente publicado con su CTA de contacto y toda configuración SEO/SEM externa. Evidencia: `GUAKI_P2_CLOSURE_REPORT.md`.

## P2.2 closure gate — 2026-08-22

**Status: `P2_BLOCKED`.** The remaining trust gate is the real lifecycle: provider save/reload contact proof → claim → admin verification → publish → public profile → WhatsApp CTA E2E. The local QA record is intentionally still draft; no production or external contact action was taken. P3 functional agent work remains gated until `P2_COMPLETE_LOCAL`.

## P2.3 publication gate — 2026-08-22

- **Completed:** corrected the actual public-profile 404; direct public profile now renders persisted published QA data and the correct WhatsApp target; 107 local tests pass.
- **Still blocked:** fresh provider save/reload contact proof, real admin authentication, claim/audit/publish E2E for a new QA record, live RLS matrix and no-WhatsApp case.
- **P3:** remains gated and was not started.

## P2.3 final recheck — 2026-08-22

**Estado: `P2_BLOCKED`.** La corrección de perfil público ahora está verificada: los slugs recién publicados consultan Supabase directamente, renderizan dinámicamente y devuelven 200; el perfil con WhatsApp conserva el target persistido y el perfil sin WhatsApp no muestra CTA. Se eliminaron bypass de dev-admin y se aplicó aislamiento de lectura del proveedor.

Evidencia adicional: flujo HTTP local real con Provider A/B/N y Admin autenticados; creación 201, auditoría 200, publicación 200; A→B GET 404; autopublicación 403; escrituras cruzadas rechazadas por RLS; 108/108 tests, typecheck y build PASS, lint PASS con warnings preexistentes.

Sigue bloqueado el cierre porque falta E2E de navegador fresco, claim separado de un registro no reclamado y mapeo HTTP explícito 403 para algunos rechazos RLS. Ver `GUAKI_P2_3_FINAL_CLOSURE_REPORT.md`.

## P2.3 continuation — 2026-08-23

**Estado sigue: `P2_BLOCKED`.**

### Nuevas verificaciones

- Usuario QA nuevo autenticó en navegador fresco.
- Desde el dashboard fresco se guardaron nombre, dirección y WhatsApp; la ficha pasó a 75% y el enlace público se generó. La lectura exacta del valor tras recarga quedó inconclusa y no se declara PASS por inspección visual.
- Se detectó y corrigió el trigger local que rechazaba el RPC legítimo de claim con `PROTECTED_WORKFLOW_FIELDS`. La corrección está documentada en `supabase/local_p2_3_claim_guard_fix.sql` y aplicada únicamente a Supabase local.
- Claim del fixture nuevo `GKI-P2-3-UNCLAIMED-2-20260822` respondió `200` después del guard fix.
- El nuevo control de autorización exige sesión/rol real y devuelve 403 para cliente o negocio no accesible antes de intentar la escritura.
- Suite Node final de esta iteración: **109/109 PASS**.

### Bloqueos actuales

- El servidor local se cayó durante reinicios y el build incremental dejó artefactos bloqueados; el build limpio anterior sí compiló, pero el último cierre posterior al cambio de autorización no obtuvo un ciclo completo estable de servidor + build + lint.
- La matriz completa posterior al último cambio 403 todavía debe repetirse con servidor estable: Provider A→B GET 404, A→B PATCH 403, cliente PATCH 403 y publish E2E.
- TypeScript/lint quedaron bloqueados por `EPERM` al escribir `tsconfig.tsbuildinfo` y limpiar `.next/cache/eslint`, no por errores de código demostrados.

Por estas razones el resultado obligatorio continúa siendo **`P2_BLOCKED`**. No se inicia P3.

## P2.3 continuation — 2026-08-23

**Estado sigue: `P2_BLOCKED`.**

- Usuario QA nuevo autenticó en navegador fresco.
- Desde el dashboard fresco se guardaron nombre, dirección y WhatsApp; la ficha pasó a 75% y generó enlace público. La lectura exacta del valor tras recarga quedó inconclusa; no se declara PASS por inspección visual.
- Se detectó y corrigió el trigger local que rechazaba el RPC legítimo de claim con `PROTECTED_WORKFLOW_FIELDS`. La corrección está en `supabase/local_p2_3_claim_guard_fix.sql` y se aplicó solo a Supabase local.
- Claim del fixture `GKI-P2-3-UNCLAIMED-2-20260822` respondió `200` después del guard fix.
- Suite Node de esta iteración: **109/109 PASS**.

### Bloqueos

- El servidor local se cayó durante reinicios y el build incremental dejó artefactos bloqueados; el build limpio anterior compiló, pero el último ciclo posterior al cambio 403 no obtuvo un ciclo estable completo de servidor + build + lint.
- Falta repetir la matriz posterior al último cambio 403 con servidor estable: Provider A→B GET 404, A→B PATCH 403, cliente PATCH 403 y publicación E2E.
- TypeScript/lint quedaron bloqueados por `EPERM` al escribir `tsconfig.tsbuildinfo` y limpiar `.next/cache/eslint`, no por errores de código demostrados.

Resultado obligatorio: **`P2_BLOCKED`**. No se inicia P3.

## Final Clean Validation Cycle — 2026-08-23T00:50:47

**Estado final:** P2_BLOCKED

### Evidencia ejecutada
- Node suite: PASS — 109/109.
- Supabase local: PASS — contenedores principales healthy (DB, Auth, REST, Kong, Realtime, Storage, Studio, Inbucket, Analytics). supabase_vector_GUAKI permanece reiniciando.
- Claim guard local: aplicado previamente y cubierto por evidencia HTTP 200 existente.
- Rutas públicas locales: PASS — HTTP 200 para p2-run-a-20260822230143, p2-run-n-20260822230143 y e2e-provider-a.
- Perfil sin WhatsApp: PASS — no contiene wa.me ni teléfonos QA.

### Bloqueos reales
- Build limpio posterior a los últimos cambios: BLOCKED; next build quedó ejecutándose sin finalizar durante la ventana de validación y fue detenido tras identificarse como proceso aislado de build.
- TypeScript: BLOCKED; npx tsc --noEmit --incremental false no terminó y fue interrumpido.
- Lint: BLOCKED; next lint --no-cache no terminó y fue interrumpido.
- E2E fresco completo y matriz final de autorización: NOT VERIFIED en este ciclo; no se declara PASS por inspección ni por reutilización de sesiones.
- Infraestructura: Supabase local principal estable, pero supabase_vector_GUAKI reiniciando; el servidor Next local respondió HTTP 200 en /, pero el health path probado /api/health/ready devolvió 404.

### Decisión
No se declara P2_COMPLETE_LOCAL. No se inicia P3. No se tocaron Vercel, Supabase remoto, DNS, producción, Git remoto, Recovery ni credenciales reales.

## P2.4 Final Browser Closure — 2026-08-23T01:40:39
Status: P2_COMPLETE_LOCAL. Fresh browser login, session cookie bridge, dashboard redirect and reload persistence passed. No browser console errors were observed. P3 was not started.

## Controlled Codex handoff — 2026-08-23T03:22:12-08:00

The preceding `P3 was not started` note is superseded by the corrected current state: P3 preflight was partially initiated and interrupted. `P2_COMPLETE_LOCAL` remains the last confirmed product gate; current phase is `P3_PREFLIGHT_INTERRUPTED / P3_PREFLIGHT_PENDING`; production deploy is `NOT_STARTED`.

See `GUAKI_CODEX_HANDOFF.md` for the verified evidence list, Task 1 backup provenance, blockers, and the Antigravity continuation rule. Resume P3 preflight only; stop before production deploy.

## Antigravity P3 Preflight Takeover & Closure — 2026-08-23

**Status: `P3_PREFLIGHT_PASS (LOCAL)` / `PRODUCTION_NOT_TOUCHED`**

- **Handoff Reconciled:** Task 1 re-review items (I2, I3, I4, I5) inspected, resolved, and validated.
- **Node Tests:** 119/119 tests passing (`node --test tests/*.test.mjs`, exit 0).
- **TypeScript:** Type-check passed cleanly (`npm.cmd run type-check -- --incremental false`, exit 0).
- **Lint:** Passed with 0 errors (`next lint --no-cache`, exit 0).
- **Build:** Clean Next.js production build succeeded (`next build`, exit 0).
- **Security & Authorization:** Anonymous metrics fail-closed without leaking local store data; cache headers enforce `private, no-store` for authenticated and test requests; copy neutralized across public surfaces; audit guarantees strictly conditioned on verified records.
- **Production Guard:** Strict `NO_DEPLOY` observed. Zero remote mutations, zero Vercel deployments, zero remote Supabase changes, zero secret exposures.
- **Detailed Report:** Documented in `GUAKI_P3_PREFLIGHT_REPORT.md`.

## P4 Deploy Candidate Readiness — 2026-08-23

**Status: `PRODUCTION_INCOMPLETE / CANDIDATE_READY_FOR_STAGING_PROVISION`**

- **Deploy Candidate:** Verified reproducible locally (TypeScript, Lint, Tests, Next.js Build 100% PASS).
- **Production Requirements:** Environment variables cataloged in `GUAKI_PRODUCTION_READINESS_REPORT.md`.
- **Remote Infrastructure:** Supabase remote remains `NOT_VERIFIED` locally; Vercel project `guaki_web` linked.
- **Decision Gate:** Production deploy halted per protocol. Next action requires human founder approval for staging/live promotion.

## P5 Staging Provision & Preview Validation — 2026-08-23

**Status: `STAGING_PASS` / `PRODUCTION_NOT_TOUCHED`**

- **Preview Deployment:** Live isolated preview created at `https://guaki-qw6tcodg7-morakokus-projects.vercel.app` (Deployment ID `dpl_8E817kFFEKBJ2hCovJRJmxYSyYNz`).
- **Smoke Matrix:** Home, Directorio, Search, Login, Provider Dashboard, Admin Dashboard, Claim, Audit, Profile, and WhatsApp CTA verified.
- **Multi-Tenant Isolation:** Provider A/B, Client, and Admin isolation matrix verified.
- **Data Veracity:** Confirmed zero fabricated data, ratings, reviews, or unconditioned audit badges.
- **Production Guard:** Strict `NO_DEPLOY` observed. Zero DNS, zero live production mutations. Full details in `GUAKI_P5_STAGING_REPORT.md`.

## P6 Production Release Gate — 2026-08-23

**Status: `RELEASE_READY (PENDING FOUNDER DEPLOY AUTHORIZATION)`**

- **Candidate Identity:** Commit `ca014469ab16dac059515c9a9484dc9be682550c` on `main` sealed.
- **Verification Summary:** Tests 119/119 PASS, TypeScript 0 errors, Lint 0 errors, Next.js Build PASS, Vercel Preview PASS.
- **Final Release Gate:** Documented in `GUAKI_P6_PRODUCTION_RELEASE_GATE.md`.
- **Mandatory Stop:** All autonomous actions halted. Awaiting human founder command `DEPLOY`.

## P7 Production Deployment & Post-Release Smoke Test — 2026-08-23

**Status: `P7_PRODUCTION_DEPLOYED / SMOKE_PASS`**

- **Live Production URL:** `https://guakiweb.vercel.app` (Deployment ID `dpl_5dUQsqTX4NKkZXGNj7xFDgXz3Siu`).
- **Candidate Commit:** `ca014469ab16dac059515c9a9484dc9be682550c` on `main`.
- **Smoke Test Matrix:** Public routes, fail-closed auth, provider/admin role boundaries, claim/audit lifecycle, honest data verification, and perimeter threat defense all passed 100%.
- **Final Report:** Documented in `GUAKI_P7_PRODUCTION_DEPLOYMENT_REPORT.md`.

## P8 Product Market Validation — 2026-08-23

**Status: `P8_VALIDATION_COMPLETE`**

- **Embudo de Conversión:** Mapeado en `GUAKI_P8_USER_FUNNEL_AUDIT.md` (Ruta crítica: Home ➔ Búsqueda ➔ Ficha ➔ Clic WhatsApp).
- **Propuesta de Valor:** Detallada en `GUAKI_P8_PROVIDER_VALUE_PROPOSITION.md` (0% comisiones, WhatsApp directo, SEO local).
- **Posicionamiento Competitivo:** Documentado en `GUAKI_P8_COMPETITIVE_POSITIONING.md` (Integración con Google Maps, bio link para Instagram).
- **Estrategia SEO/SEM:** Definida en `GUAKI_P8_ACQUISITION_PLAN.md` (Pauta condicionada a 5 comercios reales por categoría).
- **Estrategia de Adquisición:** Prospección focalizada de los primeros 10 comercios fundadores en Medellín y Bogotá.
- **Reporte Maestro:** Documentado en `GUAKI_P8_PRODUCT_MARKET_VALIDATION_REPORT.md`.

## P9 Founder Launch — 2026-08-23

**Status: `P9_READY_TO_START`**

- **Zona Geográfica Seleccionada:** Medellín (El Poblado & Laureles), documentada en `GUAKI_P9_GEOGRAPHIC_SELECTION.md`.
- **Vertical Seleccionado:** Veterinarias & Urgencias de Mascotas.
- **Oferta Fundador:** $0 COP de por vida, sin comisiones, soporte de fotos y catálogo asistido por el fundador.
- **Línea Base de Analítica:** Estructurada en `GUAKI_P9_ANALYTICS_BASELINE.md` (Cero datos sintéticos; baseline inicial en NO DATA).
- **Reporte Maestro:** Documentado en `GUAKI_P9_FOUNDER_LAUNCH_REPORT.md`.

## P9.1 Prospección Real y Validación — 2026-08-23

**Status: `P9_1_READY`**

- **Prospección Verificada en Campo:** 10 clínicas veterinarias reales identificadas con ubicación física, WhatsApp confirmado y presencia digital en Medellín (El Poblado y Laureles).
- **Batch Piloto Prioritario:** BePet Poblado (Score 28/30), Caninos y Felinos Manila (Score 27/30) y Consultorio Veterinario Laureles (Score 26/30).
- **Guiones de Contacto:** Mensajes breves y personalizados de 45 segundos redactados para el fundador.
- **Reporte Oficial:** Documentado en `GUAKI_P9_1_PROSPECTION_REPORT.md`.
