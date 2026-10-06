# `@midstem/chronous-angular` agent reference

## Scope and source of truth

`@midstem/chronous-angular` provides Angular 18+ standalone directives and components over the Chronous calendar engine. It re-exports the engine API from its package entry point; applications normally install only this adapter and `@angular/core`. Its sole peer dependency is `@angular/core` (`>=18`). The package uses Angular signals and does not require Zone.js.

This reference describes the public exports in `src/index.ts`, directive inputs and scopes, implementations, tests, and `package.json`. Calendar data, range validation, layout geometry, recurrence, and formatting semantics are defined by the [core API reference](../core/DOCUMENTATIONS.md).

When changing a public contract, verify the implementation and exported types
and update this reference in the same change. Source code takes precedence over
examples or descriptions that disagree with it.

## Setup and imports

Install the adapter and, when exact Temporal behavior is needed in runtimes without native Temporal, the polyfill:

```sh
npm install @midstem/chronous-angular temporal-polyfill
```

Load the polyfill once from the application entry point before rendering:

```ts
import 'temporal-polyfill/global'
```

Angular template dependencies need both a TypeScript import and registration in
`@Component.imports`. Choose either the full `CALENDAR_DIRECTIVES` array or
individual exported components/directives used by the template.
`CALENDAR_DIRECTIVES` contains only components/directives; it does not include
`formatIso`, `injectCalendar` or `injectCalendarNavigation`. Import those functions
normally in TypeScript when calling them; do not put them in `@Component.imports`.
Engine values and types are re-exported from the same package entry point.

```ts
import { Component, signal } from '@angular/core'
import {
  CALENDAR_DIRECTIVES,
  injectCalendar,
  injectCalendarNavigation
} from '@midstem/chronous-angular'
import type { CalendarRange, EventInput } from '@midstem/chronous-angular'

@Component({
  standalone: true,
  imports: [...CALENDAR_DIRECTIVES],
  template: `...`
})
export class ScheduleComponent {
  readonly range = signal<CalendarRange>({
    view: 'week',
    currentDate: '2026-03-18',
    timeZone: 'Europe/Kyiv'
  })
  readonly events = signal<readonly EventInput<{ title: string }>[]>([])
  readonly calendar = injectCalendar(this.range, this.events)
  readonly navigation = injectCalendarNavigation(this.range)
}
```

For a smaller template, import only its dependencies instead of the full array:

```ts
import { Component } from '@angular/core'
import {
  CalendarDirective,
  DayHeadingsDirective
} from '@midstem/chronous-angular'
import type { CalendarRange } from '@midstem/chronous-angular'

@Component({
  standalone: true,
  imports: [CalendarDirective, DayHeadingsDirective],
  template: `
    <div *chronousCalendar="range; events: []">
      <div *chronousDayHeadings="let day">{{ day.date }}</div>
    </div>
  `
})
export class DayHeadingsComponent {
  readonly range: CalendarRange = {
    view: 'week',
    currentDate: '2026-03-18',
    timeZone: 'Europe/Kyiv'
  }
}
```

## Public API

The entry point re-exports `buildCalendar`, `calendarReducer`, `formatIso`, `initialCalendarState`, `isTemporalAvailable`; errors `InvalidEventError`, `InvalidRangeError`, `InvalidRecurrenceError`, `MissingTemporalError`; and the core calendar, event, recurrence, date, locale, time-zone, view, and formatting types.

| Export                            | Contract                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `injectCalendar(range, events)`   | Returns `Signal<CalendarResult<TData>>`; both arguments are zero-argument readers. It does not inject dependencies.                                                |
| `injectCalendarNavigation(range)` | Returns `Signal<CalendarNavigation>` derived from a range reader. It does not inject dependencies.                                                                 |
| `injectNow(timeZone)`             | Called in an injection context. Returns `Signal<CalendarNow \| null>` for a time-zone reader; ticks every 30 seconds after render and clears its timer on destroy. |
| `injectCalendarContext()`         | Reads the nearest `chronousCalendar` provider. Fields `calendar`, `range`, `locale`, and `gutterWidth` are Angular signals and must be invoked to read values.     |
| `injectTimeGridContext()`         | Reads the enclosing `<chronous-time-grid>` provider; `hourHeight` and `dayHeight` are signals.                                                                     |
| `injectAllDayContext()`           | Reads the enclosing `<chronous-all-day-row>` provider; `row`, `laneHeight`, and `lanes` are signals.                                                               |

`CalendarNavigation` has `next: CalendarRange | null`, `prev: CalendarRange | null`, `today: (() => CalendarRange) | null`, and `withView(view): CalendarRange`. The `today` field is a nullable function because it reads the clock when called. Navigation computes ranges; the application owns and updates its range signal.

## Data and behavior contracts

`injectCalendar` recomputes when the range fields or the events reference change. Replacing a range object with equal fields does not invalidate its stable range reader. Keep event arrays in a signal and replace the array when event inputs change. The result is a discriminated union: `{ calendar, error: null }` or `{ calendar: null, error }`.

