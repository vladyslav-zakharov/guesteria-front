import path from 'node:path';

import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';
import checkFile from 'eslint-plugin-check-file';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

const dirname = import.meta.dirname;

export default defineConfig([
  // Lint only `src/` and the generators in `cli/`: ignore everything at the root, then
  // re-include those two folders.
  globalIgnores(['*', '!src/', '!cli/']),

  js.configs.recommended,
  // `eslint-config-next` registers the react, react-hooks, import, jsx-a11y and @next/next
  // plugins. Never register another instance of them here: on ESLint 10 a second react or
  // import instance crashes with `getFilename is not a function`. Configure their rules by
  // name only.
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname,
      },
    },
  },

  {
    // Rules kept from eslint-config-airbnb, with airbnb's options. The upstream presets above
    // either do not enable them or enable them with different defaults.
    files: ['**/*.{ts,tsx}'],
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-else-return': ['error', { allowElseIf: false }],
      'prefer-template': 'error',
      'object-shorthand': [
        'error',
        'always',
        { ignoreConstructors: false, avoidQuotes: true },
      ],
      'no-nested-ternary': 'error',
      'array-callback-return': [
        'error',
        { allowImplicit: true, checkForEach: false, allowVoid: false },
      ],
      radix: 'error',
      'no-await-in-loop': 'error',
      'prefer-const': [
        'error',
        { destructuring: 'any', ignoreReadBeforeAssign: true },
      ],
      'no-cond-assign': ['error', 'always'],
      'no-unsafe-optional-chaining': [
        'error',
        { disallowArithmeticOperators: true },
      ],

      'no-eval': 'error',
      'no-script-url': 'error',
      'no-proto': 'error',
      'no-extend-native': 'error',
      'no-new-wrappers': 'error',
      'no-caller': 'error',
      'no-return-assign': ['error', 'always'],
      'no-sequences': 'error',
      'no-self-compare': 'error',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'error',

      'import/no-cycle': [
        'error',
        {
          maxDepth: '∞',
          ignoreExternal: false,
          allowUnsafeDynamicCyclicDependency: false,
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*{.,_}{test,spec}.{ts,tsx}',
            '**/__tests__/**',
            '**/__mocks__/**',
          ],
          optionalDependencies: false,
        },
      ],
      'import/first': 'error',
      'import/no-mutable-exports': 'error',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        { selector: 'function', format: ['camelCase', 'PascalCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],

      'react/self-closing-comp': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/no-array-index-key': 'error',
      'react/jsx-no-constructed-context-values': 'error',
      'react/button-has-type': [
        'error',
        { button: true, submit: true, reset: false },
      ],
      // Airbnb lists react-router's `Link` `to`; Next's `Link` takes `href`.
      'react/jsx-no-script-url': ['error', [{ name: 'Link', props: ['href'] }]],

      'jsx-a11y/anchor-has-content': ['error', { components: [] }],
      'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
      'jsx-a11y/aria-role': ['error', { ignoreNonDOM: false }],
      'jsx-a11y/control-has-associated-label': [
        'error',
        {
          labelAttributes: ['label'],
          controlComponents: [],
          ignoreElements: [
            'audio',
            'canvas',
            'embed',
            'input',
            'textarea',
            'tr',
            'video',
          ],
          ignoreRoles: [
            'grid',
            'listbox',
            'menu',
            'menubar',
            'radiogroup',
            'row',
            'tablist',
            'toolbar',
            'tree',
            'treegrid',
          ],
          depth: 5,
        },
      ],
      'jsx-a11y/heading-has-content': ['error', { components: [''] }],
      'jsx-a11y/html-has-lang': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/lang': 'error',
      'jsx-a11y/media-has-caption': [
        'error',
        { audio: [], video: [], track: [] },
      ],
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
      'jsx-a11y/no-distracting-elements': [
        'error',
        { elements: ['marquee', 'blink'] },
      ],
      'jsx-a11y/no-interactive-element-to-noninteractive-role': [
        'error',
        { tr: ['none', 'presentation'] },
      ],
      'jsx-a11y/no-noninteractive-element-to-interactive-role': [
        'error',
        {
          ul: [
            'listbox',
            'menu',
            'menubar',
            'radiogroup',
            'tablist',
            'tree',
            'treegrid',
          ],
          ol: [
            'listbox',
            'menu',
            'menubar',
            'radiogroup',
            'tablist',
            'tree',
            'treegrid',
          ],
          li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
          table: ['grid'],
          td: ['gridcell'],
        },
      ],
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel'] },
      ],
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',
    },
  },

  prettierRecommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      boundaries,
      'check-file': checkFile,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
      // Never parse files in node_modules (or non-JS assets) when following imports. airbnb set
      // this; without it import/no-cycle parses every dependency's type declarations and runs
      // about ten times slower.
      'import/ignore': [
        'node_modules',
        '\\.(coffee|scss|css|less|hbs|svg|json)$',
      ],
      // FSD layers, relative to `src`. `slice`/`segment` are captured so
      // policies below can compare "same slice" (e.g. features/todos -> features/todos).
      // Every file under `src` must match exactly one of these — see `boundaries/no-unknown-files`
      // below, which is what actually forbids creating folders outside this list.
      'boundaries/root-path': path.resolve(dirname, 'src'),
      // File (not folder) descriptor, so `src/env.ts` counts as "known" for
      // `boundaries/no-unknown-files` without being a folder-based element.
      'boundaries/files': [{ pattern: 'env.ts', category: 'env' }],
      // Every element pattern is scoped down to its documented segments (not just
      // `<layer>/*`) — a file in an undeclared segment (e.g. `entities/todos/ui/`,
      // `features/todos/store/`) matches no element and gets caught by
      // `boundaries/no-unknown-files` just like a stray top-level folder would.
      'boundaries/elements': [
        { type: 'app', pattern: 'app/**', partialMatch: false },
        {
          // No `schemas` segment here: forms/validation live in `features`, not `widgets`.
          type: 'widgets',
          pattern: 'widgets/*/(ui|hooks|lib|types)/**',
          capture: ['slice'],
        },
        {
          type: 'features',
          pattern: 'features/*/(ui|hooks|schemas|lib|types)/**',
          capture: ['slice'],
        },
        {
          // No `ui` segment: entities are API-only (see rule 3 in CLAUDE.md).
          type: 'entities',
          pattern: 'entities/*/(api|hooks|types)/**',
          capture: ['slice', 'segment'],
        },
        {
          // No `api` segment: every API call belongs to an entity (see rule 3 in CLAUDE.md).
          type: 'shared',
          pattern:
            'shared/(ui|types|store|providers|lib|icons|hooks|constants)/**',
          capture: ['segment'],
        },
      ],
    },
    rules: {
      // Every file in `src` must belong to one of the `boundaries/elements` above —
      // this is what actually blocks creating a stray folder like `src/utils/` or
      // `src/shared/api/`.
      'boundaries/no-unknown-files': 'error',
      // File/folder naming is kebab-case everywhere in `src`, e.g. `create-todo-form.tsx`,
      // `entities/todos/`. `src/app/**` gets Next.js's own App Router case instead, since it
      // has its own conventions (`[id]`, `(group)`, `@slot`) that aren't plain kebab-case.
      'check-file/filename-naming-convention': [
        'error',
        { 'src/**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/app/**/': 'NEXT_JS_APP_ROUTER_CASE',
          'src/!(app)/**/': 'KEBAB_CASE',
        },
      ],
      // FSD layer rule: app -> widgets -> features -> entities -> shared.
      // A layer may only import itself (same slice) and layers strictly below it;
      // `shared` has no slices and its segments may freely import each other.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'shared' } },
              allow: {
                to: [
                  { element: { type: 'shared' } },
                  { file: { categories: 'env' } },
                ],
              },
            },
            {
              from: { element: { type: 'entities' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'entities',
                      captured: { slice: '{{ from.element.captured.slice }}' },
                    },
                  },
                  { element: { type: 'shared' } },
                  { file: { categories: 'env' } },
                ],
              },
            },
            {
              from: { element: { type: 'features' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'features',
                      captured: { slice: '{{ from.element.captured.slice }}' },
                    },
                  },
                  {
                    element: {
                      type: 'entities',
                      captured: { segment: '{hooks,types}' },
                    },
                  },
                  { element: { type: 'shared' } },
                  { file: { categories: 'env' } },
                ],
              },
            },
            {
              from: { element: { type: 'widgets' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'widgets',
                      captured: { slice: '{{ from.element.captured.slice }}' },
                    },
                  },
                  { element: { type: 'features' } },
                  {
                    element: {
                      type: 'entities',
                      captured: { segment: '{hooks,types}' },
                    },
                  },
                  { element: { type: 'shared' } },
                  { file: { categories: 'env' } },
                ],
              },
            },
            {
              // features and widgets never import an entity's api; only the entity's own hooks
              // and server code in app do (rule 3). This is a disallow policy because boundaries
              // prints a policy's message only when that policy decides the violation; allow
              // policies never do.
              from: { element: { type: ['features', 'widgets'] } },
              disallow: {
                to: {
                  element: { type: 'entities', captured: { segment: 'api' } },
                },
              },
              message:
                '"{{from.element.type}}" must not import entities/*/api. Use the entity\'s hooks or types; only the entity\'s own hooks and server code in app import its api.',
            },
            {
              from: { element: { type: 'app' } },
              allow: {
                to: [
                  { element: { type: 'app' } },
                  { element: { type: 'widgets' } },
                  { element: { type: 'features' } },
                  { element: { type: 'entities' } },
                  { element: { type: 'shared' } },
                  { file: { categories: 'env' } },
                ],
              },
            },
          ],
        },
      ],
      // Barrel files (`export * from`, `export { x } from`) are forbidden: they hurt
      // tree-shaking/build times in Next.js and hide real import paths. Always import
      // (and export) directly from the file that declares the symbol.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ForInStatement',
          message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
        },
        {
          selector: 'ForOfStatement',
          message:
            'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
        },
        {
          selector: 'LabeledStatement',
          message:
            'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
        },
        {
          selector: 'WithStatement',
          message:
            '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
        },
        {
          selector: 'ExportAllDeclaration',
          message:
            'Barrel re-exports ("export * from \'...\'") are forbidden. Import directly from the file that declares the symbol.',
        },
        {
          selector: 'ExportNamedDeclaration[source]',
          message:
            'Re-exporting from another module ("export { x } from \'...\'") is forbidden — it creates a barrel. Import directly from the source file instead.',
        },
      ],
      // process.env is only allowed in src/env.ts (see the override at the end of this
      // file) — everywhere else, import the validated `env` object instead.
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            'Do not read process.env directly — add the variable to src/env.ts and import `env` from there instead.',
        },
      ],
      // Styling is Tailwind-only. The single exception is app/styles/global.css (the Tailwind
      // import plus its @theme, @utility and @custom-variant setup). A stylesheet shipped by a
      // library must be imported straight from the package (e.g. `import 'swiper/css'`), never
      // copied into src/ — those bare package specifiers don't match the patterns below.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'app/**/*.css',
                'widgets/**/*.css',
                'features/**/*.css',
                'entities/**/*.css',
                'shared/**/*.css',
                './**/*.css',
                '../**/*.css',
                '**/*.scss',
                '**/*.sass',
                '**/*.less',
                '!app/styles/global.css',
              ],
              message:
                "Custom stylesheets are forbidden — style with Tailwind utility classes (compose them with cn() from shared/lib/styles). For a reusable value or class, add a @theme variable or an @utility to app/styles/global.css instead of writing a stylesheet. The only allowed stylesheet is app/styles/global.css; a third-party library's CSS must be imported directly from its package, not copied into src/.",
            },
          ],
        },
      ],
      'no-console': 'warn',
      curly: ['error', 'all'],
      // Rule 11: a comment sits on its own line above the code it explains. eslint-disable-*
      // directives are exempt.
      'no-inline-comments': 'error',
      'max-params': ['error', 3],
      'no-negated-condition': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-magic-numbers': [
        'warn',
        {
          ignoreArrayIndexes: true,
          ignore: [0, 1, -1, 60, 200, 401, 404, 500],
        },
      ],
      'func-style': ['error', 'expression'],
      'id-denylist': ['error', 'e', 'cb', 'item', 'i', 'err', 'el'],
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
        { blankLine: 'always', prev: ['case', 'default'], next: '*' },
      ],

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      // Allows `interface ICreateX extends Required<Omit<IX, 'id'>> {}`, which the entity
      // generator emits for payload types.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      // Allows `onSubmit={form.handleSubmit(...)}`, the standard React Hook Form pattern.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      // Flags calls to APIs marked @deprecated (z.string().url() in Zod 4, for example), so
      // they are replaced before the next major removes them.
      '@typescript-eslint/no-deprecated': 'error',

      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],

      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
      ],

      'prettier/prettier': 'warn',
    },
  },
  {
    // src/ holds only .ts and .tsx files (rule 8). Every guard above applies to *.ts and *.tsx
    // only, so any other script file in src/ would otherwise pass lint unchecked.
    files: ['src/**/*.{js,jsx,mjs,cjs,mts,cts}'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-blocklist': [
        'error',
        { 'src/**/*.{js,jsx,mjs,cjs,mts,cts}': '*.{ts,tsx}' },
      ],
    },
  },
  {
    // The generators are plain Node ESM scripts, outside the TypeScript program and the FSD
    // layers. The guards above apply to *.ts and *.tsx only, so cli/ gets the shared core,
    // eslint-config-next and Prettier rules, plus no-inline-comments below.
    files: ['cli/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
    rules: {
      'no-inline-comments': 'error',
    },
  },
  {
    // shadcn/ui components are vendored from its registry and regenerated with `shadcn add`.
    // Their upstream shape (function declarations, inline context values, a negated ternary)
    // breaks these rules; rewriting each file would make every upstream update a manual merge.
    files: ['src/shared/ui/shadcn/**/*.tsx'],
    rules: {
      'func-style': 'off',
      'react/jsx-no-constructed-context-values': 'off',
      'no-negated-condition': 'off',
    },
  },
  {
    // The one file allowed to read process.env directly.
    files: ['src/env.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
]);
