# `@midstem/chronous-react`

Headless React hooks on top of [`@midstem/chronous`](../core). The engine owns
geometry and semantics, the hooks own memoization and navigation, and every
pixel stays yours.

## Installation

```bash
npm install @midstem/chronous @midstem/chronous-react
```

`@midstem/chronous` is a peer dependency and is installed alongside. Temporal
has to be available before the first render — see the core README.

## `useCalendar`

`useCalendar(spec, events)` is a memoized projection of `buildCalendar`. It
holds no state and runs no effects: the spec is yours, so it can live in a
router, a query string or `useState`.

```tsx
const { calendar, error } = useCalendar(spec, events)
```

The memo is keyed on the fields of the spec rather than on its identity, so an
inline object literal does not rebuild the calendar on every render. Events are
keyed by reference — memoize that array yourself if it is built inline.

`buildCalendar` throws on the first unusable event, on an unreadable spec and on
a recurrence rule it cannot read, and a throw during render takes the whole tree
down. The hook catches `InvalidEventError`, `InvalidRangeError` and
`InvalidRecurrenceError` and hands them back instead: `calendar` is null exactly
when `error` is set. Anything else is a bug and is left to propagate.

## `useCalendarNavigation`

`useCalendarNavigation(spec)` returns the specs to move to, and never sets state
itself. It is a thin wrapper over `calendarReducer` from `@midstem/chronous` —
the same steps are available without React, and without a rendered calendar.

```tsx
const { next, prev, today, withView } = useCalendarNavigation(spec)

<button disabled={!prev} onClick={() => prev && setSpec(prev)}>Back</button>
<button disabled={!today} onClick={() => today && setSpec(today())}>Today</button>
<button disabled={!next} onClick={() => next && setSpec(next)}>Forward</button>
```

A step moves by the period the spec asks for: a day by one day, a week by seven,
a span by its own length, and a month by one month anchored on the first — so a
long month never drags the anchor backwards. The weekday of the anchor survives
a week step, which is what makes switching to `day` afterwards land where the
reader was looking.

`next` and `prev` are null when the spec itself cannot be stepped: an anchor
date that cannot be read, or a `dayCount` that is not a whole number of days.
An unreadable time zone does not stop a step — it stops the calendar, not the
arithmetic — so the buttons keep working while the zone is being fixed.

`today` is a function rather than a value because it depends on the wall clock
and not on the inputs: it is read at the click, in the calendar's own zone. It
is null only when that zone itself cannot be read, because then there is no
today to read and no move that would help — fix the zone instead.

## Components

`Calendar` is a compound component built on the same two hooks. It owns
geometry, scoping and keys — the parts every consumer would otherwise rewrite —
and nothing else: no class names, no colours, no markup you cannot replace.

```tsx
import { Calendar } from '@midstem/chronous-react'

;<Calendar.Root spec={spec} events={events} locale="en-GB">
  <Calendar.Header className="grid-header">
    <Calendar.DayHeadings className="heading">
      {({ weekday, dayNumber }) => (
        <>
          <span>{weekday}</span> <strong>{dayNumber}</strong>
        </>
      )}
    </Calendar.DayHeadings>
  </Calendar.Header>

  <Calendar.AllDayRow label="all-day">
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

`MonthGrid` / `MonthWeekdays` / `MonthRows` / `MonthDays` / `MonthBars` /
`MonthDots` cover the month view, and `AgendaList` / `AgendaDays` /
`AgendaBars` / `AgendaBoxes` the agenda. `Toolbar` wraps
`useCalendarNavigation` and reports the spec to move to through `onSpec`.

Four rules cover the whole surface.

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
      <Calendar.MonthDots />
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

**The gutter lives on `Root`.** `Header`, `AllDayRow` and `TimeGrid` lay out the
same CSS grid, so the width of the leading column is one prop on the root rather
than three that can drift apart. Month and agenda ignore it.

`Root` renders `fallback(error)` when the spec or the events cannot be read, and
rethrows when no fallback is given: an invalid range is a bug in the input, and
swallowing it into a blank grid hides it. Reach for `useCalendar` directly when
you want to handle it as state instead.

## Typed event data

Context cannot infer a type argument, so `Calendar` on its own hands render
props `data?: unknown`. `createCalendar` binds the namespace once and the type
flows to every slot:

```tsx
const Calendar = createCalendar<{ title: string; owner: string }>()

<Calendar.TimedEvents>
  {({ event }) => event.data?.title}
</Calendar.TimedEvents>
```

It is the same object at runtime — a cast, not a factory — so it costs nothing
and can be created at module scope.

## Labels

No formatting ships here, and the hooks take no `locale`. Labels are the
consumer's, and `formatIso` from `@midstem/chronous` reads either shape a
calendar hands back:

```tsx
import { formatIso } from '@midstem/chronous'

formatIso(day.date, { locale, options: { weekday: 'short', day: 'numeric' } })
formatIso(slot.start, {
  locale,
  options: { hour: '2-digit', minute: '2-digit' }
})
```

`day.date` is a bare `2026-03-18` with no time and no offset, meant for keys,
comparisons and headings; `day.start`, `slot.start` and `box.start` are full
date-times carrying their offset. `formatIso` keeps the first floating and reads
the second in the offset it carries, so neither needs `spec.timeZone` passed
back in. Reach for raw `Intl` only to step outside that — `new Date(day.date)`
is UTC midnight, which is the previous day west of Greenwich.

## License

MIT
