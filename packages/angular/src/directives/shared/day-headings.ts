import type { CalendarDay, IsoDate } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject
} from '@angular/core'

import { injectCalendarContext } from '../context'
import {
  DAY_NUMBER,
  WEEKDAY,
  contextOf,
  dayAttributes,
  labelOf
} from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type DayHeadingScope<TData> = {
  day: CalendarDay<TData>
  date: IsoDate
  weekdayLabel: string
  dayLabel: string
  inCurrentPeriod: boolean
}

export type DayHeadingContext<TData> = ScopedContext<
  CalendarDay<TData>,
  DayHeadingScope<TData>
>

@Directive({
  selector: '[chronousDayHeadings]',
  exportAs: 'chronousDayHeadings'
})
export class DayHeadingsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: DayHeadingsDirective<TData>,
    _context: unknown
  ): _context is DayHeadingContext<TData> {
    return true
  }

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<DayHeadingContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const locale = this.#calendar.locale()

    syncViews(this.#container, this.#template, this.#calendar.calendar().days, {
      contextOf: (day) =>
        contextOf(day, {
          day,
          date: day.date,
          weekdayLabel: labelOf(day.date, locale, WEEKDAY),
          dayLabel: labelOf(day.date, locale, DAY_NUMBER),
          inCurrentPeriod: day.inCurrentPeriod
        }),
      attributesOf: dayAttributes
    })
  }
}
