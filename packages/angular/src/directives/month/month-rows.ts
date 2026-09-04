import type { CalendarDay, CalendarRow } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { injectCalendarContext } from '../context'
import { columnsOf, contextOf, rowsWithDays } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

const MAX_LANES = null

const LANE_HEIGHT = 20

export type MonthRowScope<TData> = {
  row: CalendarRow<TData>
  days: CalendarDay<TData>[]
  maxLanes: number | null
  laneHeight: number
}

export type MonthRowContext<TData> = ScopedContext<
  MonthRowScope<TData>,
  MonthRowScope<TData>
>

@Directive({ selector: '[chronousMonthRows]', exportAs: 'chronousMonthRows' })
export class MonthRowsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: MonthRowsDirective<TData>,
    _context: unknown
  ): _context is MonthRowContext<TData> {
    return true
  }

  readonly maxLanes = input<number | null>(MAX_LANES, {
    alias: 'chronousMonthRowsMaxLanes'
  })

  readonly laneHeight = input(LANE_HEIGHT, {
    alias: 'chronousMonthRowsLaneHeight'
  })

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<MonthRowContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const maxLanes = this.maxLanes()
    const laneHeight = this.laneHeight()

    syncViews(
      this.#container,
      this.#template,
      rowsWithDays(this.#calendar.calendar()),
      {
        contextOf: ({ row, days }) => {
          const scope: MonthRowScope<TData> = {
            row,
            days,
            maxLanes,
            laneHeight
          }

          return contextOf(scope, scope)
        },
        styleOf: ({ days }) => ({
          position: 'relative',
          flex: '1',
          display: 'grid',
          'grid-template-columns': columnsOf(days.length)
        })
      }
    )
  }
}
