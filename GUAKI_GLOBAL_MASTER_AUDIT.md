# GUAKI GLOBAL MASTER AUDIT

Date: 2026-08-24  
Scope: G0 Baseline + G1 Reproducibility only  
Environment: local-only; no deploy, remote Git, Vercel, DNS, remote Supabase, credentials, or real-data actions

## Executive result

`AUDIT_BLOCKED` / `REMEDIATION_REQUIRED`

G1 is `BLOCKED`: security/claim helpers, the current Supabase migration, and critical P0/P1 tests are present locally but not all are in the versioned tree. The graph stops here; G2-G12 were not advanced.

## G0 — Baseline

### Node contract

- **NODE_ID:** G0
- **OBJECTIVE:** Record current repository and local evidence without changing application code.
- **AGENT:** Codex orchestrator
- **SCOPE:** `E:\Proyectos IA\AI_STUDIO\GUAKI`
- **INPUTS:** `PROMPT_GRAPH_GUAKI_MASTER.md`, current Git tree, local files and available CLI state
- **FILES_READ:** `PROMPT_GRAPH_GUAKI_MASTER.md`, `package.json`, repository metadata, candidate paths listed below
- **FILES_CHANGED:** `GUAKI_GLOBAL_MASTER_AUDIT.md` only (documentation update requested by the master prompt)
- **COMMANDS_EXECUTED:** `git rev-parse HEAD`; `git branch --show-current`; `git status --short --branch`; `git diff --stat`; `git ls-files`; `git ls-files --others --exclude-standard`; `git check-ignore`; `Get-Content package.json`; `Get-FileHash`; `supabase status`
- **TESTS_EXECUTED:** None; G0 is a baseline audit.
- **EVIDENCE:**
  - HEAD: `0a79bd74b2b9469e04520f00b5f49051efcb1fb8`
  - Branch: `main`; local status reports `ahead 35` and a heavily dirty working tree.
  - Current working tree snapshot: 320 tracked paths and 799 untracked paths from this checkout; 80 tracked paths have local modifications in the broader repository status.
  - `package.json` identifies Next.js 14.2.5, React 18.3.1, Supabase JS 2.45.0, TypeScript 5.5.4, and scripts for dev/build/lint/type-check.
  - Local Supabase CLI is installed, but `supabase status` did not produce runtime evidence: it failed while attempting to write `C:\Users\Administrator\.supabase\telemetry.json.tmp...` with `EPERM`. No remote operation was requested or performed.
- **STATUS:** `NOT_VERIFIED`; static baseline capture succeeded, but runtime and tests were not executed.
- **FINDINGS:** The checkout contains substantial unrelated local modifications and many untracked artifacts. Existing historical audit claims were not treated as current proof.
- **RISKS:** Any tracked-only review or delivery can omit local security, migration, and regression artifacts.
- **BLOCKERS:** None from baseline capture; G1 below is blocking.
- **NEXT_NODE:** G1

## G1 — Reproducibility

### Node contract

