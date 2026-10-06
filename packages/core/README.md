# Chronous

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous
[size-url]: https://bundlejs.com/?q=%40midstem%2Fchronous

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar engine for JavaScript. It calculates days, time slots and event positions across time zones and recurring schedules. You render the result with your own markup and styles.

## Installation

```bash
npm install @midstem/chronous temporal-polyfill
```

[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#browser_compatibility) is available in current Chrome, Edge and Firefox, but not yet in Safari. Install the polyfill for Safari and other runtimes without native Temporal, then import `temporal-polyfill/global` once before calling the engine.

## Basic usage

Add a container to your page:

```html
<div id="calendar" class="calendar"></div>
```

Build a week and render its days and events:

```js
import 'temporal-polyfill/global'
import { buildCalendar, formatIso } from '@midstem/chronous'

const calendar = buildCalendar(
  { view: 'week', currentDate: '2026-03-18', timeZone: 'Europe/Kyiv' },
  [
    {
      id: 'standup',
      start: '2026-03-18T09:00',
      duration: 'PT30M',
      data: { title: 'Standup' }
    }
  ]
)

const root = document.querySelector('#calendar')

for (const day of calendar.days) {
  const column = document.createElement('div')
  column.className = 'calendar-day'

  const heading = document.createElement('div')
  heading.className = 'calendar-heading'
  heading.textContent = formatIso(day.date, {
    locale: 'en-GB',
    options: { weekday: 'short', day: 'numeric' }
  })

  const grid = document.createElement('div')
  grid.className = 'calendar-grid'

  for (const box of day.boxes) {
    const event = document.createElement('div')
    event.className = 'calendar-event'
    event.textContent = box.event.data?.title ?? box.event.id
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

Give each day a grid for the positioned events:

```css
.calendar {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-day {
  min-width: 0;
  border: 1px solid #e4e4e7;
}

.calendar-heading {
  padding: 8px;
  text-align: center;
}

.calendar-grid {
  position: relative;
  height: 960px;
}

.calendar-event {
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
  background: #1d4ed8;
  color: white;
  font-size: 12px;
}
```

The engine returns event positions as fractions; the example converts them to CSS percentages. Core also exports the types, formatting, navigation and layout APIs needed to build an adapter for a framework without a dedicated Chronous package. For ready-made integrations, use [React](https://www.npmjs.com/package/@midstem/chronous-react), [Vue](https://www.npmjs.com/package/@midstem/chronous-vue), [Svelte](https://www.npmjs.com/package/@midstem/chronous-svelte) or [Angular](https://www.npmjs.com/package/@midstem/chronous-angular).

## Documentation

See the [documentation](https://chronous.midstem.net/docs/) for rendering examples, event and recurrence options, calendar views, navigation and how to load Temporal correctly. It also explains browser support and the behavior when Temporal is unavailable.

## License

MIT
