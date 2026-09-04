import type { CalendarBox, CalendarDay, TimedEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { contextOf, eventAttributes } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type MonthTimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type MonthTimedEventContext<TData> = ScopedContext<
  TimedEntry<TData>,
  MonthTimedEventScope<TData>
>

@Directive({
  selector: '[chronousMonthTimedEvents]',
  exportAs: 'chronousMonthTimedEvents'
})
export class MonthTimedEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: MonthTimedEventsDirective<TData>,
    _context: unknown
  ): _context is MonthTimedEventContext<TData> {
    return true
  }

  readonly day = input.required<CalendarDay<TData>>({
    alias: 'chronousMonthTimedEvents'
  })

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<MonthTimedEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.day().boxes, {
      contextOf: (box) => contextOf(box.event, { event: box.event, box }),
      attributesOf: eventAttributes
    })
  }
}
