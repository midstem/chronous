# Сhronous-angular

[![NPM version][npm-image]][npm-url] [![bundle size][size-image]][size-url]

[npm-image]: https://img.shields.io/npm/v/%40midstem%2Fchronous-angular.svg
[npm-url]: https://npmjs.org/package/@midstem/chronous-angular
[size-image]: https://deno.bundlejs.com/badge?q=@midstem/chronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22temporal-polyfill%22%5D%7D%7D
[size-url]: https://bundlejs.com/?q=%40midstem%2Fchronous-angular&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22%40angular%2Fcore%22%2C%22temporal-polyfill%22%5D%7D%7D

<a href='https://midstem.net'>
  <img src='https://raw.githubusercontent.com/midstem/chronous/main/images/midstem.png' height='60'>
</a>

<p><b>Chronous</b> is a headless calendar for Angular. The engine owns the hard
half — time zones, DST, recurrence and the layout of overlapping events — and
the directives hand you the geometry already computed. Every part sits on the
element <i>you</i> wrote, so nothing of ours ends up in your CSS and there is no
stylesheet to import.</p>

## Installation

```bash
npm install @midstem/chronous-angular
```

One install is enough: the engine arrives with it, and `buildCalendar`,
`formatIso`, the error classes and every type are re-exported from this same
specifier. Temporal is handled for you as well — nothing to install and nothing
to call, and only the browsers that lack it ever download the polyfill. See
[Temporal](#temporal) for the one call that makes it seamless.

Standalone, signal-based and zoneless-friendly. Angular 18 or newer.

## Basic usage

A week view, styled with Tailwind CSS. `*chronousCalendar` takes the range and
the events; every part under it is a plain element you style.

```ts
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import type { CalendarRange, EventInput } from '@midstem/chronous-angular'
import { Component, signal } from '@angular/core'

type EventData = { title: string }

@Component({
  selector: 'app-board',
  imports: [CALENDAR_DIRECTIVES],
  template: `
    <div
      *chronousCalendar="range(); events: events(); locale: 'en-GB'"
      class="h-full overflow-auto rounded-xl border border-zinc-200 bg-white"
    >
      <div chronousHeader class="border-b border-zinc-200">
        <div
          *chronousDayHeadings="
            let day;
            let weekdayLabel = weekdayLabel;
            let dayLabel = dayLabel
          "
          class="border-l border-zinc-100 py-2 text-center text-sm font-medium"
        >
          {{ weekdayLabel }} {{ dayLabel }}
        </div>
      </div>

      <chronous-time-grid [hourHeight]="48">
        <div chronousTimeAxis>
          <div
            *chronousTimeLabels="let slot; let timeLabel = timeLabel"
            class="right-2 text-[10px] text-zinc-400"
          >
            {{ timeLabel }}
          </div>
        </div>

        <div *chronousDayColumns="let day" class="border-l border-zinc-100">
          <span
            *chronousTimeSlots="day"
            class="border-t border-zinc-100"
          ></span>

          <div
            *chronousTimedEvents="day; let event"
            class="truncate rounded-md bg-blue-700 px-1.5 text-[11px] font-medium text-white"
          >
            {{ event.data.title }}
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

  readonly events = signal<EventInput<EventData>[]>([
    {
      id: 'standup',
      start: '2026-03-18T09:00',
      duration: 'PT30M',
      data: { title: 'Standup' }
    }
  ])
}
```

That is the whole wiring. A plural name renders one element per day, per slot or
per event; your classes land on every one of them, and the layout the engine
computed is written onto the same element as inline styles — so plain CSS works
exactly the same way.

`chronousMonthGrid` and `chronousAgendaList` cover the other two views,
`<chronous-all-day-row>` adds the all-day strip, and `injectCalendar` /
`injectCalendarNavigation` are there when you would rather walk the layout
yourself.

Navigation is yours to drive: `*chronousToolbar` hands you a `navigation` object
and the period title, and you set your own `range` signal from it.

```html
<div *chronousToolbar="let navigation; let title = title">
  <button
    type="button"
    [disabled]="!navigation.prev"
    (click)="range.set(navigation.prev!)"
  >
    ‹
  </button>
  <span>{{ title }}</span>
  <button
    type="button"
    [disabled]="!navigation.next"
    (click)="range.set(navigation.next!)"
  >
    ›
  </button>
</div>
```

## Temporal

The engine speaks [Temporal](https://tc39.es/proposal-temporal/docs/), which
Chrome, Edge and Firefox ship and Safari, for now, does not. Where it is
missing, `temporal-polyfill` is imported automatically; where it is already
there that import never runs, so the polyfill is never downloaded and never
enters your bundle.

The directives cover the wait on their own. Until the polyfill lands
`injectCalendar` reports `pending: true` with `calendar: null`, and
`*chronousCalendar` renders the template you passed as `pending` — nothing,
unless you pass one. The moment Temporal is ready the tree renders with the real
layout. Nothing breaks, but on Safari the first paint is an empty calendar.

```html
<div *chronousCalendar="range(); events: events(); pending: waiting">…</div>

<ng-template #waiting><p>Loading…</p></ng-template>
```

To skip that frame entirely, await `ensureTemporal` before the application
bootstraps:

```ts
import { ensureTemporal } from '@midstem/chronous-angular'
import { bootstrapApplication } from '@angular/platform-browser'

import { AppComponent } from './app.component'

await ensureTemporal()

await bootstrapApplication(AppComponent)
```

It resolves immediately and downloads nothing on a runtime that already has
Temporal, so it costs nothing to await unconditionally. If you would rather not
hold up the bootstrap, `injectTemporalStatus` reports the same state as a
signal.

The dependency is a stopgap, not part of the design. It is already dead weight
on every browser that ships Temporal, and once Safari joins them it will be
dropped from the package altogether.

## Documentation

For every directive, the template contexts, typed event data, navigation, labels
and the Safari story, see the full documentation at
[https://chronous.midstem.net/](https://chronous.midstem.net/).

## License

MIT
