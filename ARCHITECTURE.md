# ARCHITECTURE.md - Reference for Claude Code

Detailed reference for the StayHub frontend: the stack, the Feature-Sliced Design layout, code
examples, and step-by-step recipes. `CLAUDE.md` holds the hard rules and points here for
the "how it looks in code" detail. Read this when you need an example or the exact folder
layout; treat the rules in `CLAUDE.md` as authoritative.

## Stack

Next.js (App Router) frontend with TypeScript:
- **Next.js 16 App Router (Turbopack)** - React Server Components by default
- **TanStack Query** - server state and caching, fetched in the browser
- **Zustand** - client state
- **Zod + React Hook Form** - validation and forms
- **Axios** - HTTP client (`shared/lib/axios.ts`), base URL `/api` (same-origin rewrite)
- **Tailwind CSS 4 + shadcn/ui** - styling (`cn()` from `shared/lib/styles`), shadcn
  components in `shared/ui/shadcn/`
- **dayjs + `utc` plugin** - all date parsing, math and formatting, through the one
  configured instance in `shared/lib/dayjs.ts`
- **@t3-oss/env-nextjs** - typed, validated environment variables
- **SVGR** - `.svg` imported as React components
- **eslint-plugin-boundaries** - enforces the FSD layer rules at lint time
- **eslint-plugin-check-file** - enforces kebab-case file/folder naming at lint time

## Feature-Sliced Design

