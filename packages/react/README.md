# Сhronous-react

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-react.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-react
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[size-url]: https://bundlejs.com/?q=%40midstem%2Fchronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless calendar for React. The engine owns the hard
half — time zones, DST, recurrence and the layout of overlapping events — and
the components hand you the geometry already computed. Every part renders the
tag you name, takes your class names and your markup, so nothing of ours ends up
in your CSS and there is no stylesheet to import.</p>

## Installation

```bash
npm install @midstem/chronous-react
```

One package is enough: the engine is built into this bundle, and `buildCalendar`,
`formatIso`, the error classes and every type come from this same import.
Temporal must be available before using the calendar. See [Temporal](#temporal)
for setup on browsers without native support.

## Basic usage

A week view, styled with Tailwind CSS. `Calendar.Root` takes the range and the
events; every part under it is a plain element you style.

```tsx
import { createCalendarComponents } from '@midstem/chronous-react'
import type { CalendarRange, EventInput } from '@midstem/chronous-react'

type EventData = { title: string }

const Calendar = createCalendarComponents<EventData>()

const RANGE: CalendarRange = {
  view: 'week',
  currentDate: '2026-03-18',
  timeZone: 'Europe/Kyiv'
}

const EVENTS: EventInput<EventData>[] = [
  {
    id: 'standup',
    start: '2026-03-18T09:00',
    duration: 'PT30M',
    data: { title: 'Standup' }
  }
]

export const Board = () => (
  <Calendar.Root
    range={RANGE}
    events={EVENTS}
    locale="en-GB"
    className="h-full overflow-auto rounded-xl border border-zinc-200 bg-white"
  >
    <Calendar.Header className="border-b border-zinc-200">
      <Calendar.DayHeadings className="border-l border-zinc-100 py-2 text-center text-sm font-medium" />
    </Calendar.Header>

    <Calendar.TimeGrid hourHeight={48}>
      <Calendar.TimeAxis>
        <Calendar.TimeLabels className="right-2 text-[10px] text-zinc-400" />
      </Calendar.TimeAxis>

      <Calendar.DayColumns className="border-l border-zinc-100">
        <Calendar.TimeSlots className="border-t border-zinc-100" />

        <Calendar.TimedEvents className="truncate rounded-md bg-blue-700 px-1.5 text-[11px] font-medium text-white">
          {({ event }) => event.data?.title}
        </Calendar.TimedEvents>
      </Calendar.DayColumns>
    </Calendar.TimeGrid>
  </Calendar.Root>
)
```

That is the whole wiring. A plural name renders one element per day, per slot or
per event and owns the keys; `className` lands on every element it renders, and
the layout the engine computed is merged underneath any `style` you pass — so
plain CSS works exactly the same way.

`MonthGrid` and `AgendaList` cover the other two views, `Calendar.AllDayRow`
adds the all-day strip, and `useCalendar` / `useCalendarNavigation` are there
when you would rather walk the layout yourself.

## Temporal

Chronous requires `Temporal`. If your target browser does not have it, install
the polyfill in your application and import it before rendering:

```bash
npm install @midstem/chronous-react temporal-polyfill
```

```ts
import 'temporal-polyfill/global'
```

In browsers with native Temporal, the extra import is unnecessary. Chronous does
not download a polyfill or wait for one. Without Temporal, calendar results
contain `MissingTemporalError` immediately. The `pending` result field remains
for compatibility and is always `false`.

## Documentation

For the hooks, every component, typed event data, navigation, labels and the
Safari story, see the full documentation at
[https://chronous.midstem.net/](https://chronous.midstem.net/).

## License

MIT
