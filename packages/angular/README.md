# Chronous Angular

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-angular.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-angular
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%5D%7D%7D
[size-url]: https://bundlejs.com/?q=%40midstem%2Fchronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%5D%7D%7D

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

Chronous is a headless calendar for Angular 18+. Its directives handle time zones, recurrence and event layout while you control the markup and styles. No stylesheet is required.

## Installation

```bash
npm install @midstem/chronous-angular temporal-polyfill
```

[Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal#browser_compatibility) is available in current Chrome, Edge and Firefox, but not yet in Safari. Install the polyfill for Safari and other browsers without native Temporal, then import `temporal-polyfill/global` once in your app entry point before rendering the calendar. The Angular package includes the core engine.

## Basic usage

This example uses Tailwind CSS for styling:

```ts
import { Component, signal } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import type { CalendarRange, EventInput } from '@midstem/chronous-angular'

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div
      *chronousCalendar="range(); events: events()"
      class="h-full overflow-auto rounded-xl border"
    >
      <div chronousHeader>
        <div
          *chronousDayHeadings="let day; let dayLabel = dayLabel"
          class="border-l py-2 text-center"
        >
          {{ dayLabel }}
        </div>
      </div>
      <chronous-time-grid [hourHeight]="48">
        <div chronousTimeAxis>
          <div *chronousTimeLabels="let slot; let timeLabel = timeLabel">
            {{ timeLabel }}
          </div>
        </div>
        <div *chronousDayColumns="let day">
          <span *chronousTimeSlots="day" class="border-t"></span>
          <div
            *chronousTimedEvents="day; let event"
            class="rounded bg-blue-700 text-white"
          >
            {{ event.id }}
          </div>
        </div>
      </chronous-time-grid>
    </div>
  `
})
export class BoardComponent {
  readonly range = signal<CalendarRange>({
    view: 'week',
    currentDate: '2026-03-18',
    timeZone: 'Europe/Kyiv'
  })
  readonly events = signal<EventInput[]>([
    { id: 'standup', start: '2026-03-18T09:00', duration: 'PT30M' }
  ])
}
```

## Documentation

See the [Angular documentation](https://chronous.midstem.net/docs/?framework=angular) for more examples, directives, typed event data, navigation and how to load Temporal correctly. It also explains browser support and the behavior when Temporal is unavailable.

## License

MIT
