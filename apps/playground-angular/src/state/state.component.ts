import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core'
import type { CalendarLayout } from '@midstem/chronous-angular'
import { STATE_HINT, jsonOf, summaryOf } from '@midstem/playground-core'
import type { EventData, Metric } from '@midstem/playground-core'

@Component({
  selector: 'app-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details
      class="shrink-0 border-t border-line bg-raised"
      (toggle)="onToggle($event)"
    >
      <summary
        class="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-muted"
      >
        @for (item of metrics(); track item.label) {
          <span class="flex items-baseline gap-1">
            <span class="text-faint">{{ item.label }}</span>
            <span class="font-mono text-ink">{{ item.value }}</span>
          </span>
        }
      </summary>
      <div class="flex flex-col gap-2 px-3 pb-3">
        <p class="text-[11px] text-muted">{{ stateHint }}</p>
        @if (open()) {
          <pre
            class="max-h-80 overflow-auto rounded-md bg-sunken p-3 font-mono text-[11px] leading-5"
          >
            {{ json() }}
          </pre>
        }
      </div>
    </details>
  `
})
export class StateComponent {
  readonly calendar = input.required<CalendarLayout<EventData>>()
  readonly open = signal(false)

  readonly metrics = computed<readonly Metric[]>(() =>
    summaryOf(this.calendar())
  )
  readonly json = computed<string>(() => jsonOf(this.calendar()))
  readonly stateHint = STATE_HINT

  onToggle(event: Event): void {
    const details = event.currentTarget as HTMLDetailsElement
    this.open.set(details.open)
  }
}
