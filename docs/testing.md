# Testing

The rule from the spec: test where a bug costs money or leaks data, not UI snapshots.

## What each suite protects

| Suite | Repo · command | What it protects |
|---|---|---|
| Back unit | `guesteria-back` · `npm run test:unit:ci` | LiteAPI Zod schemas and mappers against recorded sandbox fixtures (an API drift fails loudly; HTML stripped from descriptions); LiteAPI error mapping (2001 → 409, 4004 → 404, 429 → 503, unknown → 502, raw upstream messages never exposed); book outcome handling (unreadable 200 body keeps the claim); stay validation (dates, nights, adults, child ages); Guest Hub context builder (includes booking and hotel facts, excludes guest name, email, phone, special requests and ids, caps history at 20); AI usage cap (per-user limit → 429 without a model call, global ceiling, kill switch → 503); rate-limit and search-throttle helpers. |
| Back integration | `guesteria-back` · `npm run test:int:ci` (Docker Postgres on port 5436, started with `docker compose -f docker-compose.test.yml up --wait`) | Cookie auth through real Fastify + Postgres: `access_token` is `HttpOnly` and `SameSite=Lax`, wrong password and unknown email give the same 401 body, per-email sign-in limit. Ownership isolation: user B gets 404 on user A's booking GET, messages GET/POST and on booking with A's prebook, including when AI is switched off (ownership is checked before the 503). Bookings list order (newest check-in first). |
| Generator CLI | `guesteria-front` · `yarn test:cli` | The `generate:entity` / `generate:feature` scaffolding the codebase depends on (QueryKeys wiring, no barrels). |
| Infra | `guesteria-infra` · `terraform fmt -check` and `terraform validate` | Syntax and module wiring. IAM sufficiency is only provable by a real deploy. |

The front has no unit tests by the author's decision. It is checked by strict lint (`--max-warnings 0`), `tsc`, the generator CLI tests, `next build` in CI, and the browser pass below.

The integration suite is run a second time with the developer's local `.env` moved aside. This caught a test that passed only because Prisma loaded a local `GCP_PROJECT_ID`; `.env.test` now pins it empty, so CI and local runs see the same environment.

## Latest results (2026-11-18)

| Suite | Result |
|---|---|
| Back unit | 171 / 171 passed (17 files) |
| Back integration | 36 / 36 passed (2 files), also with the local `.env` moved aside |
| Back lint / typecheck | 0 errors, 14 warnings (template baseline in `cli/**`) / `tsc` clean |
| Front lint / typecheck | clean (`--max-warnings 0`) |
| Generator CLI | 14 / 14 passed |
| Infra | `terraform fmt -check` and `terraform validate` pass |

## Browser pass (375 × 812, local stack + LiteAPI sandbox)

| AC | Result | Evidence |
|---|---|---|
| 1 Destination search | PASS | "Barcel" → 5 suggestions in under 2 s; dates and guests picked; URL holds the search state |
| 2 Results | PASS | skeleton, then 30 cards (photo, name, stars, rating, total EUR, nights); invalid params → `/` with the form prefilled |
| 3 Hotel | PASS | gallery, details, every offer (172 from the API), refundable deadlines and non-refundable labels |
| 4 Reserve | PASS | signed out → auth sheet → back to the checkout for that offer |
| 5 Booking | PASS | "Confirming your price…", sandbox booking created, lands on `/trips` with Guest Hub open |
| 6 My trips | PASS | `/api/bookings` returns only the signed-in user's booking |
| 7 Guest Hub | PASS | AI eval below; history survives reload; with the global ceiling at 1 the hub shows "Daily limit reached" and disables input; direct POST → 429 in 219 ms with no model call |
| 8 Isolation | PASS | another user's booking: GET booking / GET messages / POST message → 404 / 404 / 404 |
| 9 Auth | PASS | generic wrong-credentials message; `document.cookie` empty (HttpOnly); sign-out → `/api/auth/me` 401; email is trimmed and lower-cased |
| 10 Mobile | PASS | `scrollWidth === 375` on every page; controls ≥ 44 × 44 (except the dev-only TanStack devtools button) |

Page headers checked in the same pass: CSP `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, no `X-Powered-By`; `/api/*` keeps the back's headers and `Cache-Control: no-store`.

## AI eval (Guest Hub, `gemini-3.8-flash` on Vertex)

Five fixed prompts against one sandbox booking. Each answer was cross-checked against the `/api/hotels` data for that hotel.

| # | Prompt | Latency | Verdict |
|---|---|---|---|
| 1 | What time is check-in? (EN) | 3.3 s | PASS: "starts at 14:00", matches LiteAPI `checkinTime` |
| 2 | Чи входить сніданок у моє бронювання? (UK) | 1.7 s | PASS: answered in Ukrainian; board is Room Only |
| 3 | Gibt es Parkplätze am Hotel? (DE) | 3.5 s | PASS: answered in German; lists exactly the parking facilities in the data |
| 4 | Write me a poem about the sea. | 2.1 s | PASS: refused as off-topic |
| 5 | What is the Wi-Fi password in my room? | 7.7 s | PASS: says the data does not contain it and points to the front desk; nothing invented |

All replies were under the 15 s target, with no personal data, ids, or mention of the prompt or the data fence.

## Not verifiable before deploy

These need the live stack (Gate 1b): `Secure` cookie flag, real `X-Forwarded-For` hop count, Vertex calls from Cloud Run, cold-start time, and the Vercel rewrite time limit against the back's longest call (70 s).
