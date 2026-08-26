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

The previous generation shipped as `chronous@1.0.2` and stays available under
the git tag [`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).

## Playground

[`apps/demo`](apps/demo) is an interactive playground: every field of
`RangeSpec` in the left rail, next to the events as editable JSON, and beside
them a full-width board that is nothing but what `buildCalendar` returned —
plus the raw result under it. A switch in the masthead trades the board for the
one file that draws it, spec, events and all, ready to paste — in full, or
stripped down to the shortest thing that still draws a calendar. It carries a
light and a dark theme.

```bash
npm run start
```

It resolves the packages by name, so it reads their built output the way an
outside consumer would. Build them first:

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

## License

MIT
