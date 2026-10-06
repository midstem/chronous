# `@midstem/chronous` agent reference

## Scope and source of truth

This file describes the public API of `@midstem/chronous` and the behavior
agents should preserve when changing it. The package root exports are defined
in [`src/index.ts`](src/index.ts); implementation details are in the linked
source files below. Update this reference when a public contract changes.

## Setup and imports

The package root is the supported import path. Chronous reads
`globalThis.Temporal` when an operation runs and does not install a polyfill.
For full calendar behavior in runtimes without native Temporal, install
`temporal-polyfill` and import its global entry before calling Chronous:

```ts
import 'temporal-polyfill/global'
import { buildCalendar } from '@midstem/chronous'
```

`buildCalendar`, the navigation reducer and `formatIso` use an internal `Date`
fallback when Temporal is absent; see [Browser behavior](#browser-behavior).
`MissingTemporalError` is exported for identifying missing-Temporal failures.

## Public API

The root exports these runtime values and types:

| Kind                      | Exports                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Functions                 | `buildCalendar`, `calendarReducer`, `initialCalendarState`, `formatIso`, `isTemporalAvailable`                                             |
| Errors                    | `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, `MissingTemporalError`                                                 |
| Calendar types            | `AllDayEntry`, `CalendarBar`, `CalendarBox`, `CalendarDay`, `CalendarEntry`, `CalendarLayout`, `CalendarRow`, `CalendarSlot`, `TimedEntry` |
| Event types               | `EventId`, `EventInput`, `RecurrenceInput`, `RecurrenceOverride`                                                                           |
| Navigation types          | `CalendarAction`, `CalendarSelection`, `CalendarState`                                                                                     |
| Range types               | `CalendarRange`, `ViewKind`                                                                                                                |
| Time and formatting types | `DateTimeFormatOptions`, `Disambiguation`, `FormatOptions`, `IsoDate`, `IsoDateTime`, `LocaleId`, `TimeZoneId`, `WeekStartsOn`             |

Callable signatures are `buildCalendar<TData>(range: CalendarRange, events:
readonly EventInput<TData>[]): CalendarLayout<TData>`,
`initialCalendarState(range: CalendarRange): CalendarState`,
`calendarReducer(state: CalendarState, action: CalendarAction): CalendarState`,
`formatIso(value: IsoDateTime, options: FormatOptions): string`, and
`isTemporalAvailable(): boolean`. `initialCalendarState` sets selection to
`null`; it accepts only the range argument.

`EventId`, `IsoDate`, `IsoDateTime`, `LocaleId` and `TimeZoneId` are string
aliases. `ViewKind` is `'day' | 'week' | 'days' | 'month' | 'agenda'`;
`WeekStartsOn` is `0 | 1 | 2 | 3 | 4 | 5 | 6`; `Disambiguation` is
`'compatible' | 'earlier' | 'later' | 'reject'`.

## Data and behavior contracts

### Browser behavior

`isTemporalAvailable()` reports whether `globalThis.Temporal` exists at the
time it is called. When absent, calendar construction, date navigation and
`formatIso` use the `Date`/`Intl` fallback and log a missing-Temporal warning
once per engine copy. The fallback is approximate: it supports ordinary events,
the five views, and basic recurrence, but recurrence filters and daylight
saving transitions can differ from the Temporal implementation. Unsupported
or malformed fallback events are omitted with a warning; invalid ranges still
throw `InvalidRangeError`. The public calendar entry points use this fallback
when Temporal is absent; `MissingTemporalError` remains part of the exported
error API for missing-Temporal failures.

Source: [`src/runtime/index.ts`](src/runtime/index.ts),
[`src/time/temporal.ts`](src/time/temporal.ts),
[`src/calendar/date-fallback`](src/calendar/date-fallback),
[`src/calendar/date-fallback/warn.ts`](src/calendar/date-fallback/warn.ts).

### Events

`EventInput<TData>` has required `id` and ISO-string `start`; optional fields
are `end`, `duration`, `allDay`, `timeZone`, `recurrence`, and `data`. An
explicit `allDay` controls classification. Otherwise an event is all-day only
when `start` and any supplied `end` are date-only strings. The event's
`timeZone` defaults to the range zone. Timed inputs are normalized to the range
zone; all-day values remain calendar dates. If both `end` and `duration` are
given, `end` is used. A timed event with neither has zero duration; an all-day
event defaults to one day. Date-only all-day ends are exclusive, and equal
start and end are normalized to one day.

ISO durations use Temporal duration arithmetic: date units are wall-calendar
units, while clock units represent elapsed time. Ambiguous or skipped wall
times use `disambiguation`, which defaults to `compatible`. A timed end before
its start or unreadable event input throws `InvalidEventError`; the error
exposes `eventId` and `reason`.

```ts
type EventInput<TData = unknown> = {
  id: EventId
  start: IsoDateTime
  end?: IsoDateTime
  duration?: string
  allDay?: boolean
  timeZone?: TimeZoneId
  recurrence?: RecurrenceInput<TData>
  data?: TData
}

type RecurrenceInput<TData = unknown> = {
  rule?: string
  dates?: IsoDateTime[]
  exceptions?: IsoDateTime[]
  overrides?: RecurrenceOverride<TData>[]
}

type RecurrenceOverride<TData = unknown> = {
  recurrenceId: IsoDateTime
  cancelled?: boolean
  start?: IsoDateTime
  end?: IsoDateTime
  duration?: string
  data?: TData
}
```

`compatible` chooses the earlier occurrence of a repeated wall time and moves
a skipped wall time forward; `earlier`, `later` and `reject` are the other
Temporal disambiguation choices. The same setting is used to read event wall
times and recurrence instances.

Source: [`src/event/types.ts`](src/event/types.ts),
[`src/event/index.ts`](src/event/index.ts),
[`src/event/errors.ts`](src/event/errors.ts).

### Recurrence

`RecurrenceInput<TData>` has optional `rule`, `dates`, `exceptions` and
`overrides`. Rules accept `FREQ` (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`),
`INTERVAL`, `COUNT`, `UNTIL`, `BYDAY`, `BYMONTHDAY`, `BYMONTH`, `BYSETPOS` and
`WKST`, with or without the `RRULE:` prefix. `INTERVAL` defaults to 1 and
`WKST` to Monday. `COUNT` and `UNTIL` cannot be combined. Ordinal `BYDAY` is
allowed only for monthly and yearly rules; `BYMONTHDAY` is not supported with
weekly frequency. Other unsupported or malformed rule parts throw
`InvalidRecurrenceError` with `eventId` and `reason`.

