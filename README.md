# Chronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless scheduling engine. The core owns time zones,
DST, recurrence and the layout of overlapping events; a thin adapter hands it to
your framework as hooks, signals and headless primitives. The markup, the CSS
and the accessibility hooks stay yours — geometry is computed for you, cosmetics are
opt-in.</p>

## Packages

An adapter brings the engine with it, so you install one package and nothing
else.

| Package                                         | Description                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| [`@midstem/chronous`](packages/core)            | The engine: time model, layout, recurrence. No framework, no DOM |
| [`@midstem/chronous-react`](packages/react)     | Hooks and headless primitives for React                          |
| [`@midstem/chronous-angular`](packages/angular) | Signals and headless directives for Angular                      |

Follow a package link for its own README — installation and the shortest example
that draws a calendar.

## Playground

[`apps/demo`](apps/demo) is an interactive playground: the range and the events
on the left, the board they produce beside them, and the one file that draws it
a switch away. Every push to `main` deploys it to
[GitHub Pages](https://midstem.github.io/chronous/).

```bash
npm install
npm run build
npm run start
```

## Documentation

The full documentation lives at
[https://chronous.midstem.net/](https://chronous.midstem.net/).

Its source is kept in the repository and is never published to npm:
[`packages/core/DOCUMENTATIONS.md`](packages/core/DOCUMENTATIONS.md) for the
engine, [`packages/react/DOCUMENTATIONS.md`](packages/react/DOCUMENTATIONS.md)
for React,
[`packages/angular/DOCUMENTATIONS.md`](packages/angular/DOCUMENTATIONS.md) for
Angular, and [DOCUMENTATIONS.md](DOCUMENTATIONS.md) for the repository
itself — layout, the playground, benchmarks and how a release is cut.

## License

MIT
