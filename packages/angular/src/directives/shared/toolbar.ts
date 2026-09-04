import type { CalendarRange } from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject
} from '@angular/core'

import { injectCalendarNavigation } from '../../navigation'
import type { CalendarNavigation } from '../../navigation'
import { injectCalendarContext } from '../context'
import { contextOf } from '../helpers'
import type { ScopedContext } from '../types'
import { slotOf, syncSlot } from '../views'

import { titleOf } from './helpers'

export type ToolbarScope = {
  navigation: CalendarNavigation
  range: CalendarRange
  title: string
}

export type ToolbarContext = ScopedContext<CalendarNavigation, ToolbarScope>

@Directive({ selector: '[chronousToolbar]', exportAs: 'chronousToolbar' })
export class ToolbarDirective {
  static ngTemplateContextGuard(
    _directive: ToolbarDirective,
    _context: unknown
  ): _context is ToolbarContext {
    return true
  }

  readonly #calendar = injectCalendarContext()

  readonly navigation = injectCalendarNavigation(this.#calendar.range)

  readonly title = computed(() =>
    titleOf(this.#calendar.range(), this.#calendar.locale())
  )

  readonly #container = inject(ViewContainerRef)

  readonly #template = inject<TemplateRef<ToolbarContext>>(TemplateRef)

  readonly #slot = slotOf()

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const navigation = this.navigation()

    syncSlot(
      this.#slot,
      this.#container,
      this.#template,
      contextOf(navigation, {
        navigation,
        range: this.#calendar.range(),
        title: this.title()
      })
    )
  }
}
