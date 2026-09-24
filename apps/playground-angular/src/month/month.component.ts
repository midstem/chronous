import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import type { IsoDate } from '@midstem/chronous-angular'
import {
  CELL_MIN_HEIGHT,
  CONTINUES,
  MONTH_BAR_GAP,
  MONTH_LANE_HEIGHT,
  MONTH_MAX_LANES,
  NUMBER_HEIGHT,
  WEEK_COLUMNS,
  dotOf,
  toneOf
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

@Component({
  selector: 'app-month',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div chronousMonthGrid>
      <div
        class="grid border-b border-line"
        [style.gridTemplateColumns]="weekColumns"
      >
        <span
          *chronousMonthWeekdays="let day; let weekdayLabel = weekdayLabel"
          class="border-l border-hair py-1.5 text-center text-[10px] font-medium tracking-wide text-muted uppercase first:border-l-0"
        >
          {{ weekdayLabel }}
        </span>
      </div>

      <div
        *chronousMonthRows="let row; maxLanes: maxLanes; laneHeight: laneHeight"
        class="border-b border-line last:border-b-0"
        [style.minHeight.px]="cellMinHeight"
      >
        <div
          *chronousMonthDays="
            row;
            let day;
            let dayLabel = dayLabel;
            let lanes = lanes;
            let hiddenBars = hiddenBars
          "
          class="flex flex-col border-l border-hair px-1 pb-1 first:border-l-0 data-[in-current-period=false]:bg-sunken data-[in-current-period=false]:text-faint"
        >
          <span
            class="flex items-center justify-center"
            [style.height.px]="numberHeight"
          >
            <span [class]="numberClass(day.date === today())">
              {{ dayLabel }}
            </span>
          </span>

          <span class="block" [style.height.px]="lanes * laneHeight"></span>

          @if (hiddenBars.length > 0) {
            <span
              class="self-start rounded px-1 font-mono text-[10px] text-muted"
            >
              +{{ hiddenBars.length }} more
            </span>
          }

          <span class="flex flex-col gap-0.5">
            <span
              *chronousMonthTimedEvents="day; let event"
              class="flex items-center gap-1 truncate rounded px-1 text-[11px] leading-5 hover:bg-raised"
            >
              <span
                [class]="'size-1.5 shrink-0 rounded-full ' + dotOf(event.id)"
              ></span>
              <span class="truncate" [attr.title]="titleOf(event)">
                {{ titleOf(event) }}
              </span>
            </span>
          </span>
        </div>

        <div
          *chronousMonthAllDayEvents="
            row;
            let event;
            let bar = bar;
            gap: barGap;
            lanesTopOffset: numberHeight
          "
        >
          <span
            [class]="
              'flex h-full items-center truncate rounded px-1.5 text-[11px] font-medium ' +
              toneOf(event.id)
            "
            [attr.title]="titleOf(event)"
          >
            {{ edge(bar.continuesBefore) }}
            {{ titleOf(event) }}
            {{ edge(bar.continuesAfter) }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class MonthComponent {
  readonly today = input.required<IsoDate | null>()

  readonly weekColumns = WEEK_COLUMNS
  readonly maxLanes = MONTH_MAX_LANES
  readonly laneHeight = MONTH_LANE_HEIGHT
  readonly cellMinHeight = CELL_MIN_HEIGHT
  readonly numberHeight = NUMBER_HEIGHT
  readonly barGap = MONTH_BAR_GAP

  readonly dotOf = dotOf
  readonly toneOf = toneOf

  edge(shown: boolean): string {
    return shown ? CONTINUES : ''
  }

  numberClass(isToday: boolean): string {
    return isToday
      ? 'flex size-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-surface'
      : 'flex size-6 items-center justify-center text-xs font-medium'
  }

  titleOf(event: { id: string; data?: EventData }): string {
    return event.data?.title ?? event.id
  }
}
