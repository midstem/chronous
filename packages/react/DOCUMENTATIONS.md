# `@midstem/chronous-react` agent reference

## Scope and source of truth

This page documents the public React adapter API. The adapter re-exports the core engine API; date, recurrence, range, navigation, and Temporal semantics are defined by the [core reference](../core/DOCUMENTATIONS.md). Component behavior and defaults below are verified against package exports, TypeScript declarations, implementations, and tests.

When changing a public contract, verify the implementation and exported types
and update this reference in the same change. Source code takes precedence over
examples or descriptions that disagree with it.

## Setup and imports

Install `@midstem/chronous-react` and React 18 or newer:

```sh
npm install @midstem/chronous-react react
```

The adapter bundles its `@midstem/chronous` dependency; import the engine and types from this package. For runtimes without native Temporal, load a compatible polyfill before rendering if exact Temporal behavior is required:

```ts
import 'temporal-polyfill/global'
```

See the core reference's browser behavior section for fallback details.

```tsx
import {
  Calendar,
  useCalendar,
  useCalendarNavigation
} from '@midstem/chronous-react'
import type { CalendarRange, EventInput } from '@midstem/chronous-react'

const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events: EventInput<{ title: string }>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup' }
  }
]
```

## Public API

The package root re-exports the core values `buildCalendar`, `calendarReducer`, `formatIso`, `initialCalendarState`, `isTemporalAvailable`, and the error classes `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, `MissingTemporalError`. It also re-exports core types including `CalendarRange`, `CalendarLayout`, `CalendarDay`, `CalendarRow`, `CalendarBar`, `CalendarBox`, `CalendarSlot`, `CalendarEntry`, `TimedEntry`, `EventInput`, `RecurrenceInput`, `RecurrenceOverride`, `CalendarAction`, `CalendarState`, `CalendarSelection`, `ViewKind`, `IsoDate`, `IsoDateTime`, `TimeZoneId`, `LocaleId`, `WeekStartsOn`, `Disambiguation`, and formatting types.

Adapter exports are `Calendar`, `createCalendarComponents`, `useCalendar`, `useCalendarNavigation`, `useNow`, the context hooks below, and component/scope prop types. Components are accessed as `Calendar.Root`, `Calendar.Toolbar`, and so on; component and scope prop types are named exports.

`useCalendar(range, events)` returns `{ calendar, error }`. `range` is a `CalendarRange`; `events` is a readonly event array. Its result is a discriminated union: a successful layout with `error: null`, or `calendar: null` with a `CalendarError` (`InvalidEventError | InvalidRangeError | InvalidRecurrenceError | MissingTemporalError`). The range is stabilized by its fields; calendar projection is memoized by that stable range and the `events` array identity. Keep an inline-created events array stable when avoiding recomputation matters.

`useCalendarNavigation(range)` returns `{ next, prev, today, withView }`. `next` and `prev` are `CalendarRange | null`; `today` is `(() => CalendarRange) | null`; `withView(view)` returns the range with that view applied. The hook does not update application state. `today` reads the current wall clock when called.

`useNow(timeZone)` returns `CalendarNow | null`, with `{ date: IsoDate, minuteOfDay: number }`. It samples every 30 seconds after mount and initially returns `null`; an unreadable time zone also returns `null`.

`createCalendarComponents<TData>()` returns the same `Calendar` object with its render-prop scopes typed to `TData`; it performs no runtime work. Without it, event data in component scopes defaults to `unknown`.

## Data and behavior contracts

### Components, props, defaults, and provider hierarchy

All components default to `as="div"`, except `TimeSlots` (`span`). Their props include `children` and standard props for the selected HTML element. `Root` provides calendar state to descendants. Nested providers are established by `TimeGrid`, `DayColumns`, `AllDayRow`, `MonthRows`, `MonthDays`, and `AgendaDays`; use those components inside the parent contexts shown in the last column.

| Component            | Additional props (default)                                                            | Scope fields                                                                 | Required ancestor       |
| -------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `Root`               | `range`, `events` required; `locale="en-US"`; `gutterWidth="3.25rem"`; `renderError?` | `calendar`, `range`, `locale`, `gutterWidth`                                 | —                       |
| `Toolbar`            | `onNavigate` required; `views=['day','week','month','agenda']`                        | `navigation`, `range`, `title`, `goTo`                                       | `Root`                  |
| `Header`             | `gutterCell=null`                                                                     | same as root context                                                         | `Root`                  |
| `DayHeadings`        | —                                                                                     | `day`, `date`, `weekdayLabel`, `dayLabel`, `inCurrentPeriod`                 | `Root`                  |
| `AllDayRow`          | `laneHeight=24`; `minLanes=0`; `gutterCell=null`                                      | `row`, `laneHeight`, `lanes`                                                 | `Root`                  |
| `AllDayEvents`       | `gap=4`                                                                               | `event`, `bar`                                                               | `AllDayRow`             |
| `TimeGrid`           | `hourHeight=60`; `scrollToHour=7` (`null` disables initial scroll)                    | `hourHeight`, `dayHeight`                                                    | `Root`                  |
| `TimeAxis`           | —                                                                                     | `hourHeight`, `dayHeight`                                                    | `TimeGrid`              |
| `TimeLabels`         | —                                                                                     | `slot`, `minuteOfDay`, `timeLabel`                                           | `Root`                  |
| `DayColumns`         | —                                                                                     | `day`                                                                        | `Root` and `TimeGrid`   |
| `TimeSlots`          | —                                                                                     | `slot`, `minuteOfDay`                                                        | `DayColumns`            |
| `TimedEvents`        | `minHeight=22`; `gap=3`                                                               | `event`, `box`                                                               | `Root` and `DayColumns` |
| `NowMarker`          | —                                                                                     | `minuteOfDay`                                                                | `Root` and `DayColumns` |
| `MonthGrid`          | —                                                                                     | `calendar`, `range`, `locale`, `gutterWidth`                                 | `Root`                  |
| `MonthWeekdays`      | —                                                                                     | `day`, `weekdayLabel`                                                        | `Root`                  |
| `MonthRows`          | `maxLanes=null`; `laneHeight=20`                                                      | `row`, `days`, `maxLanes`, `laneHeight`                                      | `Root`                  |
| `MonthDays`          | —                                                                                     | `day`, `boxes`, `bars`, `hiddenBars`, `dayLabel`, `inCurrentPeriod`, `lanes` | `MonthRows`             |
| `MonthAllDayEvents`  | `gap=4`; `lanesTopOffset=28`                                                          | `event`, `bar`                                                               | `MonthRows`             |
| `MonthTimedEvents`   | —                                                                                     | `event`, `box`                                                               | `MonthDays`             |
| `AgendaList`         | —                                                                                     | `calendar`, `range`, `locale`, `gutterWidth`                                 | `Root`                  |
| `AgendaDays`         | `showEmptyDays=false`                                                                 | `day`, `bars`, `boxes`, `weekdayLabel`, `dayLabel`, `monthLabel`             | `Root`                  |
| `AgendaAllDayEvents` | —                                                                                     | `event`, `bar`                                                               | `AgendaDays`            |
| `AgendaTimedEvents`  | —                                                                                     | `event`, `box`, `timeRangeLabel`                                             | `AgendaDays`            |

Plural components iterate their data: for example, `DayColumns` renders one column per day and `TimedEvents` one element per positioned event. A scoped child may be a React node or a function receiving that component's scope; children render inside the provider boundary. Per-item scopes are available to custom descendants through the context hooks.

`useCalendarContext<TData>()` reads `CalendarContextValue<TData>` (`calendar`, `range`, `locale`, `gutterWidth`) from `Root`. `useTimeGridContext()` reads `{ hourHeight, dayHeight }` from `TimeGrid`. `useDayColumnContext<TData>()` reads `{ day }` from `DayColumns`; `useAllDayContext<TData>()` reads `{ row, laneHeight, lanes }` from `AllDayRow`; `useMonthRowContext<TData>()` reads `{ row, days, maxLanes, laneHeight }` from `MonthRows`; `useMonthDayContext<TData>()` reads `{ day, boxes, bars, hiddenBars }` from `MonthDays`; `useAgendaDayContext<TData>()` reads `{ day, bars, boxes }` from `AgendaDays`. Calling a context hook without its provider throws an error naming the required parent component.

### Rendering conventions

`DayHeadings`, `DayColumns`, `MonthDays`, and `AgendaDays` set `data-date` and `data-in-current-period`; event renderers set `data-event-id`, `data-continues-before`, and `data-continues-after`. Caller attributes can override these defaults.

`as` selects the rendered tag. React element props, handlers, `className`, and ARIA attributes are forwarded. Components that compute layout merge the computed style with the caller's style, with caller values taking precedence. Scopes distinguish formatted strings by `Label` suffix; the components expose `weekdayLabel`, `dayLabel`, `monthLabel`, `timeLabel`, and `timeRangeLabel` where listed in the table. Values such as `day`, `slot`, `box`, `bar`, and `minuteOfDay` remain structured engine data. Component label helpers fall back to the input string if `formatIso` rejects the locale or options. The `Toolbar`'s `onNavigate(range)` callback receives ranges; its custom child scope exposes the same callback as `goTo`.

`Root` renders `renderError(error)` within its own element when calendar construction fails and a renderer is supplied. Without `renderError`, it rethrows during render. For direct error-state handling, use `useCalendar`.

`AllDayRow` renders no row when the range has no all-day events unless `minLanes` reserves lanes. `MonthRows.maxLanes` limits displayed all-day bars; each month-day scope still exposes its `hiddenBars`, all `bars`, and `lanes`. `TimeGrid` initially scrolls to the nearest scrolling ancestor at `scrollToHour`; set it to `null` to skip this behavior. `useNow` is an independent clock hook.

## Minimal example

```tsx
import { Calendar, createCalendarComponents } from '@midstem/chronous-react'
import type { CalendarRange, EventInput } from '@midstem/chronous-react'

