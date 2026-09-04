import type {
  CalendarLayout,
  CalendarRange,
  EventInput,
  LocaleId
} from '@midstem/chronous'
import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  forwardRef,
  inject,
  input
} from '@angular/core'

import { injectCalendar } from '../../calendar'
import type { CalendarError } from '../../calendar'
import { CALENDAR_CONTEXT } from '../context'
import type { CalendarContext } from '../context'
import { GUTTER_WIDTH, LOCALE, contextOf } from '../helpers'
import type { ScopedContext } from '../types'
import { slotOf, syncSlot } from '../views'

export type CalendarScope<TData> = {
  calendar: CalendarLayout<TData>
  range: CalendarRange
  locale: LocaleId
  gutterWidth: string
}

export type CalendarTemplateContext<TData> = ScopedContext<
  CalendarLayout<TData>,
  CalendarScope<TData>
>

export type CalendarErrorContext = ScopedContext<
  CalendarError,
  { error: CalendarError }
>

@Directive({
  selector: '[chronousCalendar]',
  exportAs: 'chronousCalendar',
  providers: [
    {
      provide: CALENDAR_CONTEXT,
      useExisting: forwardRef(() => CalendarDirective)
    }
  ]
})
export class CalendarDirective<TData> implements CalendarContext<TData> {
  static ngTemplateContextGuard<TData>(
    _directive: CalendarDirective<TData>,
    _context: unknown
  ): _context is CalendarTemplateContext<TData> {
    return true
  }

  readonly range = input.required<CalendarRange>({ alias: 'chronousCalendar' })

  readonly events = input.required<readonly EventInput<TData>[]>({
    alias: 'chronousCalendarEvents'
  })

  readonly locale = input<LocaleId>(LOCALE, { alias: 'chronousCalendarLocale' })

  readonly gutterWidth = input<string>(GUTTER_WIDTH, {
    alias: 'chronousCalendarGutterWidth'
  })

  readonly pendingTemplate = input<TemplateRef<object> | null>(null, {
    alias: 'chronousCalendarPending'
  })

  readonly errorTemplate = input<TemplateRef<CalendarErrorContext> | null>(
    null,
    { alias: 'chronousCalendarError' }
  )

  readonly result = injectCalendar<TData>(this.range, this.events)

  readonly calendar = computed(
    () => this.result().calendar as CalendarLayout<TData>
  )

  readonly #container = inject(ViewContainerRef)

  readonly #template =
    inject<TemplateRef<CalendarTemplateContext<TData>>>(TemplateRef)

  readonly #slot = slotOf()

  constructor() {
    effect(() => this.#render())
  }

  #render(): void {
    const { calendar, error, pending } = this.result()

    if (pending) {
      syncSlot(this.#slot, this.#container, this.pendingTemplate(), {})

      return
    }

    if (error) {
      const template = this.errorTemplate()

      if (!template) throw error

      syncSlot(
        this.#slot,
        this.#container,
        template,
        contextOf(error, { error })
      )

      return
    }

    syncSlot(
      this.#slot,
      this.#container,
      this.#template,
      contextOf(calendar, {
        calendar,
        range: this.range(),
        locale: this.locale(),
        gutterWidth: this.gutterWidth()
      })
    )
  }
}
