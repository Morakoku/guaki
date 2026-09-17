# Agent instructions

## Decision policy

- Decide sin preguntar cuando exista un ADR aplicable o el cambio sea reversible (feature branch, preview o dry-run), siempre dentro del alcance autorizado.
- Escala a un humano antes de tocar Supabase o migraciones en PROD, rotar credenciales o contradecir un ADR. Un dry-run no autoriza una migración real.
- Registra toda decisión no trivial en un ADR, con contexto, decisión y consecuencias.
- No hagas push, despliegues ni cambios remotos sin autorización explícita. No incluyas secretos en archivos, logs o commits. Conserva el trabajo ajeno y usa staging selectivo.

## Comandos verificados

- `node --test tests/provider-directory.test.mjs tests/search-route.test.mjs tests/public-pricing.test.mjs`: verificado localmente, 21/21 pruebas aprobadas.
- `npm run typecheck`: comando de typecheck del proyecto. En PowerShell con scripts bloqueados, usar `npm.cmd run typecheck`; `npm.cmd run typecheck` verificado localmente sin errores. La ejecución con `npm` quedó bloqueada por la política de ejecución, no por errores TypeScript.
- Usar `supabase.cmd`, no `supabase.ps1`: launcher localizado en el PATH. No ejecutar operaciones remotas sin autorización.

## Automatización

- `safety.yml` escanea pull requests con Gitleaks al publicar el archivo. No sustituye push protection ni una purga de secretos históricos.
- `release.yml` es una plantilla completamente comentada: no despliega ni migra. Antes de habilitarla, el dueño debe configurar el environment `production`, required reviewers y secrets de CI. La aprobación humana de producción es obligatoria.