const TypedCalendar = createCalendarComponents<{ title: string }>()
const range: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}
const events: EventInput<{ title: string }>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup' }
  }
]

export function WeekCalendar() {
  return (
    <TypedCalendar.Root range={range} events={events}>
      <TypedCalendar.TimeGrid>
        <TypedCalendar.TimeAxis>
          <TypedCalendar.TimeLabels />
        </TypedCalendar.TimeAxis>
        <TypedCalendar.DayColumns>
          <TypedCalendar.TimeSlots />
          <TypedCalendar.TimedEvents>
            {({ event }) => event.data?.title}
          </TypedCalendar.TimedEvents>
        </TypedCalendar.DayColumns>
      </TypedCalendar.TimeGrid>
    </TypedCalendar.Root>
  )
}
```

Month and agenda components replace the slotted view inside `Root`. Choose the composition that matches `range.view`.

Month composition:

```tsx
<TypedCalendar.MonthGrid>
  <TypedCalendar.MonthWeekdays>
    {({ weekdayLabel }) => weekdayLabel}
  </TypedCalendar.MonthWeekdays>
  <TypedCalendar.MonthRows maxLanes={3}>
    <TypedCalendar.MonthDays>
      {({ dayLabel, hiddenBars }) => (
        <>
          {dayLabel}
          {hiddenBars.length > 0 && <span>+{hiddenBars.length}</span>}
          <TypedCalendar.MonthTimedEvents />
        </>
      )}
    </TypedCalendar.MonthDays>
    <TypedCalendar.MonthAllDayEvents />
  </TypedCalendar.MonthRows>
