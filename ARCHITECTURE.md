# ARCHITECTURE.md - Reference for Claude Code

Detailed reference for this template: the stack, the Feature-Sliced Design layout, code
examples, and step-by-step recipes. `CLAUDE.md` holds the hard rules and points here for
the "how it looks in code" detail. Read this when you need an example or the exact folder
layout; treat the rules in `CLAUDE.md` as authoritative.

## Stack

Next.js (App Router) frontend template with TypeScript:
- **Next.js 16 App Router (Turbopack)** - React Server Components by default
- **TanStack Query** - server state, caching, SSR prefetch + hydration
- **Zustand** - client state
- **Zod + React Hook Form** - validation and forms
- **Axios** - HTTP client (`shared/lib/axios.ts`)
- **Tailwind CSS** - styling (`cn()` from `shared/lib/styles`)
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
and imports only other `shared` segments, plus libraries and `env`. So `entities/todos` can
never import `entities/users`, `features/*`, or `widgets/*`.

## Directory Structure

```text
src/
├── app/                     # App Router: routing, layouts, pages, global styles
│   ├── layout.tsx           # Server Component
│   ├── page.tsx             # Server Component
│   ├── loading.tsx          # Shown while a page awaits its data
│   ├── error.tsx            # Client Component (Next requires it)
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
│   ├── ui/                  # All reusable UI components
│   ├── types/               # General types
│   ├── store/               # All zustand stores
│   ├── providers/           # All providers (React Query, theme, …)
│   ├── lib/                 # Global utils + configured libs (api, getQueryClient, cn)
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
- `shared/ui/` - **all reusable UI components** (Button, Input, Modal, …). A component
  used by more than one feature, or generic enough to be, belongs here — never duplicated
  inside a feature.
- `shared/types/` - all general/shared types.
- `shared/store/` - **all zustand stores**. A store is never created inside a feature or
  a component file.
- `shared/providers/` - **all React context providers** (TanStack Query and any other
  library that needs one). Providers are client components and are mounted in
  `src/app/layout.tsx`.
- `shared/lib/` - global utilities and configured library instances (`axios.ts` → `api`,
  `query.ts` → `getQueryClient`, `styles.ts` → `cn`).
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
`widgets` use an entity's `hooks/` and `types/`, never its `api/`. A page prefetches through
the entity's `queryOptions` factory in `hooks/`. Only the entity's own `hooks/` and server
code in `app/` (a route handler, a Server Action) import `entities/<entity>/api` directly.

`src/features/<feature>/` — UI components plus the logic of the user's interaction with
them: `ui/` (components), `hooks/`, `schemas/` (Zod schemas for this feature's forms and
search params), `lib/` (feature-local helpers), `types/`.

`src/widgets/` — compositions of several features into a page-level block. Optional: small
apps may not need it.

`src/app/` — routing, layouts, pages, global styles. No business logic.

## Code Examples

### Pages are Server Components (rule 2)
A page parses its search params, prefetches on the server and hands the data down through
`HydrationBoundary`; the client hook reads it from the cache instead of refetching. From
`src/app/page.tsx`:
```tsx
type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const HomePage = async ({ searchParams }: Props) => {
  const { page } = todosSearchParamsSchema.parse(await searchParams);
  const params: IGetTodosParams = { _page: page, _limit: TODOS_PER_PAGE };
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(todosQueryOptions(params));

  return (
    <main className="flex flex-col gap-6 p-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Todos</h1>
        <p className="text-sm">
          The data comes from jsonplaceholder, which accepts changes but does
          not save them.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TodosList params={params} />
      </HydrationBoundary>
      <hr />
      <CreateTodoForm />
    </main>
  );
};
```

On the server every `getQueryClient()` call returns a new client. Call it once per page, keep
it in a local `const`, and pass that instance to both `prefetchQuery` and `dehydrate`.

`error.tsx` (and `global-error.tsx`, if you add one) is the exception to rule 2: Next
requires error boundaries to be Client Components, so the file carries `'use client'`. From
`src/app/error.tsx`:
```tsx
// Next requires error boundaries to be Client Components, unlike pages and layouts.
'use client';

import { Button } from 'shared/ui/button/button';

type Props = {
  error: unknown;
  retry: () => void;
};

const ErrorPage = ({ retry }: Props) => (
  <main className="flex flex-col items-start gap-4 p-2">
    <h1 className="text-2xl font-semibold">Something went wrong</h1>
    <p>The page could not load. Try again in a moment.</p>
    <Button onClick={retry}>Try again</Button>
  </main>
);

export default ErrorPage;
```

### Environment variables (rule 1)
Every variable is declared and validated once, in `src/env.ts`:
```ts
import { createEnv } from '@t3-oss/env-nextjs';
import * as z from 'zod';

const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url({ protocol: /^https?$/ }),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  emptyStringAsUndefined: true,
});

