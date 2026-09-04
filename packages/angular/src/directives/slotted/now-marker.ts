import type { CalendarDay } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input
} from '@angular/core'

import { injectNow } from '../../now'
import type { CalendarNow } from '../../now'
import { injectCalendarContext } from '../context'
import { contextOf, minutePercentOf } from '../helpers'
import type { ScopedContext } from '../types'
import { syncViews } from '../views'

const Z_INDEX = '10'

export type NowMarkerScope = {
  minuteOfDay: number
}

export type NowMarkerContext = ScopedContext<number, NowMarkerScope>

@Directive({ selector: '[chronousNowMarker]', exportAs: 'chronousNowMarker' })
export class NowMarkerDirective<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: NowMarkerDirective<TData>,
    _context: unknown
  ): _context is NowMarkerContext {
    return true
  }

  readonly day = input.required<CalendarDay<TData>>({
    alias: 'chronousNowMarker'
  })

  readonly #calendar = injectCalendarContext<TData>()

  readonly #now = injectNow(() => this.#calendar.range().timeZone)

  readonly onDay = computed((): CalendarNow[] => {
    const now = this.#now()

    return now && now.date === this.day().date ? [now] : []
  })

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<NowMarkerContext>>(TemplateRef)

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    syncViews(this.#container, this.#template, this.onDay(), {
      contextOf: (now) =>
        contextOf(now.minuteOfDay, { minuteOfDay: now.minuteOfDay }),
      styleOf: (now) => ({
        position: 'absolute',
        left: '0',
        right: '0',
        top: minutePercentOf(now.minuteOfDay),
        'z-index': Z_INDEX
      })
    })
  }
}