</TypedCalendar.MonthGrid>
```

Agenda composition:

```tsx
<TypedCalendar.AgendaList>
  <TypedCalendar.AgendaDays>
    {({ dayLabel }) => (
      <>
        <h2>{dayLabel}</h2>
        <TypedCalendar.AgendaAllDayEvents />
        <TypedCalendar.AgendaTimedEvents>
          {({ event }) => event.data?.title}
        </TypedCalendar.AgendaTimedEvents>
      </>
    )}
  </TypedCalendar.AgendaDays>
</TypedCalendar.AgendaList>
```

## Errors and limitations

The adapter's calendar error union is `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, and `MissingTemporalError`. These cover invalid or unreadable event data, invalid range inputs such as dates/time zones/slot settings, unreadable recurrence rules, and operations that require Temporal when no fallback is available. `useCalendar` returns these errors; `Root` rethrows them unless `renderError` is supplied. Unexpected exceptions are not converted to `CalendarError` and propagate.

Navigation uses `null` for unavailable `next`, `prev`, or `today`. `today` is a nullable function, not a range value. The adapter embeds its core build, so error classes imported from this package do not share identity with classes from a separately imported `@midstem/chronous` copy. Core fallback and DST limitations are described in the [core reference](../core/DOCUMENTATIONS.md).

## Source map and validation

Public exports: [`src/index.ts`](src/index.ts), [`src/components/index.ts`](src/components/index.ts). Hook signatures: [`src/calendar/`](src/calendar/), [`src/navigation/`](src/navigation/), and [`src/components/slotted/use-now.ts`](src/components/slotted/use-now.ts). Component declarations and implementations: [`src/components/`](src/components/); contexts: [`src/components/context/`](src/components/context/). Behavior checks: [`src/__test__/`](src/__test__/), [`src/calendar/__test__/`](src/calendar/__test__/), [`src/navigation/__test__/`](src/navigation/__test__/), and [`src/components/__test__/`](src/components/__test__/). Format with `npx prettier --write packages/react/DOCUMENTATIONS.md`; run package checks with `npm run typecheck` and `npm run test:run` from `packages/react`.
