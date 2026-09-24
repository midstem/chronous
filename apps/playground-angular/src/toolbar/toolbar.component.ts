import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core'
import type {
  CalendarNavigation,
  CalendarRange,
  ViewKind
} from '@midstem/chronous-angular'
import {
  BACK_LABEL,
  DENSITIES,
  DENSITY_LABEL,
  NEXT_LABEL,
  VIEWS
} from '@midstem/playground-core'
import type { Density } from '@midstem/playground-core'

@Component({
  selector: 'app-toolbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="flex flex-wrap items-center gap-3 pb-3">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="ghost-button"
          [attr.aria-label]="backLabel"
          [disabled]="!navigation().prev"
          (click)="navigation().prev && rangeChange.emit(navigation().prev!)"
        >
          ‹
        </button>
        <button
          type="button"
          class="ghost-button"
          [disabled]="!navigation().today"
          (click)="
            navigation().today && rangeChange.emit(navigation().today()!)
          "
        >
          Today
        </button>
        <button
          type="button"
          class="ghost-button"
          [attr.aria-label]="nextLabel"
          [disabled]="!navigation().next"
          (click)="navigation().next && rangeChange.emit(navigation().next!)"
        >
          ›
        </button>
      </div>

      <h2 class="mr-auto truncate text-lg font-semibold">{{ title() }}</h2>

      @if (slotted()) {
        <div
          class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
          role="group"
          [attr.aria-label]="densityLabel"
        >
          @for (option of densities; track option.value) {
            <button
              type="button"
              [attr.aria-pressed]="option.value === density()"
              [class]="
                'rounded px-2 py-1 text-xs font-medium ' +
                (option.value === density()
                  ? 'bg-accent-soft text-accent'
                  : 'text-muted hover:text-ink')
              "
              (click)="densityChange.emit(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      }

      <div
        class="flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5"
      >
        @for (kind of views; track kind) {
          <button
            type="button"
            [attr.aria-pressed]="kind === view()"
            [class]="
              'rounded px-2.5 py-1 text-xs font-medium capitalize ' +
              (kind === view()
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink')
            "
            (click)="rangeChange.emit(navigation().withView(kind))"
          >
            {{ kind }}
          </button>
        }
      </div>
    </header>
  `
})
export class ToolbarComponent {
  readonly navigation = input.required<CalendarNavigation>()
  readonly title = input.required<string>()
  readonly view = input.required<ViewKind>()
  readonly density = input.required<Density>()
  readonly slotted = input.required<boolean>()

  readonly rangeChange = output<CalendarRange>()
  readonly densityChange = output<Density>()

  readonly backLabel = BACK_LABEL
  readonly nextLabel = NEXT_LABEL
  readonly densityLabel = DENSITY_LABEL
  readonly densities = DENSITIES
  readonly views = VIEWS
}
