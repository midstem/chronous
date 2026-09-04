import type { CalendarDay, CalendarSlot } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core'

import { contextOf, minutePercentOf } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

export type TimeSlotScope = {
  slot: CalendarSlot
  minuteOfDay: number
}

export type TimeSlotContext = ScopedContext<CalendarSlot, TimeSlotScope>

@Directive({ selector: '[chronousTimeSlots]', exportAs: 'chronousTimeSlots' })
export class TimeSlotsDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: TimeSlotsDirective<TData>,
    _context: unknown
  ): _context is TimeSlotContext {
    return true
  }

  readonly day = input.required<CalendarDay<TData>>({
    alias: 'chronousTimeSlots'
  })

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<TimeSlotContext>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.day().slots, {
      contextOf: (slot) =>
        contextOf(slot, { slot, minuteOfDay: slot.minuteOfDay }),
      styleOf: (slot) => ({
        position: 'absolute',
        left: '0',
        right: '0',
        top: minutePercentOf(slot.minuteOfDay)
      })
    })
  }
}
