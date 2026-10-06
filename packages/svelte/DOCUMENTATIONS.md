# `@midstem/chronous-svelte` agent reference

## Scope and source of truth

`@midstem/chronous-svelte` provides Svelte 5 components, context readers, and Svelte readable stores over the Chronous calendar engine. It publishes its `.svelte` source through the `svelte` package export condition so Svelte-aware tools can compile it for client rendering and SSR. Its peer dependency is Svelte `>=5.0.0`.

This reference follows the public exports, component props and implementations, tests, and package metadata. Calendar input validation, layout, recurrence, and formatting semantics are defined by the [core API reference](../core/DOCUMENTATIONS.md).

When changing a public contract, verify the implementation and exported types
and update this reference in the same change. Source code takes precedence over
examples or descriptions that disagree with it.

## Setup and imports

Install the adapter and, when exact Temporal behavior is needed in runtimes without native Temporal, the polyfill:

```sh
npm install @midstem/chronous-svelte temporal-polyfill
```

Use the Svelte Vite plugin or another Svelte-aware compiler. Load the polyfill once from the application entry point before rendering:

```ts
import 'temporal-polyfill/global'
```

Import components and helpers from the package root. `Calendar` is the default component set; `createCalendarComponents<TData>()` returns component references with snippet payloads typed for your event data.

Core is embedded in the local engine bundle; consumers need no separate
`@midstem/chronous` dependency. Use error classes from this package when catching
its errors; separately imported core has different class identities. Import the
package root rather than internal `dist` files.

```svelte
<script lang="ts">
  import { Calendar, createCalendarComponents } from '@midstem/chronous-svelte'
  import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'

  type EventData = { title: string }
  const C = createCalendarComponents<EventData>()
  let range = $state<CalendarRange>({
    view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv'
  })
  let events = $state<readonly EventInput<EventData>[]>([])
</script>

<C.Root {range} {events}>
  {#snippet children()}
    <C.DayHeadings>
      {#snippet children({ dayLabel, weekdayLabel })}
        <div>{weekdayLabel} {dayLabel}</div>
      {/snippet}
    </C.DayHeadings>
  {/snippet}
</C.Root>
```

The entry point also re-exports core functions, error classes, and types, plus `useCalendar`, `calendarResult`, `useCalendarNavigation`, `calendarNavigation`, `useNow`, and seven context readers.

## Public API

| Export                              | Contract                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `useCalendar(range, events)`        | Takes readable stores and returns `Readable<CalendarResult<TData>>`, derived whenever either input store emits.            |
| `calendarResult(range, events)`     | Synchronously returns the same result union for ordinary values.                                                           |
| `useCalendarNavigation(range)`      | Takes a readable range store and returns `Readable<CalendarNavigation>`.                                                   |
| `calendarNavigation(range)`         | Synchronously returns the navigation object for a range value.                                                             |
| `useNow(timeZone)`                  | Returns `Readable<CalendarNow \| null>`; its first subscriber starts a 30-second clock and the last unsubscribe clears it. |
| `Calendar`                          | The 23 public components listed below, with event data defaulting to `unknown`.                                            |
| `createCalendarComponents<TData>()` | Returns the same component references typed for `TData`; it does not create separate runtime components.                   |

`CalendarNavigation` contains `next` and `prev` as `CalendarRange | null`, `today` as `(() => CalendarRange) | null`, and `withView(view): CalendarRange`. The `today` function reads the clock when called. Navigation returns proposed ranges; the application updates the range passed to `Root`.

`CalendarResult<TData>` is either `{ calendar, error: null }` or `{ calendar: null, error }`. The reactive and synchronous helpers catch `InvalidRangeError`, `InvalidEventError`, `InvalidRecurrenceError`, and `MissingTemporalError`; unrelated exceptions propagate.

## Data and behavior contracts

### Components, props, and snippet scopes

Components accept `as` (default `div`, except `TimeSlots`, which defaults to `span`), `children` snippets where a scope is listed, `style` (CSS text or a style object), and standard attributes/handlers for the selected element. `children` replaces the component's default content; it does not remove geometry applied to the component's host element.

