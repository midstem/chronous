# `@midstem/chronous-angular` documentation

The whole Angular surface: the one install, Temporal on Safari, the signal
functions, every directive and the rules they follow. The [README](README.md) is
the short way in, and [`@midstem/chronous`](../core/DOCUMENTATIONS.md)
documents the engine underneath.

This file is the source for [https://chronous.midstem.net/](https://chronous.midstem.net/)
and stays in the repository — it is not part of the published package.

## Contents

- [One install](#one-install)
- [Temporal, and Safari](#temporal-and-safari)
- [`injectCalendar`](#injectcalendar)
- [`injectCalendarNavigation`](#injectcalendarnavigation)
- [`injectNow`](#injectnow)
- [Directives](#directives)
- [The microsyntax](#the-microsyntax)
- [Overflow, and the empty all-day row](#overflow-and-the-empty-all-day-row)
- [Typed event data](#typed-event-data)
- [Labels](#labels)
- [What differs from the React package](#what-differs-from-the-react-package)

## One install

One package is enough. The engine comes along as a dependency of this one and
everything it exports is re-exported from here — `buildCalendar`, `formatIso`,
`calendarReducer`, `ensureTemporal`, the error classes and every type — so an
Angular app never installs or imports `@midstem/chronous` by name:

```ts
import { CALENDAR_DIRECTIVES, formatIso } from '@midstem/chronous-angular'
import type { CalendarRange, EventInput } from '@midstem/chronous-angular'
```

The package is published in Angular's partial compilation format, standalone
and signal-based throughout. `@angular/core` is its only peer dependency, from
18 up; it uses no zone.js API, so a zoneless application needs nothing extra.

Unlike the React package, which builds the engine into its own bundle, this one
resolves `@midstem/chronous` at runtime — Angular libraries ship linkable
partial declarations rather than a rolled-up bundle, and inlining a dependency
into that format is not something the toolchain does. The consequence is a
single engine instance for an app that also imports the engine directly, which
is the better half of the trade: `instanceof` on the error classes holds across
both imports.

## Temporal, and Safari

There is nothing to set up. Render a calendar and the engine is there.

Chrome and Edge ship Temporal from 144 and Firefox from 139, and on those the
first render draws the calendar and downloads nothing — the engine is read
straight off `globalThis`. Safari still ships none, so there the first read that
needs Temporal loads `temporal-polyfill` through a dynamic import that every
bundler splits into its own chunk (~20 kB gzip). The signal it feeds updates
when the chunk lands, and Angular redraws that subtree — you install nothing and
pick no version, and the engine holds the implementation itself instead of
assigning `globalThis.Temporal`.

That one waiting frame is the whole cost, and it is a Safari-only cost.
`injectCalendar` reports it as `pending`, and `*chronousCalendar` renders the
template you hand it as `pending`:

```html
<div *chronousCalendar="range(); events: events(); pending: waiting">…</div>

<ng-template #waiting><app-skeleton /></ng-template>
```

`injectTemporalStatus()` is the same state as a signal — `'ready'`, `'pending'`
or `'failed'` — for a component that wants to gate on it directly.

`ensureTemporal()` is still exported and still does what it did: awaiting it
before `bootstrapApplication` removes the pending state entirely. Reach for it
on the server, in a worker, or wherever a first render cannot be allowed to
arrive empty.

A load that fails settles on `MissingTemporalError`, which `injectCalendar`
catches like the other calendar errors, so the `error` template on
`*chronousCalendar` can show it rather than the error reaching the error
handler.

## `injectCalendar`

`injectCalendar(range, events)` is a computed projection of `buildCalendar`. It
holds no state and runs no effects: the range is yours, so it can live in a
router, a query string or a signal of your own. Both arguments are read as
functions, so a signal, a computed or a plain getter all work.

```ts
readonly calendar = injectCalendar(this.range, this.events)
```

```ts
const { calendar, error, pending } = this.calendar()
```

The computed is keyed on the fields of the range rather than on its identity, so
rebuilding the range object with the same values does not rebuild the calendar.
Events are compared by reference — keep them in a signal you set deliberately.

`buildCalendar` throws on the first unusable event, on an unreadable range and
on a recurrence rule it cannot read. The signal catches `InvalidEventError`,
`InvalidRangeError` and `InvalidRecurrenceError` and hands them back instead:
`calendar` is null exactly when `error` is set. Anything else is a bug and is
left to propagate.

`pending` is set only while the polyfill is in flight, and it comes alongside a
`MissingTemporalError` rather than in place of one — so code written against
`calendar` and `error` alone keeps reading correctly. Check it before the error
to draw a skeleton instead, which is what `*chronousCalendar` does with its
`pending` template.

Call it from an injection context: a field initializer, a constructor, or
`runInInjectionContext`. It subscribes to the Temporal loader and releases that
subscription on destroy, which is what ties it to an injector.

## `injectCalendarNavigation`

`injectCalendarNavigation(range)` returns the ranges to move to, and never sets
state itself. It is a thin wrapper over `calendarReducer` — the same steps are
available without Angular, and without a rendered calendar.

```ts
readonly navigation = injectCalendarNavigation(this.range)
```

```html
<button [disabled]="!navigation().prev" (click)="range.set(navigation().prev!)">
  Back
</button>
<button
  [disabled]="!navigation().today"
  (click)="range.set(navigation().today()!)"
>
  Today
</button>
<button [disabled]="!navigation().next" (click)="range.set(navigation().next!)">
  Forward
</button>
```

A step moves by the period the range asks for: a day by one day, a week by
seven, a span by its own length, and a month by one month anchored on the
first — so a long month never drags the anchor backwards. The weekday of the
anchor survives a week step, which is what makes switching to `day` afterwards
land where the reader was looking.

`next` and `prev` are null while Temporal is still loading, and become steppable
on their own once it lands. Beyond that they are null when the range itself
cannot be stepped: an anchor date that cannot be read, or a `dayCount` that is
not a whole number of days. An unreadable time zone does not stop a step — it
stops the calendar, not the arithmetic — so the buttons keep working while the
zone is being fixed.

`today` is a function rather than a value because it depends on the wall clock
and not on the inputs: it is read at the click, in the calendar's own zone. It
is null only when that zone itself cannot be read.

## `injectNow`

`injectNow(timeZone)` reads the wall clock in the calendar's own zone and ticks
every thirty seconds. It reports `null` until the first render and whenever the
zone cannot be read, so a marker of your own can gate on it directly.

```ts
readonly now = injectNow(() => this.range().timeZone)
```

`CalendarNow` carries the `date` the clock is on and its `minuteOfDay`, which is
all `*chronousNowMarker` needs to place itself. The timer is started after the
first render and cleared on destroy, so it costs nothing on the server.

## Directives

`CALENDAR_DIRECTIVES` is the whole set, ready for a standalone component's
`imports`. The tedious half comes already wired — geometry, scoping, the
loops — and everything you can see is yours to write: every part sits on _your_
element, keeps your classes, your bindings and your markup, and hands you the
event behind it.

```html
<div *chronousCalendar="range(); events: events(); locale: 'en-GB'">
  <div chronousHeader class="grid-header">
    <div
      *chronousDayHeadings="
        let day;
        let weekdayLabel = weekdayLabel;
        let dayLabel = dayLabel
      "
      class="heading"
    >
      <span>{{ weekdayLabel }}</span> <strong>{{ dayLabel }}</strong>
    </div>
  </div>

  <chronous-all-day-row>
    <span chronousGutterCell>all-day</span>

    <div *chronousAllDayEvents="let event" class="bar">
      {{ event.data.title }}
    </div>
  </chronous-all-day-row>

  <chronous-time-grid [hourHeight]="60">
    <div chronousTimeAxis class="gutter">
      <div
        *chronousTimeLabels="let slot; let timeLabel = timeLabel"
        class="tick"
      >
        {{ timeLabel }}
      </div>
    </div>

    <div *chronousDayColumns="let day" class="column">
      <span *chronousTimeSlots="day" class="line"></span>

      <div *chronousNowMarker="day" class="now"></div>

      <button
        *chronousTimedEvents="day; let event"
        type="button"
        class="event"
        (click)="open(event)"
      >
        {{ event.data.title }}
      </button>
    </div>
  </chronous-time-grid>
</div>
```

`chronousMonthGrid` / `chronousMonthWeekdays` / `chronousMonthRows` /
`chronousMonthDays` / `chronousMonthAllDayEvents` / `chronousMonthTimedEvents`
cover the month view, and `chronousAgendaList` / `chronousAgendaDays` /
`chronousAgendaAllDayEvents` / `chronousAgendaTimedEvents` the agenda. The pair
repeats in every view: the all-day part draws what the engine laid out as bars,
the timed part what it laid out inside a day. `*chronousToolbar` wraps
`injectCalendarNavigation` and hands you `navigation`, `range` and a formatted
`title`; where you move to is your own signal to set.

Six rules cover the whole surface.

**A plural name is a structural directive that iterates.** `chronousDayColumns`
renders your element once per day, `chronousTimedEvents` once per box,
`chronousTimeSlots` once per slot. Singular names — `chronousHeader`,
`chronousTimeAxis`, `chronousMonthGrid` — are attribute directives that style
the element they sit on. `<chronous-all-day-row>` and `<chronous-time-grid>` are
the two components in the set, because both wrap their content in a leading
gutter cell and a grid you would otherwise have to write yourself.

**Geometry is written onto your element as inline styles.** Position, size,
lane offsets and the grid templates land on the element you wrote, so a class is
always free to add to them. A `[style.top]` binding of your own on the same
property is the one thing that fights: reach for a class there, or take the
numbers off the scope and place the element yourself.

**Three scopes travel through DI; the rest travel through the template.**
`injectCalendarContext()`, `injectTimeGridContext()` and `injectAllDayContext()`
give a component of your own the calendar, the grid geometry or the all-day row
it sits inside, and each throws by name when it is used outside its parent.
Anything that repeats — a day, a row — cannot travel that way, because one
directive instance renders every iteration, so it travels as a template
variable you hand to the next part: `*chronousTimeSlots="day"`,
`*chronousMonthDays="row"`.

**A formatted string ends in `Label`.** `weekdayLabel`, `dayLabel`,
`monthLabel`, `timeLabel` and `timeRangeLabel` have already been through
`formatIso` in the calendar's locale and are ready to render. Everything without
the suffix is data: `day` is a `CalendarDay`, `box` a `CalendarBox`, `bar` a
`CalendarBar`, and `minuteOfDay` a number.

**Per-item state arrives as data attributes**, because a class is shared by
every element a directive renders. `data-date` and `data-in-current-period` land
on `chronousDayHeadings`, `chronousDayColumns`, `chronousMonthDays` and
`chronousAgendaDays`; `data-event-id` and `data-continues-before` /
`data-continues-after` land on the event directives:

```html
<div
  *chronousMonthDays="row; let day"
  class="data-[in-current-period=false]:bg-zinc-50"
></div>
```

**The gutter lives on the calendar.** `chronousHeader`,
`<chronous-all-day-row>` and `<chronous-time-grid>` lay out the same CSS grid,
so `gutterWidth` is one input on the root rather than three that can drift
apart. Month and agenda ignore it.

## The microsyntax

Every repeating part is a structural directive, so it is written with `*` and
reads its options out of Angular's microsyntax. Three shapes cover all of it:

```html
<div *chronousDayColumns="let day"></div>

<span *chronousTimeSlots="day; let slot; let minuteOfDay = minuteOfDay"></span>

<div *chronousMonthRows="let row; maxLanes: 3; laneHeight: 18"></div>
```

The leading expression, where a part takes one, is the parent value it works
from — the day whose boxes to draw, the row whose bars to lay out. `let x` binds
the item being repeated; `let x = key` binds anything else on the scope. Options
are `key: value` pairs and may sit anywhere after the first part, which is what
lets an option-only directive be written `*chronousAgendaDays="let day;
showEmptyDays: true"`.

The parts and what they take:

| Part                          | Takes                        | Repeats over                  |
| ----------------------------- | ---------------------------- | ----------------------------- |
| `*chronousCalendar`           | the range, then `events`     | once                          |
| `*chronousToolbar`            | —                            | once                          |
| `chronousHeader`              | —                            | the element it is on          |
| `*chronousDayHeadings`        | —                            | every day                     |
| `<chronous-all-day-row>`      | `laneHeight`, `minLanes`     | once                          |
| `*chronousAllDayEvents`       | —                            | the row's bars                |
| `<chronous-time-grid>`        | `hourHeight`, `scrollToHour` | once                          |
| `chronousTimeAxis`            | —                            | the element it is on          |
| `*chronousTimeLabels`         | —                            | the slots of a day            |
| `*chronousDayColumns`         | —                            | every day                     |
| `*chronousTimeSlots`          | a day                        | its slots                     |
| `*chronousTimedEvents`        | a day                        | its boxes                     |
| `*chronousNowMarker`          | a day                        | once, if today                |
| `chronousMonthGrid`           | —                            | the element it is on          |
| `*chronousMonthWeekdays`      | —                            | the first row's days          |
| `*chronousMonthRows`          | —                            | every row                     |
| `*chronousMonthDays`          | a row                        | its days                      |
| `*chronousMonthAllDayEvents`  | a row                        | its bars                      |
| `*chronousMonthTimedEvents`   | a day                        | its boxes                     |
| `chronousAgendaList`          | —                            | the element it is on          |
| `*chronousAgendaDays`         | —                            | the days that carry something |
| `*chronousAgendaAllDayEvents` | the day's bars               | those bars                    |
| `*chronousAgendaTimedEvents`  | a day                        | its boxes                     |

Every structural directive carries an `ngTemplateContextGuard`, so `let`
variables are typed under `strictTemplates` and `TData` flows from the events
you passed all the way to `event.data`.

## Overflow, and the empty all-day row

Two cut-offs are shared between siblings, so they cannot drift apart.

`*chronousMonthRows` takes `maxLanes`, and the `laneHeight` its bars are drawn
at, for the same reason the gutter lives on the calendar: both are shared with
siblings, so they sit on the parent rather than on one child that could drift
from another. `*chronousMonthAllDayEvents` then stops drawing bars past that
lane, and every `*chronousMonthDays` cell is handed the bars that cover _it_ —
`bars` for all of them, `hiddenBars` for the ones the cut-off dropped, and
`lanes` counting only what is drawn. That is the whole "+2 more" affordance:

```html
<div *chronousMonthRows="let row; maxLanes: 3">
  <div *chronousMonthDays="row; let day; let hiddenBars = hiddenBars">
    @if (hiddenBars.length) {
    <button type="button">+{{ hiddenBars.length }} more</button>
    }
  </div>

  <div *chronousMonthAllDayEvents="row; let event" class="bar">
    {{ event.data.title }}
  </div>
</div>
```

`<chronous-all-day-row>` hides itself when the range has no all-day event at
all, which keeps a week view from carrying an empty strip. `minLanes` holds a
height anyway — one lane is usually what a stable header wants — and never
shrinks a row that already needs more.

## Typed event data

`EventInput<TData>` carries whatever you put on `data`, and that type survives
the whole way through the layout: `CalendarBox<TData>`, `CalendarBar<TData>` and
the template contexts are all generic in it. Nothing in the engine reads `data`;
it is carried, not interpreted.

```ts
type EventData = { title: string; owner: string }

readonly events = signal<EventInput<EventData>[]>([...])
```

```html
<div *chronousTimedEvents="day; let event">{{ event.data.title }}</div>
```

The generic is inferred from the events you hand `*chronousCalendar`, so there
is nothing to annotate at the point of use.

## Labels

Every label is `formatIso` in the calendar's `locale`, with the options the part
needs — `weekday: 'short'` for a weekday, `day: 'numeric'` for a day number,
`hour`/`minute` for a clock. A locale the runtime cannot read falls back to the
ISO value rather than throwing, so a typo shows up as `2026-03-18` on the screen
instead of taking the view down.

Where a label is not the one you want, the data behind it is on the same scope:
take `day.date` or `box.start` and call `formatIso` — or `Intl` — yourself.

```ts
readonly weekdayOf = (day: CalendarDay<EventData>): string =>
  formatIso(day.date, { locale: 'uk-UA', options: { weekday: 'long' } })
```

```html
<div *chronousDayHeadings="let day">{{ weekdayOf(day) }}</div>
```

## What differs from the React package

The two adapters draw the same calendar and share the engine, the vocabulary and
the geometry. Where they differ, Angular's idioms won:

- **`use*` hooks are `inject*` functions** returning signals, called from an
  injection context.
- **Components with an `as` prop are directives on your element.** There is no
  tag to name, because you already wrote it.
- **Render props are template contexts.** `let event` is what
  `{({ event }) => …}` was.
- **The toolbar has no `onNavigate`.** The range is a signal you own, so
  `*chronousToolbar` hands you `navigation` and you set it.
- **Per-item scopes are passed, not injected**, for the reason under the third
  rule above.
