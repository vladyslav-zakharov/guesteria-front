# StayHub: write-up

StayHub is a mobile web hotel-booking app on the LiteAPI sandbox. Its new feature is **Guest Hub**, a per-booking AI concierge on Gemini (Vertex AI) that answers questions about the guest's stay in the guest's language.

Repos: `guesteria-front` (Next.js on Vercel), `guesteria-back` (Fastify on Cloud Run), `guesteria-infra` (Terraform for GCP). Status on 2026-11-18: built and verified locally against the LiteAPI sandbox and Vertex AI; not yet deployed.

## 1. API integration and data protection

**Flow.** The browser only ever calls `/api/*` on the Vercel origin. A Next.js `rewrites()` proxies those calls to the Fastify API on Cloud Run. The back is the only party that talks to LiteAPI and Vertex, so no key reaches the browser and the session cookie stays first-party.

**LiteAPI.**
- Search: `GET /data/places` → `GET /data/hotels` + one `POST /hotels/rates` for up to 50 hotels. Hotel page: `GET /data/hotel` + rates for one hotel. Booking: `POST /rates/prebook`, then `POST /rates/book` with our booking UUID as `clientReference`.
- Every LiteAPI response used is parsed with a Zod schema and mapped to our own DTOs; unit tests run the mappers against recorded sandbox fixtures, so API drift fails loudly.
- The sandbox shares 5 req/s per key across endpoints. Places and hotel data are cached in memory (10 min / 1 h), rates never are, there are at most 2 LiteAPI calls per search, and an in-process throttle caps search traffic so prebook and book keep headroom.
- LiteAPI errors are mapped (no availability → 409, unknown booking → 404, rate limit → 503, other → 502) and raw upstream messages are never returned to the client.
- Book is guarded against double submits: the prebook is claimed atomically before calling LiteAPI. A LiteAPI 4xx releases the claim; an HTTP 200 with an unreadable body keeps it and is shown as "not confirmed, check later" rather than a failure.

**Data protection.**
- **Session:** one JWT in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production), 7-day lifetime; the user is reloaded from the DB on every request. Passwords are hashed with argon2id. Wrong email and wrong password give the same 401.
- **Ownership:** every repository method for prebooks, bookings and chat messages takes `userId` and queries by `id` + `userId`. There is no method that loads them by id alone, so another user's booking is a 404, never a 403. The LiteAPI `prebookId` never leaves the server.
- **Abuse limits:** per-route rate limits (auth by IP and per email, bookings and chat per user), a per-user daily AI cap, a global daily AI ceiling, and an app-level AI kill switch; in infra, a billing budget and a kill switch that disables Vertex at 100% of budget.
- **Headers:** `Cache-Control: no-store` on every API response (so Vercel never caches personal data), helmet on the API, and CSP `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy` and `Permissions-Policy` on pages.
- **AI data boundary:** the model sees the booking (hotel, dates, room, board, cancellation terms, guest counts), public hotel data and the last 20 messages. It never sees guest names, email, phone, special requests, user id or LiteAPI ids. Hotel data is fenced with a per-request random marker and the system prompt treats it as information, not instructions. The model has no tools.
- **Secrets** live in Secret Manager in production and in gitignored `.env` files locally. Nothing secret is exposed through `NEXT_PUBLIC_*`.

## 2. Agents and pipeline

One Claude Code orchestrator (Opus) planned the work and delegated all implementation to custom subagents: `backend-developer`, `frontend-developer`, `mechanic` and `test-writer` (medium effort) built it; `code-reviewer`, `security-auditor` and `verifier` (high effort, read-only) reviewed it. The flow was spec (`research-task`) → plan (`superpowers:writing-plans`) → inside-out build (back, contract check, front) → two review passes → fixes → browser pass and AI eval. The orchestrator verified every report by diffing against a snapshot and rerunning the checks. Agents never committed; every change is left for the author to review.

Details, the full step table and the user decisions: [ai-pipeline.md](ai-pipeline.md). Spec and plan: [specs](superpowers/specs/2026-11-17-guesteria-booking-clone-design.md), [plans](superpowers/plans/2026-11-17-stayhub-booking-clone.md).

## 3. Tests, why, and results