| Component            | Specific props and defaults                                                                   | `children` snippet scope / provider                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Root`               | required `range`, `events`; `locale='en-US'`; `gutterWidth='3.25rem'`; optional `renderError` | calendar context (`calendar`, `range`, `locale`, `gutterWidth`); provides calendar context               |
| `Toolbar`            | required `onNavigate`; `views=['day','week','month','agenda']`                                | `navigation`, `range`, `title`, `goTo`                                                                   |
| `Header`             | optional `gutterCell` snippet                                                                 | calendar context                                                                                         |
| `DayHeadings`        | —                                                                                             | `day`, `date`, `weekdayLabel`, `dayLabel`, `inCurrentPeriod`                                             |
| `AllDayRow`          | `laneHeight=24`; `minLanes=0`; optional `gutterCell` snippet                                  | `row`, `laneHeight`, `lanes`; provides all-day context                                                   |
| `AllDayEvents`       | `gap=4`                                                                                       | `event`, `bar`                                                                                           |
| `TimeGrid`           | `hourHeight=60`; `scrollToHour=7` (`null` disables initial scroll)                            | `hourHeight`, `dayHeight`; provides time-grid context                                                    |
| `TimeAxis`           | —                                                                                             | `hourHeight`, `dayHeight`                                                                                |
| `TimeLabels`         | —                                                                                             | `slot`, `minuteOfDay`, `timeLabel`                                                                       |
| `DayColumns`         | —                                                                                             | `day`; provides day-column context                                                                       |
| `TimeSlots`          | —                                                                                             | `slot`, `minuteOfDay`                                                                                    |
| `TimedEvents`        | `minHeight=22`; `gap=3`                                                                       | `event`, `box`                                                                                           |
| `NowMarker`          | —                                                                                             | `minuteOfDay`                                                                                            |
| `MonthGrid`          | —                                                                                             | calendar context                                                                                         |
| `MonthWeekdays`      | —                                                                                             | `day`, `weekdayLabel`                                                                                    |
| `MonthRows`          | `maxLanes=null`; `laneHeight=20`                                                              | `row`, `days`, `maxLanes`, `laneHeight`; provides month-row context                                      |
| `MonthDays`          | —                                                                                             | `day`, `boxes`, `bars`, `hiddenBars`, `dayLabel`, `inCurrentPeriod`, `lanes`; provides month-day context |
| `MonthAllDayEvents`  | `gap=4`; `lanesTopOffset=28`                                                                  | `event`, `bar`                                                                                           |
| `MonthTimedEvents`   | —                                                                                             | `event`, `box`                                                                                           |
| `AgendaList`         | —                                                                                             | calendar context                                                                                         |
| `AgendaDays`         | `showEmptyDays=false`                                                                         | `day`, `bars`, `boxes`, `weekdayLabel`, `dayLabel`, `monthLabel`; provides agenda-day context            |
| `AgendaAllDayEvents` | —                                                                                             | `event`, `bar`                                                                                           |
| `AgendaTimedEvents`  | —                                                                                             | `event`, `box`, `timeRangeLabel`                                                                         |

Context readers run during component initialization beneath their matching
provider and throw a descriptive error outside it. They return getter-backed
objects, not stores; retain the object to read updated values.

| Reader                         | Provider     | Fields                                       |
| ------------------------------ | ------------ | -------------------------------------------- |
| `useCalendarContext<TData>()`  | `Root`       | `calendar`, `range`, `locale`, `gutterWidth` |
| `useTimeGridContext()`         | `TimeGrid`   | `hourHeight`, `dayHeight`                    |
| `useDayColumnContext<TData>()` | `DayColumns` | `day`                                        |
| `useAllDayContext<TData>()`    | `AllDayRow`  | `row`, `laneHeight`, `lanes`                 |
| `useMonthRowContext<TData>()`  | `MonthRows`  | `row`, `days`, `maxLanes`, `laneHeight`      |
| `useMonthDayContext<TData>()`  | `MonthDays`  | `day`, `boxes`, `bars`, `hiddenBars`         |
| `useAgendaDayContext<TData>()` | `AgendaDays` | `day`, `bars`, `boxes`                       |

Compose slotted views as `Root > TimeGrid > DayColumns > TimeSlots/TimedEvents/NowMarker`;
place `TimeLabels` inside `TimeAxis` in the same grid. Compose month rows under
`Root`, with `MonthDays` and `MonthAllDayEvents` as siblings in each `MonthRows`
snippet; place `MonthTimedEvents` inside `MonthDays`. For agenda, place the event
components inside `AgendaDays` under `Root`. `MonthGrid` and `AgendaList` supply
markup and geometry rather than additional context providers.

### Rendering contracts

`EventInput<TData>` flows through the computed calendar layout into day, row, bar, box, and snippet values. `createCalendarComponents<TData>()` supplies type information for those snippet values; it does not transform payloads. Core layout values `box.top`, `box.height`, `box.left`, and `box.width` are fractions. The timed-event components apply those fractions as percentages and apply event positioning to their own host element. When writing custom geometry on another element, convert a fraction to a CSS percentage by multiplying by 100; when using a component's positioned host, do not apply the same geometry again to its child. Month timed events render within a day cell and do not apply slotted time-grid geometry.

The all-day row hides when it has no bars and reserves `minLanes` only when requested. Month rows show all lanes by default; `maxLanes` filters rendered bars and exposes per-day `hiddenBars`. Agenda days omit empty days unless `showEmptyDays` is true. The calendar gutter is shared across header, all-day row, and time grid. Labels use the root locale and fall back to the original ISO value if formatting fails. See [core data and layout contracts](../core/DOCUMENTATIONS.md).

## Minimal example

This composition shows the day-column context consumed by time slots, timed events, and the now marker. Geometry belongs to the `TimedEvents` host; the snippet only supplies content and styling:

```svelte
<C.Root {range} {events}>
  {#snippet children()}
    <C.TimeGrid>
      {#snippet children()}
        <C.DayColumns>
          {#snippet children({ day })}
            <span>{day.date}</span>
            <C.TimeSlots />
            <C.TimedEvents>
              {#snippet children({ event })}
                <span class="event-title">{event.data?.title}</span>
              {/snippet}
            </C.TimedEvents>
            <C.NowMarker />
          {/snippet}
        </C.DayColumns>
      {/snippet}
    </C.TimeGrid>
  {/snippet}
</C.Root>
```

For a month view, the `MonthRows` snippet provides the row and its days; nest `MonthDays` and `MonthAllDayEvents` in that row, then put `MonthTimedEvents` in each day. The components read their row/day from context:

```svelte
<C.MonthRows maxLanes={3}>
  {#snippet children({ row, days })}
    <C.MonthAllDayEvents>
      {#snippet children({ event, bar })}
        <div data-lane={bar.lane}>{event.data?.title}</div>
      {/snippet}
    </C.MonthAllDayEvents>
    <C.MonthDays>
      {#snippet children({ day, hiddenBars })}
        <section>
          <span>{day.date}</span>
          {#if hiddenBars.length}<span>+{hiddenBars.length} more</span>{/if}
          <C.MonthTimedEvents>
            {#snippet children({ event })}<div>{event.data?.title}</div>{/snippet}
          </C.MonthTimedEvents>
        </section>
      {/snippet}
    </C.MonthDays>
  {/snippet}
</C.MonthRows>
```

For an agenda, nest `AgendaDays` in `AgendaList`; each day snippet can use its bars directly or delegate to the event components:

```svelte
<C.AgendaList>
  {#snippet children()}
    <C.AgendaDays>
      {#snippet children({ day, weekdayLabel, dayLabel, bars })}
        <section>
          <h2>{weekdayLabel} {dayLabel}</h2>
          <C.AgendaAllDayEvents>
            {#snippet children({ event })}<p>{event.data?.title}</p>{/snippet}
          </C.AgendaAllDayEvents>
          <C.AgendaTimedEvents>
            {#snippet children({ event, timeRangeLabel })}
              <p>{timeRangeLabel}: {event.data?.title}</p>
            {/snippet}
          </C.AgendaTimedEvents>
          <small>{bars.length} all-day bars</small>
        </section>
      {/snippet}
    </C.AgendaDays>
  {/snippet}
</C.AgendaList>
```

## Errors and limitations

`Root` renders a recognized calendar error through `renderError` when supplied; otherwise it throws that error. Errors outside the caught set propagate. The `calendar` getter on the calendar context throws the current calendar error if the root is in its error state.

Without Temporal, core uses its Date fallback and warns. Ordinary calendar construction and navigation remain available, while recurrence expansion and cross-zone/DST calculations can be approximate; malformed event input can still be rejected. See [core browser behavior](../core/DOCUMENTATIONS.md#browser-behavior). Install and load `temporal-polyfill/global` when exact behavior is required.

`useNow` starts a timer only while subscribed in a browser. Its initial value and its value for an unreadable time zone are `null`; server rendering does not start a timer. Invalid previous/next transitions return `null`, and `today` is null when it cannot read the range time zone. Context readers must run during component initialization under their matching provider. Retain the context object and read its fields in reactive expressions: its getter-backed values track current props, while destructuring a field once captures a snapshot.

## Source map and validation

- Public exports and component list: [`src/index.ts`](src/index.ts), [`src/components/index.ts`](src/components/index.ts)
- Component prop and snippet types: [`src/components/types.ts`](src/components/types.ts)
- Reactive results and navigation: [`src/calendar`](src/calendar), [`src/navigation`](src/navigation)
- Context providers and getters: [`src/components/context`](src/components/context)
- Clock and SSR behavior: [`src/components/slotted/use-now.ts`](src/components/slotted/use-now.ts), [`tests/ssr.test.ts`](tests/ssr.test.ts)
- Package export condition and peer dependency: [`package.json`](package.json)
- Validate with `npm run typecheck --workspace @midstem/chronous-svelte` and `npm run test:run --workspace @midstem/chronous-svelte` from the repository root.