export { env };
```
A server-only variable goes in a `server` object next to `client`. t3-env throws when client
code reads one, so read it only in server code. Everything else imports the validated `env`.
From `src/shared/lib/axios.ts`:
```ts
import axios from 'axios';

import { env } from 'env';

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Zod schemas and inferred types (rule 4)
A form schema and the type derived from it. From
`src/features/todos/schemas/validation.ts`:
```ts
import * as z from 'zod';

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, { error: 'Title is required' }),
  completed: z.boolean().default(false),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
```
Search params are untrusted input too, so the page parses them with a schema from the
feature. From `src/features/todos/schemas/todos-search-params.ts`:
```ts
import * as z from 'zod';

// A missing or malformed `?page=` falls back to the first page instead of failing the request.
export const todosSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
});
```
Forms use React Hook Form with `zodResolver(schema)` and let `useForm` infer its types:
`useForm({ resolver: zodResolver(createTodoSchema) })`. A single generic,
`useForm<z.infer<…>>`, stops type-checking as soon as the schema's input and output types
differ: a `.default()`, or a `.transform()` or `z.coerce` that changes the type. If a generic
is unavoidable, pass all three:
`useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`.

### Entity hooks (rule 5)
Each query has one `queryOptions` factory; the hook and the server prefetch both call it.
From the output of `yarn generate:entity user`, `src/entities/users/hooks/get.ts`:
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
imported as a React component through SVGR. From
`src/features/theme-toggle/ui/theme-toggle/theme-toggle.tsx`:
```tsx
'use client';

import MoonIcon from 'shared/icons/moon.svg';
import SunIcon from 'shared/icons/sun.svg';
import { Themes, useThemeStore } from 'shared/store/theme';
import { Button } from 'shared/ui/button/button';

export const ThemeToggle = () => {
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const isDark = theme === Themes.dark;

  return (
    <Button
      variant="ghost"
      className="p-2"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    >
      {isDark ? (
        <SunIcon aria-hidden className="size-5" />
      ) : (
        <MoonIcon aria-hidden className="size-5" />
      )}
    </Button>
  );
};
```
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
import { useGetTodos } from 'entities/todos/hooks/get';
import { cn } from 'shared/lib/styles';
```
```ts
// ❌ Fails type-check (TS2307): there is no entities/todos/index.ts or shared/lib/index.ts
import { useGetTodos } from 'entities/todos';
import { cn } from 'shared/lib';
```
Use absolute imports from `src` (per-layer `paths` in `tsconfig.json`) across layers. Inside
the same slice, relative imports of siblings are correct and preferred (`../todo/todo`).

### Providers
A provider is a client component in `shared/providers`, mounted once in the root layout.
From `src/app/layout.tsx`:
```tsx
<TanStackQueryProvider>
  <ThemeProvider>
    <Header />
    {children}
  </ThemeProvider>
</TanStackQueryProvider>
```

### Styling (rule 9)
Compose Tailwind classes with `cn()`; never string-concatenate class names. A component with
variants maps each variant to a class string and merges it with `cn()`. From
`src/shared/ui/button/button.tsx`:
```tsx
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-500',
};

interface IProps extends ComponentProps<'button'> {
  variant?: keyof typeof variants;
}

export const Button = ({
  type,
  variant = 'primary',
  className,
  ...props
}: IProps) => (
  <button
    // react/button-has-type checks only a literal or a ternary of literals, so the prop is
    // narrowed here instead of passed through.
    type={type === 'submit' ? 'submit' : 'button'}
    className={cn(
      'cursor-pointer rounded-sm px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      className,
    )}
    {...props}
  />
);
```
```tsx
// ❌ Fails lint (no-restricted-imports): the only stylesheet is app/styles/global.css
import './button.css';
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
✅ src/features/todos/ui/create-todo-form/create-todo-form.tsx
❌ src/features/todos/ui/CreateTodoForm/createTodoForm.tsx    (fails lint: check-file)
```

### Comments (rule 11)
```ts
// ✅ States what the code cannot
// jsonplaceholder pages start at 1, not 0.
const firstPage = 1;
```
```ts
// ❌ Restates the code (lint cannot catch this)
// Set the first page to 1.
const firstPage = 1;
```
```ts
// ❌ Fails lint (no-inline-comments)
const firstPage = 1; // pages start at 1
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
4. Create `src/app/<route>/page.tsx` as a Server Component: parse `searchParams` with that
   schema, prefetch with the entity's `queryOptions` factory, and render the feature inside
   `HydrationBoundary` (see "Pages are Server Components")
5. Run `yarn lint:fix && yarn typescript`

### Add an environment variable
1. Add it to the `client` or `server` schema in `src/env.ts`
2. Add the matching `runtimeEnv` line
3. Add the key to `.env.example`
4. If it is required, add it to GitHub Actions (a variable, or a secret for a server-only
   value) and to the Build step's `env:` in `.github/workflows/build.yml`: `next build`
   validates it
