# `@midstem/chronous-react`

Headless React hooks and primitives on top of
[`@midstem/chronous`](https://www.npmjs.com/package/@midstem/chronous). The
engine owns geometry and semantics, the hooks own memoization and navigation,
and every pixel stays yours.

## Installation

```bash
npm install @midstem/chronous-react
```

One package is enough. The engine is built into this bundle rather than
installed beside it, and everything it exports is re-exported from here —
`buildCalendar`, `formatIso`, `calendarReducer`, `ensureTemporal`, the error
classes and every type — so a React app never installs or imports
`@midstem/chronous` by name:

```tsx
import { Calendar, formatIso } from '@midstem/chronous-react'
import type { CalendarRange, EventInput } from '@midstem/chronous-react'
```

Install `@midstem/chronous` on its own only where React is not involved — a
server, a worker, another framework. Its version never has to line up with this
one, because nothing here resolves it at runtime. The one thing that does not
survive that split is `instanceof`: an error thrown by a separately installed
engine is not an instance of the error classes exported here, so catch it
against the package that built the calendar.

## Temporal, and Safari

There is nothing to set up. Render a calendar and the engine is there.

Chrome and Edge ship Temporal from 144 and Firefox from 139, and on those the
first render draws the calendar and downloads nothing — the hooks read the
engine straight off `globalThis`, with no extra render and no effect. Safari
still ships none, so there the first render that needs Temporal loads
`temporal-polyfill` through a dynamic import that every bundler splits into its
own chunk (~20 kB gzip), and re-renders once it lands. You install nothing and
pick no version: the polyfill is a dependency of this package, and the engine
holds the implementation itself instead of assigning `globalThis.Temporal`.

That one waiting render is the whole cost, and it is a Safari-only cost.
`useCalendar` reports it as `pending`, and `Calendar.Root` draws its
`renderPending` slot — the container and its styles are already in place, so
nothing jumps when the calendar arrives:

```tsx
<Calendar.Root range={range} events={events} renderPending={() => <Skeleton />}>
```

`useTemporalStatus()` is the same signal on its own — `'ready'`, `'pending'` or
`'failed'` — for a component that wants to gate on it directly.

`ensureTemporal()` is still exported and still does what it did: awaiting it
before the first render removes the pending state entirely. Reach for it on the
server, in a worker, or wherever a render cannot be allowed to arrive empty.
Nothing in a browser app needs it any more.

A load that fails settles on `MissingTemporalError`, which `useCalendar` catches
like the other calendar errors, so `renderError` on `Calendar.Root` can show it
rather than the tree coming down.

## `useCalendar`

`useCalendar(range, events)` is a memoized projection of `buildCalendar`. It
holds no state and runs no effects: the range is yours, so it can live in a
router, a query string or `useState`. A `CalendarRange` names what to draw —
the view, the anchor date and the time zone.

```tsx
const { calendar, error, pending } = useCalendar(range, events)
```

The memo is keyed on the fields of the range rather than on its identity, so an
inline object literal does not rebuild the calendar on every render. Events are
keyed by reference — memoize that array yourself if it is built inline.

`buildCalendar` throws on the first unusable event, on an unreadable range and
on a recurrence rule it cannot read, and a throw during render takes the whole
tree down. The hook catches `InvalidEventError`, `InvalidRangeError` and
`InvalidRecurrenceError` and hands them back instead: `calendar` is null exactly
when `error` is set. Anything else is a bug and is left to propagate.

`pending` is set only while the polyfill is in flight, and it comes alongside a
`MissingTemporalError` rather than in place of one — so code written against
`calendar` and `error` alone keeps reading correctly. Check it before the error
to draw a skeleton instead, which is what `Calendar.Root` does with
`renderPending`:

```tsx
const { calendar, error, pending } = useCalendar(range, events)

if (pending) return <Skeleton />
if (error) return <Failed error={error} />

return <Board calendar={calendar} />
```

The order is the whole trick: without the first line the error branch draws for
that one render, and with it nothing does. `pending` never arrives on its own —
an engine that is not here yet is still an engine that is not here, and saying
so as `error: null` would drop code that only checks `error` straight into a
null `calendar`.

## `useCalendarNavigation`

`useCalendarNavigation(range)` returns the ranges to move to, and never sets
state itself. It is a thin wrapper over `calendarReducer` — the same steps are
available without React, and without a rendered calendar.

```tsx
const { next, prev, today, withView } = useCalendarNavigation(range)

<button disabled={!prev} onClick={() => prev && setRange(prev)}>Back</button>
<button disabled={!today} onClick={() => today && setRange(today())}>Today</button>
<button disabled={!next} onClick={() => next && setRange(next)}>Forward</button>
```

A step moves by the period the range asks for: a day by one day, a week by
seven, a span by its own length, and a month by one month anchored on the
first — so a long month never drags the anchor backwards. The weekday of the
anchor survives a week step, which is what makes switching to `day` afterwards
land where the reader was looking.

`next` and `prev` are also null while Temporal is still loading, and become
steppable on their own once it lands. Beyond that they are null when the range
itself cannot be stepped: an anchor
date that cannot be read, or a `dayCount` that is not a whole number of days.
An unreadable time zone does not stop a step — it stops the calendar, not the
arithmetic — so the buttons keep working while the zone is being fixed.

`today` is a function rather than a value because it depends on the wall clock
and not on the inputs: it is read at the click, in the calendar's own zone. It
is null only when that zone itself cannot be read, because then there is no
today to read and no move that would help — fix the zone instead.

## Components

`Calendar` is a compound component built on the same two hooks. The tedious half
comes already wired — geometry, scoping, keys — and everything you can see is
yours to write: every part renders the tag you name, takes your class names and
your markup, and hands you the event behind it. Nothing here is closed off; the
pieces arrive pre-wired, not locked down, so styling is the part left for you.

```tsx
import { Calendar } from '@midstem/chronous-react'

;<Calendar.Root range={range} events={events} locale="en-GB">
  <Calendar.Header className="grid-header">
    <Calendar.DayHeadings className="heading">
      {({ weekday, dayNumber }) => (
        <>
          <span>{weekday}</span> <strong>{dayNumber}</strong>
        </>
      )}
    </Calendar.DayHeadings>
  </Calendar.Header>

  <Calendar.AllDayRow gutterCell="all-day">
    <Calendar.AllDayEvents className="bar">
      {({ event }) => event.data?.title}
    </Calendar.AllDayEvents>
  </Calendar.AllDayRow>

  <Calendar.TimeGrid hourHeight={60}>
    <Calendar.TimeAxis className="gutter">
      <Calendar.TimeLabels className="tick" />
    </Calendar.TimeAxis>

    <Calendar.DayColumns className="column">
      <Calendar.TimeSlots className="line" />
      <Calendar.NowMarker className="now" />
      <Calendar.TimedEvents as="button" className="event" onClick={open}>
        {({ event }) => event.data?.title}
      </Calendar.TimedEvents>
    </Calendar.DayColumns>
  </Calendar.TimeGrid>
</Calendar.Root>
```

`MonthGrid` / `MonthWeekdays` / `MonthRows` / `MonthDays` /
`MonthAllDayEvents` / `MonthTimedEvents` cover the month view, and
`AgendaList` / `AgendaDays` / `AgendaAllDayEvents` / `AgendaTimedEvents` the
agenda. The pair repeats in every view: `AllDayEvents` draws what the engine
laid out as bars, `TimedEvents` what it laid out inside a day. `Toolbar` wraps
`useCalendarNavigation` and reports where to move to through `onNavigate` — the
same function reaches its render prop as `goTo`, so a toolbar of your own reads
`goTo(navigation.next)`. `useNow` reads the wall clock in the calendar's own
zone when you want to mark today yourself.

Five rules cover the whole surface.

**A plural name iterates.** `DayColumns` renders one element per day,
`TimedEvents` one per box, `TimeSlots` one per slot. This is the one place the
API departs from Radix, where a child is always one element: the calendar's
repetition is the engine's, not the consumer's, so the component owns the loop
and the keys. Singular names — `Root`, `Header`, `TimeGrid`, `NowMarker` — render
once.

**Children are a node or a function of the scope**, and either way they render
inside that scope, so nested components resolve:

```tsx
<Calendar.MonthDays>
  {({ dayNumber, inPeriod }) => (
    <div data-outside={!inPeriod}>
      {dayNumber}
      <Calendar.MonthTimedEvents className="dot" />
    </div>
  )}
</Calendar.MonthDays>
```

Every scope is also a hook — `useDayColumnContext`, `useMonthRowContext`,
`useAgendaDayContext` and the rest — so a component of your own can sit inside
`Calendar.DayColumns` and read the day without a render prop. Reading a scope
outside its parent throws and names the parent it wants.

**`as` picks the tag, and your `style` wins.** Every component forwards
`className`, `ref`, handlers and `aria-*` to the element it renders, and merges
the layout it computed underneath the `style` you pass — so an event can be a
`<button>`, and a `top` of your own overrides the one the engine placed.

**Per-item state arrives as data attributes**, because `className` is shared by
every element a component renders. `data-date` and `data-in-period` land on
`DayHeadings`, `DayColumns`, `MonthDays` and `AgendaDays`; `data-event-id` and
`data-continues-before` / `data-continues-after` land on the event components. A
prop you pass wins over the attribute, so you can pin one when you need to:

```tsx
<Calendar.MonthDays className="data-[in-period=false]:bg-zinc-50" />
```

**The gutter lives on `Root`.** `Header`, `AllDayRow` and `TimeGrid` lay out
the same CSS grid, so `gutterWidth` is one prop on the root rather than three
that can drift apart. Month and agenda ignore it. What goes _in_ that leading
column is `gutterCell`, on `Header` and on `AllDayRow`.

### Overflow, and the empty all-day row

Two cut-offs are shared between siblings, so they cannot drift apart.

`MonthRows` takes `maxLanes`. `MonthAllDayEvents` then stops drawing bars past
that lane, and every `MonthDays` cell is handed the bars that cover _it_ —
`bars` for all of them, `hiddenBars` for the ones the cut-off dropped, and
`lanes` counting only what is drawn. That is the whole "+2 more" affordance:

```tsx
<Calendar.MonthRows maxLanes={3}>
  <Calendar.MonthDays>
    {({ dayNumber, hiddenBars }) => (
      <>
        {dayNumber}
        {hiddenBars.length > 0 && <button>+{hiddenBars.length} more</button>}
      </>
    )}
  </Calendar.MonthDays>
  <Calendar.MonthAllDayEvents className="bar" />
</Calendar.MonthRows>
```

Timed events in a month cell need nothing new: `boxes` is already in the same
scope, so `boxes.slice(0, 3)` and `boxes.length - 3` are yours to write.

`AllDayRow` renders nothing when the range holds no all-day event, which frees
the space but moves the grid under it as you step between weeks. `minLanes`
holds the row open instead — `minLanes={1}` keeps one lane's height and the
`gutterCell` with it, and a row that needs more lanes still gets them:

```tsx
<Calendar.AllDayRow minLanes={1} gutterCell="all-day">
  <Calendar.AllDayEvents className="bar" />
</Calendar.AllDayRow>
```

`TimeGrid` scrolls to `scrollToHour` on mount by finding the nearest element
that actually scrolls — itself when nothing else does, the ancestor when your
layout puts a sticky header above it. Pass `null` to leave the scroll alone.

`Root` renders `renderError(error)` inside its own element when the range or
the events cannot be read, so the layout does not collapse, and rethrows when
no `renderError` is given: an invalid range is a bug in the input, and
swallowing it into a blank grid hides it. Reach for `useCalendar` directly when
you want to handle it as state instead.

## Typed event data

Context cannot infer a type argument, so `Calendar` on its own hands render
props `data?: unknown`. `createCalendarComponents` binds the namespace once and
the type flows to every render prop:

```tsx
const Calendar = createCalendarComponents<{ title: string; owner: string }>()

<Calendar.TimedEvents>
  {({ event }) => event.data?.title}
</Calendar.TimedEvents>
```

It is the same object at runtime — a cast, not a factory — so it costs nothing
and can be created at module scope. It is named for what it returns, and not
`createCalendar`, because `buildCalendar` arrives from the same import and
builds something else entirely.

## Labels

No formatting ships here, and the hooks take no `locale`. Labels are the
consumer's, and `formatIso` reads either shape a calendar hands back:

```tsx
import { formatIso } from '@midstem/chronous-react'

formatIso(day.date, { locale, options: { weekday: 'short', day: 'numeric' } })
formatIso(slot.start, {
  locale,
  options: { hour: '2-digit', minute: '2-digit' }
})
```

`day.date` is a bare `2026-03-18` with no time and no offset, meant for keys,
comparisons and headings; `day.start`, `slot.start` and `box.start` are full
date-times carrying their offset. `formatIso` keeps the first floating and reads
the second in the offset it carries, so neither needs `range.timeZone` passed
back in. Reach for raw `Intl` only to step outside that — `new Date(day.date)`
is UTC midnight, which is the previous day west of Greenwich.

## License

MIT
