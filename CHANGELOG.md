# Changelog

Both packages are versioned together for now, and each release is tagged
`<package name>@<version>` — `@midstem/chronous@1.0.0`. The bare `1.0.0`,
`1.0.1` and `1.0.2` tags belong to the previous generation, which shipped as the
unscoped `chronous` package and stays available under
[`1.0.2`](https://github.com/midstem/chronous/tree/1.0.2).

## Unreleased

### Renames across both packages

A naming pass before the first scoped release, while there is nothing published
to break. Every name below says what it is rather than what it happens to hold.

- `CalendarRange.date` is now **`currentDate`** — the date the calendar is on,
  and the one whose period is drawn. `date` never said whether it meant today,
  a selection or the window, and every reader had to look it up.
- `CalendarDay.inPeriod` is now **`inCurrentPeriod`**, and the attribute the
  React components put on day elements is `data-in-current-period`.
- Every render-prop value that is already a formatted string ends in `Label`:
  `dayNumber` → **`dayLabel`** (it was typed `string` while its name promised a
  number), `weekday` → **`weekdayLabel`**, `month` → **`monthLabel`**,
  `time` → **`timeLabel`**, `timeRange` → **`timeRangeLabel`**. Anything
  without the suffix is data, not a label.
- `Calendar.AgendaDays` takes **`showEmptyDays`** rather than `showEmpty`.
- `Calendar.MonthAllDayEvents` takes **`lanesTopOffset`** rather than
  `topOffset`, and no longer takes `laneHeight`: that moved up to
  `Calendar.MonthRows` beside `maxLanes`, so the two lane settings sit together
  on the parent the way `AllDayRow` already had them.
- The `Now` type is now **`CalendarNow`**. `useNow` is unchanged.

### `@midstem/chronous-react`

- Temporal now installs itself. The first render of `useCalendar`,
  `useCalendarNavigation` or any `Calendar` component loads
  `temporal-polyfill` where the browser has none, and re-renders once it
  lands — no `ensureTemporal()` call at the top of an app, nothing to await
  before `createRoot`. Browsers that ship Temporal draw on the first render as
  before: the engine is read synchronously, with no extra render and no effect.
- `useCalendar` reports the wait as `pending`, added to both arms of
  `CalendarResult` rather than as a third arm, so existing code that reads
  `calendar` and `error` keeps compiling and behaving. It comes alongside a
  `MissingTemporalError`, which is what it is until the chunk lands.
- `Calendar.Root` takes `renderPending`, drawn in place of the calendar for that
  one render. Its container and styles are already in place, so nothing jumps.
- `useCalendarNavigation` no longer freezes with dead arrows when it first
  renders without Temporal — the steps come back once the engine is in place.
- `useTemporalStatus()` is the raw signal for components that want to gate on it
  themselves.
- `ensureTemporal()` is unchanged and still exported. It is now an optimisation
  for server rendering and workers rather than a setup step.

### `@midstem/chronous`

- `temporalStatus()` reports `'ready'`, `'pending'` or `'failed'`, and
  `subscribeTemporal(listener)` starts the load if it has not started and calls
  back when it settles — the store the React package renders from, and the seam
  any other framework can bind to.
- A polyfill import that fails now rejects and throws `MissingTemporalError`
  with the original failure as its `cause`, instead of surfacing the raw module
  error.

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
