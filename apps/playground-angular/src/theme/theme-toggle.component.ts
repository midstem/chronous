import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject
} from '@angular/core'
import { DARK_LABEL, LIGHT_LABEL, opposite } from '@midstem/playground-core'

import { ThemeService } from './theme.service'

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="ghost-button"
      [attr.aria-pressed]="pinned() !== null"
      [attr.title]="
        pinned()
          ? 'Follow the system setting'
          : 'Pin the ' + nextTheme() + ' theme'
      "
      (click)="toggle()"
    >
      <span aria-hidden="true">{{ resolved() === 'dark' ? '☾' : '☀' }}</span>
      {{ resolved() === 'dark' ? darkLabel : lightLabel }}
    </button>
  `
})
export class ThemeToggleComponent {
  readonly #theme = inject(ThemeService)

  readonly pinned = this.#theme.pinned
  readonly resolved = this.#theme.resolved

  readonly darkLabel = DARK_LABEL
  readonly lightLabel = LIGHT_LABEL

  readonly nextTheme = computed(() => opposite(this.resolved()))

  toggle(): void {
    this.#theme.toggle()
  }
}
