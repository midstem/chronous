import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core'
import {
  DOCS_LABEL,
  FRAMEWORK_NAV_LABEL,
  HEADLINE,
  MODES,
  MODE_LABEL,
  REPOSITORY_URL,
  RESET_LABEL,
  TAGLINE,
  getFrameworkLinks
} from '@midstem/playground-core'
import type { Mode } from '@midstem/playground-core'

import { RuntimeComponent } from '../runtime/runtime.component'
import { ThemeToggleComponent } from '../theme/theme-toggle.component'

@Component({
  selector: 'app-masthead',
  standalone: true,
  imports: [RuntimeComponent, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-surface px-4 py-2.5"
    >
      <h1 class="flex items-baseline gap-2 text-base font-semibold">
        {{ headline }}
        <span class="text-xs font-normal text-faint">{{ tagline }}</span>
      </h1>

      <nav
        class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
        [attr.aria-label]="frameworkNavLabel"
      >
        @for (link of frameworks; track link.id) {
          <a
            [href]="link.href"
            [attr.aria-current]="link.isCurrent ? 'page' : null"
            [class]="
              'rounded px-3 py-1 text-[13px] font-medium no-underline transition-colors ' +
              (link.isCurrent
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink')
            "
          >
            {{ link.title }}
          </a>
        }
      </nav>

      <div
        class="ml-2 flex items-center gap-0.5 rounded-md border border-line bg-raised p-0.5"
        role="group"
        [attr.aria-label]="modeLabel"
      >
        @for (option of modes; track option.value) {
          <button
            type="button"
            [attr.aria-pressed]="option.value === mode()"
            [class]="
              'rounded px-3 py-1 text-[13px] font-medium ' +
              (option.value === mode()
                ? 'bg-accent-soft text-accent'
                : 'text-muted hover:text-ink')
            "
            (click)="modeChange.emit(option.value)"
          >
            {{ option.label }}
          </button>
        }
      </div>

      <div class="ml-auto flex flex-wrap items-center gap-2">
        <app-runtime />
        <app-theme-toggle />
        <button type="button" class="ghost-button" (click)="reset.emit()">
          {{ resetLabel }}
        </button>
        <a
          class="ghost-button"
          [href]="repositoryUrl"
          target="_blank"
          rel="noreferrer"
        >
          {{ docsLabel }}
        </a>
      </div>
    </header>
  `
})
export class MastheadComponent {
  readonly mode = input.required<Mode>()
  readonly modeChange = output<Mode>()
  readonly reset = output<void>()

  readonly headline = HEADLINE
  readonly tagline = TAGLINE
  readonly modeLabel = MODE_LABEL
  readonly frameworkNavLabel = FRAMEWORK_NAV_LABEL
  readonly frameworks = getFrameworkLinks('angular')
  readonly modes = MODES
  readonly resetLabel = RESET_LABEL
  readonly docsLabel = DOCS_LABEL
  readonly repositoryUrl = REPOSITORY_URL
}
