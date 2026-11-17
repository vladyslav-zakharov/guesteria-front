## Next.js Template ⚡
A starter for Next.js 16 App Router apps built on
[Feature-Sliced Design](https://feature-sliced.design/). Lint enforces the architecture, and
generators scaffold the API layer and the features, so every project built from it keeps the
same structure and rules.

- 🧱 **FSD enforced by lint:** layer boundaries, a fixed set of folders, kebab-case names and
  the ban on barrel files all fail `yarn lint` when broken.
- 🔄 **Server data written once:** pages prefetch with TanStack Query into a per-request
  client and hydrate it on the client, through one `queryOptions` factory per query.
- ⚙️ **Typed env:** every environment variable is declared and validated with Zod in
  `src/env.ts`.
- 🏗️ **Generators:** `yarn generate:entity` and `yarn generate:feature` scaffold code that
  passes lint and type-check.
- 🤖 **Claude Code ready:** `CLAUDE.md`, `ARCHITECTURE.md` and the `.claude/` agents give an AI
  assistant the same rules.


## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/docs) (App Router, Turbopack) and [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/) for server state and
  [Zustand](https://zustand.docs.pmnd.rs/) for client state
- [Zod](https://zod.dev/) and [React Hook Form](https://react-hook-form.com/) for validation
  and forms
- [Axios](https://axios-http.com/docs/intro) as the HTTP client
- [T3 Env](https://env.t3.gg/) for typed environment variables
- [SVGR](https://react-svgr.com/) for SVG icons as React components
- [ESLint](https://eslint.org/) with
  [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) and
  [eslint-plugin-check-file](https://github.com/dukeluo/eslint-plugin-check-file), and
  [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/), [commitlint](https://commitlint.js.org/) and
  [Commitizen](https://github.com/commitizen/cz-cli) for git hooks and commit messages


## 📚 Getting Started
Requires Node.js 24 (see `.nvmrc`; run `nvm use`).
### 1. Install dependencies:
```bash
yarn install
```
### 2. Create a .env file:
```bash
cp .env.example .env
```
### 3. Run the development server:
```bash
yarn dev
```
The app runs at http://localhost:3000.

### 4. Set the CI variable (repositories created from this template)
GitHub does not copy Actions variables into a repository created from a template. Add
`NEXT_PUBLIC_API_URL` under **Settings > Secrets and variables > Actions > Variables**
(the value from `.env.example` works for the demo). Until you do, the `Development Lint & Build`
workflow stops at its first step with this instruction.


## 🧰 Scripts and Git hooks
| Script | What it does |
| --- | --- |
| `yarn dev` | Starts the development server |
| `yarn build` | Builds for production; fails if a required env variable is missing |
| `yarn start` | Serves the production build |
| `yarn lint` | Runs ESLint; any warning fails it |
| `yarn lint:fix` | Runs ESLint and fixes what it can |
| `yarn typescript` | Type-checks the project (`tsc --noEmit`) |
| `yarn generate:entity <singular>` | Scaffolds `entities/<plural-kebab>/`, see [`CLAUDE.md`](CLAUDE.md#code-generation-commands) |
| `yarn generate:feature <name>` | Scaffolds `features/<name>/` |
| `yarn test:cli` | Runs the generator tests |
| `yarn commit` | Runs Commitizen, which then calls `git commit -m` with your answers; the `prepare-commit-msg` hook skips a commit that has a message, so you answer once |
| `yarn lint:staged` | Runs `eslint --fix` on the staged files in `src/` and `cli/`; the `pre-commit` hook runs it |
| `yarn commitlint` | Checks the message in `.git/COMMIT_EDITMSG`; the `commit-msg` hook calls commitlint directly |
| `yarn prepare` | Installs the git hooks; yarn runs it after `yarn install` |

Husky runs three git hooks:
- `pre-commit` runs `yarn lint:staged && yarn typescript`. lint-staged runs `eslint --fix` on
  the staged files in `src/` and `cli/`, so a lint or type error stops the commit.
- `commit-msg` runs commitlint on the message.
- `prepare-commit-msg` opens the Commitizen prompts on a plain `git commit` in a terminal,
  and the answers become the message. It does nothing when git already has a message source:
  `-m`, `-F`, `-t` or `commit.template`, `--amend`, `-c`/`-C`, a merge or a squash. It also
  does nothing without a terminal, such as in a GUI client, and the commit goes on. With
  `commit.template` set, run `yarn commit` to get the prompts.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
`type(scope?): subject`, for example `fix(todos): keep the page after a toggle`. The
`commit-msg` hook rejects any other format. The allowed types are listed in
[`@commitlint/config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum).


## 🧱 Feature-Sliced Design (FSD)
`src/` follows [Feature-Sliced Design](https://feature-sliced.design/docs): code is grouped
by layer, from the most concrete (`app`) to the most generic (`shared`):
```text
app → widgets → features → entities → shared
```
A layer may import only itself (the same slice) and the layers below it; `shared` imports only
other `shared` segments, plus libraries and `env`. `eslint-plugin-boundaries` enforces this in
`yarn lint`.

- `app/`: routing, layouts and pages. `page.tsx` and `layout.tsx` are Server Components;
  `error.tsx` is a Client Component, because Next requires it.
- `widgets/`: page-level blocks that combine several features, such as the header. Optional:
  small apps may not need it.
- `features/`: one user-facing capability each, with its UI, hooks, Zod schemas and helpers.
- `entities/`: the API layer, one folder per route prefix, with no UI. `features` and
  `widgets` use an entity's `hooks/` and `types/`, never its `api/`. A page prefetches through
  the entity's `queryOptions` factory in `hooks/`. Only the entity's own `hooks/` and server
  code in `app/` (a route handler, a Server Action) import `entities/<entity>/api` directly.
- `shared/`: everything global and feature-agnostic: UI components, utils, stores, providers,
  constants, types and icons.

`src/env.ts` sits outside the layers: it is the only file that reads `process.env`.
`ARCHITECTURE.md` has [the folder tree and the segments allowed in each
layer](ARCHITECTURE.md#directory-structure) and [what goes
where](ARCHITECTURE.md#layer-placement-where-a-file-goes).


## 📏 Rules at a glance
The hard rules live in [`CLAUDE.md`](CLAUDE.md#architecture-rules-non-negotiable), and lint
enforces most of them. In short:

0. Entities and features come from the generators, never written by hand.
1. `process.env` is read only in `src/env.ts`; everything else imports `env`.
   [Example](ARCHITECTURE.md#environment-variables-rule-1)
2. Pages and layouts are Server Components; `'use client'` sits on the smallest leaf.
   [Example](ARCHITECTURE.md#pages-are-server-components-rule-2)
3. Every file goes to its layer. There is no `shared/api/`: every API call is an entity.
   [Details](ARCHITECTURE.md#layer-placement-where-a-file-goes)
4. Untrusted input (forms, search params) is validated with Zod, and types come from
   `z.infer`. [Example](ARCHITECTURE.md#zod-schemas-and-inferred-types-rule-4)
5. Server state lives in TanStack Query and client state in zustand stores; query keys come
   from `QueryKeys`. [Example](ARCHITECTURE.md#entity-hooks-rule-5)
6. Restyled icons are SVGs in `shared/icons/`, other icons SVGs in `public/icons/`, and every
   other image a WebP file in `public/`. [Example](ARCHITECTURE.md#assets-rule-6)
7. No barrel files: every import names the file that declares the symbol (see below).
   [Example](ARCHITECTURE.md#imports-without-barrel-files-rule-7)
8. `src/` has a fixed set of folders and holds only TypeScript files.
   [Segment list](ARCHITECTURE.md#directory-structure)
9. Styling is Tailwind only, composed with `cn()`; the only stylesheet is `global.css`.
   [Example](ARCHITECTURE.md#styling-rule-9)
10. Files and folders are kebab-case, except Next's own names in `src/app/`.
    [Example](ARCHITECTURE.md#naming-rule-10)
11. Comments explain why, not what, and sit on their own line.
    [Example](ARCHITECTURE.md#comments-rule-11)

### Why no barrel files
No folder in `src/` has an `index.ts` that re-exports its contents. Barrel files defeat
tree-shaking (importing one symbol pulls in the whole barrel graph), slow down cold builds and
HMR, and hide where a symbol actually lives. ESLint's `no-restricted-syntax` rule rejects both
`export * from '...'` and `export { x } from '...'`, so a barrel file cannot come back by
accident.


## 🤖 Claude Code agents & commands
This repo ships a `.claude/` folder with Claude Code agents and slash commands tuned to this
template's FSD/Next.js conventions (the same rules documented in `CLAUDE.md`), so anyone using
Claude Code in this repo gets them automatically — no setup required.

| Path | What it does |
| --- | --- |
| `.claude/commands/pr-review.md` (`/pr-review`) | Orchestrated PR review: runs the two agents below in parallel against a PR (or the local branch diff), merges their findings, and publishes one review. |
| `.claude/agents/pr-review/pr-architecture-reviewer.md` | Checks a diff against this repo's own architecture rules, read live from `CLAUDE.md` (Server/Client components, generator-only `entities`/`features`, no barrel files, layer boundaries, `env.ts`, Zod, `QueryKeys`, Tailwind-only styling, kebab-case). |
| `.claude/agents/pr-review/pr-functional-reviewer.md` | Verifies a PR actually implements its ticket and hunts for logic bugs on the real code path (query-key mismatches, stale query-cache data, unhandled loading/error states). |
| `.claude/agents/code-reviewer.md` | General quality/maintainability review for a diff. No test-coverage checks — the application has no test suite. |
| `.claude/agents/security-auditor.md` | Frontend-focused security review: XSS, `NEXT_PUBLIC_*` env leakage, CSP/security headers, client-side token handling. |
| `.claude/agents/ai-engineer.md` | LLM/RAG integration specialist for AI-powered feature work. |

These are **not** a substitute for `yarn lint:fix && yarn typescript` — they catch things lint
can't (architectural intent, ticket coverage, logic bugs), while ESLint/TypeScript remain the
hard gate for everything mechanical.
