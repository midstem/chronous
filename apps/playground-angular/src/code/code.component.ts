import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal
} from '@angular/core'
import {
  COPIED_LABEL,
  COPIED_MS,
  COPY_LABEL,
  TOKEN_STYLES,
  highlight
} from '@midstem/playground-core'
import type { CodeToken } from '@midstem/playground-core'

@Component({
  selector: 'app-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-0 flex-1 flex-col p-4">
      <header class="flex flex-wrap items-center gap-3 pb-3">
        <h2 class="font-mono text-lg font-semibold">{{ fileName() }}</h2>
        <span class="font-mono text-[11px] text-faint">{{ badge() }}</span>
        <button
          type="button"
          class="ghost-button ml-auto"
          (click)="copyToClipboard()"
        >
          {{ copied() ? copiedLabel : copyLabel }}
        </button>
      </header>

      <section
        class="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface shadow-sm"
      >
        <pre
          class="min-h-0 flex-1 overflow-auto p-4 font-mono text-xs leading-5 text-code-plain"
        >
          @for (token of tokens(); track $index) {
            <span [class]="tokenStyles[token.kind]">{{ token.text }}</span>
          }
        </pre>
      </section>

      <p class="pt-2 text-[11px] leading-4 text-muted">{{ hint() }}</p>
    </div>
  `
})
export class CodeComponent {
  readonly fileName = input.required<string>()
  readonly badge = input.required<string>()
  readonly hint = input.required<string>()
  readonly source = input.required<string>()

  readonly copied = signal(false)

  readonly copyLabel = COPY_LABEL
  readonly copiedLabel = COPIED_LABEL
  readonly tokenStyles = TOKEN_STYLES

  readonly tokens = computed<CodeToken[]>(() => highlight(this.source()))

  copyToClipboard(): void {
    void navigator.clipboard.writeText(this.source()).then(() => {
      this.copied.set(true)
      window.setTimeout(() => this.copied.set(false), COPIED_MS)
    })
  }
}
