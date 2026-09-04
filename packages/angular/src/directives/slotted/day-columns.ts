import type { CalendarDay } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject
} from '@angular/core'

import { injectCalendarContext, injectTimeGridContext } from '../context'
import { contextOf, dayAttributes, pixelsOf } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type DayColumnScope<TData> = {
  day: CalendarDay<TData>
}

export type DayColumnContext<TData> = ScopedContext<
  CalendarDay<TData>,
  DayColumnScope<TData>
>

@Directive({ selector: '[chronousDayColumns]', exportAs: 'chronousDayColumns' })
export class DayColumnsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: DayColumnsDirective<TData>,
    _context: unknown
  ): _context is DayColumnContext<TData> {
    return true
  }

  readonly #calendar = injectCalendarContext<TData>()

  readonly #timeGrid = injectTimeGridContext()

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<DayColumnContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const dayHeight = this.#timeGrid.dayHeight()

    syncViews(this.#container, this.#template, this.#calendar.calendar().days, {
      contextOf: (day) => contextOf(day, { day }),
      attributesOf: dayAttributes,
      styleOf: () => ({ position: 'relative', height: pixelsOf(dayHeight) })
    })
  }
}
