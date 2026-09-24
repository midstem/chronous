import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'

@Component({
  selector: 'app-plain-agenda',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul chronousAgendaList class="divide-y divide-hair">
      <li
        *chronousAgendaDays="
          let day;
          let dayLabel = dayLabel;
          let weekdayLabel = weekdayLabel;
          let bars = bars
        "
        class="flex gap-4 px-4 py-3"
      >
        <span class="w-16 shrink-0 text-sm font-semibold">
          {{ weekdayLabel }} {{ dayLabel }}
        </span>

        <span class="flex flex-col gap-1">
          <span
            *chronousAgendaAllDayEvents="bars; let event"
            class="text-[13px]"
          >
            {{ event.data?.title ?? event.id }} · all-day
          </span>

          <span
            *chronousAgendaTimedEvents="
              day;
              let event;
              let timeRangeLabel = timeRangeLabel
            "
            class="text-[13px]"
          >
            {{ event.data?.title ?? event.id }} · {{ timeRangeLabel }}
          </span>
        </span>
      </li>
    </ul>
  `
})
export class PlainAgendaComponent {}
