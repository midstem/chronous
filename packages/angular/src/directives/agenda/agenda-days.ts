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
  MONTH,
  WEEKDAY,
  barsByDay,
  contextOf,
  dayAttributes,
  labelOf
} from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type AgendaDayScope<TData> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
  boxes: CalendarBox<TData>[]
  weekdayLabel: string
  dayLabel: string
  monthLabel: string
}

export type AgendaDayContext<TData> = ScopedContext<
  CalendarDay<TData>,
  AgendaDayScope<TData>
>

type DayWithBars<TData> = {
  day: CalendarDay<TData>
  bars: CalendarBar<TData>[]
}

@Directive({ selector: '[chronousAgendaDays]', exportAs: 'chronousAgendaDays' })
export class AgendaDaysDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: AgendaDaysDirective<TData>,
    _context: unknown
  ): _context is AgendaDayContext<TData> {
    return true
  }

  readonly showEmptyDays = input(false, {
    alias: 'chronousAgendaDaysShowEmptyDays'
  })

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<AgendaDayContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #daysWithBars(): DayWithBars<TData>[] {
    const calendar = this.#calendar.calendar()
    const bars = barsByDay(calendar)
    const showEmptyDays = this.showEmptyDays()

    return calendar.days
      .map((day, index) => ({ day, bars: bars[index] }))
      .filter(
        ({ day, bars: onDay }) =>
          showEmptyDays || onDay.length > 0 || day.boxes.length > 0
      )
  }

  #render(): void {
    const locale = this.#calendar.locale()

    syncViews(this.#container, this.#template, this.#daysWithBars(), {
      contextOf: ({ day, bars }) =>
        contextOf(day, {
          day,
          bars,
          boxes: day.boxes,
          weekdayLabel: labelOf(day.date, locale, WEEKDAY),
          dayLabel: labelOf(day.date, locale, DAY_NUMBER),
          monthLabel: labelOf(day.date, locale, MONTH)
        }),
      attributesOf: ({ day }) => dayAttributes(day)
    })
  }
}
