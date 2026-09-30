# `@midstem/chronous-playground-svelte`

The Chronous Svelte 5 playground. The left rail exposes the `CalendarRange`
fields and editable event JSON; the masthead switches between the calendar and
its generated standalone Svelte component.

The board uses the typed `createCalendarComponents` API for slotted events,
month rows and agenda entries. Shared fixtures, controls, formatting, themes
and styles come from `@midstem/playground-core`. The code view follows the
current view and density and supports both the full and simple variants.

Build the packages first:

```bash
npm run build
```

Then run it:

```bash
npm run dev --workspace @midstem/chronous-playground-svelte
```

The app imports `temporal-polyfill/global` before mounting and uses a relative
Vite base so its assets work under the GitHub Pages `/chronous/svelte/` path.
