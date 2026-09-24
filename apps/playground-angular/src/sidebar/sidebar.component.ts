import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { DEFAULT_TAB, TABS } from '@midstem/playground-core'
import type { TabId } from '@midstem/playground-core'

import { ControlsComponent } from '../controls/controls.component'
import { EventsComponent } from '../events/events.component'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [ControlsComponent, EventsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="flex min-h-0 flex-col border-r border-line bg-raised">
      <div class="flex shrink-0 gap-0.5 border-b border-line px-2 pt-2">
        @for (item of tabs; track item.id) {
          <button
            type="button"
            [attr.aria-pressed]="item.id === tab()"
            [class]="
              'rounded-t-md border-b-2 px-3 py-2 text-[13px] font-medium ' +
              (item.id === tab()
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-ink')
            "
            (click)="tab.set(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </div>

      <div class="flex min-h-0 flex-1 flex-col p-3">
        @if (tab() === 'range') {
          <app-controls />
        }
        @if (tab() === 'events') {
          <app-events />
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly tab = signal<TabId>(DEFAULT_TAB)
  readonly tabs = TABS
}
