# `@midstem/chronous-vue` agent reference

## Scope and source of truth

This page documents the public Vue adapter API. The adapter re-exports the core engine API; date, recurrence, range, navigation, and Temporal semantics are defined by the [core reference](../core/DOCUMENTATIONS.md). Component behavior and defaults below are verified against package exports, TypeScript declarations, implementations, and tests.

When changing a public contract, verify the implementation and exported types
and update this reference in the same change. Source code takes precedence over
examples or descriptions that disagree with it.

## Setup and imports

Install `@midstem/chronous-vue` and Vue 3.4 or newer:

```sh
npm install @midstem/chronous-vue vue
```

The adapter bundles its `@midstem/chronous` dependency; import the engine and types from this package. For runtimes without native Temporal, load a compatible polyfill before rendering if exact Temporal behavior is required:

```ts
import 'temporal-polyfill/global'
```

See the core reference's browser behavior section.

```vue
<script setup lang="ts">
import { Calendar, createCalendarComponents } from '@midstem/chronous-vue'
import type { CalendarRange, EventInput } from '@midstem/chronous-vue'

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
</script>
```

## Public API

The package root re-exports the core values `buildCalendar`, `calendarReducer`, `formatIso`, `initialCalendarState`, `isTemporalAvailable`, and the error classes `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, `MissingTemporalError`. It also re-exports core types including `CalendarRange`, `CalendarLayout`, `CalendarDay`, `CalendarRow`, `CalendarBar`, `CalendarBox`, `CalendarSlot`, `CalendarEntry`, `TimedEntry`, `EventInput`, `RecurrenceInput`, `RecurrenceOverride`, `CalendarAction`, `CalendarState`, `CalendarSelection`, `ViewKind`, `IsoDate`, `IsoDateTime`, `TimeZoneId`, `LocaleId`, `WeekStartsOn`, `Disambiguation`, and formatting types.

Adapter exports are `Calendar`, `createCalendarComponents`, `Root`, `Toolbar`, all other named components in the table, `useCalendar`, `useCalendarNavigation`, `useNow`, the context hooks below, and component/scope prop types.

`useCalendar(range, events)` accepts a `MaybeRefOrGetter` for both arguments. It returns computed refs `{ calendar, error }`; `calendar.value` is a layout or `null`, and `error.value` is a `CalendarError` or `null`. The error union is `InvalidEventError | InvalidRangeError | InvalidRecurrenceError | MissingTemporalError`. Range tracking compares range fields. Ref and getter inputs remain reactive; a plain array input has no automatic change tracking.

`useCalendarNavigation(range)` accepts a `MaybeRefOrGetter<CalendarRange>` and returns computed refs `next`, `prev`, and `today`, plus `withView(view)`. The first two are `CalendarRange | null`; `today.value` is `(() => CalendarRange) | null`; `withView` returns the range with that view applied. The composable does not update application state. `today` reads the current wall clock when called. The result also exposes a `value` getter for the unwrapped `CalendarNavigation` object.

`useNow(timeZone)` accepts a `MaybeRefOrGetter<TimeZoneId>` and returns a computed ref of `CalendarNow | null`, where `CalendarNow` is `{ date: IsoDate, minuteOfDay: number }`. It initializes from the current time, then samples every 30 seconds in a browser. An unreadable time zone returns `null`.

`createCalendarComponents<TData>()` returns the same `Calendar` object with its scoped-slot data typed to `TData`; it performs no runtime work. Without it, event data in component scopes defaults to `unknown`.

## Data and behavior contracts

### Components, props, defaults, and provider hierarchy

All components default to `as="div"`, except `TimeSlots` (`span`). `Root` requires `range` and `events`; all other entries list their additional props and defaults. Slots receive the scope shown in the table. `Root` provides calendar state; nested providers are established by `TimeGrid`, `DayColumns`, `AllDayRow`, `MonthRows`, `MonthDays`, and `AgendaDays`.

| Component            | Additional props (default)                                                            | Slot scope fields                                                            | Required ancestor       |
| -------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `Root`               | `range`, `events` required; `locale="en-US"`; `gutterWidth="3.25rem"`; `renderError?` | `calendar`, `range`, `locale`, `gutterWidth`                                 | —                       |
| `Toolbar`            | `onNavigate?`; `views=['day','week','month','agenda']`                                | `navigation`, `range`, `title`, `goTo`                                       | `Root`                  |
| `Header`             | `gutterCell=null`                                                                     | `calendar`, `range`, `locale`, `gutterWidth`                                 | `Root`                  |
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

Plural components iterate their data: for example, `DayColumns` renders one column per day and `TimedEvents` one element per positioned event. Scoped slots are named `default`; the scope arrives as the slot props. Descendants can read provided contexts through the composables below.

`useCalendarContext<TData>()` reads `CalendarContextValue<TData>` (`calendar`, `range`, `locale`, `gutterWidth`) from `Root`. Each field is a `ComputedRef`. `useTimeGridContext()` reads `{ hourHeight, dayHeight }` from `TimeGrid`; `useDayColumnContext<TData>()` reads `{ day }` from `DayColumns`; `useAllDayContext<TData>()` reads `{ row, laneHeight, lanes }` from `AllDayRow`; `useMonthRowContext<TData>()` reads `{ row, days, maxLanes, laneHeight }` from `MonthRows`; `useMonthDayContext<TData>()` reads `{ day, boxes, bars, hiddenBars }` from `MonthDays`; `useAgendaDayContext<TData>()` reads `{ day, bars, boxes }` from `AgendaDays`. Context fields are computed refs. Calling a context composable without its provider throws an error naming the required parent component.

### Rendering conventions

`DayHeadings`, `DayColumns`, `MonthDays`, and `AgendaDays` set `data-date` and `data-in-current-period`; event renderers set `data-event-id`, `data-continues-before`, and `data-continues-after`. Caller attributes can override these defaults.

`as` selects the rendered tag or component. Vue attributes, listeners, and `class` fall through to the rendered root; components merge computed layout styles with the supplied style. Scopes distinguish formatted strings by `Label` suffix; the components expose `weekdayLabel`, `dayLabel`, `monthLabel`, `timeLabel`, and `timeRangeLabel` where listed in the table. Values such as `day`, `slot`, `box`, `bar`, and `minuteOfDay` remain structured engine data. Component label helpers fall back to the input string if `formatIso` rejects the locale or options. `Toolbar` emits `navigate` and optionally calls `onNavigate(range)`; its custom slot scope exposes the navigation callback as `goTo`.

`Root` handles a calendar construction error using the `error` slot first or `renderError(error)` second, rendering the fallback inside its own element. If neither is provided it rethrows. For direct error-state handling, use `useCalendar`.

`AllDayRow` renders no row when the range has no all-day events unless `minLanes` reserves lanes. `MonthRows.maxLanes` limits displayed all-day bars; each month-day scope still exposes its `hiddenBars`, all `bars`, and `lanes`. `TimeGrid` initially scrolls to the nearest scrolling ancestor at `scrollToHour`; set it to `null` to skip this behavior. `useNow` is an independent clock composable.

## Minimal example

```vue
<script setup lang="ts">
import { createCalendarComponents } from '@midstem/chronous-vue'
import type { CalendarRange, EventInput } from '@midstem/chronous-vue'

