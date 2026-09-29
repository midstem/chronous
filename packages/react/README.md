# Chronous React

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-react.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-react
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D
[size-url]: https://bundlejs.com/?q=%40midstem%2Fchronous-react&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22react%22%2C%22react-dom%22%5D%7D%7D

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar for React. It handles time zones, recurrence and event layout; you control the markup and styles. No stylesheet is required.

## Installation

```bash
npm install @midstem/chronous-react temporal-polyfill
```

[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#browser_compatibility) is available in current Chrome, Edge and Firefox, but not yet in Safari. Install the polyfill for Safari and other browsers without native Temporal, then import `temporal-polyfill/global` once in your app entry point before rendering the calendar. The React package includes the core engine.

## Basic usage

This example uses Tailwind CSS for styling:

```tsx
import { Calendar } from '@midstem/chronous-react'

export function Board() {
  return (
    <Calendar.Root
      range={{
        view: 'week',
        currentDate: '2026-03-18',
        timeZone: 'Europe/Kyiv'
      }}
      events={[{ id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }]}
      className="h-full overflow-auto rounded-xl border"
    >
      <Calendar.Header>
        <Calendar.DayHeadings className="border-l py-2 text-center" />
      </Calendar.Header>
      <Calendar.TimeGrid hourHeight={48}>
        <Calendar.TimeAxis>
          <Calendar.TimeLabels />
        </Calendar.TimeAxis>
        <Calendar.DayColumns>
          <Calendar.TimeSlots className="border-t" />
          <Calendar.TimedEvents className="rounded bg-blue-700 text-white">
            {({ event }) => event.id}
          </Calendar.TimedEvents>
        </Calendar.DayColumns>
      </Calendar.TimeGrid>
    </Calendar.Root>
  )
}
```

## Documentation

See the [documentation](https://chronous.midstem.net/docs/) for more examples, components, typed event data, navigation and how to load Temporal correctly. It also explains browser support and the behavior when Temporal is unavailable.

## License

MIT
