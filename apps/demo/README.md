# `@midstem/chronous-demo`

The Chronous playground. The left rail carries the props — every field of
`RangeSpec` as a control, and the events as editable JSON. The masthead switches
what fills the rest of the window.

**Calendar** is the board: a full-width time grid with packed columns, a sticky
header, an all-day strip, a month grid and an agenda list, all drawn from
nothing but what `buildCalendar` returned. Under it a status strip prints the
summary of the `Calendar`, and opens onto its raw JSON.

**Code** is that same board as one file. It carries the spec, the events and the
row height on screen, and the same Tailwind classes, the same geometry and the
same hooks the board runs — including the scroll to 07:00 and the current-time
line. The three shapes the engine draws each get their own version, so the file
follows the view you were looking at. The dark half of every colour pair is a
`dark:` variant, so it follows the system in a stock Tailwind v4 project.

**Simple** is the short way to the same picture: no toolbar, no navigation, no
colour palette, no helper functions — the spec, the events, and one component
that walks the `Calendar` and lays it out. Under half the lines of the full
version, and the place to start reading.

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
