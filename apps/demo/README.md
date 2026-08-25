# `@midstem/chronous-demo`

The Chronous playground: every field of `RangeSpec` is a control, the events are
editable JSON, and the board between them is a real render of what
`buildCalendar` returned — a time grid with packed columns, lanes of all-day and
multi-day bars, and a month grid.

Beside the board it prints the raw `Calendar`, a summary of what the engine
produced, and the call the current settings describe.

It consumes `@midstem/chronous` and `@midstem/chronous-react` by name, so it
resolves their built output and their exports map the way an outside consumer
would. Build the packages first:

```bash
npm run build
```

Then run it:

```bash
npm run dev --workspace @midstem/chronous-demo
```

`Temporal` is loaded on demand: the app installs `temporal-polyfill/global`
before the first render only when the browser does not carry `Temporal` itself,
so the polyfill lands in its own chunk and native runtimes never download it.

The app is private and is never published to npm. It is the page GitHub Pages
serves.