The project follows [Feature-Sliced Design](https://feature-sliced.design/) (FSD):
```text
app → widgets → features → entities → shared
```
A layer may import only **itself** (same slice) and layers **strictly below** it — enforced
by `boundaries/dependencies` in `eslint.config.mjs`, not just convention. `shared` has no slices
and imports only other `shared` segments, plus libraries and `env`. So `entities/hotels` can
never import `entities/users`, `features/*`, or `widgets/*`.

## Directory Structure

```text
src/
├── app/                     # App Router: routing, layouts, pages, global styles
│   ├── layout.tsx           # Server Component
│   ├── page.tsx             # Server Component
│   ├── error.tsx            # Client Component (Next requires it)
│   ├── not-found.tsx
│   └── styles/global.css
├── widgets/                 # Compositions of features
├── features/                # UI + user-interaction logic (yarn generate:feature)
│   └── <feature>/
│       ├── ui/              # Components ('use client' where needed)
│       ├── hooks/           # Feature-local hooks
│       ├── schemas/         # Zod schemas for this feature
│       ├── lib/             # Feature-local helpers
│       └── types/           # Feature-local types
├── entities/                # API layer only (yarn generate:entity)
│   └── <entity>/            # One folder per route prefix (/users → users/)
│       ├── api/             # Axios requests
│       ├── types/           # Params, payloads, responses
│       └── hooks/           # React Query hooks and queryOptions factories
├── shared/
│   ├── ui/                  # Reusable UI components, one flat file each
│   │   └── shadcn/          # shadcn/ui registry components (button, drawer, …)
│   ├── types/               # General types
│   ├── store/               # All zustand stores
│   ├── providers/           # All providers (React Query)
│   ├── lib/                 # Global utils + configured libs (api, getQueryClient, cn, dayjs)
│   ├── icons/               # Custom SVG icons (SVGR components)
│   ├── hooks/               # Global hooks (no network calls — those live in entities/)
│   └── constants/           # Global constants + QueryKeys
└── env.ts                   # The only place that reads process.env
public/                      # Static assets: SVG icons, WebP images
```

The set of folders/segments is fixed and lint-enforced (`boundaries/no-unknown-files`):
- `app/**` — unrestricted (routing/pages, not segmented)
- `widgets/*/(ui|hooks|lib|types)/**`
- `features/*/(ui|hooks|schemas|lib|types)/**`
- `entities/*/(api|hooks|types)/**`
- `shared/(ui|types|store|providers|lib|icons|hooks|constants)/**`
- `env.ts` (via a file descriptor, not an element)

## Layer placement (where a file goes)

`src/shared/**` — everything global, reusable and feature-agnostic:
- `shared/ui/` - **all reusable UI components**. A component used by more than one feature,
  or generic enough to be, belongs here — never duplicated inside a feature. Each one is a
  flat file (`shared/ui/date-range-picker.tsx`, not `shared/ui/date-range-picker/…`).
  `shared/ui/shadcn/` holds the shadcn/ui components (`Button`, `Drawer`, `Input`, …).
- `shared/types/` - all general/shared types.
- `shared/store/` - **all zustand stores**. A store is never created inside a feature or
  a component file.
- `shared/providers/` - **all React context providers** (TanStack Query and any other
  library that needs one). Providers are client components and are mounted in
  `src/app/layout.tsx`.
- `shared/lib/` - global utilities and configured library instances (`axios.ts` → `api`,
  `query.ts` → `getQueryClient`, `styles.ts` → `cn`, `dayjs.ts` → `dayjs` with the `utc`
  plugin and `getUtcToday`). Import dates from `shared/lib/dayjs`, never from `dayjs`
  directly, and do no hand-rolled `Date` arithmetic.
- `shared/icons/` - **custom icons only** — `.svg` files imported directly as React
  components via SVGR. Use this when the icon must be customized (`fill="currentColor"`,
  size, theme). An icon that is never restyled goes to `public/icons/` instead.
- `shared/hooks/` - global hooks that **do not touch the network** (`useDebouncedValue`,
  `useMediaQuery`, …). A hook that wraps a TanStack Query call belongs in
  `entities/<entity>/hooks/`, never here.
- `shared/constants/` - global constants, including the `QueryKeys` enum.

There is **no `shared/api/`**. Every API call — even a single one-off endpoint that no other
feature will ever reuse — is scaffolded as an `entities/<entity>`.

`src/entities/<entity>/` — **API access only**, one folder per route prefix. The folder
name is the route prefix (routes under `/users` → `src/entities/users/`), with exactly
`api/` (the axios requests), `types/` (params, responses, payloads), and `hooks/` (the
React Query hooks). An entity contains **no UI and no business logic**. `features` and
`widgets` use an entity's `hooks/` and `types/`, never its `api/`. Only the entity's own
`hooks/` and server code in `app/` (a route handler, a Server Action) import
`entities/<entity>/api` directly.

`src/features/<feature>/` — UI components plus the logic of the user's interaction with
them: `ui/` (components), `hooks/`, `schemas/` (Zod schemas for this feature's forms and
search params), `lib/` (feature-local helpers), `types/`.

`src/widgets/` — compositions of several features into a page-level block. Optional: small
apps may not need it.

`src/app/` — routing, layouts, pages, global styles. No business logic.

## Code Examples

### Pages are Server Components (rule 2)
A page awaits its params, parses them with Zod, sends bad input to `notFound()` or
`redirect()`, and renders one client feature with the parsed values. It does not prefetch:
LiteAPI rates take several seconds, so the feature fetches them in the browser behind a
skeleton. There is no `HydrationBoundary` and no `loading.tsx`. From
`src/app/search/page.tsx`:
```tsx
type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<SearchParamsRecord>;
};

const SearchPage = async ({ searchParams }: Props) => {
  const raw = await searchParams;
  // The back validates stays against the UTC calendar day, so the front uses the same day.
  const today = getUtcToday();
  const stay = parseStayParams({ raw, today });

  if (!stay) {
    redirect(buildPrefillHref(parseStayPrefill(raw)));
  }

  const { sort, refundableOnly } = parseResultsParams(raw);

  return (
    <HotelResults stay={stay} sort={sort} refundableOnly={refundableOnly} />
  );
};
```

`error.tsx` (and `global-error.tsx`, if you add one) is the exception to rule 2: Next
requires error boundaries to be Client Components, so the file carries `'use client'`. From
`src/app/error.tsx`:
```tsx
// Next requires error boundaries to be Client Components, unlike pages and layouts.
'use client';

import { CircleAlert } from 'lucide-react';

import { Button } from 'shared/ui/shadcn/button';
import { StateMessage } from 'shared/ui/state-message';

type Props = {
  error: unknown;
  retry: () => void;
};

const ErrorPage = ({ retry }: Props) => (
  <div className="px-4 pt-4">
    <StateMessage
      tone="error"
      titleAs="h1"
      icon={<CircleAlert />}
      title="Something went wrong"
      description="The page could not load. Try again in a moment."
      action={
        <Button type="button" className="min-h-11 w-full" onClick={retry}>
          Try again
        </Button>
      }
    />
  </div>
);

export default ErrorPage;
```

### Environment variables (rule 1)
Every variable is declared and validated once, in `src/env.ts`:
```ts
import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const env = createEnv({
  server: {
    BACKEND_API_URL: z.url({ protocol: /^https?$/ }),
  },
  client: {},
  runtimeEnv: {
    BACKEND_API_URL: process.env.BACKEND_API_URL,
  },
  emptyStringAsUndefined: true,
});

export { env };
```
`BACKEND_API_URL` is server-only: t3-env throws when client code reads it. The browser never
calls the back directly. `next.config.ts` imports the validated `env` and rewrites `/api/*`
to the back, so the `access_token` cookie stays first-party:
```ts
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${env.BACKEND_API_URL}/api/:path*`,
    },
  ];
},
```
The axios instance in `src/shared/lib/axios.ts` therefore uses the relative base URL `/api`
with `withCredentials: true`, and reads no env at all.

### Zod schemas and inferred types (rule 4)
A form schema. From `src/features/guest-hub/schemas/message.ts`:
```ts
import * as z from 'zod';

