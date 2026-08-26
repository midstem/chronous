# `@midstem/chronous-demo`

The Chronous playground. The left rail carries the props — every field of
`RangeSpec` as a control, the events as editable JSON, and the component the
current settings describe, ready to copy. The rest of the window is the board:
a full-width time grid with packed columns, a sticky header, an all-day strip,
a month grid and an agenda list, all drawn from nothing but what
`buildCalendar` returned.

Under the board a status strip prints the summary of the `Calendar`, and opens
onto its raw JSON.

The board is styled with Tailwind CSS v4. Colours are design tokens resolved
with `light-dark()`, so the page follows the operating system and the toggle in
the masthead pins the opposite theme — the choice is kept in `localStorage` and
replayed from `index.html` before the first paint.

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
