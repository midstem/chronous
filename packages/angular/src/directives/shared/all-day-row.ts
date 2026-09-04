import type { CalendarRow } from '@midstem/chronous'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input
} from '@angular/core'

import { ALL_DAY_CONTEXT } from '../context'
import type { AllDayContext } from '../context'
import { injectCalendarContext } from '../context'
import { templateOf } from '../helpers'

const LANE_HEIGHT = 24

const MIN_LANES = 0

const LANES_COLUMN = '2 / -1'

@Component({
  selector: 'chronous-all-day-row',
  exportAs: 'chronousAllDayRow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': 'lanes() ? "grid" : "none"',
    '[style.gridTemplateColumns]': 'columns()'
  },
  providers: [
    {
      provide: ALL_DAY_CONTEXT,
      useExisting: forwardRef(() => AllDayRowComponent)
    }
  ],
  template: `
    <div><ng-content select="[chronousGutterCell]" /></div>
    <div
      [style.gridColumn]="lanesColumn"
      [style.position]="'relative'"
      [style.height.px]="lanesHeight()"
    >
      <ng-content />
    </div>
  `
})
export class AllDayRowComponent<TData> implements AllDayContext<TData> {
  readonly laneHeight = input(LANE_HEIGHT)

  readonly minLanes = input(MIN_LANES)

  readonly lanesColumn = LANES_COLUMN

  readonly #calendar = injectCalendarContext<TData>()

  readonly row = computed(
    (): CalendarRow<TData> => this.#calendar.calendar().rows[0]
  )

  readonly lanes = computed(() => Math.max(this.row().lanes, this.minLanes()))

  readonly lanesHeight = computed(() => this.lanes() * this.laneHeight())

  readonly columns = computed(() =>
    templateOf(
      this.#calendar.gutterWidth(),
      this.#calendar.calendar().days.length
    )
  )
}