The event start anchors the rule and is an instance only if it matches the
rule. Generated instances retain the series wall
time and wall duration. `COUNT` counts rule-generated dates before exceptions
are removed. `dates` adds explicit starts. For timed series, `exceptions` and
override `recurrenceId` match the resolved start instant in the series zone;
equivalent offsets can identify the same occurrence. For all-day series they
match the calendar date (a supplied date-time is converted to the series zone's
date). An override may supply `start`, `end`, `duration` and/or
`data`; `cancelled: true` removes the matching occurrence. An omitted end and
duration keep the series duration. A moved override
is included when its replacement overlaps the requested range, even if its
original recurrence start is outside it. Expansion is limited to the requested
visible range, while including instances whose duration overlaps that range.
An instance's `id` is `${seriesId}__${recurrenceId}`; `seriesId` stores the
original event id and `recurrenceId` identifies the original occurrence.

Source: [`src/event/types.ts`](src/event/types.ts),
[`src/recurrence/index.ts`](src/recurrence/index.ts),
[`src/recurrence/parse.ts`](src/recurrence/parse.ts),
[`src/recurrence/helpers.ts`](src/recurrence/helpers.ts).

### Views

`CalendarRange` requires `view`, date-only `currentDate` and `timeZone`.
`view` is `day`, `week`, `days`, `month` or `agenda`; optional fields are
`weekStartsOn` (0 Sunday through 6 Saturday, default 1/Monday), `dayCount`,
`slotMinutes` (default 60) and `disambiguation` (default `compatible`).
`day` spans one date; `week` spans seven dates from `weekStartsOn`; `days` and
`agenda` span `dayCount`, defaulting to 7 and 30 respectively. `month` spans
whole weeks containing the month; padding dates have `inCurrentPeriod: false`.
Time slots are present for `day`, `week` and `days`, and absent for `month` and
`agenda`.

`slotMinutes` must be an integer from 1 through 1440, and `dayCount` must be a
positive integer when used. A day has `ceil(1440 / slotMinutes)` wall-clock
slots. Slot boundaries resolve in the range time zone; around daylight saving
transitions slot elapsed minutes can differ from the wall interval and can be
zero. Slot placement is by wall-clock row; `disambiguation` applies to event
times, not slot rows. `CalendarDay.minutes` reports the actual elapsed length
of that date. `compatible` resolves ambiguous event times to the earlier
occurrence and shifts nonexistent times forward; `earlier`, `later` and
`reject` are also accepted. Invalid dates, zones or numeric range options
throw `InvalidRangeError` when the range is built.

```ts
type CalendarRange = {
  view: ViewKind
  currentDate: IsoDate
  timeZone: TimeZoneId
  weekStartsOn?: WeekStartsOn
  dayCount?: number
  slotMinutes?: number
  disambiguation?: Disambiguation
}
```

