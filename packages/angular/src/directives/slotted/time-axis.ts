import { Directive } from '@angular/core'

import { injectTimeGridContext } from '../context'

@Directive({
  selector: '[chronousTimeAxis]',
  exportAs: 'chronousTimeAxis',
  host: {
    '[style.position]': '"relative"',
    '[style.height.px]': 'dayHeight()'
  }
})
export class TimeAxisDirective {
  readonly #timeGrid = injectTimeGridContext()

  readonly dayHeight = this.#timeGrid.dayHeight
}
