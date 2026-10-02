# `@midstem/chronous-playground-vanilla`

The Chronous Vanilla JS playground. The left rail carries the props — every field of
`CalendarRange` as a control, and the events as editable JSON. The masthead
switches what fills the rest of the window.

**Calendar** is the board: a full-width time grid with packed columns, a sticky
header, an all-day strip, a month grid and an agenda list, all drawn with standard
DOM from nothing but what `buildCalendar` returned. Under it a status strip prints the
summary of the `CalendarLayout`, and opens onto its raw JSON.

**Code** is that same board as one file. It carries the range, the events and
the row height on screen, and the same Tailwind classes, the same geometry and the
same standard DOM rendering the board runs. Slotted views include the scroll to
07:00 and the current-time line. The generated file is plain JavaScript and
contains only the selected view’s renderer. Its navigation moves through dates
while keeping that view.

**Simple** starts with the range, the events, and small rendering functions
that walk the `CalendarLayout` and lay it out in the DOM. It uses a compact,
neutral style without a toolbar or navigation, and is the place to start reading.

The board is styled with Tailwind CSS v4. Colours are design tokens resolved
with `light-dark()`, so the page follows the operating system and the toggle in
the masthead pins the opposite theme — the choice is kept in `localStorage` and
replayed from `index.html` before the first paint.

It consumes `@midstem/chronous` directly by name, with no UI framework involved. Build the packages first:

```bash
npm run build
```

Then run it:

```bash
npm run dev --workspace @midstem/chronous-playground-vanilla
```

The app imports `temporal-polyfill/global` from its entry module before the first
render, showing how a consumer supplies Temporal on browsers without native support.

To use the copied example, install `@midstem/chronous` and `temporal-polyfill` in
an app that supports ES module imports. Include Tailwind CSS v4 and let it scan
the copied file. Provide a `#root` element with a height (for example,
`height: 100dvh`), then import `calendar.js` from your entry module. The snippet
includes its current range, event data and row height; it does not depend on
the playground's internal modules or design tokens.

The app is private and is never published to npm.