export const MESSAGE_MAX_LENGTH = 1000;

// Mirrors the `content` rule of POST /bookings/:bookingId/messages, so a blank or
// oversized question never leaves the browser.
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Type a question.')
    .max(
      MESSAGE_MAX_LENGTH,
      `Keep your question under ${MESSAGE_MAX_LENGTH} characters.`,
    ),
});
```
Search params are untrusted input too, so the page parses them with a schema from the
feature, and the type comes from `z.infer`. From
`src/features/hotel-results/schemas/results-params.ts`:
```ts
// A hand-edited or stale URL falls back to the defaults instead of failing the page: sort
// and the filter only refine a valid stay.
const resultsParamsSchema = z.object({
  sort: z.preprocess(
    firstValue,
    z.enum(RESULTS_SORTS).catch(DEFAULT_RESULTS_SORT),
  ),
  refundableOnly: z.preprocess(
    firstValue,
    z
      .string()
      .optional()
      .catch(undefined)
      .transform(value => value === 'true'),
  ),
});

export type ResultsParams = z.infer<typeof resultsParamsSchema>;
```
Forms use React Hook Form with `zodResolver(schema)` and let `useForm` infer its types:
`useForm({ resolver: zodResolver(messageSchema) })`. A single generic,
`useForm<z.infer<…>>`, stops type-checking as soon as the schema's input and output types
differ: a `.default()`, or a `.transform()` or `z.coerce` that changes the type. If a generic
is unavoidable, pass all three:
`useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`.

### Entity hooks (rule 5)
Each query has one `queryOptions` factory, so the key and the fetcher are written once
(pages in this app do not prefetch, but a future one would reuse the same factory). From
the output of `yarn generate:entity user`, `src/entities/users/hooks/get.ts`:
```ts
// One options factory per query, shared by the server prefetch in app/ and the hook, so
// the query key and the fetcher cannot drift apart.
export const usersQueryOptions = (query: IGetUsersParams) =>
  queryOptions({
    queryKey: [QueryKeys.GET_USERS, query],
    queryFn: ({ signal }) => getUsers(query, signal),
  });

export const userQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [QueryKeys.GET_USERS, userId],
    queryFn: ({ signal }) => getUser(userId, signal),
  });

export const useGetUsers = (query: IGetUsersParams) =>
  useQuery(usersQueryOptions(query));
```
A mutation invalidates the queries it makes stale. `onSuccess` returns the promise, so the
mutation stays pending until the refetch finishes. From `src/entities/users/hooks/post.ts`:
```ts
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess() {
      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_USERS],
        }),
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_INFINITE_USERS],
        }),
      ]);
    },
    mutationFn: (payload: ICreateUser) => createUser(payload),
  });
};
```

### Entity requests
Requests take `(params | payload, signal?)`, use the shared `api` instance, and return
`response.data` typed with an interface from the entity's `types/`. From
`src/entities/users/api/get.ts`:
```ts
export const getUsers = async (
  params: IGetUsersParams,
  signal?: AbortSignal,
): Promise<IUsersResponse> => {
  const response = await api.get<IUsersResponse>('/users', {
    signal,
    params,
  });

  return response.data;
};
```

### Assets (rule 6)
An icon that is restyled (size, `currentColor`, theme) is an SVG in `src/shared/icons/`,
imported as a React component through SVGR. From `src/shared/ui/logo.tsx`:
```tsx
import LogoIcon from 'shared/icons/stayhub-logo.svg';
import { cn } from 'shared/lib/styles';

type Props = {
  className?: string;
};

