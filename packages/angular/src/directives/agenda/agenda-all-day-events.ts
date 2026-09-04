import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { contextOf, spanAttributes } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type AgendaAllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AgendaAllDayEventContext<TData> = ScopedContext<
  CalendarEntry<TData>,
  AgendaAllDayEventScope<TData>
>

@Directive({
  selector: '[chronousAgendaAllDayEvents]',
  exportAs: 'chronousAgendaAllDayEvents'
})
export class AgendaAllDayEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: AgendaAllDayEventsDirective<TData>,
    _context: unknown
  ): _context is AgendaAllDayEventContext<TData> {
    return true
  }

  readonly bars = input.required<readonly CalendarBar<TData>[]>({
    alias: 'chronousAgendaAllDayEvents'
  })

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<AgendaAllDayEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.bars(), {
      contextOf: (bar) => contextOf(bar.event, { event: bar.event, bar }),
      attributesOf: spanAttributes
    })
  }
}
