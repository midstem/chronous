import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'

const LANE_HEIGHT = 20

@Component({
  selector: 'app-plain-month',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div chronousMonthGrid>
      <div
        *chronousMonthRows="let row; laneHeight: laneHeight"
        class="border-b border-line last:border-b-0"
      >
        <div
          *chronousMonthDays="
            row;
            let day;
            let dayLabel = dayLabel;
            let lanes = lanes
          "
          class="min-h-28 border-l border-hair p-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
        >
          <div class="h-7 text-center text-xs font-medium">
            {{ dayLabel }}
          </div>
          <div [style.height.px]="lanes * laneHeight"></div>
          <div
            *chronousMonthTimedEvents="day; let event"
            class="truncate rounded bg-tone-1 px-1 text-[11px] leading-5 text-tone-1-ink"
          >
            {{ event.data?.title ?? event.id }}
          </div>
        </div>

        <div
          *chronousMonthAllDayEvents="row; let event"
          class="truncate rounded bg-tone-2 px-1.5 text-[11px] leading-5 text-tone-2-ink"
        >
          {{ event.data?.title ?? event.id }}
        </div>
      </div>
    </div>
  `
})
export class PlainMonthComponent {
  readonly laneHeight = LANE_HEIGHT
}
