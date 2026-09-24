import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core'
import type { Option } from '@midstem/playground-core'

let nextId = 0

@Component({
  selector: 'app-select-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label
        [class]="
          labelHidden()
            ? 'sr-only'
            : 'font-mono text-xs font-semibold tracking-tight text-ink'
        "
        [attr.for]="id"
      >
        {{ label() }}
      </label>
      <select
        [id]="id"
        class="field-control"
        [value]="value()"
        (change)="onChange($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">
            {{ option.label }}
          </option>
        }
      </select>
      @if (hint()) {
        <span class="text-[11px] leading-4 text-muted">{{ hint() }}</span>
      }
    </div>
  `
})
export class SelectFieldComponent {
  readonly id = `select-field-${++nextId}`

  readonly label = input.required<string>()
  readonly hint = input<string>()
  readonly labelHidden = input<boolean>(false)
  readonly value = input.required<string>()
  readonly options = input.required<readonly Option[]>()
  readonly valueChange = output<string>()

  onChange(event: Event): void {
    const target = event.target as HTMLSelectElement
    this.valueChange.emit(target.value)
  }
}