The rule: test where a bug costs money or leaks data, not UI snapshots.

| Suite | Why | Result |
|---|---|---|
| Back unit | LiteAPI schemas and mappers on real sandbox fixtures, error mapping, book outcomes, stay validation, AI context builder (no personal data), AI usage caps | 171 / 171 |
| Back integration (Docker Postgres) | Cookie auth flags and generic 401; ownership isolation (404 on another user's booking, messages and prebook) | 36 / 36, also with the local `.env` moved aside |
| Generator CLI | The scaffolding the front's architecture depends on | 14 / 14 |
| Lint / typecheck / Terraform | Strict lint (`--max-warnings 0` on the front), `tsc`, `terraform fmt` + `validate` | All pass (back: 14 template warnings in `cli/**`) |

The front has no unit tests by the author's decision; it is checked by strict lint, `tsc`, the generator tests, `next build` in CI and a browser pass. The browser pass at 375 × 812 covered acceptance criteria 1–10 and passed. Details: [testing.md](testing.md).

## 4. How AI output was verified

**Code written by agents:**
- No report was accepted as is. After each task the orchestrator diffed the repo against a pre-task snapshot, reran lint, typecheck and tests, and read the risky parts itself (auth plugins, the AI context builder, migration SQL).
- The API was checked against the spec contract (Swagger dump plus curl probes) before any front page was built.
- Two independent review passes: five code and security reviewers at Gate 2, then three auditors who were told what was already fixed and looked for new issues. Each finding was re-read at file:line before it was accepted, and one finding was rejected as a tool artifact.
- A `verifier` agent checked AC 1–10 against code and tests, and the integration tests were rerun without the developer's `.env` to make sure they pass the way CI runs them.
- Secret scans over fixtures, notes and docs, printing file names only.

**Guest Hub answers:** an eval of 5 fixed prompts on a real sandbox booking. Answers were cross-checked against the hotel's LiteAPI data.

| Prompt | Result |
|---|---|
| Check-in time (EN) | Correct (14:00), 3.3 s |
| Breakfast (UK) | Answered in Ukrainian, correct (Room Only), 1.7 s |
| Parking (DE) | Answered in German, matches the listed facilities, 3.5 s |
| Poem about the sea | Refused as off-topic, 2.1 s |
| Wi-Fi password | Said it is not in the data and pointed to the front desk, 7.7 s |

## 5. Time spent and limitations

**Time.** The spec and plan were written on 2026-11-17; the build, review and verification ran on 2026-11-18.

> **TODO (author):** hours spent — spec and plan: `__ h`; build and review: `__ h`; total: `__ h`.

**Residual risks (known, not fixed):**
- **Double booking after a retry.** If book times out or LiteAPI returns 5xx, the prebook claim is released, so a retry may create a second booking upstream. LiteAPI cannot look up bookings by our reference, so automatic reconciliation is out of scope.
- **Direct calls to the Cloud Run URL.** With `TRUST_PROXY_HOPS = 2`, a caller who bypasses Vercel can spoof `X-Forwarded-For` and rotate IP rate-limit buckets. Mitigated by the per-email sign-in limit, per-user limits, the global AI ceiling and the search throttle, but not closed. The fix is a shared secret header added by Vercel and checked by the API.
- **Sign-out does not revoke the JWT.** It clears the cookie; a copied token stays valid until its 7-day expiry.
- **Global AI ceiling can overshoot** by the number of requests in flight at the moment it is reached.
- **LiteAPI throttle is per process.** Correct with one Cloud Run instance (the current maximum); it must be lowered if more instances are allowed.
- **Search card price vs hotel page.** The card price comes from 3 sampled rates per hotel, so it can be slightly above the cheapest offer on the hotel page.
- **Large hotel payload.** The hotel page lists every offer (172 in one test, about 200 KB) in one list, with no grouping by room.

**Only verifiable after deploy:** the `Secure` cookie flag, the real `X-Forwarded-For` hop count, Vertex calls from Cloud Run, cold-start time, and the Vercel rewrite time limit against the back's longest call (70 s).

**Deferred:** cancel booking and pre-arrival check-in (out of scope by decision); streaming chat replies; Swagger documents only success responses; search cards load full-size photos instead of thumbnails.