The result catches `InvalidRangeError`, `InvalidEventError`, `InvalidRecurrenceError`, and `MissingTemporalError`. Other exceptions propagate. `*chronousCalendar` uses the same result; it renders the supplied error template when present and otherwise throws the known error.

All-day bars, timed boxes, ranges, recurrence expansion, and localized labels follow the [core data and layout contracts](../core/DOCUMENTATIONS.md). The adapter carries `EventInput<TData>` through layout and template contexts without interpreting `data`. Generated geometry and data attributes are applied to the consumer's repeated element. Labels ending in `Label` are formatted strings; values such as `day`, `bar`, and `box` are typed data objects.

The application supplies colors, typography, borders and interaction handlers.
Avoid overriding generated position/size styles unless replacing the layout.
Day elements expose `data-date` and `data-in-current-period`; event elements
expose `data-event-id`, `data-continues-before` and `data-continues-after`.
Labels use the calendar locale and fall back to their ISO value when formatting
fails. `formatIso` itself can throw; the adapter label helper catches those errors.
Project gutter content with an element carrying `chronousGutterCell` into the
header or `<chronous-all-day-row>`.

### Directive and component reference

`CALENDAR_DIRECTIVES` contains every entry below. For structural directives, use the selector with `*`; the listed aliases are their microsyntax inputs. Each repeated template context also exposes `$implicit` as its primary item. “Provider” names the scope available to the corresponding context reader; repeated item values are template variables and are not DI providers.

| Selector                             | Inputs and defaults                                                                                                | Template scope / provider                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `*chronousCalendar`                  | required range expression; required `events`; `locale='en-US'`; `gutterWidth='3.25rem'`; optional `error` template | `$implicit` calendar plus `calendar`, `range`, `locale`, `gutterWidth`; provides calendar context                            |
| `*chronousToolbar`                   | none                                                                                                               | `$implicit` navigation plus `navigation`, `range`, `title`; requires calendar context                                        |
| `[chronousHeader]`                   | none                                                                                                               | styles the host; requires calendar context                                                                                   |
| `*chronousDayHeadings`               | none                                                                                                               | `$implicit` day plus `day`, `date`, `weekdayLabel`, `dayLabel`, `inCurrentPeriod`; requires calendar context                 |
| `<chronous-all-day-row>`             | `laneHeight=24`, `minLanes=0`                                                                                      | provides all-day `row`, `laneHeight`, `lanes` signals; requires calendar context                                             |
| `*chronousAllDayEvents`              | `gap=4`                                                                                                            | `$implicit` event plus `event`, `bar`; requires all-day row context                                                          |
| `<chronous-time-grid>`               | `hourHeight=60`, `scrollToHour=7` (`null` disables scrolling)                                                      | provides `hourHeight`, computed `dayHeight`; requires calendar context                                                       |
| `[chronousTimeAxis]`                 | none                                                                                                               | styles the host; requires time-grid context                                                                                  |
| `*chronousTimeLabels`                | none                                                                                                               | `$implicit` slot plus `slot`, `minuteOfDay`, `timeLabel`; requires calendar context                                          |
| `*chronousDayColumns`                | none                                                                                                               | `$implicit` day plus `day`; requires calendar and time-grid contexts                                                         |
| `*chronousTimeSlots="day"`           | required day                                                                                                       | `$implicit` slot plus `slot`, `minuteOfDay`                                                                                  |
| `*chronousTimedEvents="day"`         | required day; `minHeight=22`; `gap=3`                                                                              | `$implicit` event plus `event`, `box`; requires day expression                                                               |
| `*chronousNowMarker="day"`           | required day                                                                                                       | `$implicit` minute number plus `minuteOfDay`; requires calendar context                                                      |
| `[chronousMonthGrid]`                | none                                                                                                               | styles the host; no context read                                                                                             |
| `*chronousMonthWeekdays`             | none                                                                                                               | `$implicit` day plus `day`, `weekdayLabel`; requires calendar context                                                        |
| `*chronousMonthRows`                 | `maxLanes=null`; `laneHeight=20`                                                                                   | `$implicit` row scope plus `row`, `days`, `maxLanes`, `laneHeight`; requires calendar context                                |
| `*chronousMonthDays="row"`           | required month row scope                                                                                           | `$implicit` day plus `day`, `boxes`, `bars`, `hiddenBars`, `dayLabel`, `inCurrentPeriod`, `lanes`; requires calendar context |
| `*chronousMonthAllDayEvents="row"`   | required month row scope; `gap=4`; `lanesTopOffset=28`                                                             | `$implicit` event plus `event`, `bar`                                                                                        |
| `*chronousMonthTimedEvents="day"`    | required day                                                                                                       | `$implicit` event plus `event`, `box`                                                                                        |
| `[chronousAgendaList]`               | none                                                                                                               | styles the host; requires calendar context                                                                                   |
| `*chronousAgendaDays`                | `showEmptyDays=false`                                                                                              | `$implicit` day plus `day`, `bars`, `boxes`, `weekdayLabel`, `dayLabel`, `monthLabel`; requires calendar context             |
| `*chronousAgendaAllDayEvents="bars"` | required bars                                                                                                      | `$implicit` event plus `event`, `bar`                                                                                        |
| `*chronousAgendaTimedEvents="day"`   | required day                                                                                                       | `$implicit` event plus `event`, `box`, `timeRangeLabel`; needs calendar context                                              |

