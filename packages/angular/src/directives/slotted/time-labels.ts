import type { CalendarSlot } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject
} from '@angular/core'

import { injectCalendarContext } from '../context'
import { CLOCK, contextOf, labelOf, minutePercentOf } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type TimeLabelScope = {
  slot: CalendarSlot
  minuteOfDay: number
  timeLabel: string
}

export type TimeLabelContext = ScopedContext<CalendarSlot, TimeLabelScope>

@Directive({ selector: '[chronousTimeLabels]', exportAs: 'chronousTimeLabels' })
export class TimeLabelsDirective {
  static ngTemplateContextGuard(
    _directive: TimeLabelsDirective,
    _context: unknown
  ): _context is TimeLabelContext {
    return true
  }

  readonly #calendar = injectCalendarContext()

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<TimeLabelContext>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const locale = this.#calendar.locale()
    const day = this.#calendar.calendar().days[0]

    syncViews(this.#container, this.#template, day.slots, {
      contextOf: (slot) =>
        contextOf(slot, {
          slot,
          minuteOfDay: slot.minuteOfDay,
          timeLabel: labelOf(slot.start, locale, CLOCK)
        }),
      styleOf: (slot) => ({
        position: 'absolute',
        top: minutePercentOf(slot.minuteOfDay),
        transform: 'translateY(-50%)'
      })
    })
  }
}
