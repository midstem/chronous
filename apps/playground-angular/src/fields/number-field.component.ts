import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core'

let nextId = 0

@Component({
  selector: 'app-number-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label
        class="font-mono text-xs font-semibold tracking-tight text-ink"
        [attr.for]="id"
      >
        {{ label() }}
      </label>
      <input
        [id]="id"
        class="field-control"
        type="number"
        [value]="value()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
      />
      @if (hint()) {
        <span class="text-[11px] leading-4 text-muted">{{ hint() }}</span>
      }
    </div>
  `
})
export class NumberFieldComponent {
  readonly id = `number-field-${++nextId}`

  readonly label = input.required<string>()
  readonly hint = input<string>()
  readonly value = input.required<string>()
  readonly placeholder = input<string>('')
  readonly valueChange = output<string>()

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.valueChange.emit(target.value)
  }
}