For example, microsyntax `let event` reads `$implicit`, `let box = box` reads a named scope field, and `maxLanes: 3` binds an input alias. Structural context guards preserve `TData` under Angular `strictTemplates`. Repeated values such as a particular day or row are passed into child directives explicitly (`*chronousTimeSlots="day"`, `*chronousMonthDays="row"`).

The all-day row hides when it has no all-day bars and reserves `minLanes` only when requested. Month rows default to unlimited visible lanes; setting `maxLanes` filters rendered bars and supplies per-day `hiddenBars` for an overflow affordance. Agenda days omit empty days unless `showEmptyDays` is true. The calendar gutter is shared by the header, all-day row, and time grid.

## Minimal example

This view composition shows the required root inputs, shared grid, and the day value passed to each slotted directive:

```html
<div *chronousCalendar="range(); events: events()">
  <div chronousHeader>
    <div *chronousDayHeadings="let day">{{ day.date }}</div>
  </div>
  <chronous-time-grid>
    <div *chronousDayColumns="let day">
      <span *chronousTimeSlots="day"></span>
      <button *chronousTimedEvents="day; let event">
        {{ event.data?.title }}
      </button>
      <span *chronousNowMarker="day"></span>
    </div>
  </chronous-time-grid>
</div>
```

For month views, the implicit value from `chronousMonthRows` is a `MonthRowScope<TData>`. Pass that same row to both day cells and spanning all-day bars; the agenda all-day directive instead takes the current day's `bars` array:

Render the appropriate recipe inside `*chronousCalendar`, with the matching
`range().view` (`'month'` or `'agenda'`).

```html
<div chronousMonthGrid>
  <div *chronousMonthWeekdays="let day; let weekdayLabel = weekdayLabel">
    {{ weekdayLabel }}
  </div>
  <div *chronousMonthRows="let row; maxLanes: 3">
    <div *chronousMonthDays="row; let day; let hiddenBars = hiddenBars">
      {{ day.date }} <span>{{ hiddenBars.length }}</span>
    </div>
    <div *chronousMonthAllDayEvents="row; let event">
      {{ event.data?.title }}
    </div>
  </div>
</div>

<div chronousAgendaList>
  <section *chronousAgendaDays="let day; let bars = bars">
    <h2>{{ day.date }}</h2>
    <div *chronousAgendaAllDayEvents="bars; let event">
      {{ event.data?.title }}
    </div>
    <div *chronousAgendaTimedEvents="day; let event">
      {{ event.data?.title }}
    </div>
  </section>
</div>
```

## Errors and limitations

Without Temporal, core selects its Date fallback and warns. Ordinary calendar construction and navigation remain available, while recurrence expansion and cross-zone/DST calculations can be approximate; malformed event input can still be rejected. See [core browser behavior](../core/DOCUMENTATIONS.md#browser-behavior). Load `temporal-polyfill/global` before rendering when exact behavior is required.

`injectNow` must run in an Angular injection context. It is initially `null`, starts its 30-second timer after the first browser render, and clears it at destroy. An unreadable time zone also produces `null`. `today` is unavailable (`null`) when the range time zone cannot be read; `prev` and `next` are null when the range cannot be stepped. Context readers require an injection context and their matching provider, and throw a descriptive error otherwise.

## Source map and validation

The build embeds core into the FESM2022 module and emits Angular 18 partial
declarations for the consumer's linker. No separate core dependency is resolved
at runtime. Use this package's error classes when catching its errors: a
separate `@midstem/chronous` import has different class identities.

- Public exports and directive set: [`src/index.ts`](src/index.ts), [`src/directives/index.ts`](src/directives/index.ts)
- Signal helpers and their caught errors: [`src/calendar`](src/calendar), [`src/navigation`](src/navigation), [`src/now`](src/now)
- Providers and template context guards: [`src/directives/context`](src/directives/context), [`src/directives`](src/directives)
- Package entry and peer dependency: [`package.json`](package.json)
- Embedded core and partial declarations: [`build.mjs`](../../tools/angular-build/scripts/build.mjs), [`embed-core.mjs`](../../tools/angular-build/scripts/embed-core.mjs)
- Validate with `npm run typecheck --workspace @midstem/chronous-angular` and `npm run test:run --workspace @midstem/chronous-angular` from the repository root.
