# Chronous — working on the repository

Everything here stays in the repository: it is the source for
[https://chronous.midstem.net/](https://chronous.midstem.net/), and none of it
is published to npm.

The engine and the adapters document themselves:

- [`packages/core/DOCUMENTATIONS.md`](packages/core/DOCUMENTATIONS.md) — the
  engine: Temporal, events, recurrence, views, navigation, calendars, layout,
  lanes and labels
- [`packages/react/DOCUMENTATIONS.md`](packages/react/DOCUMENTATIONS.md) — the
  React surface: the one install, Safari, the hooks, every component
- [`packages/angular/DOCUMENTATIONS.md`](packages/angular/DOCUMENTATIONS.md) —
  the Angular surface: the one install, Safari, the signal functions, every
  directive
- [`packages/vue/DOCUMENTATIONS.md`](packages/vue/DOCUMENTATIONS.md) —
  the Vue surface: the one install, Safari, the composables, every
  component

- [`packages/svelte/DOCUMENTATIONS.md`](packages/svelte/DOCUMENTATIONS.md) —
  the Svelte 5 surface: reactive helpers, snippets, contexts and every component
- [`packages/playground-core/DOCUMENTATIONS.md`](packages/playground-core/DOCUMENTATIONS.md) —
  private playground utilities, fixtures, state conversion and browser lifecycle

Package references use a shared agent-oriented structure: scope, setup, public
API, behavior contracts, examples, errors and source maps. Read the selected
adapter reference together with the core reference. Verify changes against
`src/index.ts`, the relevant implementation and `package.json`; examples from
another adapter do not define this adapter's reactive or rendering contract.

For contributor setup and pull requests, see [CONTRIBUTING.md](CONTRIBUTING.md).
GitHub-specific workflows, shared setup and CI scripts are described in
[GitHub automation](.github/README.md).

What follows is the repository itself — how it is laid out, how the playground
runs, how the benchmarks are read and how a release is cut.

## Layout

| Path                       | What it is                                                   |
| -------------------------- | ------------------------------------------------------------ |
| `packages/core`            | `@midstem/chronous` — the engine                             |
| `packages/react`           | `@midstem/chronous-react` — hooks and primitives             |
| `packages/angular`         | `@midstem/chronous-angular` — signals and directives         |
| `packages/vue`             | `@midstem/chronous-vue` — composables and components         |
| `packages/svelte`          | `@midstem/chronous-svelte` — reactive helpers and components |
| `packages/playground-core` | `@midstem/playground-core` — shared playground logic         |
| `apps/playground-vanilla`  | Vanilla JS playground                                        |
| `apps/playground-react`    | React playground                                             |
| `apps/playground-angular`  | Angular playground                                           |
| `apps/playground-vue`      | Vue playground                                               |
| `apps/playground-svelte`   | Svelte playground                                            |
| `tools/release`            | the interactive release CLI                                  |
| `tools/scripts`            | `prepack` and the build invariants                           |
| `tools/package-check`      | isolated npm archive consumers and framework compatibility   |
| `tools/maintenance`        | staged checks and bundle size reports                        |
| `tools/vue-build`          | Vue 3.4 types for compatible published declarations          |

```bash
npm ci
npm run build
npm run start:vanilla
npm run start
```

`apps/playground-vanilla`, `apps/playground-react`, `apps/playground-angular`, `apps/playground-vue`, and `apps/playground-svelte` consume the packages by name,
so they resolve the built output the way an outside consumer would — which is why
`npm run build` comes first, and why CI builds before it lints or typechecks.

## Installing Chronous and Temporal

An app installs one Chronous package, which re-exports the whole engine, so
`buildCalendar`, `formatIso`, the error classes and every type come from the
same import as the components — and there is never a question of which engine
version an app is on. Reach for `@midstem/chronous` on its own where no
framework is involved — a server, a worker, another adapter.

The adapters carry the engine differently, because their toolchains do.
`@midstem/chronous-react` builds it into its own bundle; `verify-dist.mjs`
fails the build if a `@midstem/chronous` specifier survives into `packages/react/dist`.
`@midstem/chronous-vue` also bundles the engine. `@midstem/chronous-svelte`
ships preprocessed Svelte 5 components and a local copy of the engine bundle
and its public declarations. The consumer's Svelte compiler handles client and
SSR builds; the adapter never resolves a separate core package at runtime.
`verify-dist.mjs` checks every Svelte output module and declaration.

`@midstem/chronous-angular` ships a flattened FESM2022 module with Angular's
linkable partial declarations and embeds the core engine during its build.
It resolves no separate core package at runtime. All adapters therefore have
their own engine error classes: a direct `@midstem/chronous` import has different
class identities. Use error classes from the package that built the calendar.

For exact calendar behavior, the application should install `temporal-polyfill`
and import `temporal-polyfill/global` from its entry module in browsers without
native Temporal. Chronous does not bundle it. When `globalThis.Temporal` is
absent, core automatically uses a warning-producing `Date` fallback for basic
calendar behavior; no `CalendarRange` flag is required. See the
[core browser behavior](packages/core/DOCUMENTATIONS.md#browser-behavior) for
its limitations.

`packages/angular` builds with `ng-packagr` and `compilationMode: 'partial'`,
using the isolated Angular 18 toolchain in `tools/angular-build`, because a
published Angular library has to carry `ɵɵngDeclare*`
declarations for the consumer's linker; `verify-dist.mjs` checks one emitted
file for them. Its tests run under vitest with
`@analogjs/vite-plugin-angular`, which compiles the templates ahead of time —
signal inputs do not exist in Angular's JIT compiler, so a plain esbuild
transform would silently leave every input unbound.

## Playground

[`apps/playground-vanilla`](apps/playground-vanilla) (Vanilla JS),
[`apps/playground-react`](apps/playground-react) (React),
[`apps/playground-angular`](apps/playground-angular) (Angular),
[`apps/playground-vue`](apps/playground-vue) (Vue), and
[`apps/playground-svelte`](apps/playground-svelte) (Svelte) are interactive playgrounds:
every field of `CalendarRange` in the left rail, next to the events as editable JSON, and
beside them a full-width board that is nothing but what `buildCalendar`
returned — plus the raw result under it. A switch in the masthead trades the
board for the one file that draws it, range, events and all, ready to paste —
in full, or stripped down to the shortest thing that still draws a calendar. It
carries a light and a dark theme.

```bash
npm run start:vanilla # starts Vanilla JS playground
npm run start         # starts React playground
npm run start:angular # starts Angular playground
npm run start:vue     # starts Vue playground
npm run start:svelte  # starts Svelte playground
```

After CI succeeds on a push to `main`, the Pages workflow publishes all
playgrounds to GitHub Pages. It can also be run manually from the CI workflow
on `main`. The reusable Pages workflow builds with `npm run build:pages` and
uploads `dist-pages`.

## Benchmarks

The engine carries a `vitest bench` suite in
[`packages/core/src/bench`](packages/core/src/bench): the layout and
`buildCalendar` at ten thousand events, recurrence expanded from series anchored
near and far, and the label formatter over a month grid.

```bash
npm run bench --workspace @midstem/chronous
```

The numbers only compare against themselves on one machine. Hold a baseline and
check a change against it:

```bash
npm run bench:save --workspace @midstem/chronous
```

```bash
npm run bench:compare --workspace @midstem/chronous
```

`bench.json` stays out of git. `bench:native` runs the same suite on a runtime
that already carries `Temporal`; expect it to take considerably longer, so reach
for it to compare runtimes rather than to gate a change.

## Releasing

```bash
npm run release
```

[`tools/release`](tools/release) is the interactive CLI: it lists the
publishable packages with their local and published versions, and takes
whichever half of the release is due — bumping the version in `package.json` and
`package-lock.json`, or, once that bump is on `main`, creating the tagged GitHub
release. `npm run release -- --dry-run` walks the same path and writes nothing.

Publishing the release starts
[`.github/workflows/release.yml`](.github/workflows/release.yml), which reads
the package out of the tag, builds, verifies the build invariants, lints,
typechecks and runs the suite, then publishes that one package —
`latest` for a plain version, `next` for a prerelease.

Tags are `<package name>@<version>` — `@midstem/chronous-react@1.0.0` — because
the packages will not stay on one version forever, and because the bare
`1.0.0` through `1.0.2` tags belong to the previous generation. Publishing needs
an `NPM_TOKEN` secret; packages carry
[provenance](https://docs.npmjs.com/generating-provenance-statements), which is
what `id-token: write` in the workflow is for.

Every package runs the same `prepack`, so `npm pack` and `npm publish` rebuild
from source and re-check the invariants rather than shipping whatever happened
to be in `dist`.

[`docs/PUBLISH.md`](docs/PUBLISH.md) is the whole flow, including doing it by
hand.

## History

The previous generation shipped as `chronous@1.0.2` and stays available under
the git tag [`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).
