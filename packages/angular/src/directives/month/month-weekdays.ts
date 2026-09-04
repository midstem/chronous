import type { CalendarDay } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject
} from '@angular/core'

import { injectCalendarContext } from '../context'
import { WEEKDAY, contextOf, labelOf, rowsWithDays } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type MonthWeekdayScope<TData> = {
  day: CalendarDay<TData>
  weekdayLabel: string
}

export type MonthWeekdayContext<TData> = ScopedContext<
  CalendarDay<TData>,
  MonthWeekdayScope<TData>
>

@Directive({
  selector: '[chronousMonthWeekdays]',
  exportAs: 'chronousMonthWeekdays'
})
export class MonthWeekdaysDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: MonthWeekdaysDirective<TData>,
    _context: unknown
  ): _context is MonthWeekdayContext<TData> {
    return true
  }

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<MonthWeekdayContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const locale = this.#calendar.locale()
    const first = rowsWithDays(this.#calendar.calendar())[0]

    syncViews(this.#container, this.#template, first.days, {
      contextOf: (day) =>
        contextOf(day, {
          day,
          weekdayLabel: labelOf(day.date, locale, WEEKDAY)
        })
    })
  }
}
