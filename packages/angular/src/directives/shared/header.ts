import { Directive, computed } from '@angular/core'

import { injectCalendarContext } from '../context'
import { templateOf } from '../helpers'

@Directive({
  standalone: true,
  selector: '[chronousHeader]',
  exportAs: 'chronousHeader',
  host: {
    '[style.display]': '"grid"',
    '[style.gridTemplateColumns]': 'columns()'
  }
})
export class HeaderDirective {
  readonly #calendar = injectCalendarContext()

  readonly columns = computed(() =>
    templateOf(
      this.#calendar.gutterWidth(),
      this.#calendar.calendar().days.length
    )
  )
}
