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

## Layout

Overlapping events are packed into columns the way a calendar draws them, one
day at a time.

```ts
type PlacedEvent<TData = unknown> = {
  event: TimedEvent<TData>
  start: Moment
  end: Moment
  startMinute: number
  endMinute: number
  minutes: number
  top: number
  height: number
  left: number
  width: number
  column: number
  columns: number
  span: number
  continuesBefore: boolean
  continuesAfter: boolean
}
```

- Only events shorter than a day are placed here. All-day events, and timed
  events long enough to cover a whole day, move up into the lanes below.
- An event is clipped to every day it touches, so one event crossing midnight
  is placed once per day with `continuesBefore` and `continuesAfter` saying
  where it carries on.
- Events that overlap form a cluster. The cluster is cut into as few columns as
  it needs, and each event then widens to the right until it meets a
  neighbour — an event with nothing beside it takes the full width.
- `startMinute` and `endMinute` are wall-clock minutes from midnight, the same
  coordinates the grid rows use, and `top` / `height` / `left` / `width` are
  those coordinates as fractions of the day. `minutes` is the real elapsed
  length of the clipped piece: on 29 March 2026 in `Europe/Kyiv` an event from
  01:00 to 04:00 is drawn three hours tall and reports two hours.
- A box never runs backwards. An event that starts and ends inside a repeated
  hour collapses to zero height, exactly as its row does.
- Days without a time grid are placed all the same, so `month` and `agenda`
  cells can order their events by the same numbers.

## Lanes

Long events are drawn as bars above the grid instead of inside it.

```ts
type LaneRow<TData = unknown> = {
  start: CalendarDate
  end: CalendarDate
  days: number
  lanes: number
  spans: PlacedSpan<TData>[]
}

type PlacedSpan<TData = unknown> = {
  event: CalendarEvent<TData>
  start: CalendarDate
  end: CalendarDate
  startDay: number
  endDay: number
  days: number
  lane: number
  lanes: number
  left: number
  width: number
  continuesBefore: boolean
  continuesAfter: boolean
}
```

- Every all-day event gets a bar. A timed event gets one when it covers
  twenty-four hours or more **by the wall clock**, and it then leaves the grid
  entirely. An event from 09:00 to 09:00 the next day is a bar on any date,
  including the day a DST transition cuts to twenty-three real hours; an event
  from 22:00 to 02:00 stays in the grid, split across the two days it touches.
- A range is cut into lane rows: a month grid breaks at every week, so a bar
  never crosses a grid row, and every other view is one row.
- A bar is clipped to its row and placed once per row, with `continuesBefore`
  and `continuesAfter` saying where it carries on.
- `startDay` and `endDay` are day indices inside the row, `endDay` exclusive.
  `days` is the length in days, and `left` / `width` are the same span as
  fractions of the row.
- `start` and `end` are the dates the bar covers, `end` exclusive as everywhere
  else. For a timed event the original moments stay on `event`.
- Bars read across the row, longest first, and each takes the lowest free lane.
  A bar never grows into a free lane beside it. Every bar in a row reports the
  same `lanes` count, so a row can be sized before it is drawn, and a renderer
  that shows only the first few lanes picks its own cut-off.

## License

MIT
