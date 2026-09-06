# GUAKI FINAL RELEASE GATE

Date: 2026-08-24

## Result

`DEPLOYED_WITH_DOCUMENTED_EXCEPTIONS`

The user explicitly authorized production deployment after the local candidate was isolated and committed. The fresh authenticated browser proof remains unavailable in the in-app browser, but direct Auth/session proof and production route checks passed.

## Executed evidence

| Gate | Result | Evidence |
|---|---|---|
| Unit/integration suite | PASS | `138/138` tests passed |
| TypeScript | PASS | `npx.cmd tsc --noEmit --incremental false` |
| Lint | PASS WITH WARNINGS | Exit 0; three existing `no-img-element` warnings |
| Production build | PASS | Next.js compiled and generated `23/23` static pages |
| RLS isolation | PASS | pgTAP `37/37` across provider A, provider B, client and admin |
| Database lint | PASS | No schema errors found |
| Public browser routes | PASS | Home, Directory, Login, About and local provider profile rendered with one H1 and no visible hydration error |
| Protected browser routes | PASS | Provider/Admin redirected to `/login` without a session |
| Auth/session API | PASS | Local provider token 200, session bridge 200, provider dashboard 200, admin dashboard 307 |
| Test-data cleanup | PASS | Local E2E provider account deleted after verification |
| Production deployment | PASS | Vercel deployment `dpl_7KsMMmB2MabSGaXegB27kPZNUyRq` reached `READY` (superseding the initial deployment) |
| Public alias | PASS | `https://guakiweb.vercel.app` now points to the deployed candidate |
| Production smoke | PASS | Home, Directory, Login, About and Health returned `200`; protected provider dashboard returned `307` |

## Open release blockers

1. The in-app browser blocks direct access to local Supabase on port `54321`; fresh browser login remains `BLOCKED_BY_TEST_CLIENT`. The equivalent local Auth/session flow passed through direct HTTP evidence.
2. The monorepo still contains unrelated pending work outside the isolated GUAKI commits. Future releases must continue to use scoped commits and upload exclusions.
3. The first upload exposed incomplete `.next-*` exclusions. The final deployment uses `.next*`, reducing the Vercel upload to 417 files / 2.6 KB delta and excluding all local Next build artifacts.

Required eventual result:

`POST_DEPLOY_MONITORING_REQUIRED`

Production was deployed under explicit human authorization. Continue with monitoring and a fresh browser login check from a client able to access the production Supabase configuration.

## Post-deploy audit — 2026-08-24

| Gate | Result | Evidence |
|---|---|---|
| Deployment | PASS | Vercel deployment `dpl_Dz4scrRw7VS3mVZfUefucEdAbxTM` reached `READY` and `guakiweb.vercel.app` was explicitly aliased to it. |
| Full regression suite | PASS | `139/139` Node tests passed. |
| TypeScript | PASS | `npx.cmd tsc --noEmit --incremental false` exited successfully. |
| Production build | PASS | `npm.cmd run build` with the public site URL generated `23/23` static pages. |
| Directory SEO regression | PASS | Public browser audit found exactly one H1: `Directorio de Negocios`; no console errors. |
| Public route smoke | PASS | Home, Directory, About, Login and Health returned `200`; protected provider/admin routes returned `307` without a session. |

The local build without a public site URL remains intentionally blocked by `SITE_URL_REQUIRED_IN_PRODUCTION`; Vercel provides its deployment URL during real builds. Three existing `no-img-element` lint warnings remain non-blocking and are not part of this release regression.
