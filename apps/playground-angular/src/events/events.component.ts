import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core'
import { EVENTS_HINT, ROWS, presetOf } from '@midstem/playground-core'

import { PlaygroundService } from '../playground/playground.service'

@Component({
  selector: 'app-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-0 flex-1 flex-col gap-2">
      <p class="text-[11px] leading-4 text-muted">{{ hint() }}</p>
      <p class="font-mono text-[10px] text-faint">
        EventInput[] · {{ count() }} on the board
      </p>
      <textarea
        [class]="
          'field-control min-h-0 flex-1 resize-none font-mono text-[11px] leading-5 ' +
          (problem() ? 'border-danger' : '')
        "
        aria-label="Events JSON"
        spellcheck="false"
        [rows]="rows"
        [value]="source()"
        (input)="onInput($event)"
      ></textarea>
      @if (problem()) {
        <p role="alert" class="text-[11px] leading-4 text-danger">
          {{ problem() }}
        </p>
      } @else {
        <p class="text-[11px] leading-4 text-muted">{{ eventsHint }}</p>
      }
    </div>
  `
})
export class EventsComponent {
  readonly #playground = inject(PlaygroundService)

  readonly source = this.#playground.source
  readonly problem = this.#playground.problem
  readonly count = computed(() => this.#playground.events().length)
  readonly hint = computed(() => presetOf(this.#playground.state().preset).hint)

  readonly rows = ROWS
  readonly eventsHint = EVENTS_HINT

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement
    this.#playground.changeSource(target.value)
  }
}
