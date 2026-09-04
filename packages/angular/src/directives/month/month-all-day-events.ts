import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import {
  contextOf,
  percentOf,
  pixelsOf,
  spanAttributes,
  visibleLanes
} from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'
import type { ViewStyle } from '../views'

import type { MonthRowScope } from './month-rows'

const GAP = 4

const HALF = 2

const LANES_TOP_OFFSET = 28

const Z_INDEX = '1'

export type MonthAllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type MonthAllDayEventContext<TData> = ScopedContext<
  CalendarEntry<TData>,
  MonthAllDayEventScope<TData>
>

@Directive({
  selector: '[chronousMonthAllDayEvents]',
  exportAs: 'chronousMonthAllDayEvents'
})
export class MonthAllDayEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: MonthAllDayEventsDirective<TData>,
    _context: unknown
  ): _context is MonthAllDayEventContext<TData> {
    return true
  }

  readonly monthRow = input.required<MonthRowScope<TData>>({
    alias: 'chronousMonthAllDayEvents'
  })

  readonly gap = input(GAP, { alias: 'chronousMonthAllDayEventsGap' })

  readonly lanesTopOffset = input(LANES_TOP_OFFSET, {
    alias: 'chronousMonthAllDayEventsLanesTopOffset'
  })

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<MonthAllDayEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #styleOf(bar: CalendarBar<TData>): ViewStyle {
    const gap = this.gap()
    const { laneHeight } = this.monthRow()

    return {
      position: 'absolute',
      left: `calc(${percentOf(bar.left)} + ${pixelsOf(gap / HALF)})`,
      width: `calc(${percentOf(bar.width)} - ${pixelsOf(gap)})`,
      top: pixelsOf(this.lanesTopOffset() + bar.lane * laneHeight),
      height: pixelsOf(laneHeight),
      'z-index': Z_INDEX
    }
  }

  #render(): void {
    const { row, maxLanes } = this.monthRow()

    syncViews(
      this.#container,
      this.#template,
      visibleLanes(row.bars, maxLanes),
      {
        contextOf: (bar) => contextOf(bar.event, { event: bar.event, bar }),
        attributesOf: spanAttributes,
        styleOf: (bar) => this.#styleOf(bar)
      }
    )
  }
}
