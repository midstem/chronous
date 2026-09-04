import type { CalendarBox, CalendarDay, TimedEntry } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { contextOf, percentOf, pixelsOf, spanAttributes } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'
import type { ViewStyle } from '../views'

const MIN_HEIGHT = 22

const GAP = 3

export type TimedEventScope<TData> = {
  event: TimedEntry<TData>
  box: CalendarBox<TData>
}

export type TimedEventContext<TData> = ScopedContext<
  TimedEntry<TData>,
  TimedEventScope<TData>
>

@Directive({
  selector: '[chronousTimedEvents]',
  exportAs: 'chronousTimedEvents'
})
export class TimedEventsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: TimedEventsDirective<TData>,
    _context: unknown
  ): _context is TimedEventContext<TData> {
    return true
  }

  readonly day = input.required<CalendarDay<TData>>({
    alias: 'chronousTimedEvents'
  })

  readonly minHeight = input(MIN_HEIGHT, {
    alias: 'chronousTimedEventsMinHeight'
  })

  readonly gap = input(GAP, { alias: 'chronousTimedEventsGap' })

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<TimedEventContext<TData>>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #styleOf(box: CalendarBox<TData>): ViewStyle {
    return {
      position: 'absolute',
      overflow: 'hidden',
      top: percentOf(box.top),
      height: percentOf(box.height),
      left: percentOf(box.left),
      width: `calc(${percentOf(box.width)} - ${pixelsOf(this.gap())})`,
      'min-height': pixelsOf(this.minHeight())
    }
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.day().boxes, {
      contextOf: (box) => contextOf(box.event, { event: box.event, box }),
      attributesOf: spanAttributes,
      styleOf: (box) => this.#styleOf(box)
    })
  }
}
