# Svelte adapter guide

`@midstem/chronous-svelte` wraps the shared `@midstem/chronous` engine with Svelte 5 components, context helpers, and Svelte stores. It publishes its `.svelte` files with the Svelte export condition so the consumer's Svelte compiler can produce both client and server output.

## Install

```sh
npm install @midstem/chronous-svelte svelte temporal-polyfill
```

Svelte 5 is required. Configure the Svelte plugin in Vite as usual. Import the Temporal polyfill from the application entry when exact recurrence and time-zone calculations are required:

```ts
import 'temporal-polyfill/global'
```

The engine also works without Temporal and reports whether it is available through `isTemporalAvailable()`. Its date fallback keeps ordinary calendars and navigation working; recurrence expansion and cross-zone calculations may be approximate.

## Weekly calendar

`Calendar.Root` builds the calendar and provides its range, layout, locale, and gutter width to descendants. Svelte snippets receive scope objects as parameters. Their values remain typed through `createCalendarComponents<TData>()`.

```svelte
<script lang="ts">
  import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'
  import { Calendar, createCalendarComponents } from '@midstem/chronous-svelte'

  type EventData = { title: string; color: string }
  const C = createCalendarComponents<EventData>()
  let range = $state<CalendarRange>({
    view: 'week',
    currentDate: '2026-03-18',
    timeZone: 'Europe/Kyiv'
  })
  let events = $state<EventInput<EventData>[]>([
    {
      id: 'planning',
      start: '2026-03-18T09:00:00',
      end: '2026-03-18T10:30:00',
      data: { title: 'Planning', color: '#6b4eff' }
    },
    {
      id: 'team-day',
      allDay: true,
      start: '2026-03-17',
      end: '2026-03-20',
      data: { title: 'Team day', color: '#008c74' }
    }
  ])

  const navigate = (next: CalendarRange) => (range = next)
</script>

<C.Root {range} {events} locale="en-GB" gutterWidth="3.5rem">
  {#snippet children()}
    <C.Toolbar onNavigate={navigate}>
      {#snippet children({ navigation, range, title, goTo })}
        <button
          disabled={!navigation.prev}
          onclick={() => navigation.prev && goTo(navigation.prev)}
        >
          Previous
        </button>
        <strong>{title}</strong>
        <button
          disabled={!navigation.next}
          onclick={() => navigation.next && goTo(navigation.next)}
        >
          Next
        </button>
        <button onclick={() => goTo(navigation.withView('month'))}>Month</button
        >
      {/snippet}
    </C.Toolbar>

    <C.DayHeadings>
      {#snippet children({ weekdayLabel, dayLabel, inCurrentPeriod })}
        <div class:outside={!inCurrentPeriod}>{weekdayLabel} {dayLabel}</div>
      {/snippet}
    </C.DayHeadings>

    <C.AllDayRow minLanes={1}>
      {#snippet children()}
        <C.AllDayEvents>
          {#snippet children({ event, bar })}
            <div
              class="all-day"
              data-lane={bar.lane}
              style={`background:${event.data?.color}`}
            >
              {event.data?.title}
            </div>
          {/snippet}
        </C.AllDayEvents>
      {/snippet}
    </C.AllDayRow>

    <C.TimeGrid hourHeight={64} scrollToHour={8}>
      {#snippet children()}
        <C.TimeAxis>
          {#snippet children({ dayHeight })}
            <div style={`height:${dayHeight}px`}><C.TimeLabels /></div>
          {/snippet}
        </C.TimeAxis>
        <C.DayColumns>
          {#snippet children({ day })}
            <span class="date">{day.date}</span>
            <C.TimeSlots />
            <C.TimedEvents>
              {#snippet children({ event, box })}
                <article
                  class="timed"
                  style={`background:${event.data?.color};top:${box.top}%;height:${box.height}%`}
                >
                  {event.data?.title}
                </article>
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

The `children` snippet replaces a primitive's default rendering and receives its scope. Without a snippet, components use simple labels or event IDs where those make sense. `as` accepts an HTML tag name, and `style` accepts a CSS string or a style object. Standard HTML attributes and event handlers pass through to the generated element.

## Month view

`MonthRows` provides each row's lane configuration. Place `MonthAllDayEvents` beside `MonthDays` in the row snippet so each spanning bar is rendered once over its full row. `MonthDays` provides each day with its timed boxes, all-day bars, hidden overflow bars, visible lane count, and formatted day number.

```svelte
<C.MonthGrid>
  {#snippet children()}
    <C.MonthWeekdays>
      {#snippet children({ day, weekdayLabel })}
        <div data-date={day.date}>{weekdayLabel}</div>
      {/snippet}
    </C.MonthWeekdays>
    <C.MonthRows maxLanes={2} laneHeight={20}>
      {#snippet children({ row, days })}
        <C.MonthAllDayEvents>
          {#snippet children({ event, bar })}
            <div class="bar" data-lane={bar.lane}>{event.data?.title}</div>
          {/snippet}
        </C.MonthAllDayEvents>
        <C.MonthDays>
          {#snippet children({ day, hiddenBars, lanes })}
            <section data-date={day.date} data-visible-lanes={lanes}>
              <span>{day.date}</span>
              {#each hiddenBars as bar (`${bar.event.id}-${bar.startDay}`)}
                <button class="more">More: {bar.event.data?.title}</button>
              {/each}
              <C.MonthTimedEvents>
                {#snippet children({ event, box })}
                  <div class="month-event" data-start-minute={box.startMinute}>
                    {event.data?.title}
                  </div>
                {/snippet}
              </C.MonthTimedEvents>
            </section>
          {/snippet}
        </C.MonthDays>
      {/snippet}
    </C.MonthRows>
  {/snippet}
</C.MonthGrid>
```

Set `maxLanes={null}` to show all all-day lanes. The default is `null`.

## Agenda view

`AgendaDays` hides empty days by default. Set `showEmptyDays` to render each day in the range. All-day and timed events are exposed as snippets, and timed events include a localized `timeRangeLabel`.

```svelte
<C.AgendaList>
  {#snippet children()}
    <C.AgendaDays showEmptyDays>
      {#snippet children({ day, weekdayLabel, dayLabel, monthLabel })}
        <section>
          <h2>{weekdayLabel}, {monthLabel} {dayLabel}</h2>
          <C.AgendaAllDayEvents>
            {#snippet children({ event })}<p>{event.data?.title}</p>{/snippet}
          </C.AgendaAllDayEvents>
          <C.AgendaTimedEvents>
            {#snippet children({ event, timeRangeLabel })}
              <p>{timeRangeLabel}: {event.data?.title}</p>
            {/snippet}
          </C.AgendaTimedEvents>
        </section>
      {/snippet}
    </C.AgendaDays>
  {/snippet}
</C.AgendaList>
```

## Navigation

`Calendar.Toolbar` generates previous, today, next, and view buttons unless you provide its `children` snippet. It requires `onNavigate`, which receives the next range; keep that range in `$state` so the root and all descendants update.

For a store-backed range outside the built-in toolbar, use `useCalendarNavigation(rangeStore)`. It returns a Svelte readable store. `calendarNavigation(range)` returns the same navigation object for a plain value. Invalid previous/next transitions return `null`; `today` is `null` when the range cannot be navigated.

## Calendar result stores

`useCalendar(rangeStore, eventsStore)` returns a readable store containing either `{ calendar, error: null }` or `{ calendar: null, error }`. It rebuilds when either store changes. `calendarResult(range, events)` computes the same union synchronously for ordinary values.

```ts
import type { CalendarRange, EventInput } from '@midstem/chronous-svelte'
import { get, writable } from 'svelte/store'
import { useCalendar } from '@midstem/chronous-svelte'

const range = writable<CalendarRange>({
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
})
const events = writable<readonly EventInput[]>([])
const result = useCalendar(range, events)
console.log(get(result).error)
```

Within a Svelte component, auto-subscribe with `$result` or subscribe using the normal Svelte store API.

## Typed payloads

The base `Calendar` components accept any event data type. `createCalendarComponents<TData>()` returns the same component set with event and day snippets typed for `TData`:

```svelte
<script lang="ts">
  import { createCalendarComponents } from '@midstem/chronous-svelte'
  type Task = { title: string; owner: string }
  const C = createCalendarComponents<Task>()
</script>

<C.TimedEvents>
  {#snippet children({ event })}
    <span>{event.data?.owner}: {event.data?.title}</span>
  {/snippet}
</C.TimedEvents>
```

## Errors and contexts

`Calendar.Root` catches the engine's `InvalidRangeError`, `InvalidEventError`, `InvalidRecurrenceError`, and `MissingTemporalError`. Supply a `renderError` snippet to render those errors in place. Without it, the known error is thrown. Unexpected errors are never hidden.

```svelte
<C.Root {range} {events}>
  {#snippet children()}<C.DayHeadings />{/snippet}
  {#snippet renderError(error)}
    <p role="alert">Calendar unavailable: {error.message}</p>
  {/snippet}
</C.Root>
```

Context readers are called during component initialization inside the matching provider. Keep the returned context object and read its fields in reactive expressions; destructuring a getter-backed field once would take a snapshot.

```svelte
<script lang="ts">
  import { useCalendarContext } from '@midstem/chronous-svelte'

  const context = useCalendarContext()
</script>

<p>{context.range.currentDate} ({context.calendar.days.length} days)</p>
```

The seven readers map to their providers as follows:

| Reader                  | Provider        | Values                                                  |
| ----------------------- | --------------- | ------------------------------------------------------- |
| `useCalendarContext()`  | `Calendar.Root` | `calendar`, `range`, `locale`, `gutterWidth`            |
| `useTimeGridContext()`  | `TimeGrid`      | `hourHeight`, `dayHeight`                               |
| `useDayColumnContext()` | `DayColumns`    | `day`                                                   |
| `useAllDayContext()`    | `AllDayRow`     | `row`, `laneHeight`, `lanes`                            |
| `useMonthRowContext()`  | `MonthRows`     | `row`, `days`, `maxLanes`, `laneHeight`                 |
| `useMonthDayContext()`  | `MonthDays`     | `day`, timed `boxes`, all covering `bars`, `hiddenBars` |
| `useAgendaDayContext()` | `AgendaDays`    | `day`, `bars`, timed `boxes`                            |

Calling a reader outside its matching provider throws a descriptive error.

## Component reference

All 23 primitives accept `as`, standard HTML attributes, `class`, and string or object `style`. A `children` snippet overrides the default markup and receives the scope shown below.

| Component            | Main props                                                | `children` snippet scope                                                     |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Root`               | `range`, `events`, `locale`, `gutterWidth`, `renderError` | calendar context                                                             |
| `Toolbar`            | `onNavigate`, `views`                                     | `navigation`, `range`, `title`, `goTo`                                       |
| `Header`             | `gutterCell`                                              | calendar context                                                             |
| `DayHeadings`        | —                                                         | `day`, `date`, `weekdayLabel`, `dayLabel`, `inCurrentPeriod`                 |
| `AllDayRow`          | `laneHeight`, `minLanes`, `gutterCell`                    | `row`, `laneHeight`, `lanes`                                                 |
| `AllDayEvents`       | `gap`                                                     | `event`, `bar`                                                               |
| `TimeGrid`           | `hourHeight`, `scrollToHour`                              | `hourHeight`, `dayHeight`                                                    |
| `TimeAxis`           | —                                                         | `hourHeight`, `dayHeight`                                                    |
| `TimeLabels`         | —                                                         | `slot`, `minuteOfDay`, `timeLabel`                                           |
| `DayColumns`         | —                                                         | `day`                                                                        |
| `TimeSlots`          | —                                                         | `slot`, `minuteOfDay`                                                        |
| `TimedEvents`        | `minHeight`, `gap`                                        | `event`, `box`                                                               |
| `NowMarker`          | —                                                         | `minuteOfDay`                                                                |
| `MonthGrid`          | —                                                         | calendar context                                                             |
| `MonthWeekdays`      | —                                                         | `day`, `weekdayLabel`                                                        |
| `MonthRows`          | `maxLanes`, `laneHeight`                                  | `row`, `days`, `maxLanes`, `laneHeight`                                      |
| `MonthDays`          | —                                                         | `day`, `boxes`, `bars`, `hiddenBars`, `dayLabel`, `inCurrentPeriod`, `lanes` |
| `MonthAllDayEvents`  | `gap`, `lanesTopOffset`                                   | `event`, `bar`                                                               |
| `MonthTimedEvents`   | —                                                         | `event`, `box`                                                               |
| `AgendaList`         | —                                                         | calendar context                                                             |
| `AgendaDays`         | `showEmptyDays`                                           | `day`, `bars`, `boxes`, `weekdayLabel`, `dayLabel`, `monthLabel`             |
| `AgendaAllDayEvents` | —                                                         | `event`, `bar`                                                               |
| `AgendaTimedEvents`  | —                                                         | `event`, `box`, `timeRangeLabel`                                             |

## Current-time marker and SSR

`Calendar.NowMarker` renders only in the day column matching the current date in the calendar's time zone. It refreshes every 30 seconds. Its timer starts only for browser subscribers and stops when the last subscriber unmounts. The exported `useNow(timeZone)` returns a `Readable<CalendarNow | null>`; it is `null` before a browser subscription (including during SSR), emits the current zoned date and minute on subscribe, and clears its interval when the final subscriber unsubscribes. The server output omits the current-time marker until hydration, so rendering does not require `window` or start timers.

The package publishes `.svelte` component sources through the Svelte export condition. Svelte-aware build tools compile those components for the target, including server rendering. Import the adapter from your application entry; do not import individual files from its `dist` folder.

## Defaults

The adapter follows the React layout defaults: locale `en-US`, gutter width `3.25rem`, 60 pixels per hour, initial scroll to hour 7, 24-pixel all-day lanes with no reserved lane unless requested, 4-pixel all-day event gaps, 22-pixel minimum timed-event height with a 3-pixel gap, 20-pixel month lanes, unlimited month lanes, a 28-pixel month all-day offset, and hidden empty agenda days.

All components are headless. Their inline geometry keeps event positioning and slot alignment consistent; class names, colors, borders, and typography belong to the application.

## Working on this package

Run `npm run build` from the repository root to build core before the adapters.
The Svelte build uses `svelte-package` for preprocessed components and their
declarations, then Vite to bundle the local `src/engine.ts` entry. It uses the
core build's self-contained public declaration as `dist/engine.d.ts`.
`verify:dist` checks that the package resolves no separate core dependency and
that no internal aliases or Temporal namespace types reach the published files.

```bash
npm run build
npm run typecheck --workspace @midstem/chronous-svelte
npm run test:run --workspace @midstem/chronous-svelte
```
