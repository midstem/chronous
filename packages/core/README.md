# `@midstem/chronous`

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless scheduling engine for plain JavaScript. One
call turns a range and a list of events into the days, slots, packed columns and
lanes a calendar draws — time zones, DST and recurrence handled for you. No
React, no DOM, no stylesheet: the markup and the CSS stay yours.</p>

## Installation

```bash
npm install @midstem/chronous
```

## Basic usage

`buildCalendar` is the front door. A range says what to draw, the events say
what goes on it, and what comes back is plain JSON — strings and numbers only,
so it survives `JSON.stringify` and a server-to-client payload unchanged.

```ts
import { buildCalendar } from '@midstem/chronous'

const calendar = buildCalendar(
  { view: 'week', date: '2026-03-18', timeZone: 'Europe/Kyiv' },
  [
    { id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' },
    { id: 'offsite', start: '2026-03-19', end: '2026-03-21', allDay: true }
  ]
)

const [box] = calendar.days.flatMap((day) => day.boxes)

box.top // 0.375 — 09:00 as a fraction of the day, ready for a `top` style
box.height // 0.0208… — the thirty minutes it runs
box.column // which column of its overlap cluster it took

const [bar] = calendar.rows.flatMap((row) => row.bars)

bar.left // where the all-day bar starts across the row
bar.width // and how far it reaches
```

`days` are the days of the grid, each with its slots and its packed `boxes`;
`rows` are the bands of all-day bars above them. Every geometry field is a
fraction, so the CSS is yours to write.

Building a calendar in React? Install
[`@midstem/chronous-react`](https://www.npmjs.com/package/@midstem/chronous-react)
instead — it bundles this engine and re-exports all of it.

## Temporal

The engine speaks [Temporal](https://tc39.es/proposal-temporal/docs/), which
Chrome, Edge and Firefox ship and Safari does not. Where it is missing, install
it once before the first call:

```ts
import { ensureTemporal } from '@midstem/chronous'

await ensureTemporal()
```

It resolves immediately and downloads nothing on a runtime that already has
Temporal.

## Documentation

For events, recurrence, views, navigation, layout, lanes and labels, see the
full documentation at
[https://chronous.midstem.net/](https://chronous.midstem.net/).

## License

MIT
