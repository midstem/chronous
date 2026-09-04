import type { CalendarBar, CalendarBox, CalendarDay } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { injectCalendarContext } from '../context'
import {
  DAY_NUMBER,
  contextOf,
  dayAttributes,
  hiddenLanes,
  labelOf,
  laneCount,
  rowBarsByDay
} from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

import type { MonthRowScope } from './month-rows'

export type MonthDayScope<TData> = {
  day: CalendarDay<TData>
  boxes: CalendarBox<TData>[]
  bars: CalendarBar<TData>[]
  hiddenBars: CalendarBar<TData>[]
  dayLabel: string
  inCurrentPeriod: boolean
  lanes: number
}

export type MonthDayContext<TData> = ScopedContext<
  CalendarDay<TData>,
  MonthDayScope<TData>
>

@Directive({ selector: '[chronousMonthDays]', exportAs: 'chronousMonthDays' })
export class MonthDaysDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: MonthDaysDirective<TData>,
    _context: unknown
  ): _context is MonthDayContext<TData> {
    return true
  }

  readonly monthRow = input.required<MonthRowScope<TData>>({
    alias: 'chronousMonthDays'
  })

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<MonthDayContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const locale = this.#calendar.locale()
    const { row, days, maxLanes } = this.monthRow()
    const barsByDay = rowBarsByDay(row, days.length)

    syncViews(this.#container, this.#template, days, {
      contextOf: (day, index) => {
        const bars = barsByDay[index]

        return contextOf(day, {
          day,
          boxes: day.boxes,
          bars,
          hiddenBars: hiddenLanes(bars, maxLanes),
          dayLabel: labelOf(day.date, locale, DAY_NUMBER),
          inCurrentPeriod: day.inCurrentPeriod,
          lanes: laneCount(row.lanes, maxLanes)
        })
      },
      attributesOf: dayAttributes
    })
  }
}
