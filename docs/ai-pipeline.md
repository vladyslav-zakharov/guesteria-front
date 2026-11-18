# AI pipeline

StayHub was built by one Claude Code orchestrator session that delegated all implementation to subagents. The orchestrator read, planned, wrote dispatch briefs, reviewed diffs and reran checks; it did not edit project code itself. Nothing was committed by an agent: every change is an uncommitted working-tree diff the author reviews and commits.

Evidence:
- Spec: [superpowers/specs/2026-11-17-guesteria-booking-clone-design.md](superpowers/specs/2026-11-17-guesteria-booking-clone-design.md)
- Plan: [superpowers/plans/2026-11-17-stayhub-booking-clone.md](superpowers/plans/2026-11-17-stayhub-booking-clone.md)

Both end with a "Superseded during the build (2026-11-18)" section listing what changed after approval.

## Configuration

**Orchestrator:** Claude Code on Opus 5.5, started from the spec session on 2026-11-17.

**Custom subagents** (user-level, `~/.claude/agents/*.md`). Every one runs `model: opus`; the tier is set by `effort` in the frontmatter, and dispatches never override the model.

| Agent | Effort | Writes files | Used for |
|---|---|---|---|
| `backend-developer` | medium | yes | Fastify modules, LiteAPI client, bookings, Guest Hub chat, fix rounds |
| `frontend-developer` | medium | yes | Next.js FSD skeleton, UI kit, pages, fix rounds |
| `mechanic` | medium | yes | Infra port, Dockerfile, Cloud Build, CI, infra fixes |
| `test-writer` | medium | yes | Back integration tests (cookie auth, ownership) |
| `code-reviewer` | high | no (read-only) | Gate 2 review and the pre-merge audit |
| `security-auditor` | high | no (read-only) | Gate 2 security review per repo |
| `verifier` | high | no (read-only) | Acceptance criteria 1–10 against code and tests |
| `technical-writer` | low | yes | These delivery docs |

**Repo-level agents** (`.claude/agents/` in `guesteria-back` and `guesteria-front`, inherited from the templates): `ai-engineer` (opus), `code-reviewer` (sonnet), `security-auditor` (opus). The orchestrator ran from the workspace root above the repos and dispatched the user-level agents above; the repo-level definitions were not used in this build.

**Skills:** `research-task` (spec), `superpowers:writing-plans` (plan), and the `audit-implementation` method for the final audit.

**Guard rails given to every subagent:** read the repo's `CLAUDE.md` and `ARCHITECTURE.md` first; use the generators for modules, repositories, entities and features; the exact lint, typecheck and test commands (non-watch `:ci` scripts on the back); acceptance criteria; never run `git add/commit/push/stash/reset/checkout`; never print or copy the LiteAPI key or database URLs; no deploys or cloud writes.

## Order of work

