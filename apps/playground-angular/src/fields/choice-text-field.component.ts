import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output
} from '@angular/core'
import { signal } from '@angular/core'
import type { Option } from '@midstem/playground-core'

let nextId = 0

@Component({
  selector: 'app-choice-text-field',
  standalone: true,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label
        class="font-mono text-xs font-semibold tracking-tight text-ink"
        [attr.for]="id"
      >
        {{ label() }}
      </label>
      <select
        [id]="id"
        class="field-control"
        [attr.aria-label]="label() + ' common values'"
        [value]="customMode() ? customValue : value()"
        (change)="onSelect($event)"
      >
        @for (option of options(); track option) {
          <option
            [value]="option"
            [selected]="!customMode() && option === value()"
          >
            {{ optionLabel(option) }}
          </option>
        }
        <option [value]="customValue" [selected]="customMode()">
          Custom value…
        </option>
      </select>
      @if (customMode()) {
        <input
          class="field-control"
          type="text"
          [attr.aria-label]="label() + ' custom value'"
          [placeholder]="'Enter ' + label()"
          [value]="value()"
          (input)="onInput($event)"
        />
      }
      @if (hint()) {
        <span class="text-[11px] leading-4 text-muted">{{ hint() }}</span>
      }
    </div>
  `
})
export class ChoiceTextFieldComponent {
  readonly id = `choice-text-field-${++nextId}`
  readonly customValue = '__custom__'

  readonly label = input.required<string>()
  readonly hint = input<string>()
  readonly value = input.required<string>()
  readonly options = input.required<readonly string[]>()
  readonly optionLabels = input<readonly Option[]>([])
  readonly valueChange = output<string>()
  readonly customMode = signal(false)
  #internalUpdate = false

  constructor() {
    effect(() => {
      const value = this.value()
      const options = this.options()
      if (!this.#internalUpdate) this.customMode.set(!options.includes(value))
      this.#internalUpdate = false
    })
  }

  onSelect(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value
    if (selected === this.customValue) {
      this.customMode.set(true)
      return
    }
    this.customMode.set(false)
    this.#internalUpdate = true
    this.valueChange.emit(selected)
  }

  optionLabel(option: string): string {
    return (
      this.optionLabels().find((item) => item.value === option)?.label ?? option
    )
  }

  onInput(event: Event): void {
    this.#internalUpdate = true
    this.valueChange.emit((event.target as HTMLInputElement).value)
  }
}
