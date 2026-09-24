import { ChangeDetectionStrategy, Component } from '@angular/core'
import { CALENDAR_DIRECTIVES } from '@midstem/chronous-angular'
import {
  ALL_DAY_BAR_GAP,
  ALL_DAY_LABEL,
  ALL_DAY_LANE_HEIGHT,
  CONTINUES,
  MIN_LANES,
  toneOf
} from '@midstem/playground-core'
import type { EventData } from '@midstem/playground-core'

@Component({
  selector: 'app-allday',
  standalone: true,
  imports: [CALENDAR_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <chronous-all-day-row
      class="border-b border-line pt-0.5 pb-1.5"
      [laneHeight]="laneHeight"
      [minLanes]="minLanes"
    >
      <span
        chronousGutterCell
        class="block pt-1 pr-2 text-right text-[10px] text-faint"
      >
        {{ allDayLabel }}
      </span>

      <div
        *chronousAllDayEvents="let event; let bar = bar; gap: barGap"
        class="px-px py-px"
      >
        <span
          [class]="
            'flex h-full items-center truncate rounded-md px-2 text-[11px] font-medium ' +
            toneOf(event.id)
          "
          [attr.title]="titleOf(event)"
        >
          {{ edge(bar.continuesBefore) }}
          {{ titleOf(event) }}
          {{ edge(bar.continuesAfter) }}
        </span>
      </div>
    </chronous-all-day-row>
  `
})
export class AlldayComponent {
  readonly laneHeight = ALL_DAY_LANE_HEIGHT
  readonly minLanes = MIN_LANES
  readonly barGap = ALL_DAY_BAR_GAP
  readonly allDayLabel = ALL_DAY_LABEL

  readonly toneOf = toneOf

  edge(shown: boolean): string {
    return shown ? CONTINUES : ''
  }

  titleOf(event: { id: string; data?: EventData }): string {
    return event.data?.title ?? event.id
  }
}
