import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core'

import { TIME_GRID_CONTEXT, injectCalendarContext } from '../context'
import type { TimeGridContext } from '../context'
import { HOURS_IN_DAY, templateOf } from '../helpers'

import { scrollerOf } from './helpers'

const HOUR_HEIGHT = 60

const SCROLL_TO_HOUR = 7

@Component({
  selector: 'chronous-time-grid',
  exportAs: 'chronousTimeGrid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': '"block"',
    '[style.overflowY]': '"auto"'
  },
  providers: [
    {
      provide: TIME_GRID_CONTEXT,
      useExisting: forwardRef(() => TimeGridComponent)
    }
  ],
  template: `
    <div [style.display]="'grid'" [style.gridTemplateColumns]="columns()">
      <ng-content />
    </div>
  `
})
export class TimeGridComponent implements TimeGridContext {
  readonly hourHeight = input(HOUR_HEIGHT)

  readonly scrollToHour = input<number | null>(SCROLL_TO_HOUR)

  readonly dayHeight = computed(() => this.hourHeight() * HOURS_IN_DAY)

  readonly #calendar = injectCalendarContext()

  readonly columns = computed(() =>
    templateOf(
      this.#calendar.gutterWidth(),
      this.#calendar.calendar().days.length
    )
  )

  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef)

  readonly #rendered = signal(false)

  constructor() {
    afterNextRender(() => this.#rendered.set(true))

    effect(() => this.#scroll())
  }

  #scroll(): void {
    const hour = this.scrollToHour()

    if (!this.#rendered() || hour === null) return

    const scroller = scrollerOf(this.#element.nativeElement)

    if (scroller) scroller.scrollTop = this.hourHeight() * hour
  }
}
