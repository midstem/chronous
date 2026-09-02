# Changelog

Both packages are versioned together for now, and each release is tagged
`<package name>@<version>` — `@midstem/chronous@1.0.0`. The bare `1.0.0`,
`1.0.1` and `1.0.2` tags belong to the previous generation, which shipped as the
unscoped `chronous` package and stays available under
[`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).

## 1.0.0

The first release of the scoped line: a rewritten engine plus a React adapter,
sharing nothing with `chronous@1.0.2` but the name.

### `@midstem/chronous`

- `buildCalendar(range, events)` is the whole engine — one range and a list of
  events in, one plain object out. Everything crossing the boundary is a string
  or a number, so a calendar survives `JSON.stringify` and a server-to-client
  payload unchanged.
- Time is Temporal, not `Date`: `day`, `week`, `days`, `month` and `agenda`
  views, wall-clock slot grids that absorb DST transitions, all-day events as
  floating dates with exclusive ends, and disambiguation for wall times a
  transition skipped or repeated.
- Recurrence expands RFC 5545 `RRULE` (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`,
  `BYDAY` with ordinals, `BYMONTHDAY`, `BYMONTH`, `BYSETPOS`, `WKST`) plus
  `dates`, `exceptions` and `overrides`, only ever as far as the range on screen.
- Overlapping events are packed into columns the way a calendar draws them;
  events of a day or longer move up into lanes as bars.
- `calendarReducer` / `initialCalendarState` move around a calendar as a pure
  reducer, testable without rendering anything.
- `formatIso` labels either shape a calendar hands back, reading a bare date as
  floating and a date-time in the offset it carries.
- `ensureTemporal()` installs Temporal where the runtime has none. It resolves
  immediately on Chrome, Edge and Firefox and downloads nothing; on Safari it
  loads `temporal-polyfill` through a dynamic import that bundlers split into
  its own chunk. The implementation is held by the engine, so
  `globalThis.Temporal` is never assigned.
- Failures are typed and carry what went wrong: `InvalidEventError`,
  `InvalidRangeError`, `InvalidRecurrenceError` and `MissingTemporalError`.

### `@midstem/chronous-react`

- `useCalendar(range, events)` memoizes `buildCalendar` on the fields of the
  range, and hands calendar errors back as state instead of throwing.
- `useCalendarNavigation(range)` returns the ranges to move to and sets no state
  itself. `useNow(timeZone)` reads the wall clock in the calendar's own zone.
- `Calendar` is a compound component of 23 parts over 7 scopes, Radix-style:
  a plural name iterates and owns its keys, children are a node or a function of
  the scope, `as` picks the tag, your `style` wins over the computed layout, and
  per-item state arrives as data attributes.
- `createCalendarComponents<TData>()` binds the namespace once so typed event
  data flows to every render prop.
- Month cells carry the bars that cover them. `MonthRows` takes `maxLanes`,
  `MonthAllDayEvents` stops at that lane, and each `MonthDays` scope reports
  `bars`, `hiddenBars` and the drawn `lanes` — enough to render "+2 more"
  without the two components disagreeing on the count.
- `AllDayRow` takes `minLanes`, so a week with no all-day event can hold the
  row's height instead of collapsing and shifting the grid beneath it.
- The engine is built into this package rather than installed beside it, so a
  React app installs one thing and never has to match two version numbers.
  Everything the engine exports is re-exported from here.
