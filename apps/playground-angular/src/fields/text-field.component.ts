import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core'

let nextId = 0

@Component({
  selector: 'app-text-field',
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
        [type]="type()"
        [value]="value()"
        [attr.list]="suggestions() ? listId : null"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
      />
      @if (suggestions()) {
        <datalist [id]="listId">
          @for (suggestion of suggestions()!; track suggestion) {
            <option [value]="suggestion"></option>
          }
        </datalist>
      }
      @if (hint()) {
        <span class="text-[11px] leading-4 text-muted">{{ hint() }}</span>
      }
    </div>
  `
})
export class TextFieldComponent {
  readonly id = `text-field-${++nextId}`
  readonly listId = `${this.id}-list`

  readonly label = input.required<string>()
  readonly hint = input<string>()
  readonly value = input.required<string>()
  readonly type = input<string>('text')
  readonly suggestions = input<readonly string[] | undefined>(undefined)
  readonly placeholder = input<string>('')
  readonly valueChange = output<string>()

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement
    this.valueChange.emit(target.value)
  }
}
