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
  recurrence?: RecurrenceInput<TData>
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

## Recurrence

An event that carries `recurrence` is a series. Building a calendar expands it
into instances, and only for the range asked for — an unbounded rule is never
walked past the last day on screen.

```ts
type RecurrenceInput<TData = unknown> = {
  rule?: string
  dates?: string[]
  exceptions?: string[]
  overrides?: RecurrenceOverride<TData>[]
}

type RecurrenceOverride<TData = unknown> = {
  recurrenceId: string
  cancelled?: boolean
  start?: string
  end?: string
  duration?: string
  data?: TData
}
```

- `rule` is an RFC 5545 `RRULE`, with or without the `RRULE:` prefix. Supported
  parts are `FREQ` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`), `INTERVAL`,
  `COUNT`, `UNTIL`, `BYDAY` (with ordinals such as `-1FR` under `MONTHLY` and
  `YEARLY`), `BYMONTHDAY`, `BYMONTH`, `BYSETPOS` and `WKST`. Anything else
  throws `InvalidRecurrenceError` rather than being ignored.
- The event's own `start` is the anchor. An anchor the rule does not match is
  not an instance: `FREQ=WEEKLY;BYDAY=MO` on a Tuesday starts the following
  Monday.
- Every instance keeps the wall clock and the wall length of the series, so a
  09:00 meeting stays at 09:00 through a DST change and an instance that lands
  in a skipped hour follows the calendar's `disambiguation`.
- `dates` adds starts the rule does not produce, each with its own time of day.
- `exceptions` removes instances by their start. `COUNT` is counted before they
  are removed, exactly as RFC 5545 asks.
- `overrides` replaces one instance, or drops it with `cancelled`. An override
  with no `end` or `duration` keeps the length of the series, and one that
  moves an instance into the range brings it into view.
- Instances are matched by the moment they name, so an exception or an override
  may be written in any zone that resolves to it.
- An instance is a full event: its `id` is the series id, `__` and its
  `recurrenceId`, and it carries `seriesId` and `recurrenceId` of its own. A
  plain event has neither.

## Views

A range turns an anchor date into the days a calendar draws, and the rows it
draws them on.

```ts
type CalendarRange = {
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
- Rows are placed by the wall clock alone. `disambiguation` is what the events
  are read with and is never applied to a row, so the hour a zone skips stays a
  zero-length row instead of becoming an error.
- An anchor date or a time zone that cannot be read, a `slotMinutes` outside 1
  to 1440 or a `dayCount` below one throws `InvalidRangeError`. The zone is
  checked once, where the range is resolved, so a mistyped one never reaches the
  engine as a bare `RangeError`.

## Navigation

Moving around a calendar is a reducer over the range, so next and previous can
be tested without rendering anything.

```ts
import { calendarReducer, initialCalendarState } from '@midstem/chronous'

const state = initialCalendarState({
  view: 'week',
  date: '2026-08-25',
  timeZone: 'Europe/Kyiv'
})

calendarReducer(state, { type: 'next' }).range.date
calendarReducer(state, { type: 'view', view: 'month' }).range.view
calendarReducer(state, {
  type: 'select',
  selection: { kind: 'event', id: 'standup' }
})
```

- The state is `{ range, selection }` and nothing else. Every action returns a
  new state, or the state it was handed when the move changes nothing, so a
  consumer can compare by identity.
- `next` and `prev` move by the period the range asks for: `day` by one day,
  `week` by seven, `days` and `agenda` by their own length, `month` by one
  month anchored on the first. Anchoring the month is what keeps 31 January
  from stepping to 28 February and staying there. Every other view keeps the
  weekday of the anchor, so `prev` always undoes `next`.
- The step is computed from the same resolved span the range is built from, so
  one period ends exactly where the next begins — no repeated day, no gap.
- `today` carries the moment: `{ type: 'today', now }`, where `now` is any ISO
  string. The reducer reads it in `range.timeZone` and never looks at the clock
  itself, which is what keeps it pure and testable. An absolute instant is read
  as one; a bare wall-clock string is read as local to the range.
- `goto` sets the anchor, `view` swaps the view, `select` and `clear` hold and
  drop a selection — an event, a slot or a date. Moving does not clear the
  selection; drop it yourself if that is what the interface wants.
- Everything `buildCalendar` would refuse, the reducer refuses the same way,
  with `InvalidRangeError`.

## Calendars

`buildCalendar` is the front door: a range and a list of events in, one
plain object out.

```ts
const calendar = buildCalendar(
  { view: 'week', date: '2026-03-18', timeZone: 'Europe/Kyiv' },
  [{ id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }]
)
```

```ts
type CalendarLayout<TData = unknown> = {
  view: ViewKind
  start: IsoDateTime
  end: IsoDateTime
  days: CalendarDay<TData>[]
  rows: CalendarRow<TData>[]
}

type CalendarDay<TData = unknown> = {
  date: IsoDate
  start: IsoDateTime
  end: IsoDateTime
  minutes: number
  inPeriod: boolean
  slots: CalendarSlot[]
  boxes: CalendarBox<TData>[]
}

type CalendarSlot = {
  minuteOfDay: number
  start: IsoDateTime
  end: IsoDateTime
  minutes: number
}
```

- Everything crossing the boundary is a string or a number. Temporal types stay
  inside the engine, so a calendar is plain JSON: it survives `JSON.stringify`,
  a server-to-client payload and a React state update unchanged.
- A moment comes back as an ISO-8601 string carrying its offset —
  `2026-10-25T03:00:00+03:00` — so `new Date(value)` is exact without knowing
  the calendar's time zone. A date with no time comes back as `2026-03-18`.
- `days` are the days the grid draws, `rows` the bands of bars above it.
- Every box and bar carries the normalized event as `event`, discriminated by
  `allDay`: a timed entry holds date-times, an all-day entry plain dates.
- The range's `timeZone` and `disambiguation` are the ones the events are read
  with, so a calendar is built from one consistent point of view.
- Input that cannot be read throws `InvalidEventError`, `InvalidRangeError` or
  `InvalidRecurrenceError`. One unusable event fails the whole call.

## Layout

Overlapping events are packed into columns the way a calendar draws them, one
day at a time.

```ts
type CalendarBox<TData = unknown> = {
  event: TimedEntry<TData>
  start: IsoDateTime
  end: IsoDateTime
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
type CalendarRow<TData = unknown> = {
  start: IsoDate
  end: IsoDate
  days: number
  lanes: number
  bars: CalendarBar<TData>[]
}

type CalendarBar<TData = unknown> = {
  event: CalendarEntry<TData>
  start: IsoDate
  end: IsoDate
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
  else. For a promoted timed event the original moments stay on `event`.
- Bars read across the row, longest first, and each takes the lowest free lane.
  A bar never grows into a free lane beside it. Every bar in a row reports the
  same `lanes` count, so a row can be sized before it is drawn, and a renderer
  that shows only the first few lanes picks its own cut-off.

## Labels

`formatIso` turns a string a calendar hands back into a label, without asking
the consumer which of the two shapes it is holding.

```ts
formatIso(day.date, {
  locale: 'uk-UA',
  options: { day: 'numeric', month: 'long' }
})
formatIso(slot.start, {
  locale: 'en-GB',
  options: { hour: '2-digit', minute: '2-digit' }
})
formatIso(box.start, {
  locale: 'en-GB',
  timeZone: 'America/New_York',
  options: { timeStyle: 'short' }
})
```

```ts
type FormatOptions = {
  locale: LocaleId
  timeZone?: TimeZoneId
  options?: DateTimeFormatOptions
}
```

- The range is scalars only, so it crosses the boundary with everything else:
  `locale`, an optional `timeZone` and `Intl.DateTimeFormatOptions`.
- A date — `2026-03-18` — is formatted as the floating date it is and is never
  moved into a zone, so a day heading cannot slip a day. `timeZone` is ignored
  for it. This is what `new Date('2026-03-18')` gets wrong: that reads UTC
  midnight, which is the previous day west of Greenwich.
- A date-time carries its offset, which fixes the instant. `timeZone` decides
  the zone it is shown in and defaults to the offset the string already has, so
  `slot.start` reads back as the wall time the row stands for — both times an
  hour repeats, and either side of an hour that is skipped.
- A date-time with no offset is floating too, and reads as written.
- Formatters are cached, so a month grid formatting forty-two cells on every
  render builds one formatter, not forty-two.

## License

MIT
