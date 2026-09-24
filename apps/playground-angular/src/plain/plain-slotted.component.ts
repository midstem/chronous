import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'

@Component({
  selector: 'app-plain-slotted',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sticky top-0 z-10 bg-surface">
      <div chronousHeader class="border-b border-line">
        <div></div>
        <div
          *chronousDayHeadings="
            let day;
            let weekdayLabel = weekdayLabel;
            let dayLabel = dayLabel
          "
          class="border-l border-hair py-2 text-center text-sm font-medium"
        >
          {{ weekdayLabel }} {{ dayLabel }}
        </div>
      </div>

      <chronous-all-day-row class="border-b border-line">
        <span chronousGutterCell class="pl-2 text-[10px] text-faint">
          all-day
        </span>

        <div
          *chronousAllDayEvents="let event"
          class="truncate rounded bg-tone-2 px-2 text-[11px] leading-6 text-tone-2-ink"
        >
          {{ event.data?.title ?? event.id }}
        </div>
      </chronous-all-day-row>
    </div>

    <chronous-time-grid [hourHeight]="hourHeight()">
      <div chronousTimeAxis>
        <div
          *chronousTimeLabels="let slot; let timeLabel = timeLabel"
          class="right-2 text-[10px] text-faint"
        >
          {{ timeLabel }}
        </div>
      </div>

      <div *chronousDayColumns="let day" class="border-l border-hair">
        <span *chronousTimeSlots="day" class="border-t border-hair"></span>

        <div
          *chronousTimedEvents="day; let event"
          class="truncate rounded-md bg-tone-1 px-1.5 text-[11px] leading-[1.35] font-medium text-tone-1-ink"
        >
          {{ event.data?.title ?? event.id }}
        </div>
      </div>
    </chronous-time-grid>
  `
})
export class PlainSlottedComponent {
  readonly hourHeight = input.required<number>()
}
