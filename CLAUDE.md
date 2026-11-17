# CLAUDE.md - Project Guide for Claude Code

Next.js (App Router) + TypeScript frontend template on **Feature-Sliced Design**:
`app → widgets → features → entities → shared`.

**Main rule: everything goes by the FSD architecture.** For the stack, the folder layout,
code examples and step-by-step recipes, read **`ARCHITECTURE.md`** — consult it whenever you
need the "how it looks in code" detail. This file holds the hard rules; they are authoritative.

Next.js docs matching the installed version live in `node_modules/next/dist/docs/`. Read the
relevant guide there before using a Next.js API.

## Code Generation Commands

- **New entity:** `yarn generate:entity <singular> [--plural <plural>]` — takes the
  singular (`user`) and scaffolds `entities/<plural-kebab>/` (`entities/users/`) with `api/`,
  `hooks/`, `types/`, wires the `QueryKeys` enum and lints the result. Pass `--plural` when
  the plural is irregular (`person --plural people`). Never create an entity by hand.
- **New feature:** `yarn generate:feature <name>` — scaffolds `ui/`, `hooks/`, `lib/`,
  `schemas/`, `types/`. Never create a feature by hand.
- **Finishing a feature:** always run `yarn lint:fix && yarn typescript`.

Names are camelCase or kebab-case (`userProfile`, `user-profile`); folders come out
kebab-case. Generators emit no barrel files. If a generator can't produce what a task needs,
stop and ask — fixing the generator is valid, bypassing it is not. After changing a
generator, run `yarn test:cli`.

## Architecture Rules (non-negotiable)

Hard constraints. If a task cannot be done without breaking one, **stop and ask** instead of
working around it. Code examples for each rule live in `ARCHITECTURE.md`.

0. **Generators only.** Entities and features are always scaffolded by the CLI
   (`generate:entity` / `generate:feature`), never written by hand — hand-written folders
   skip the `QueryKeys` wiring and drift from the expected layout. Then edit what they
   produced (delete unused request kinds).

1. **Env vars only through `src/env.ts`.** `process.env` is read in exactly one place, where
   every variable is declared and validated with Zod via `createEnv`. Everywhere else,
   `import { env } from 'env'`. Forbidden outside that file: `process.env.X`, `process.env.X!`,
   `process.env.X ?? 'fallback'` (lint-enforced by `no-restricted-properties`). Adding a
   variable = three edits: the schema entry (`client` for `NEXT_PUBLIC_*`, else `server`),
   the matching `runtimeEnv` line, and the key in `.env.example`. `next build` validates every
   required variable through the `./src/env` import in `next.config.ts`, so a required one also
   needs a GitHub Actions variable (a secret for a server-only value) and a line in the Build
   step's `env:` in `.github/workflows/build.yml`. Server-only vars must never be named
   `NEXT_PUBLIC_*`. Do not remove the `./src/env` import in `next.config.ts`.

2. **Pages and layouts are Server Components.** No `'use client'` on a `page.tsx` /
   `layout.tsx`, and therefore no hooks, stores, or browser APIs there. `error.tsx` and
   `global-error.tsx` are the exception: Next requires them to be Client Components, so they
   carry `'use client'`. Interactive code is a client component in `features/` (or `widgets/`)
   carrying its own `'use client'`; the page only composes them. `'use client'` sits on the
   smallest **leaf** that needs it. A page prefetches server data with the entity's
   `queryOptions` factory into one per-request client from `getQueryClient()`
   (`shared/lib/query`), then passes that same client to `dehydrate` inside `HydrationBoundary`.

3. **Layer placement.**
   - `shared/**` = global, reusable, feature-agnostic: `ui`, `types`, `store`, `providers`,
     `lib`, `icons`, `hooks` (no network), `constants`. There is **no `shared/api/`**: every
     API call, including one-offs, is an entity.
   - `entities/<entity>` = **API access only** (`api` + `types` + `hooks`), one folder per
     route prefix, no UI or business logic.
   - `features/<feature>` = UI + interaction logic. `widgets/` = compositions of features.
     `app/` = routing, layouts, pages; no business logic.
   - `features` and `widgets` use an entity's `hooks/` and `types/`, never its `api/`. A page
     prefetches through the entity's `queryOptions` factory in `hooks/`. Only the entity's own
     `hooks/` and server code in `app/` (a route handler, a Server Action) import
     `entities/<entity>/api` directly. Lint (`boundaries/dependencies`) enforces the
     `features`/`widgets` part; the rest is a convention that review checks.

