import { Injectable, computed, effect, signal } from '@angular/core'
import {
  DARK_QUERY,
  applyScheme,
  opposite,
  storedScheme,
  systemScheme
} from '@midstem/playground-core'
import type { Scheme } from '@midstem/playground-core'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly pinned = signal<Scheme | null>(storedScheme())
  readonly system = signal<Scheme>(systemScheme())

  readonly resolved = computed<Scheme>(() => this.pinned() ?? this.system())

  constructor() {
    const media = window.matchMedia(DARK_QUERY)
    const sync = (): void => this.system.set(systemScheme())

    media.addEventListener('change', sync)

    effect(() => {
      applyScheme(this.pinned())
    })
  }

  toggle(): void {
    this.pinned.update((held) => (held ? null : opposite(this.system())))
  }
}
