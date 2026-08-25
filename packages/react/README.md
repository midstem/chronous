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

`useCalendarNavigation(calendar, spec)` returns the specs to move to, and never
sets state itself.

```tsx
const { next, prev, today, withView } = useCalendarNavigation(calendar, spec)

<button disabled={!prev} onClick={() => prev && setSpec(prev)}>Back</button>
<button disabled={!today} onClick={() => today && setSpec(today())}>Today</button>
<button disabled={!next} onClick={() => next && setSpec(next)}>Forward</button>
```

`next` and `prev` are read off the calendar on screen, so `month` lands on the
neighbouring month and a span moves by its own length. They are null while
there is no calendar to step from — and `today` still works there, which is the
way out of an anchor date that cannot be read.

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
