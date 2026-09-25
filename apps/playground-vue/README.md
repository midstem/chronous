# `@midstem/chronous-playground-vue`

The Chronous Vue playground. The left rail carries the props — every field of
`CalendarRange` as a control, and the events as editable JSON. The masthead
switches what fills the rest of the window.

**Calendar** is the board: a full-width time grid with packed columns, a sticky
header, an all-day strip, a month grid and an agenda list, all drawn with the
Vue components from `@midstem/chronous-vue`. Under it a status strip prints
the summary of the `CalendarLayout`, and opens onto its raw JSON.

**Code** is that same board as one standalone Vue single-file component (`.vue`). It carries the
range, the events and the row height on screen, and the same Tailwind classes, the
same geometry and the same components the board runs — including the scroll to 07:00
and the current-time line.

**Simple** is the short way to the same picture: no toolbar, no navigation, no
colour palette, no helper functions — the range, the events, and plain components.

The board is styled with Tailwind CSS v4 and shares logic with the other playgrounds
through `@midstem/playground-core`.

Build the packages first:

```bash
npm run build
```

Then run it:

```bash
npm run dev --workspace @midstem/chronous-playground-vue
```

The app imports `temporal-polyfill/global` from its entry module before bootstrap,
showing how a consumer supplies Temporal on browsers without native support.

The app is private and is never published to npm.