| # | Agent / skill | Output | What it caught | How it was verified |
|---|---|---|---|---|
| 1 | `research-task` | Spec | 15 readiness gaps and risks: cookie through the Vercel rewrite, rewrite caching, prebook latency, the 5 req/s sandbox limit, strict lint vs shadcn, no front test runner | User reviewed and approved the spec file |
| 2 | `superpowers:writing-plans` | Plan (Tasks 0–21) | Gate 1 needed a deploy only the user can do → split into local 1a and live 1b; the template's `test:unit` runs Vitest in watch mode and would hang agents → `:ci` scripts; a generic base repository would allow id-only loads → owner-scoped repository types; Gemini needs the first turn to be the user's | Self-review against spec coverage, then user review |
| 3 | orchestrator | Branches, installs, baselines | Back lint baseline 0 errors / 14 warnings; front lint and typecheck clean | Command output |
| 4 | `backend-developer` (Task 2) | Prisma schema (5 models), owner-scoped repositories, init migration | Docker container name and port clashes with other local projects → moved to 5435/5436; an install rewrote unrelated lock fields → restored | Orchestrator reran lint, tsc, unit tests and read the migration SQL |
| 5 | `mechanic` (Task 5) | Infra trimmed to project APIs, secrets, Cloud Run, migration job, budget, AI kill switch | Removed every reference to foreign projects and orgs | `terraform fmt` + `validate`, grep scan |
| 6 | `frontend-developer` (Task 6) | FSD skeleton, axios `/api` client, rewrites, Vitest | Next 16.4.3 build refused with a security error; the agent escalated instead of following an instruction found in tool output → orchestrator checked the advisories and pinned 16.4.6 | Orchestrator reran lint, tsc, tests and `yarn audit` |
| 7 | `mechanic` (Task 4) | Dockerfile, Cloud Build files, CI workflows | Built the image from a clean snapshot so it did not race parallel edits | Cloud Build substitutions cross-checked against the infra triggers |
| 8 | `backend-developer` (Task 3) + fix round | Cookie JWT, rate limit, helmet, `no-store`, auth module | A plain-object 429 builder produced a 500 → Error instance; a critical `fast-jwt` advisory fixed by `npm audit fix`; Fastify 5.12 numeric `trustProxy` fails closed → hop function | Orchestrator read the plugins and the Fastify source, reran checks |
| 9 | `frontend-developer` (Task 7) | shadcn kit, StayHub tokens, shell, auth sheet, search UI | shadcn CLI added a dark variant that leaked on a dark OS, and its `accent` clashed with the StayHub coral | Orchestrator reran checks, reviewed a 375 × 812 screenshot |
| 10 | orchestrator (Gate 1a) | Cookie flow proven through the Next.js rewrite | None | curl + in-app browser at 375 × 812; user approved the StayHub look |
| 11 | `backend-developer` (Task 1 spike, after user go-ahead) | 11 sandbox fixtures, findings note, spec "(spike)" notes | Sandbox book returns placeholder room/occupancy/cancellation → `BookingDto` built from our Prebook row; `cancelTime` is not ISO; unknown booking is 404/4004; `stars: 0` means unrated; rates take about 7.7 s | Secret-value scan of fixtures, docs and notes; diff vs snapshot |
| 12 | user → orchestrator | Global constraints updated: dayjs + utc everywhere; flat `shared/ui` files | Back part routed into the running agent to avoid two writers in one repo | None |
| 13 | `frontend-developer` (refactor R1) | One dayjs instance, date helpers moved, `shared/ui` flattened | Agent could not open a browser → orchestrator checked the date picker | Orchestrator reran checks, grep, in-app browser |
| 14 | `backend-developer` (Tasks 8–11 + fix rounds) | LiteAPI client, places, hotels, bookings, Guest Hub chat | Sandbox 4002 for an unknown hotel → 404; book timeout 504 → 502 per spec; prebook body was string-encoded → JSON types; unauthenticated invalid body gave 400 → authorization moved to `onRequest` | Orchestrator reran checks after each task and read the context builder for personal data |
| 15 | orchestrator (contract check) | Swagger vs spec §API: pass, 2 minor notes | Swagger lists only 2xx; `HotelDetails` nullability wider than spec (front types follow Swagger) | Swagger dump + curl probes |
| 16 | `test-writer` (Task 16) | Integration tests: cookie auth, ownership | Mutation-checked the owner filters and cookie flags | Orchestrator ran the suite on the test Postgres container |
| 17 | `frontend-developer` (Tasks 12–15) | Entities, search, results, hotel, checkout, trips, Guest Hub | Hotel page showed at most 3 offers (AC 3) → back fix in Task 18 | Orchestrator reran checks and walked each page at 375 × 812 against the sandbox |
| 18 | `code-reviewer` ×2 ∥ `security-auditor` ×3 (Gate 2, Task 17) | 5 reports | Back: prebook occupancy taken from the client; offers capped at 3; the `TRUST_PROXY_HOPS` trade-off. Front: stale Trips after an unknown book outcome; previous account's cache survives sign-in. Infra: project-wide `actAs` + `run.admin` for Cloud Build; unanchored trigger branch regex. The auditor also corrected the orchestrator's own risk note (XFF spoofing exists only at hops = 2) | Orchestrator re-read each Important finding at file:line before accepting |
| 19 | user → orchestrator | `TRUST_PROXY_HOPS = 2` plus protections; prebook error copy without "card" | None | None |
| 20 | `mechanic` ×2 (Task 18 infra) | IAM scoped, triggers anchored `^main$`, hops = 2, global AI ceiling variable | None | Diff vs snapshot, `fmt` + `validate` |
| 21 | `backend-developer` (Task 18 back) | 13 fixes, +25 unit / +2 integration tests | A second `rateLimit()` in `preHandler` is silently skipped after the per-IP limiter ran (an integration test got 200 on the 11th try) → separate limiter instance | Orchestrator read the diff; tsc, lint, unit 149, integration 33 |
| 22 | `frontend-developer` (Task 18 front) | 9 fixes, +20 tests | Its own report flagged that its "Check Trips" copy contradicted the back's new "not confirmed" copy → follow-up round | Orchestrator lint, tsc, 198 tests, read the `headers()` source |
| 23 | orchestrator (Task 19 browser pass + AI eval) | AC 1–10 pass at 375 × 812; AI eval 5/5 | 5 minor findings (label association, drawer focus, sign-out lands with the auth sheet open, card price above cheapest offer, long offer list) | In-app browser, fetch timings, answers cross-checked against `/api/hotels` data |
| 24 | `verifier` (Task 19) | AC 8 partial | Chat checked "AI off" before ownership (503 instead of 404), and the integration test passed only through the developer's local `.env` | Orchestrator reran integration tests with the local `.env` moved aside: 35/35 after the fix |
| 25 | `frontend-developer` (rounds 2–4) | UTC trips split, sign-out without the auth sheet, drawer focus | A checkout "Loading…" hang was a test artifact (hidden browser pane, `requestAnimationFrame` never fires); `loading.tsx` removed anyway for real 307/404. It also found that its earlier fix broke reloads because LiteAPI reissues `offerId`s → three-state availability | Headless Chrome with rAF on/off; orchestrator confirmed the hidden pane and reran checks (205/205). One label finding was a tool artifact and was rejected |
| 26 | `code-reviewer` ×3 (Task 20, `audit-implementation`) | Back 3 M / 6 L, front 2 M / 6 L, infra 2 M / 10 L; contracts consistent across repos | Book 200 with an unparseable body lost the booking; a failed background `/auth/me` refetch unmounted checkout mid-book; LiteAPI key exhaustion via spoofed XFF at hops = 2; Terraform would revert the Cloud Build image; branch protection missing; template docs still steering agents | Orchestrator re-read every MEDIUM at file:line |
| 27 | user → orchestrator | Fix all MEDIUM, in-back LiteAPI throttle, cheap LOWs | None | None |
| 28 | `backend-developer` ∥ `frontend-developer` ∥ `mechanic` (Task 20 fixes) | Fixes in three repos; sandbox check with a child confirmed `childrenAges [8]` | Back agent caught its own broken scripted replace and a migration command that touched the test DB; front applied "error screen only without data" to Trips and Guest Hub too | Back tsc / lint / unit 171 / integration 35; front lint / tsc / 222; infra `fmt` / `validate`; diffs and migration SQL read |