Source: [`src/range/types.ts`](src/range/types.ts),
[`src/range/index.ts`](src/range/index.ts),
[`src/range/helpers.ts`](src/range/helpers.ts).

### Navigation

`CalendarState` is `{ range: CalendarRange, selection: CalendarSelection |
null }`, initially with `selection: null`. A selection is `{ kind: 'event',
id }`, `{ kind: 'slot', date, minuteOfDay }` or `{ kind: 'date', date }`.
Actions are `{ type: 'next' }`, `{ type: 'prev' }`, `{ type: 'today', now }`,
`{ type: 'goto', date }`, `{ type: 'view', view }`, `{ type: 'select',
selection }` and `{ type: 'clear' }`. `today` reads the supplied moment in the
range zone; the reducer does not read the system clock. `day` moves by one day,
`week` by seven, `days` and `agenda` by their configured span, and `month` by
one month from the first of the month. Navigation preserves selection except
for `clear`; unchanged actions may return the original state object. The
initializer only wraps the range and does not validate it. `goto` and `view`
do not eagerly validate either. `next` and `prev` read the anchor (and the
`days`/`agenda` span when needed); `today` reads the time zone and supplied
moment. Those operations can throw `InvalidRangeError` for unreadable values.

```ts
type CalendarSelection =
  | { kind: 'event'; id: EventId }
  | { kind: 'slot'; date: IsoDate; minuteOfDay: number }
  | { kind: 'date'; date: IsoDate }

type CalendarAction =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'today'; now: IsoDateTime }
  | { type: 'goto'; date: IsoDate }
  | { type: 'view'; view: ViewKind }
  | { type: 'select'; selection: CalendarSelection }
  | { type: 'clear' }
```

```ts
type CalendarState = {
  range: CalendarRange
  selection: CalendarSelection | null
}
```

Source: [`src/navigation/types.ts`](src/navigation/types.ts),
[`src/navigation/index.ts`](src/navigation/index.ts),
[`src/navigation/helpers.ts`](src/navigation/helpers.ts).

### Calendars

`buildCalendar(range, events)` returns `CalendarLayout<TData>` with `view`,
ISO-string `start` and `end`, `days` and lane `rows`. Calendar output is
JSON-compatible except for arbitrary `data` payloads: their serializability
is the caller's responsibility. Timed values are ISO date-times with offsets; all-day values
are date-only strings. Entries include `id`, `allDay`, `start`, `end`, and
optional `seriesId`, `recurrenceId` and `data`. Each day includes `date`,
`start`, `end`, elapsed `minutes`, `inCurrentPeriod`, `slots` and timed `boxes`.
Invalid input in the Temporal path fails the call with the corresponding
`InvalidRangeError`, `InvalidEventError` or `InvalidRecurrenceError`.

```ts
type TimedEntry<TData = unknown> = {
  id: EventId
  allDay: false
  start: IsoDateTime
  end: IsoDateTime
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

type AllDayEntry<TData = unknown> = {
  id: EventId
  allDay: true
  start: IsoDate
  end: IsoDate
  seriesId?: EventId
  recurrenceId?: IsoDateTime
  data?: TData
}

type CalendarEntry<TData = unknown> = TimedEntry<TData> | AllDayEntry<TData>

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
  inCurrentPeriod: boolean
  slots: CalendarSlot[]
  boxes: CalendarBox<TData>[]
}

type CalendarSlot = {
  minuteOfDay: number
  start: IsoDateTime
  end: IsoDateTime
  minutes: number
}

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

type CalendarRow<TData = unknown> = {
  start: IsoDate
  end: IsoDate
  dayCount: number
  lanes: number
  bars: CalendarBar<TData>[]
}

type CalendarBar<TData = unknown> = {
  event: CalendarEntry<TData>
  start: IsoDate
  end: IsoDate
  startDay: number
  endDay: number
  dayCount: number
  lane: number
  lanes: number
  left: number
  width: number
  continuesBefore: boolean
  continuesAfter: boolean
}
```

Source: [`src/calendar/index.ts`](src/calendar/index.ts),
[`src/calendar/helpers.ts`](src/calendar/helpers.ts),
[`src/calendar/types.ts`](src/calendar/types.ts).

### Layout

`CalendarBox` has these fields: `event: TimedEntry<TData>`, clipped ISO
`start`/`end`, wall-clock `startMinute`/`endMinute`, elapsed `minutes`,
`top`/`height`, horizontal `left`/`width`, zero-based `column`, cluster
`columns`, occupied-column `span`, and `continuesBefore`/`continuesAfter`.
`top = startMinute / 1440` and `height = (endMinute - startMinute) / 1440`;
`left = column / columns` and `width = span / columns`. Multiply fractions by
100 for CSS percentages, or by the target pixel size. The minute fields are
wall-clock coordinates; elapsed `minutes` can differ across DST. A segment
ending earlier by the wall clock within a repeated hour clamps to zero height.
Events that overlap are assigned columns and expand right through free columns.
All-day
events and timed events whose wall duration is at least 24 hours are placed in
lanes, not boxes.

