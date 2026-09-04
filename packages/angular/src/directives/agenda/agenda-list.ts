import { Directive } from '@angular/core'

import { injectCalendarContext } from '../context'

@Directive({ selector: '[chronousAgendaList]', exportAs: 'chronousAgendaList' })
export class AgendaListDirective {
  readonly #context = injectCalendarContext()

  readonly calendar = this.#context.calendar

  readonly range = this.#context.range

  readonly locale = this.#context.locale
}
