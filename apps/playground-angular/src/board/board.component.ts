import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core'
import {
  CALENDAR_DIRECTIVES,
  injectCalendarNavigation,
  injectNow
} from '@midstem/chronous-angular'
import type {
  CalendarRange,
  EventInput,
  IsoDate,
  LocaleId
} from '@midstem/chronous-angular'
import {
  GUTTER,
  MONTH_VIEW,
  hourHeightOf,
  isSimple,
  isSlotted,
  titleOf
} from '@midstem/playground-core'
import type { Density, EventData, Style } from '@midstem/playground-core'

import { AgendaComponent } from '../agenda/agenda.component'
import { SlottedComponent } from '../grid/slotted.component'
import { MonthComponent } from '../month/month.component'
import { PlainAgendaComponent } from '../plain/plain-agenda.component'
import { PlainMonthComponent } from '../plain/plain-month.component'
import { PlainSlottedComponent } from '../plain/plain-slotted.component'
import { StateComponent } from '../state/state.component'
import { ToolbarComponent } from '../toolbar/toolbar.component'

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CALENDAR_DIRECTIVES,
    ToolbarComponent,
    SlottedComponent,
    MonthComponent,
    AgendaComponent,
    PlainSlottedComponent,
    PlainMonthComponent,
    PlainAgendaComponent,
    StateComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #calendarError let-error>
      <div class="flex min-h-0 flex-1 flex-col p-4">
        <app-toolbar
          [navigation]="navigation()"
          [title]="range().currentDate"
          [view]="range().view"
          [density]="density()"
          [slotted]="isSlotted(range().view)"
          (rangeChange)="rangeChange.emit($event)"
          (densityChange)="densityChange.emit($event)"
        />
        <p
          role="alert"
          class="rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <strong class="font-mono">{{ error.name }}</strong
          >: {{ error.message }}
        </p>
      </div>
    </ng-template>

    <div
      *chronousCalendar="
        range();
        events: events();
        locale: locale();
        gutterWidth: gutter;
        error: calendarError;
        let calendar
      "
      class="flex min-h-0 flex-1 flex-col p-4"
    >
      <app-toolbar
        [navigation]="navigation()"
        [title]="titleOf(calendar, locale())"
        [view]="range().view"
        [density]="density()"
        [slotted]="isSlotted(range().view)"
        (rangeChange)="rangeChange.emit($event)"
        (densityChange)="densityChange.emit($event)"
      />

      <section
        class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
      >
        <div data-scroller class="min-h-0 flex-1 overflow-auto">
          @if (isSlotted(range().view)) {
            @if (isSimple(style())) {
              <app-plain-slotted [hourHeight]="hourHeight()" />
            } @else {
              <app-slotted
                [locale]="locale()"
                [hourHeight]="hourHeight()"
                [today]="today()"
              />
            }
          } @else if (range().view === monthView) {
            @if (isSimple(style())) {
              <app-plain-month />
            } @else {
              <app-month [today]="today()" />
            }
          } @else {
            @if (isSimple(style())) {
              <app-plain-agenda />
            } @else {
              <app-agenda [locale]="locale()" [today]="today()" />
            }
          }
        </div>

        <app-state [calendar]="calendar" />
      </section>
    </div>
  `
})
export class BoardComponent {
  readonly range = input.required<CalendarRange>()
  readonly events = input.required<readonly EventInput<EventData>[]>()
  readonly locale = input.required<LocaleId>()
  readonly density = input.required<Density>()
  readonly style = input.required<Style>()

  readonly rangeChange = output<CalendarRange>()
  readonly densityChange = output<Density>()

  readonly gutter = GUTTER
  readonly monthView = MONTH_VIEW
  readonly isSlotted = isSlotted
  readonly isSimple = isSimple
  readonly titleOf = titleOf

  readonly navigation = injectCalendarNavigation(this.range)
  readonly now = injectNow(() => this.range().timeZone)
  readonly today = computed<IsoDate | null>(() => this.now()?.date ?? null)
  readonly hourHeight = computed<number>(() => hourHeightOf(this.density()))
}