Source: [`src/layout/index.ts`](src/layout/index.ts),
[`src/layout/helpers.ts`](src/layout/helpers.ts),
[`src/calendar/types.ts`](src/calendar/types.ts).

### Lanes

`CalendarRow` has ISO-date `start`/`end` bounds, `dayCount`, row `lanes` count
and `bars`. `CalendarBar` has `event: CalendarEntry<TData>`, clipped date
`start`/exclusive `end`, zero-based `startDay`/exclusive `endDay`, `dayCount`,
zero-based `lane`, row `lanes`, horizontal `left`/`width`, and
`continuesBefore`/`continuesAfter`. The day indices are relative to the row;
`left` and `width` are fractions of that row. Long timed events are selected
by wall duration of at least 24 hours. Month views split lane rows by week;
other views use one row. Events are ordered by start, then longer span, then
id, and assigned the lowest available lane. Every bar in a row reports that
row's total `lanes` count.

Source: [`src/lanes/index.ts`](src/lanes/index.ts),
[`src/lanes/helpers.ts`](src/lanes/helpers.ts),
[`src/calendar/types.ts`](src/calendar/types.ts).

### Labels

`formatIso(value, options)` accepts an `IsoDateTime` string and required
`locale`, with optional `timeZone` and `Intl.DateTimeFormatOptions`. Date-only
strings are formatted as floating dates and are not shifted by a time zone.
Date-times with offsets or zone annotations identify an instant; `timeZone`
chooses its display zone and otherwise the input zone/offset is used. Floating
date-times retain their written wall fields. Formatters are cached internally.
Invalid input or unsupported `Intl` options can throw `RangeError`.

```ts
type FormatOptions = {
  locale: LocaleId
  timeZone?: TimeZoneId
  options?: DateTimeFormatOptions // Intl.DateTimeFormatOptions alias
}
```

Use `formatIso(day.date, { locale: 'en-GB', options: { weekday: 'short' } })`
for dates. Avoid `new Date(day.date)` for day headings: it reads midnight UTC
and can shift the date in a viewer's zone.

Source: [`src/time/index.ts`](src/time/index.ts),
[`src/time/helpers.ts`](src/time/helpers.ts),
[`src/time/types.ts`](src/time/types.ts).

## Minimal example

```ts
import 'temporal-polyfill/global'
import {
  buildCalendar,
  type CalendarRange,
  type EventInput
} from '@midstem/chronous'

const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events: EventInput[] = [
  { id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }
]

const calendar = buildCalendar(range, events)
```

## Errors and limitations

The public error classes are `InvalidEventError` (`eventId`, `reason`),
`InvalidRecurrenceError` (`eventId`, `reason`), `InvalidRangeError`
(`reason`) and `MissingTemporalError`. The first three describe invalid
calendar inputs in the Temporal implementation. The Date fallback can omit
individual invalid or unsupported events with warnings; range validation
errors remain exceptions. Fallback recurrence and zone-transition results
are approximate. The public calendar entry points use a fallback when Temporal
is absent; `MissingTemporalError` is exported for missing-Temporal failures.

## Source map and validation

- Root exports: [`src/index.ts`](src/index.ts)
- Runtime detection: [`src/runtime/index.ts`](src/runtime/index.ts)
- Temporal requirement and error: [`src/time/temporal.ts`](src/time/temporal.ts), [`src/time/errors.ts`](src/time/errors.ts)
- Public input/output contracts: [`src/event/types.ts`](src/event/types.ts), [`src/range/types.ts`](src/range/types.ts), [`src/navigation/types.ts`](src/navigation/types.ts), [`src/calendar/types.ts`](src/calendar/types.ts)
- Calendar assembly: [`src/calendar/index.ts`](src/calendar/index.ts)
- Recurrence parser and expansion: [`src/recurrence/parse.ts`](src/recurrence/parse.ts), [`src/recurrence/index.ts`](src/recurrence/index.ts)
- Formatting: [`src/time/index.ts`](src/time/index.ts)

Run from the repository root:

```sh
npm run typecheck --workspace @midstem/chronous
npm run test:run --workspace @midstem/chronous
npx prettier --check packages/core/DOCUMENTATIONS.md
```

When changing contracts, check the relevant tests in each source module's
`__test__` directory and update this reference alongside the implementation.
