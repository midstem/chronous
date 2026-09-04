import { Directive } from '@angular/core'

@Directive({
  selector: '[chronousMonthGrid]',
  exportAs: 'chronousMonthGrid',
  host: {
    '[style.display]': '"flex"',
    '[style.flexDirection]': '"column"',
    '[style.minHeight]': '"100%"'
  }
})
export class MonthGridDirective {}
