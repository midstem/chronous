# `@midstem/chronous`

Headless scheduling engine: time model, layout and recurrence. Zero React, zero
DOM.

## Installation

```bash
npm install @midstem/chronous
```

## Temporal

The engine speaks [Temporal](https://tc39.es/proposal-temporal/docs/) —
separate types for a moment in a time zone, a date without a time and a
duration — so that DST transitions, all-day events and cross-zone schedules are
correct by construction rather than by discipline.

Temporal is a language feature, not a dependency of this package. Chrome,
Edge and Firefox ship it; Safari does not yet. Load a polyfill only where the
runtime lacks one and it costs nothing on browsers that already have it:

```js
if (!globalThis.Temporal) {
  await import('temporal-polyfill/global')
}
```

`temporal-polyfill` is an optional peer dependency. Bundlers keep a conditional
dynamic import in its own chunk, so it is fetched only by browsers that need it
(~20 kB gzip). `isTemporalAvailable()` reports whether the current runtime has
Temporal at all.

### Server rendering

Temporal has to be installed before the first render, not inside an effect. In
Node the polyfill loads once at startup — in Next.js from `instrumentation.ts`:

```ts
export const register = async () => {
  if (!globalThis.Temporal) await import('temporal-polyfill/global')
}
```

On the client, keep the same conditional import at the top of a module that
loads before hydration.

## Events

An event is described with ISO-8601 strings. Times are read in the calendar's
time zone unless the event carries its own — that is how a Kyiv office schedule
stays correct when it is opened from Berlin.

```ts
type EventInput<TData = unknown> = {
  id: string
  start: string
  end?: string
  duration?: string
  allDay?: boolean
  timeZone?: string
  data?: TData
}
```

- `end` wins over `duration`; with neither, a timed event has zero length.
- `duration` is an ISO-8601 duration (`PT90M`, `P3D`). Date units are calendar
  arithmetic — `P1D` keeps the wall clock across a DST transition — while clock
  units are exact, so `PT4H` is always four real hours.
- An event is all-day when `allDay` says so, or when its dates carry no time.
  All-day events are plain dates with no zone attached, and their `end` is
  **exclusive** — `2026-03-15` to `2026-03-18` covers three days. An `end`
  equal to `start` means a single day.
- A wall time that a DST transition skipped or repeated is resolved with the
  calendar's `disambiguation` (`compatible` by default, or `earlier`, `later`,
  `reject`).
- Input that cannot be read, or an event that ends before it starts, throws
  `InvalidEventError` carrying the offending `eventId`.

## License

MIT
