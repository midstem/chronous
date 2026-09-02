# Сhronous

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

`buildCalendar` is the front door: a range and a list of events in, one plain
object out. It draws nothing — it hands back the days, the slots and the
geometry of every event as fractions, and the DOM is yours to build.

### The markup

One element to fill. Everything under it is created from what the engine
returned.

```html
<div class="calendar" id="calendar"></div>
```

### The engine

```js
import { buildCalendar, ensureTemporal, formatIso } from '@midstem/chronous'

await ensureTemporal()

const calendar = buildCalendar(
  { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' },
  [
    {
      id: 'standup',
      start: '2026-03-18T09:00',
      duration: 'PT30M',
      data: { title: 'Standup' }
    },
    {
      id: 'review',
      start: '2026-03-18T09:15',
      duration: 'PT45M',
      data: { title: 'Review' }
    }
  ]
)

const root = document.querySelector('#calendar')

for (const day of calendar.days) {
  const column = document.createElement('div')
  column.className = 'day'

  const heading = document.createElement('div')
  heading.className = 'heading'
  heading.textContent = formatIso(day.date, {
    locale: 'en-GB',
    options: { weekday: 'short', day: 'numeric' }
  })

  const grid = document.createElement('div')
  grid.className = 'grid'

  for (const box of day.boxes) {
    const event = document.createElement('div')
    event.className = 'event'
    event.textContent = box.event.data.title

    event.style.top = `${box.top * 100}%`
    event.style.height = `${box.height * 100}%`
    event.style.left = `${box.left * 100}%`
    event.style.width = `${box.width * 100}%`

    grid.append(event)
  }

  column.append(heading, grid)
  root.append(column)
}
```

`top`, `height`, `left` and `width` are fractions of the day the box sits on, so
they go straight into percentages. The two overlapping meetings above end up
side by side without any measuring: the engine packed them into columns first.

### The styles

```css
.calendar {
  display: flex;
}

.day {
  flex: 1 1 0;
  min-width: 0;
}

.grid {
  position: relative;
  height: 960px;
}

.event {
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
  background: #1d4ed8;
  color: #fff;
}
```

Two of these rules are a contract, not decoration — `.grid` is what the
percentages are measured against, so it needs `position: relative` and a height
of its own, and `.event` has to be `position: absolute` to use them. Its height
is yours: 960px is forty pixels an hour. Everything else on the page is styling
you own.

### The rest of the object

- `day.slots` are the wall-clock rows of that day — twenty-four by default, each
  with its own `minuteOfDay` and real length — which is what hour lines and the
  time gutter are drawn from.
- `calendar.rows` are the bands above the grid, and `row.bars` the all-day
  events on them, placed with `left` and `width` across the row and stacked by
  `lane`. Events long enough to cover a whole day move up there too.
- Everything crossing the boundary is a string or a number, so a calendar is
  plain JSON: it survives `JSON.stringify` and a server-to-client payload
  unchanged.

Building a calendar in React? Install
[`@midstem/chronous-react`](https://www.npmjs.com/package/@midstem/chronous-react)
instead — it bundles this engine and re-exports all of it, and the components
do the loop above for you.

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
