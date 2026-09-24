import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core'
import { DEFAULT_MODE, hourHeightOf } from '@midstem/playground-core'
import type { Density, Mode } from '@midstem/playground-core'

import { BoardComponent } from '../board/board.component'
import { MastheadComponent } from '../masthead/masthead.component'
import { PlaygroundService } from '../playground/playground.service'
import { SidebarComponent } from '../sidebar/sidebar.component'
import { SnippetComponent } from '../snippet/snippet.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MastheadComponent,
    SidebarComponent,
    BoardComponent,
    SnippetComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-dvh flex-col bg-canvas text-ink">
      <app-masthead
        [mode]="mode()"
        (modeChange)="mode.set($event)"
        (reset)="onReset()"
      />

      <div
        class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,16rem)_minmax(0,1fr)] lg:grid-cols-[minmax(300px,23vw)_minmax(0,1fr)] lg:grid-rows-1"
      >
        <app-sidebar />

        <main class="flex min-h-0 min-w-0 flex-col">
          @if (mode() === 'calendar') {
            <app-board
              [range]="range()"
              [events]="events()"
              [locale]="state().locale"
              [density]="state().density"
              [style]="state().style"
              (rangeChange)="playground.applyRange($event)"
              (densityChange)="onDensity($event)"
            />
          }

          @if (mode() === 'code') {
            <app-snippet
              [range]="range()"
              [events]="events()"
              [locale]="state().locale"
              [hourHeight]="hourHeight()"
              [style]="state().style"
            />
          }
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  readonly playground = inject(PlaygroundService)

  readonly mode = signal<Mode>(DEFAULT_MODE)

  readonly state = this.playground.state
  readonly range = this.playground.range
  readonly events = this.playground.events

  readonly hourHeight = computed(() => hourHeightOf(this.state().density))

  onReset(): void {
    this.playground.reset()
  }

  onDensity(density: Density): void {
    this.playground.update({ density })
  }
}