After the build, the front unit tests (Vitest) were removed at the author's request; the rows above record them as they ran at the time.

`∥` means dispatched in parallel. Parallel agents always worked in different repos, so no two agents wrote the same files.

## How it ran

The work went inside-out: data layer and platform plugins first, then the LiteAPI client and back modules, a contract check of Swagger against the spec, and only then the front pages. Front feature work waited for the local walking skeleton (Gate 1a), where the orchestrator proved that the session cookie survives the Next.js rewrite and the user approved the StayHub look.

Every subagent returned a report; none was taken at its word. The orchestrator diffed the repo against a snapshot taken before the dispatch, reran lint, typecheck and tests, and read the risky code itself (auth plugins, the AI context builder, migration SQL). Any value from a `.env` file was checked for by scanning fixtures, notes and docs for it, printing file names only.

Review ran in two passes. Gate 2 used five read-only reviewers in parallel (code and security, per repo); Task 20 ran three more auditors with the earlier reports marked "already handled", so they looked for new problems. That second pass found the most expensive bug of the build: a LiteAPI 200 with an unreadable body would have released the prebook and lost a real booking.

The agents caught their own mistakes several times: the front agent flagged contradictory copy in its own report, found that its own earlier fix broke checkout reloads, and the back agent noticed a broken scripted edit and a migration that touched the test database. The orchestrator made mistakes too: one of its briefs caused the reload regression, and its first note on `X-Forwarded-For` spoofing was wrong until the security auditor corrected it.

## Decisions the user made

| When | Decision |
|---|---|
| 2026-11-17 | Approved the spec (three repos, Supabase, StayHub brand, shadcn kit, no cancel or pre-arrival check-in) |
| 2026-11-18 | Go-ahead for the live sandbox spike and real sandbox bookings |
| 2026-11-18 | Approved the StayHub look at Gate 1a |
| 2026-11-18 | dayjs + utc for all dates in both repos; flat `shared/ui` files |
| 2026-11-18 | Deployment protection on previews only; production URL public |
| 2026-11-18 | `TRUST_PROXY_HOPS = 2` with a per-email sign-in limit and a global daily AI ceiling |
| 2026-11-18 | Prebook error copy: "Something went wrong. You have not been charged." |
| 2026-11-18 | After the audit: fix all MEDIUM findings, add an in-back LiteAPI search throttle, batch the cheap LOWs, defer the rest |
