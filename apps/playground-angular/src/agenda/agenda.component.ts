import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import type { IsoDate, LocaleId } from '@midstem/chronous-angular'
import {
  ALL_DAY_LABEL,
  EMPTY_LABEL,
  dotOf,
  formatDay
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul chronousAgendaList class="divide-y divide-hair">
      <li
        *chronousAgendaDays="
          let day;
          let weekdayLabel = weekdayLabel;
          let dayLabel = dayLabel;
          let bars = bars;
          let boxes = boxes;
          showEmptyDays: true
        "
        class="grid grid-cols-[88px_minmax(0,1fr)] gap-4 px-4 py-3 data-[in-current-period=false]:bg-sunken"
      >
        <div
          class="flex items-baseline gap-2"
          [attr.title]="formatDay(day.date, locale())"
        >
          <span [class]="numberClass(day.date === today())">{{
            dayLabel
          }}</span>
          <span class="text-[11px] tracking-wide text-muted uppercase">
            {{ weekdayLabel }}
          </span>
        </div>

        <div class="flex flex-col gap-1">
          @if (bars.length === 0 && boxes.length === 0) {
            <span class="text-[13px] text-faint">{{ emptyLabel }}</span>
          }

          <span
            *chronousAgendaAllDayEvents="bars; let event"
            class="flex items-center gap-2 text-[13px]"
          >
            <span
              [class]="'size-2 shrink-0 rounded-full ' + dotOf(event.id)"
            ></span>
            <span class="w-24 shrink-0 text-[11px] text-faint">
              {{ allDayLabel }}
            </span>
            <span class="truncate">{{ titleOf(event) }}</span>
          </span>

          <span
            *chronousAgendaTimedEvents="
              day;
              let event;
              let timeRangeLabel = timeRangeLabel
            "
            class="flex items-center gap-2 text-[13px]"
          >
            <span
              [class]="'size-2 shrink-0 rounded-full ' + dotOf(event.id)"
            ></span>
            <span
              class="w-24 shrink-0 font-mono text-[11px] tabular-nums text-muted"
            >
              {{ timeRangeLabel }}
            </span>
            <span class="truncate">{{ titleOf(event) }}</span>
          </span>
        </div>
      </li>
    </ul>
  `
})
export class AgendaComponent {
  readonly locale = input.required<LocaleId>()
  readonly today = input.required<IsoDate | null>()

  readonly emptyLabel = EMPTY_LABEL
  readonly allDayLabel = ALL_DAY_LABEL

  readonly formatDay = formatDay
  readonly dotOf = dotOf

  numberClass(isToday: boolean): string {
    return isToday
      ? 'flex size-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-surface'
      : 'flex size-7 items-center justify-center text-sm font-semibold'
  }

  titleOf(event: { id: string; data?: EventData }): string {
    return event.data?.title ?? event.id
  }
}