4. **Validation only via Zod.** All untrusted input (forms, search params) is validated with a
   Zod schema; feature schemas live in `features/<feature>/schemas/`, and the type is derived
   with `z.infer` (`z.input` when the pre-parse shape is needed), never hand-written. Forms use
   React Hook Form with `zodResolver(schema)` and let `useForm` infer its types from the
   resolver — no single `useForm<T>()` generic (if one is unavoidable, see `ARCHITECTURE.md`).

5. **Server state → TanStack Query, client state → zustand.** API data is fetched with a
   query/mutation hook from `entities/<entity>/hooks`, keyed with a `QueryKeys` member, and
   invalidated after mutations — never mirrored into a store or `useState`. Each query has one
   `queryOptions` factory next to its hook in `entities/<entity>/hooks/`; the hook and the
   server prefetch both call it, so the key and the fetcher are written once. Purely
   client-side state (theme, modals, wizard step) is a zustand store in `shared/store`. Query
   keys always come from the `QueryKeys` enum, never inline strings. Never import a
   module-level `QueryClient`: server code calls `getQueryClient()`, which returns a new client
   per request; hooks call `useQueryClient()`.

6. **Assets.** Custom/restyled icons → SVG in `src/shared/icons/` (SVGR components);
   used-as-is icons → `public/icons/`, rendered with `next/image` (a plain `<img>` fails lint).
   Every other image → WebP in `public/`, rendered with `next/image`. No PNG/JPEG or raster
   image under `src/`, except the Next.js metadata image files in `app/` (`favicon.ico` and the
   `icon`, `apple-icon`, `opengraph-image` and `twitter-image` files).

7. **No barrel files, ever.** No `index.ts` re-exporting a folder anywhere in `src/`
   (lint-enforced: `no-restricted-syntax` bans `export * from` / `export { x } from`). Always
   import directly from the declaring file. Absolute imports from `src` across layers
   (per-layer `paths` in `tsconfig.json`); relative imports for siblings in the same slice.
   Layer boundaries (`app → widgets → features → entities → shared`, plus "same slice only")
   are enforced by `eslint-plugin-boundaries`.

8. **`src/` has a fixed set of folders.** Every `.ts`/`.tsx` file must match a declared
   layer/segment (`boundaries/no-unknown-files`): no stray top-level folder (`src/utils/`,
   `src/shared/api/`) and no stray segment inside a slice (`entities/todos/ui/`,
   `features/todos/store/`). Code in `src/` is TypeScript-only: a `.js`, `.jsx`, `.mjs`,
   `.cjs`, `.mts` or `.cts` file there fails lint (`check-file/filename-blocklist`). A new
   kind of code that doesn't fit → **stop and ask**. The fix is to extend
   `boundaries/elements` in `eslint.config.mjs` on purpose, add a `paths` entry in
   `tsconfig.json` for a new top-level folder, and update the segment list in
   `ARCHITECTURE.md` and the summary in `README.md`; inventing a folder is not.

9. **Styling — Tailwind only.** Utility classes composed with `cn()` from `shared/lib/styles`.
   The only stylesheet in `src/` is `src/app/styles/global.css`; no component-level
   `.css`/`.module.css`/`.scss`/`.sass`/`.less` (lint-enforced by `no-restricted-imports`).
   Reusable values go in `global.css` as `@theme` variables; a reusable class is an `@utility`
   there. A library's own stylesheet is imported from the package (`import 'swiper/css'`),
   never copied into `src/`.

10. **Naming — kebab-case** for every file and folder under `src/` (`create-todo-form.tsx`,
    `entities/todos/`). `src/app/**` is the exception — it follows Next.js App Router naming
    (`[id]`, `(group)`, `@slot`, fixed special filenames). Lint-enforced by
    `eslint-plugin-check-file`.

11. **Comments explain why, not what.** Write a comment only for what the code cannot say: the
    reason for a choice, a constraint, a workaround (with a link to its issue), or a non-obvious
    consequence. Never restate what the code does, narrate history ("changed X to Y"), or leave
    commented-out code. A comment goes on its own line above the code it explains, never after
    code on the same line (lint-enforced by `no-inline-comments`; `eslint-disable-*` directives
    are exempt). When you change code, update or delete every comment it makes wrong: a stale
    comment misleads more than a missing one. JSDoc on a function or component only when it adds
    non-obvious context.