const TypedCalendar = createCalendarComponents<{ title: string }>()

const range = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
} as const
const events = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup' }
  }
]
</script>

<template>
  <TypedCalendar.Root :range="range" :events="events">
    <TypedCalendar.TimeGrid>
      <TypedCalendar.TimeAxis
        ><TypedCalendar.TimeLabels
      /></TypedCalendar.TimeAxis>
      <TypedCalendar.DayColumns>
        <TypedCalendar.TimeSlots />
        <TypedCalendar.TimedEvents v-slot="{ event }">{{
          event.data?.title
        }}</TypedCalendar.TimedEvents>
      </TypedCalendar.DayColumns>
    </TypedCalendar.TimeGrid>
  </TypedCalendar.Root>
</template>
```

Month and agenda components replace the slotted view inside `Root`. Choose the composition that matches `range.view`.

Month composition:

```vue
<TypedCalendar.MonthGrid>
  <TypedCalendar.MonthWeekdays v-slot="{ weekdayLabel }">{{ weekdayLabel }}</TypedCalendar.MonthWeekdays>
  <TypedCalendar.MonthRows :max-lanes="3">
    <TypedCalendar.MonthDays v-slot="{ dayLabel, hiddenBars }">
      {{ dayLabel }}<span v-if="hiddenBars.length">+{{ hiddenBars.length }}</span>
      <TypedCalendar.MonthTimedEvents />
    </TypedCalendar.MonthDays>
    <TypedCalendar.MonthAllDayEvents />
  </TypedCalendar.MonthRows>
</TypedCalendar.MonthGrid>
```

Agenda composition:

```vue
<TypedCalendar.AgendaList>
  <TypedCalendar.AgendaDays v-slot="{ dayLabel }">
    <h2>{{ dayLabel }}</h2>
    <TypedCalendar.AgendaAllDayEvents />
    <TypedCalendar.AgendaTimedEvents v-slot="{ event }">{{ event.data?.title }}</TypedCalendar.AgendaTimedEvents>
  </TypedCalendar.AgendaDays>
</TypedCalendar.AgendaList>
```

## Errors and limitations

The adapter's calendar error union is `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, and `MissingTemporalError`. These cover invalid or unreadable event data, invalid range inputs such as dates/time zones/slot settings, unreadable recurrence rules, and operations that require Temporal when no fallback is available. `useCalendar` exposes these errors; `Root` renders an error slot or renderer when supplied and otherwise rethrows. Unexpected exceptions are not converted to `CalendarError` and propagate.

Navigation uses `null` for unavailable `next`, `prev`, or `today`. `today` is a nullable function, not a range value. The adapter embeds its core build, so error classes imported from this package do not share identity with classes from a separately imported `@midstem/chronous` copy. Core fallback and DST limitations are described in the [core reference](../core/DOCUMENTATIONS.md).

## Source map and validation

Public exports: [`src/index.ts`](src/index.ts), [`src/components/index.ts`](src/components/index.ts). Composable signatures: [`src/calendar/`](src/calendar/), [`src/navigation/`](src/navigation/), and [`src/components/slotted/use-now.ts`](src/components/slotted/use-now.ts). Component declarations and implementations: [`src/components/`](src/components/); contexts: [`src/components/context/`](src/components/context/). Behavior checks: [`src/__test__/`](src/__test__/), [`src/calendar/__test__/`](src/calendar/__test__/), [`src/navigation/__test__/`](src/navigation/__test__/), and [`src/components/__test__/`](src/components/__test__/). Format with `npx prettier --write packages/vue/DOCUMENTATIONS.md`; run package checks with `npm run typecheck` and `npm run test:run` from `packages/vue`.
