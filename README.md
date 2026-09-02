# Chronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless scheduling engine. The core owns time zones,
DST, recurrence and the layout of overlapping events; a thin adapter hands it to
your framework as hooks and headless primitives. The markup, the CSS and the
accessibility hooks stay yours — geometry is computed for you, cosmetics are
opt-in.</p>

## Packages

| Package                                     | Description                                                  |
| ------------------------------------------- | ------------------------------------------------------------ |
| [`@midstem/chronous`](packages/core)        | The engine: time model, layout, recurrence. No React, no DOM |
| [`@midstem/chronous-react`](packages/react) | Hooks and headless primitives for React                      |

A React app installs one package, and that package has no dependencies.
`@midstem/chronous-react` builds the engine into its own bundle and re-exports
all of it, so `buildCalendar`, `formatIso`, the error classes and every type
come from the same import as the components — and there is never a question of
which engine version an app is on. Reach for `@midstem/chronous` on its own
where React is not involved — a server, a worker, another framework.

Temporal itself is handled for you, with nothing to call: the React package
loads `temporal-polyfill` on the first render that needs it, as a separate chunk
that only Safari ever fetches. Chrome, Edge and Firefox ship Temporal and draw
on the first render, downloading none of it.

The previous generation shipped as `chronous@1.0.2` and stays available under
the git tag [`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).

## Playground

[`apps/demo`](apps/demo) is an interactive playground: every field of
`CalendarRange` in the left rail, next to the events as editable JSON, and
beside them a full-width board that is nothing but what `buildCalendar`
returned — plus the raw result under it. A switch in the masthead trades the
board for the one file that draws it, range, events and all, ready to paste —
in full, or stripped down to the shortest thing that still draws a calendar. It
carries a light and a dark theme.

```bash
npm run start
```

It imports only `@midstem/chronous-react`, by name, so it reads the built
output the way an outside consumer would — and proves the one install is
enough. Build the packages first:

```bash
npm run build
```

Every push to `main` publishes it to GitHub Pages through
[`.github/workflows/pages.yml`](.github/workflows/pages.yml), which runs
`npm run build:pages` and uploads `apps/demo/dist`.

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
the two packages will not stay on one version forever, and because the bare
`1.0.0` through `1.0.2` tags belong to the previous generation. Publishing needs
an `NPM_TOKEN` secret; packages carry
[provenance](https://docs.npmjs.com/generating-provenance-statements), which is
what `id-token: write` in the workflow is for.

Both packages run the same `prepack`, so `npm pack` and `npm publish` rebuild
from source and re-check the invariants rather than shipping whatever happened
to be in `dist`.

[PUBLISH.md](PUBLISH.md) is the whole flow, including doing it by hand.

## License

MIT
