import type { CalendarBox, CalendarDay, TimedEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { injectCalendarContext } from '../context'
import { contextOf, rangeOf, spanAttributes } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type AgendaTimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
  timeRangeLabel: string
}

export type AgendaTimedEventContext<TData> = ScopedContext<
  TimedEntry<TData>,
  AgendaTimedEventScope<TData>
>

@Directive({
  selector: '[chronousAgendaTimedEvents]',
  exportAs: 'chronousAgendaTimedEvents'
})
export class AgendaTimedEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: AgendaTimedEventsDirective<TData>,
    _context: unknown
  ): _context is AgendaTimedEventContext<TData> {
    return true
  }

  readonly day = input.required<CalendarDay<TData>>({
    alias: 'chronousAgendaTimedEvents'
  })

  readonly #calendar = injectCalendarContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<AgendaTimedEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const locale = this.#calendar.locale()

    syncViews(this.#container, this.#template, this.day().boxes, {
      contextOf: (box) =>
        contextOf(box.event, {
          event: box.event,
          box,
          timeRangeLabel: rangeOf(box.start, box.end, locale)
        }),
      attributesOf: spanAttributes
    })
  }
}