export const Logo = ({ className }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground',
      className,
    )}
  >
    <LogoIcon aria-hidden className="size-8 text-primary" />
    StayHub
  </span>
);
```
Stock UI icons come from `lucide-react`.
An icon that is never restyled goes to `public/icons/` and is rendered from its URL
(`/icons/…`) with `next/image`, which skips optimization for a `.svg` file on its own; a plain
`<img>` fails lint (`@next/next/no-img-element`). Every other local image is a WebP file in
`public/`, rendered with `next/image`; a remote image also needs its host in
`images.remotePatterns` in `next.config.ts`
([Next.js docs](https://nextjs.org/docs/app/api-reference/components/image#remotepatterns)).
The only raster files under `src/` are the Next.js metadata image files in `app/`:
`favicon.ico` and the `icon`, `apple-icon`, `opengraph-image` and `twitter-image` files.

### Imports without barrel files (rule 7)
```ts
// ✅ Import the file that declares the symbol
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';
```
```ts
// ❌ Fails type-check (TS2307): there is no shared/ui/index.ts or shared/lib/index.ts
import { Button } from 'shared/ui';
import { cn } from 'shared/lib';
```
Use absolute imports from `src` (per-layer `paths` in `tsconfig.json`) across layers. Inside
the same slice, relative imports of siblings are correct and preferred.

### Providers
A provider is a client component in `shared/providers`, mounted once in the root layout.
From `src/app/layout.tsx`:
```tsx
<TanStackQueryProvider>
  <main className="mx-auto w-full max-w-md pb-safe">{children}</main>
  <BottomNav />
  <AuthSheet />
  <AccountSheet />
  <Toaster />
</TanStackQueryProvider>
```

### Styling (rule 9)
Compose Tailwind classes with `cn()`; never string-concatenate class names. A component with
variants uses `cva` (as the shadcn components in `shared/ui/shadcn/` do) and merges the
result with `cn()`. A component with one look just merges its classes with the caller's
`className`. From `src/shared/ui/logo.tsx` (above):
```tsx
<span
  className={cn(
    'inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground',
    className,
  )}
>
```
```tsx
// ❌ Fails lint (no-restricted-imports): the only stylesheet is app/styles/global.css
import './logo.css';
```
A reusable value (a brand color, a spacing scale, a breakpoint, a font) is a `@theme`
variable in `src/app/styles/global.css`, used as a utility class (`bg-brand`):
```css
@theme {
  --color-brand: #1a73e8;
}
```
A reusable class that no built-in utility covers is an `@utility` in the same file. It then
works with variants such as `hover:` and `md:`:
```css
@utility scrollbar-hidden {
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
```
A UI library that ships its own stylesheet (Swiper, react-day-picker, …) is imported straight
from the package (`import 'swiper/css'`), never copied into `src/`. Tailwind 4 targets
Safari 16.4+, Chrome 111+ and Firefox 128+.

### Naming (rule 10)
```text
✅ src/features/hotel-results/ui/hotel-results/hotel-results.tsx
❌ src/features/hotel-results/ui/HotelResults/hotelResults.tsx    (fails lint: check-file)
```

### Comments (rule 11)
```ts
// ✅ States what the code cannot
// The back validates stays against the UTC calendar day, so the front uses the same day.
const today = getUtcToday();
```
```ts
// ❌ Restates the code (lint cannot catch this)
// Get today's UTC date.
const today = getUtcToday();
```
```ts
// ❌ Fails lint (no-inline-comments)
const today = getUtcToday(); // UTC day
```

## Common Tasks

### Add a new API route group (e.g. `/users`)
1. `yarn generate:entity user` — creates `entities/users/` (pass `--plural` for an
   irregular plural)
2. Delete the request kinds the API does not have; adjust paths in `api/*.ts`. When you
   delete the infinite hook, also delete its `GET_INFINITE_*` member from `QueryKeys` and the
   matching `invalidateQueries` call in each mutation hook
3. Fill in `types/responses.ts`, `types/payloads.ts`, `types/params.ts`
4. Import the generated hooks directly (e.g. `entities/users/hooks/get`) from a feature
   component
5. Run `yarn lint:fix && yarn typescript`

### Add a new screen
1. `yarn generate:feature <feature>`
2. Build the components in `features/<feature>/ui/` (`'use client'` only on the leaves that
   need it); reuse components from `shared/ui`; import each component from its own file
3. If the page reads search params, add a Zod schema for them in
   `features/<feature>/schemas/`
4. Create `src/app/<route>/page.tsx` as a Server Component: await and parse `params` /
   `searchParams` with that schema, `redirect()` or `notFound()` on bad input, and render the
   feature with the parsed values; the feature fetches through entity hooks (see "Pages are
   Server Components")
5. Add a `*.test.ts` next to new parsing or formatting logic
6. Run `yarn lint:fix && yarn typescript`

### Add an environment variable
1. Add it to the `client` or `server` schema in `src/env.ts`
2. Add the matching `runtimeEnv` line
3. Add the key to `.env.example`
4. If it is required, add it to GitHub Actions (a variable, or a secret for a server-only
   value) and to the Build step's `env:` in `.github/workflows/build.yml`: `next build`
   validates it
