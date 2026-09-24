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

What follows is the repository itself — how it is laid out, how the playground
runs, how the benchmarks are read and how a release is cut.

## Layout

| Path                      | What it is                                           |
| ------------------------- | ---------------------------------------------------- |
| `packages/core`           | `@midstem/chronous` — the engine                     |
| `packages/react`          | `@midstem/chronous-react` — hooks and primitives     |
| `packages/angular`        | `@midstem/chronous-angular` — signals and directives |
| `packages/playground-core`| `@midstem/playground-core` — shared playground logic  |
| `apps/playground-react`   | React playground, deployed to GitHub Pages           |
| `apps/playground-angular` | Angular playground                                   |
| `tools/release`           | the interactive release CLI                          |
| `tools/scripts`           | `prepack` and the build invariants                   |

```bash
npm install
npm run build
npm run start
```

`apps/playground-react` and `apps/playground-angular` consume the packages by name,
so they resolve the built output the way an outside consumer would — which is why
`npm run build` comes first, and why CI builds before it lints or typechecks.

## Installing Chronous and Temporal

An app installs one Chronous package, which re-exports the whole engine, so
`buildCalendar`, `formatIso`, the error classes and every type come from the
same import as the components — and there is never a question of which engine
version an app is on. Reach for `@midstem/chronous` on its own where no
framework is involved — a server, a worker, another adapter.

The two adapters carry the engine differently, because their toolchains do.
`@midstem/chronous-react` builds it into its own bundle; `verify-dist.mjs`
fails the build if a `@midstem/chronous` specifier survives into `packages/react/dist`.
`@midstem/chronous-angular` ships Angular's partial declarations, which are
linked rather than bundled, so it depends on the engine the ordinary way and
resolves it at runtime — the same one install for a consumer, and `instanceof`
on the error classes holds across a direct engine import.

The application must supply Temporal before using the calendar. Where it is not
native, install `temporal-polyfill` and import `temporal-polyfill/global` from
the application entry module. Chronous reads `globalThis.Temporal` synchronously.

`packages/angular` builds with `ngc` in `compilationMode: 'partial'` rather than
with vite, because a published Angular library has to carry `ɵɵngDeclare*`
declarations for the consumer's linker; `verify-dist.mjs` checks one emitted
file for them. Its tests run under vitest with
`@analogjs/vite-plugin-angular`, which compiles the templates ahead of time —
signal inputs do not exist in Angular's JIT compiler, so a plain esbuild
transform would silently leave every input unbound.

## Playground

[`apps/playground-react`](apps/playground-react) (React) and
[`apps/playground-angular`](apps/playground-angular) (Angular) are interactive playgrounds:
every field of `CalendarRange` in the left rail, next to the events as editable JSON, and
beside them a full-width board that is nothing but what `buildCalendar`
returned — plus the raw result under it. A switch in the masthead trades the
board for the one file that draws it, range, events and all, ready to paste —
in full, or stripped down to the shortest thing that still draws a calendar. It
carries a light and a dark theme.

```bash
npm run start # starts React playground
npm run start:angular # starts Angular playground
```

Every push to `main` publishes the React playground to GitHub Pages through
[`.github/workflows/pages.yml`](.github/workflows/pages.yml), which runs
`npm run build:pages` and uploads `apps/playground-react/dist`.

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
