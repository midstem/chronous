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
