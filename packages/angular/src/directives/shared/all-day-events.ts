import type { CalendarBar, CalendarEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { injectAllDayContext } from '../context'
import { contextOf, percentOf, pixelsOf, spanAttributes } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'
import type { ViewStyle } from '../views'

const GAP = 4

const HALF = 2

export type AllDayEventScope<TData> = {
  event: CalendarEntry<TData>
  bar: CalendarBar<TData>
}

export type AllDayEventContext<TData> = ScopedContext<
  CalendarEntry<TData>,
  AllDayEventScope<TData>
>

@Directive({
  selector: '[chronousAllDayEvents]',
  exportAs: 'chronousAllDayEvents'
})
export class AllDayEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: AllDayEventsDirective<TData>,
    _context: unknown
  ): _context is AllDayEventContext<TData> {
    return true
  }

  readonly gap = input(GAP, { alias: 'chronousAllDayEventsGap' })

  readonly #allDay = injectAllDayContext<TData>()

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<AllDayEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #styleOf(bar: CalendarBar<TData>): ViewStyle {
    const gap = this.gap()

    return {
      position: 'absolute',
      left: `calc(${percentOf(bar.left)} + ${pixelsOf(gap / HALF)})`,
      width: `calc(${percentOf(bar.width)} - ${pixelsOf(gap)})`,
      top: pixelsOf(bar.lane * this.#allDay.laneHeight()),
      height: pixelsOf(this.#allDay.laneHeight())
    }
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.#allDay.row().bars, {
      contextOf: (bar) => contextOf(bar.event, { event: bar.event, bar }),
      attributesOf: spanAttributes,
      styleOf: (bar) => this.#styleOf(bar)
    })
  }
}
