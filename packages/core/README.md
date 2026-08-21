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

## Views

A range turns an anchor date into the days a calendar draws, and the rows it
draws them on.

```ts
type RangeSpec = {
  view: 'day' | 'week' | 'days' | 'month' | 'agenda'
  date: string
  timeZone: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  dayCount?: number
  slotMinutes?: number
  disambiguation?: Disambiguation
}
```

- `day` is one day and `week` is seven from `weekStartsOn` (Monday by
  default). `days` and `agenda` span `dayCount`, which defaults to a week and
  to thirty days. `month` covers the anchor's month padded out to whole weeks;
  the padding days are marked `inPeriod: false`.
- A time grid is built for `day`, `week` and `days`. `month` and `agenda`
  carry no slots.
- Slots are wall-clock rows. A day always has `1440 / slotMinutes` of them —
  twenty-four by default — whatever the time zone does that day. Each slot
  knows its `minuteOfDay`, its real `start` and `end`, and its length in
  `minutes`: a row is placed by the wall clock and sized by elapsed time.
- A DST transition is absorbed by the row it falls in. In `Europe/Kyiv` the
  03:00 row runs two hours on 25 October 2026 and zero on 29 March 2026; in
  `Australia/Lord_Howe` a row can be ninety or thirty minutes long. No row is
  ever negative, and a day's rows always add up to its real length.
- An anchor date that cannot be read, a `slotMinutes` outside 1 to 1440 or a
  `dayCount` below one throws `InvalidRangeError`.

## License

MIT