- **NODE_ID:** G1
- **OBJECTIVE:** Verify that security helpers, migrations, and critical tests are included in the versioned tree.
- **AGENT:** Codex orchestrator; read-only repository inspection
- **SCOPE:** Local Git index and working tree only
- **INPUTS:** G0 snapshot; critical local paths
- **FILES_READ:** `src/lib/authorization.ts`, `src/lib/claim-workflow.ts`, `src/lib/security_engine.ts`, `supabase/migrations/20260823021621_fix_authenticated_read_privileges.sql`, `tests/p0-auth-claim-workflow.test.mjs`, `tests/p0-local-only.test.mjs`, `tests/p1-hardening-regressions.test.mjs`
- **FILES_CHANGED:** None in the application/test/security set
- **COMMANDS_EXECUTED:** `git ls-files -- <path>`; `git ls-files --others --exclude-standard`; `git check-ignore -v -- <path>`; `Get-FileHash`
- **TESTS_EXECUTED:** None; executing regression tests would not remove the reproducibility blocker.
- **EVIDENCE:**
  - `src/lib/authorization.ts`: exists locally, `tracked=False`.
  - `src/lib/claim-workflow.ts`: exists locally, `tracked=False`.
  - `src/lib/security_engine.ts`: `tracked=True`.
  - `supabase/migrations/20260823021621_fix_authenticated_read_privileges.sql`: exists locally, `tracked=False`.
  - `supabase/local_p2_3_claim_guard_fix.sql`: exists locally, `tracked=False`.
  - `tests/p0-auth-claim-workflow.test.mjs`: exists locally, `tracked=False`.
  - `tests/p0-local-only.test.mjs`: exists locally, `tracked=False`.
  - `tests/p1-hardening-regressions.test.mjs`: exists locally, `tracked=False`.
  - Additional local helpers `src/lib/map-projection.ts` and `src/lib/whatsapp.ts` are also untracked; tracked `src/lib/auth_service.ts` and `src/middleware.ts` import the untracked `src/lib/authorization.ts`.
  - Every current file under `supabase/migrations/` is absent from HEAD, including `20260824092543_canonical_claim_state_machine.sql`; `20260824200013_local_hardening_rls_review_moderation.sql` is empty locally (`0` bytes).
  - Tracked `supabase/init_schema.sql` still contains `GRANT ALL` to `anon` and `authenticated` at lines 121–124; the untracked migrations are therefore part of the intended hardening boundary, not optional evidence.
  - `supabase/config.toml` enables `./seed.sql`, but `supabase/seed.sql` is absent locally: `BLOCKED` for reproducible local database setup.
  - These paths are not ignored; the issue is absence from the Git index, not an intentional ignore rule.
- **STATUS:** `BLOCKED`
- **FINDINGS:** The local security/claim implementation and its current migration/regression evidence are not reproducible from the versioned tree. A tracked-only checkout can omit them; the empty hardening migration is an independent `FAIL`.
- **RISKS:** A future reviewer, CI job, or release process may validate a different code/security boundary than the one currently present locally.
- **BLOCKERS:** P1 reproducibility blocker: critical helper, migration, and test files are untracked; the configured seed is missing; and the latest hardening migration is empty. Do not advance to G2 or modify application code until an explicitly authorized single-writer remediation makes the intended candidate reproducible and verifies it.
- **NEXT_NODE:** Stop. Re-run G1 after the blocker is resolved.

## Prior findings retained as historical context, not current proof

- Prior notes identified unsafe bootstrap grants, claim/auth gaps, non-durable writes, client-supplied review verification, missing public inquiry mounting, unsupported commercial claims, and incomplete multi-country/Mapache/Hermes/Strix evidence. They remain `NOT_VERIFIED` or `REMEDIATION_REQUIRED` until independently re-executed in the current local runtime.

## Final state

`BLOCKED — DO NOT DEPLOY`

## G1 remediation attempt — 2026-08-24

- The critical local security/claim helpers, migrations, regression tests, prompt,
  and audit evidence were added to the local Git index.
- `supabase/seed.sql` now exists as an intentionally empty, real-data-only seed;
  no businesses, leads, reviews, or synthetic records were added.
- The zero-byte review-hardening migration was replaced with explicit local-only
  moderation status and RLS policy SQL.
- `git diff --cached --check` still reports one existing trailing blank line in
  `tests/p0-local-only.test.mjs`; this is non-functional but must be normalized
  before release review.
- The P1 regression suite remains `FAIL` (5/5), including unsafe bootstrap grants
  and unresolved application hardening. This remediation therefore does not make
  P1 or G1 a release pass.

### Current gate

`G1_PARTIAL / P1_REMEDIATION_REQUIRED`

The next safe action is to repair the bootstrap schema and the failing P1
application contracts, then rerun the regression suite and local Supabase checks.
